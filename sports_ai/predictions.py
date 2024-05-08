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

bl1_predictions_loaded = False
bl1_predictions_data = None
bl1_initial_load_completed = False

# Function to fetch data for upcoming matches from The Odds API
def bl1_fetch_upcoming_matches(api_key):
    url = f'https://api.the-odds-api.com/v4/sports/soccer_germany_bundesliga/odds/?apiKey={api_key}&regions=uk&eu&markets=h2h'
    response = requests.get(url)
    data = response.json()
    return data

# Function to preprocess upcoming match data
def bl1_preprocess_upcoming_matches(data):
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
def bl1_make_predictions(model, upcoming_df):
    # Extract features
    X = upcoming_df[['Home Odds', 'Away Odds', 'Third Feature']]

    # Predict probabilities
    probabilities = model.predict_proba(X)

    # Adjust probabilities
    probabilities[:, 1] *= 1.1

    # Normalize probabilities
    probabilities_sum = np.sum(probabilities, axis=1)
    probabilities /= probabilities_sum[:, np.newaxis]

    # Predict the winner based on adjusted probabilities
    predictions = np.argmax(probabilities, axis=1)

    return predictions, probabilities

# Function to load the trained model
def bl1_load_model():
    return joblib.load('./bl1_model.h5')

# Function to load or update predictions data
def bl1_load_predictions(api_key):
    global bl1_predictions_loaded, bl1_predictions_data, bl1_initial_load_completed
    
    if not bl1_predictions_loaded and not bl1_initial_load_completed:
        try:
            # Fetch upcoming match data
            upcoming_data = bl1_fetch_upcoming_matches(api_key)

            # Preprocess upcoming match data
            upcoming_df = bl1_preprocess_upcoming_matches(upcoming_data)

            # Load the trained model
            model = bl1_load_model()

            # Make predictions
            predictions, probabilities = bl1_make_predictions(model, upcoming_df)

            # Map predicted winner codes to actual team names
            upcoming_df['Predicted Winner'] = np.where(predictions == 1, upcoming_df['Home Team'], upcoming_df['Away Team'])
            upcoming_df['Probability (%)'] = np.max(probabilities, axis=1) * 100

            mask = upcoming_df['Probability (%)'] < 65
            upcoming_df['Predicted Winner'] = np.where(mask, upcoming_df['Predicted Winner'] + ' or Tie', upcoming_df['Predicted Winner'])

            # Drop the third feature column
            upcoming_df.drop(columns=['Third Feature'], inplace=True)

            # Convert DataFrame to JSON and store in bl1_predictions_data
            bl1_predictions_data = upcoming_df.to_dict(orient='records')

            bl1_predictions_loaded = True
            bl1_initial_load_completed = True

        except Exception as e:
            print(f"Error loading predictions: {str(e)}")

# Schedule task to load predictions data every day at 6 AM US Eastern Time
schedule.every().day.at("06:00").do(bl1_load_predictions, API_KEY)

# Main function to run scheduler
def run_scheduler():
    while True:
        schedule.run_pending()
        time.sleep(1)

# Run scheduler in a separate thread
import threading
scheduler_thread = threading.Thread(target=run_scheduler)
scheduler_thread.start()

# Main endpoint to get soccer predictions
@app.get("/bl1predictions")
async def bl1_get_predictions():
    global bl1_predictions_loaded, bl1_predictions_data, bl1_initial_load_completed
    
    # Load or update predictions data if not loaded yet
    if not bl1_initial_load_completed:
        bl1_load_predictions(API_KEY)
    
    return bl1_predictions_data




# Initialize global variables to store predictions data
pl_predictions_loaded = False
pl_predictions_data = None
pl_initial_load_completed = False

# Function to fetch data for upcoming matches from The Odds API
def pl_fetch_upcoming_matches(api_key):
    url = f'https://api.the-odds-api.com/v4/sports/soccer_epl/odds/?apiKey={api_key}&regions=uk&eu&markets=h2h'
    response = requests.get(url)
    data = response.json()
    return data

# Function to preprocess upcoming match data
def pl_preprocess_upcoming_matches(data):
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
def pl_make_predictions(model, upcoming_df):
    # Extract features
    X = upcoming_df[['Home Odds', 'Away Odds', 'Third Feature']]

    # Predict probabilities
    probabilities = model.predict_proba(X)

    # Adjust probabilities
    probabilities[:, 1] *= 1.1

    # Normalize probabilities
    probabilities_sum = np.sum(probabilities, axis=1)
    probabilities /= probabilities_sum[:, np.newaxis]

    # Predict the winner based on adjusted probabilities
    predictions = np.argmax(probabilities, axis=1)

    return predictions, probabilities

# Function to load the trained model
def pl_load_model():
    return joblib.load('./pl_model.h5')

# Function to load or update predictions data
def pl_load_predictions(api_key):
    global pl_predictions_loaded, pl_predictions_data, pl_initial_load_completed
    
    if not pl_predictions_loaded and not pl_initial_load_completed:
        try:
            # Fetch upcoming match data
            upcoming_data = pl_fetch_upcoming_matches(api_key)

            # Preprocess upcoming match data
            upcoming_df = pl_preprocess_upcoming_matches(upcoming_data)

            # Load the trained model
            model = pl_load_model()

            # Make predictions
            predictions, probabilities = pl_make_predictions(model, upcoming_df)

            # Map predicted winner codes to actual team names
            upcoming_df['Predicted Winner'] = np.where(predictions == 1, upcoming_df['Home Team'], upcoming_df['Away Team'])
            upcoming_df['Probability (%)'] = np.max(probabilities, axis=1) * 100

            mask = upcoming_df['Probability (%)'] < 65
            upcoming_df['Predicted Winner'] = np.where(mask, upcoming_df['Predicted Winner'] + ' or Tie', upcoming_df['Predicted Winner'])

            # Drop the third feature column
            upcoming_df.drop(columns=['Third Feature'], inplace=True)

            # Convert DataFrame to JSON and store in pl_predictions_data
            pl_predictions_data = upcoming_df.to_dict(orient='records')

            pl_predictions_loaded = True
            pl_initial_load_completed = True

        except Exception as e:
            print(f"Error loading predictions: {str(e)}")

# Schedule task to load predictions data every day at 6 AM US Eastern Time
schedule.every().day.at("06:00").do(pl_load_predictions, API_KEY)

# Main function to run scheduler
def run_scheduler():
    while True:
        schedule.run_pending()
        time.sleep(1)

# Run scheduler in a separate thread
import threading
scheduler_thread = threading.Thread(target=run_scheduler)
scheduler_thread.start()

# Main endpoint to get soccer predictions
@app.get("/plpredictions")
async def pl_get_predictions():
    global pl_predictions_loaded, pl_predictions_data, pl_initial_load_completed
    
    # Load or update predictions data if not loaded yet
    if not pl_initial_load_completed:
        pl_load_predictions(API_KEY)
    
    return pl_predictions_data





# Initialize global variables to store predictions data
ppl_predictions_loaded = False
ppl_predictions_data = None
ppl_initial_load_completed = False

# Function to fetch data for upcoming matches from The Odds API
def ppl_fetch_upcoming_matches(api_key):
    url = f'https://api.the-odds-api.com/v4/sports/soccer_portugal_primeira_liga/odds/?apiKey={api_key}&regions=uk&eu&markets=h2h'
    response = requests.get(url)
    data = response.json()
    return data

# Function to preprocess upcoming match data
def ppl_preprocess_upcoming_matches(data):
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
def ppl_make_predictions(model, upcoming_df):
    # Extract features
    X = upcoming_df[['Home Odds', 'Away Odds', 'Third Feature']]

    # Predict probabilities
    probabilities = model.predict_proba(X)

    # Adjust probabilities
    probabilities[:, 1] *= 1.1

    # Normalize probabilities
    probabilities_sum = np.sum(probabilities, axis=1)
    probabilities /= probabilities_sum[:, np.newaxis]

    # Predict the winner based on adjusted probabilities
    predictions = np.argmax(probabilities, axis=1)

    return predictions, probabilities

# Function to load the trained model
def ppl_load_model():
    return joblib.load('./ppl_model.h5')

# Function to load or update predictions data
def ppl_load_predictions(api_key):
    global ppl_predictions_loaded, ppl_predictions_data, ppl_initial_load_completed
    
    if not ppl_predictions_loaded and not ppl_initial_load_completed:
        try:
            # Fetch upcoming match data
            upcoming_data = ppl_fetch_upcoming_matches(api_key)

            # Preprocess upcoming match data
            upcoming_df = ppl_preprocess_upcoming_matches(upcoming_data)

            # Load the trained model
            model = ppl_load_model()

            # Make predictions
            predictions, probabilities = ppl_make_predictions(model, upcoming_df)

            # Map predicted winner codes to actual team names
            upcoming_df['Predicted Winner'] = np.where(predictions == 1, upcoming_df['Home Team'], upcoming_df['Away Team'])
            upcoming_df['Probability (%)'] = np.max(probabilities, axis=1) * 100

            mask = upcoming_df['Probability (%)'] < 65
            upcoming_df['Predicted Winner'] = np.where(mask, upcoming_df['Predicted Winner'] + ' or Tie', upcoming_df['Predicted Winner'])

            # Drop the third feature column
            upcoming_df.drop(columns=['Third Feature'], inplace=True)

            # Convert DataFrame to JSON and store in ppl_predictions_data
            ppl_predictions_data = upcoming_df.to_dict(orient='records')

            ppl_predictions_loaded = True
            ppl_initial_load_completed = True

        except Exception as e:
            print(f"Error loading predictions: {str(e)}")

# Schedule task to load predictions data every day at 6 AM US Eastern Time
schedule.every().day.at("06:00").do(ppl_load_predictions, API_KEY)

# Main function to run scheduler
def run_scheduler():
    while True:
        schedule.run_pending()
        time.sleep(1)

# Run scheduler in a separate thread
import threading
scheduler_thread = threading.Thread(target=run_scheduler)
scheduler_thread.start()

# Main endpoint to get soccer predictions
@app.get("/pplpredictions")
async def ppl_get_predictions():
    global ppl_predictions_loaded, ppl_predictions_data, ppl_initial_load_completed
    
    # Load or update predictions data if not loaded yet
    if not ppl_initial_load_completed:
        ppl_load_predictions(API_KEY)
    
    return ppl_predictions_data





# Initialize global variables to store predictions data and track if predictions have been loaded
mlb_predictions_loaded = False
mlb_predictions_data = None
mlb_initial_load_completed = False

# Function to fetch data for upcoming matches from The Odds API
def mlb_fetch_upcoming_matches(api_key):
    url = f'https://api.the-odds-api.com/v4/sports/baseball_mlb/odds/?apiKey={api_key}&regions=us&markets=h2h'
    response = requests.get(url)
    data = response.json()
    return data

# Function to preprocess upcoming match data
def mlb_preprocess_upcoming_matches(data):
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

# Function to make predictions using the trained model
def mlb_make_predictions(model, upcoming_df):
    X = upcoming_df[['Home Odds', 'Away Odds']]  # Extract features
    probabilities = model.predict_proba(X)  # Predict probabilities
    probabilities[:, 1] *= 1.1  # Adjust probabilities
    predictions = np.argmax(probabilities, axis=1)  # Predict the winner
    return predictions, probabilities

# Function to load the trained model
def mlb_load_model():
    return joblib.load('./mlb_model.h5')

# Function to load or update predictions data
def mlb_load_predictions(api_key):
    global mlb_predictions_loaded, mlb_predictions_data, mlb_initial_load_completed
    
    if not mlb_predictions_loaded:
        # Load the trained model
        model = mlb_load_model()

        # Fetch upcoming match data
        upcoming_data = mlb_fetch_upcoming_matches(api_key)

        # Preprocess upcoming match data
        upcoming_df = mlb_preprocess_upcoming_matches(upcoming_data)

        # Make predictions
        predictions, probabilities = mlb_make_predictions(model, upcoming_df)
        
        # Add predicted winner and probability to predictions data
        upcoming_df['Predicted Winner'] = np.where(predictions == 1, upcoming_df['Home Team'], upcoming_df['Away Team'])
        upcoming_df['Probability (%)'] = np.max(probabilities, axis=1) * 100
        
        # Store predictions data globally
        mlb_predictions_data = upcoming_df.to_dict(orient='records')
        mlb_predictions_loaded = True
        mlb_initial_load_completed = True

# Schedule task to load predictions data every day at 6 AM US Eastern Time
schedule.every().day.at("06:00").do(mlb_load_predictions, API_KEY)

# Main function to run scheduler
def run_scheduler():
    while True:
        schedule.run_pending()
        time.sleep(1)

# Run scheduler in a separate thread
import threading
scheduler_thread = threading.Thread(target=run_scheduler)
scheduler_thread.start()

# Main endpoint to get predictions
@app.get("/mlbpredictions")
async def mlb_get_predictions():
    global mlb_predictions_loaded, mlb_predictions_data
    
    # Load or update predictions data if not loaded yet
    if not mlb_initial_load_completed:
        mlb_load_predictions(API_KEY)
    
    return mlb_predictions_data





# Initialize global variables
nba_predictions_loaded = False
nba_predictions_data = None
nba_initial_load_completed = False

# Function to fetch data for upcoming matches from The Odds API
def nba_fetch_upcoming_matches(api_key):
    url = f'https://api.the-odds-api.com/v4/sports/basketball_nba/odds/?apiKey={api_key}&regions=us&markets=h2h'
    response = requests.get(url)
    data = response.json()
    return data

# Function to preprocess upcoming match data
def nba_preprocess_upcoming_matches(data):
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
def nba_make_predictions(model, upcoming_df):
    # Extract features
    X = upcoming_df[['Home Odds', 'Away Odds']]

    # Predict probabilities
    probabilities = model.predict_proba(X)

    probabilities[:, 1] *= 1.1

    # Predict the winner based on adjusted probabilities
    predictions = np.argmax(probabilities, axis=1)

    return predictions, probabilities

# Function to load the trained model
def nba_load_model():
    return joblib.load('./nba_model.h5')

# Function to load or update predictions data
def nba_load_predictions(api_key):
    global nba_predictions_loaded, nba_predictions_data, nba_initial_load_completed
    
    if not nba_predictions_loaded and not nba_initial_load_completed:
        upcoming_data = nba_fetch_upcoming_matches(api_key)
        if upcoming_data:
            upcoming_df = nba_preprocess_upcoming_matches(upcoming_data)
            model = nba_load_model()
            predictions, probabilities = nba_make_predictions(model, upcoming_df)
            upcoming_df['Predicted Winner'] = np.where(predictions == 1, upcoming_df['Home Team'], upcoming_df['Away Team'])
            upcoming_df['Probability (%)'] = np.max(probabilities, axis=1) * 100
            nba_predictions_data = upcoming_df.to_dict(orient='records')
            nba_predictions_loaded = True
            nba_initial_load_completed = True

# Schedule task to load predictions data every day at 6 AM US Eastern Time
schedule.every().day.at("06:00").do(nba_load_predictions, API_KEY)

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
async def nba_get_predictions():
    global nba_predictions_loaded, nba_predictions_data, nba_initial_load_completed
    
    # Load or update predictions data if not loaded yet
    if not nba_initial_load_completed:
        nba_load_predictions(API_KEY)
    
    return nba_predictions_data






# Initialize global variables
nhl_predictions_loaded = False
nhl_predictions_data = None
nhl_initial_load_completed = False

# Function to fetch data for upcoming NHL matches from The Odds API
def nhl_fetch_upcoming_matches(api_key):
    url = f'https://api.the-odds-api.com/v4/sports/icehockey_nhl/odds/?apiKey={api_key}&regions=us&markets=h2h'
    response = requests.get(url)
    data = response.json()
    return data

# Function to preprocess upcoming match data
def nhl_preprocess_upcoming_matches(data):
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
        upcoming_matches.append({
            'Home Team': home_team, 
            'Away Team': away_team, 
            'Home Odds': home_odds, 
            'Away Odds': away_odds
        })
    return pd.DataFrame(upcoming_matches)

# Function to make predictions using the trained model
def nhl_make_predictions(model, df):
    X = df[['Home Odds', 'Away Odds']]
    probabilities = model.predict_proba(X)
    predictions = (probabilities[:, 1] * 1.1 > 0.65).astype(int)
    return predictions, probabilities

# Function to load the trained model
def nhl_load_model():
    return joblib.load('./nhl_model.h5')

# Function to load or update predictions data
def nhl_load_predictions(api_key):
    global nhl_predictions_loaded, nhl_predictions_data, nhl_initial_load_completed
    
    if not nhl_predictions_loaded and not nhl_initial_load_completed:
        upcoming_data = nhl_fetch_upcoming_matches(api_key)
        if upcoming_data:
            upcoming_df = nhl_preprocess_upcoming_matches(upcoming_data)
            model = nhl_load_model()
            predictions, probabilities = nhl_make_predictions(model, upcoming_df)
            upcoming_df['Predicted Winner'] = np.where(predictions == 1, upcoming_df['Home Team'], upcoming_df['Away Team'])
            upcoming_df['Probability (%)'] = np.max(probabilities, axis=1) * 100
            nhl_predictions_data = upcoming_df.to_dict(orient='records')
            nhl_predictions_loaded = True
            nhl_initial_load_completed = True

# Scheduler to update predictions data every day at a specified time
schedule.every().day.at("06:00").do(nhl_load_predictions, api_key=API_KEY)

def run_scheduler():
    while True:
        schedule.run_pending()
        time.sleep(1)

# Run scheduler in a separate thread
import threading
scheduler_thread = threading.Thread(target=run_scheduler)
scheduler_thread.start()

@app.get("/nhlpredictions")
async def nhl_get_predictions():
    global nhl_predictions_loaded, nhl_predictions_data, nhl_initial_load_completed
    
    # Load or update predictions data if not loaded yet
    if not nhl_initial_load_completed:
        nhl_load_predictions(API_KEY)
    
    return nhl_predictions_data

