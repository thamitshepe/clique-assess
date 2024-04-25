from fastapi import FastAPI, BackgroundTasks
import requests
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
import joblib
import datetime
from dotenv import load_dotenv
import pytz
import time
import threading
import os
from fastapi.middleware.cors import CORSMiddleware
import schedule

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to restrict access to specific origins if needed
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Load environment variables
load_dotenv()
API_KEY = os.getenv('API_KEY')

MODEL_PATH = "./trained_model.h5"

predictions_loaded = False
predictions_data = None
initial_load_completed = False

def fetch_upcoming_matches(api_key):
    url = f'https://api.the-odds-api.com/v4/sports/baseball_mlb/odds/?apiKey={api_key}&regions=us&markets=h2h'
    response = requests.get(url)
    data = response.json()
    return data

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
        third_feature = 0  # placeholder for the third feature
        upcoming_matches.append({'Home Team': home_team, 'Away Team': away_team, 'Home Odds': home_odds, 'Away Odds': away_odds, 'Third Feature': third_feature})
    return pd.DataFrame(upcoming_matches)

def make_predictions(model, upcoming_df):
    X = upcoming_df[['Home Odds', 'Away Odds']]  # Extract features
    probabilities = model.predict_proba(X)  # Predict probabilities
    probabilities[:, 1] *= 1.1  # Adjust probabilities
    predictions = np.argmax(probabilities, axis=1)  # Predict the winner
    return predictions, probabilities

def load_model():
    return joblib.load(MODEL_PATH)

def load_predictions(api_key):
    global predictions_loaded, predictions_data, initial_load_completed
    
    if not predictions_loaded:

        # Fetch upcoming match data
        upcoming_data = fetch_upcoming_matches(api_key)

       # Ensure upcoming_data is not empty and in the correct format
        if upcoming_data:
            # Preprocess upcoming match data
            upcoming_df = preprocess_upcoming_matches(upcoming_data)

            # Load the trained model
            model = load_model()
                
            # Make predictions
            predictions, probabilities = make_predictions(model, upcoming_df)
            
            # Add predicted winner and probability to predictions data
            upcoming_df['Predicted Winner'] = np.where(predictions == 1, upcoming_df['Home Team'], upcoming_df['Away Team'])
            upcoming_df['Probability (%)'] = np.max(probabilities, axis=1) * 100
            
            # Apply formatting to the predictions data
            mask = upcoming_df['Probability (%)'] < 65
            upcoming_df['Predicted Winner'] = np.where(mask, upcoming_df['Predicted Winner'])
            
            # Drop the third feature column
            upcoming_df.drop(columns=['Third Feature'], inplace=True)
            
            # Store predictions data globally
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

# Background task to keep instance alive
def keep_instance_alive():
    while True:
        time.sleep(1500)  # 25 minutes
        requests.get("https://betvision-ai.onrender.com/mlbpredictions")  # Replace with your FastAPI instance URL



# Run background tasks
background_tasks = BackgroundTasks()
background_tasks.add_task(keep_instance_alive)

# Main endpoint to get predictions
@app.get("/mlbpredictions")
async def get_predictions():
    global predictions_loaded, predictions_data, initial_load_completed
    
    # Load or update predictions data if not loaded yet
    if not initial_load_completed:
        load_predictions(API_KEY)
    
    return predictions_data
