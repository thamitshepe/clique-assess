from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import requests
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
import joblib
import schedule
import time
import threading
from dotenv import load_dotenv
import os

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://dashboard.betvisionai.com"],  # Change this to restrict access to specific origins if needed
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Load environment variables
load_dotenv()
API_KEY = os.getenv('API_KEY')

# Initialize global variables
predictions_loaded = False
predictions_data = None
initial_load_completed = False

# Function to fetch data for upcoming matches from The Odds API
def fetch_upcoming_matches(api_key):
    url = f'https://api.the-odds-api.com/v4/sports/basketball_nba/odds/?apiKey={api_key}&regions=us&markets=h2h'
    response = requests.get(url)
    data = response.json()
    return data

# Function to preprocess upcoming match data
def preprocess_upcoming_matches(data):
    upcoming_matches = []
    for match in data:
        home_team = match.get('home_team', None)
        away_team = match.get('away_team', None)
        home_odds = None
        away_odds = None
        for bookmaker in match.get('bookmakers', []):
            h2h_market = next((market for market in bookmaker.get('markets', []) if market.get('key') == 'h2h'), None)
            if h2h_market:
                home_odds = next((outcome['price'] for outcome in h2h_market.get('outcomes', []) if outcome['name'] == home_team), None)
                away_odds = next((outcome['price'] for outcome in h2h_market.get('outcomes', []) if outcome['name'] == away_team), None)
                if home_odds is not None and away_odds is not None:
                    break
        # Add a placeholder for the third feature (e.g., match importance)
        third_feature = 0
        upcoming_matches.append({'Home Team': home_team, 'Away Team': away_team, 'Home Odds': home_odds, 'Away Odds': away_odds, 'Third Feature': third_feature})
    return pd.DataFrame(upcoming_matches)

# Function to make predictions using the trained model
def make_predictions(model, upcoming_df):
    # Extract features
    X = upcoming_df[['Home Odds', 'Away Odds']]

    # Predict probabilities
    probabilities = model.predict_proba(X)

    probabilities[:, 1] *= 1.1

    # Predict the winner based on adjusted probabilities
    predictions = np.argmax(probabilities, axis=1)

    return predictions, probabilities

# Function to load the trained model
def load_model():
    return joblib.load('./trained_model.h5')

# Function to load or update predictions data
def load_predictions(api_key):
    global predictions_loaded, predictions_data, initial_load_completed
    
    if not predictions_loaded and not initial_load_completed:
        upcoming_data = fetch_upcoming_matches(api_key)
        if upcoming_data:
            upcoming_df = preprocess_upcoming_matches(upcoming_data)
            model = load_model()
            predictions, probabilities = make_predictions(model, upcoming_df)
            upcoming_df['Predicted Winner'] = np.where(predictions == 1, upcoming_df['Home Team'], upcoming_df['Away Team'])
            upcoming_df['Probability (%)'] = np.max(probabilities, axis=1) * 100
            predictions_data = upcoming_df.to_dict(orient='records')
            predictions_loaded = True
            initial_load_completed = True

# Schedule task to load predictions data every day at 6 AM US Eastern Time
schedule.every().day.at("06:00").do(load_predictions, API_KEY)

# Main function to run scheduler
def run_scheduler():
    while True:
        schedule.run_pending()
        time.sleep(1)

# Run scheduler in a separate thread
import threading
scheduler_thread = threading.Thread(target=run_scheduler)
scheduler_thread.start()

# Main endpoint to get NBA predictions
@app.get("/nbapredictions")
async def get_predictions():
    global predictions_loaded, predictions_data, initial_load_completed
    
    # Load or update predictions data if not loaded yet
    if not initial_load_completed:
        load_predictions(API_KEY)
    
    return predictions_data

