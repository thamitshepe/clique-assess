from fastapi import FastAPI, BackgroundTasks
import requests
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
import joblib
import datetime
import pytz
import time
import threading
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Load environment variables
load_dotenv()
API_KEY = os.getenv('API_KEY')

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to restrict access to specific origins if needed
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

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
            upcoming_df['Predicted Winner'] = np.where(mask, upcoming_df['Predicted Winner'] + ' - Risky Bet', upcoming_df['Predicted Winner'])
            
            # Drop the third feature column
            upcoming_df.drop(columns=['Third Feature'], inplace=True)
            
            # Store predictions data globally
            predictions_data = upcoming_df.to_dict(orient='records')
            predictions_loaded = True
            initial_load_completed = True

def update_predictions():
    while True:
        now = datetime.datetime.now(pytz.timezone('US/Eastern'))
        if now.hour == 3 and now.minute == 0:
            load_predictions(API_KEY)
            print("Predictions updated at 3:00 AM EST")
        time.sleep(60)  # Check every minute

def keep_instance_alive():
    while True:
        time.sleep(1500)  # Wait for 25 minutes
        requests.get("https://betvision-ai.onrender.com/mlbpredictions")  # FastAPI instance URL

# Start a thread for updating predictions
update_thread = threading.Thread(target=update_predictions)
update_thread.daemon = True
update_thread.start()

# Start a thread for keeping instance alive
instance_thread = threading.Thread(target=keep_instance_alive)
instance_thread.daemon = True
instance_thread.start()

@app.get("/")
def read_root():
    load_predictions(API_KEY)  # Load or update predictions data
    return {"message": "Predictions loaded successfully."}

@app.get("/mlbpredictions")
def get_predictions():
    if not initial_load_completed:
        load_predictions(API_KEY)  # Load or update predictions data if not already done
    return predictions_data
