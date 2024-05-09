from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from flask import Flask, request, jsonify
import httpx
import os
import asyncio
from datetime import datetime, timezone
from typing import Optional, Dict, List
from pydantic import BaseModel, Field
from redis import Redis
from dotenv import load_dotenv
import logging
import json
import time
from nba_api.stats.endpoints import scoreboardv2

# Add logging setup if not already present
logging.basicConfig(level=logging.INFO)

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://dashboard.betvisionai.com"
    ],  # Update with your allowed origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Redis Configuration
redis_url = os.getenv("REDIS_URL")
redis = Redis.from_url(redis_url)

# Rate Limiting Configuration
RATE_LIMIT_PERIOD = 60  # 60 seconds
RATE_LIMIT_REQUESTS = 10  # 10 requests per period

# Define a lock object
lock = asyncio.Lock()

# Define a function to throttle requests
async def throttle_requests():
    async with lock:
        await asyncio.sleep(0.1)  # Add a small delay for fairness

class Competition(BaseModel):
    id: Optional[int] = None
    name: str
    code: Optional[str] = "PL"
    emblem: Optional[str] = None

class Team(BaseModel):
    shortName: str
    crest: str

class Score(BaseModel):
    winner: Optional[str]
    duration: str
    fullTime: dict
    halfTime: dict

class Match(BaseModel):
    utcDate: str
    status: str
    homeTeam: Team
    awayTeam: Team
    score: Score

class SoccerData(BaseModel):
    competition: Competition
    matches: List[Match]

# Function to fetch soccer data with Redis caching
async def fetch_soccer_data(competition_code: str, date_from: Optional[str] = None, date_to: Optional[str] = None) -> SoccerData:
    try:
        # Throttle requests
        # await throttle_requests()

        date_from = date_from or datetime.now(timezone.utc).strftime('%Y-%m-%d')
        date_to = date_to or date_from

        cache_key = f"soccer:{competition_code}:{date_from}-{date_to}"
        cached_data = redis.get(cache_key)
        if cached_data:
            # Introduce a small delay of 1 second before returning the cached data
            # time.sleep(1)
            # Load cached JSON data and create SoccerData object directly
            cached_data_dict = json.loads(cached_data)
            return SoccerData(**cached_data_dict)

        base_url = os.getenv("FOOTBALL_DATA_API_URL")
        headers = {'X-Auth-Token': os.getenv("FOOTBALL_DATA_API_KEY")}
        url = f"{base_url}competitions/{competition_code}/matches?dateFrom={date_from}&dateTo={date_to}"

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()  # Raise exception for non-200 status codes
            
            # Log the response for debugging
            logging.info("Response from soccer data API: %s", response.text)
            
            # Extract the data from the response JSON
            data = response.json()

        # Process matches data from the response if matches exist
        matches_data = data.get("matches", [])
        processed_matches_data = []
        for match in matches_data:
            processed_match = Match(
                utcDate=match["utcDate"],
                status=match["status"],
                homeTeam=Team(
                    shortName=match["homeTeam"]["shortName"],
                    crest=match["homeTeam"]["crest"],
                ),
                awayTeam=Team(
                    shortName=match["awayTeam"]["shortName"],
                    crest=match["awayTeam"]["crest"],
                ),
                score=Score(
                    winner=match["score"].get("winner"),
                    duration=match["score"]["duration"],
                    fullTime=match["score"]["fullTime"],
                    halfTime=match["score"]["halfTime"]
                )
            )
            processed_matches_data.append(processed_match)

        # Determine the competition name based on the competition code
        competition_name = "Premier League" if competition_code == "PL" else "Bundesliga" if competition_code == "BL1" else "Primeira Liga"

        # Create a SoccerData instance with the processed data
        soccer_data = SoccerData(
            competition=Competition(name=competition_name, code=competition_code),
            matches=processed_matches_data
        )

        # Cache the data with a different expiration for the current day's data
        if date_from == datetime.now(timezone.utc).strftime('%Y-%m-%d'):
            redis.setex(cache_key, 10, soccer_data.json())  # 10 seconds expiration for current day's data
        else:
            redis.setex(cache_key, 43200, soccer_data.json())  # Half a day expiration for other data
        
        return soccer_data

    except Exception as e:
        # Log the exception for debugging
        logging.error("Error fetching soccer data: %s", str(e))
        # In case of an error, return a default response with empty matches
        soccer_data = SoccerData(
            competition=Competition(name="", code=competition_code),
            matches=[]
        )
        return soccer_data

@app.get('/api/soccerdata', response_model=SoccerData)
async def get_soccer_data_api(competition_code: str = Query(..., description="Competition code"), date_from: Optional[str] = None, date_to: Optional[str] = None):
    return await fetch_soccer_data(competition_code, date_from, date_to)

# Function to fetch MLB data with Redis caching
async def fetch_mlb_data(start_date: Optional[str] = None, end_date: Optional[str] = None) -> list:
    try:
        # Throttle requests
        await throttle_requests()

        # Check if requested dates are in the cache
        cache_key = f"mlb_data:{start_date}:{end_date}"
        cached_data = redis.get(cache_key)

        if cached_data:
            # Introduce a small delay of 1 second before returning the cached data
            time.sleep(1)
            # Return cached data if exists
            return json.loads(cached_data)

        mlb_base_url = os.getenv("MLB_API_URL")
        mlb_date_url = f'{mlb_base_url}&startDate={start_date}&endDate={end_date}' if start_date and end_date else mlb_base_url

        async with httpx.AsyncClient() as client:
            response = await client.get(mlb_date_url)
            response.raise_for_status()  # Raise exception for non-200 status codes

        mlb_data = response.json()
        extracted_data = []
        for date in mlb_data.get("dates", []):
            for game in date.get("games", []):
                extracted_game = {
                    "gameDate": game.get("gameDate"),
                    "status": game.get("status", {}).get("detailedState"),
                    "homeTeam": {
                        "name": game.get("teams", {}).get("home", {}).get("team", {}).get("name"),
                        "score": game.get("teams", {}).get("home", {}).get("score")
                    },
                    "awayTeam": {
                        "name": game.get("teams", {}).get("away", {}).get("team", {}).get("name"),
                        "score": game.get("teams", {}).get("away", {}).get("score")
                    }
                }
                extracted_data.append(extracted_game)

        # Determine expiration time based on current date or other dates
        expiration = 10 if start_date == datetime.now().strftime('%Y-%m-%d') else 60 * 60 * 12  # 10 seconds for current date, half a day for others

        # Cache the data in Redis with the appropriate expiration time
        redis.setex(cache_key, expiration, json.dumps(extracted_data))

        return extracted_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching MLB data: {str(e)}")

@app.get('/api/mlbdata')
async def get_mlb_data_api(start_date: Optional[str] = None, end_date: Optional[str] = None):
    return await fetch_mlb_data(start_date, end_date)


# Function to fetch NHL data with Redis caching
async def fetch_nhl_data(game_date: str) -> list:
    try:
        # Throttle requests
        await throttle_requests()

        # Check if requested game date is in the cache
        cache_key = f"nhl_data:{game_date}"
        cached_data = redis.get(cache_key)

        if cached_data:
            time.sleep(1)  # Introduce a delay before returning cached data
            return json.loads(cached_data)

        nhl_base_url = os.getenv("NHL_API_URL")
        nhl_date_url = f"{nhl_base_url}/{game_date}"

        async with httpx.AsyncClient() as client:
            response = await client.get(nhl_date_url)
            response.raise_for_status()

        nhl_data = response.json()
        extracted_data = []
        for game in nhl_data.get("games", []):
            extracted_game = {
                "gameDate": game.get("gameDate"),
                "startTimeUTC": game.get("startTimeUTC"),
                "status": "Completed" if game.get("gameState") == "OFF" else "Scheduled",
                "homeTeam": {
                    "name": game.get("homeTeam", {}).get("name", {}).get("default"),
                    "logo": game.get("homeTeam", {}).get("logo"),
                    "score": game.get("homeTeam", {}).get("score")
                },
                "awayTeam": {
                    "name": game.get("awayTeam", {}).get("name", {}).get("default"),
                    "logo": game.get("awayTeam", {}).get("logo"),
                    "score": game.get("awayTeam", {}).get("score")
                }
            }
            extracted_data.append(extracted_game)

        # Cache the data in Redis with a 12-hour expiration
        redis.setex(cache_key, 60 * 60 * 12, json.dumps(extracted_data))

        return extracted_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching NHL data: {str(e)}")

@app.get('/api/nhldata')
async def get_nhl_data_api(game_date: str):
    return await fetch_nhl_data(game_date)


app = Flask(__name__)

# Function to fetch NBA data with Redis caching
def fetch_nba_data(game_date: str) -> list:
    try:
        # Check if requested game date is in the cache
        cache_key = f"nba_data:{game_date}"
        cached_data = redis.get(cache_key)

        if cached_data:
            return json.loads(cached_data)

        # Call the NBA API endpoint to fetch data
        nba_data = scoreboardv2.ScoreboardV2(
            day_offset=0,
            game_date=game_date,
            league_id="00"  # NBA league ID
        )

        # Extract relevant information from the response
        result_sets = nba_data.get_dict().get("resultSets", [])
        game_headers = None
        line_scores = None
        for result_set in result_sets:
            if result_set.get("name") == "GameHeader":
                game_headers = result_set.get("rowSet", [])
            elif result_set.get("name") == "LineScore":
                line_scores = result_set.get("rowSet", [])

        # Prepare the extracted data
        extracted_data = []
        if game_headers and line_scores:
            for i in range(0, len(line_scores), 2):
                home_line_score = line_scores[i]
                away_line_score = line_scores[i + 1]
                game_id = home_line_score[2]
                # Find the corresponding game header
                game_header = next((gh for gh in game_headers if gh[2] == game_id), None)
                if game_header:
                    extracted_game = {
                        "gameDate": game_header[0],
                        "status": game_header[4],
                        "homeTeam": {
                            "abbreviation": home_line_score[4],
                            "name": f"{home_line_score[5]} {home_line_score[6]}",
                            "score": home_line_score[-3]
                        },
                        "awayTeam": {
                            "abbreviation": away_line_score[4],
                            "name": f"{away_line_score[5]} {away_line_score[6]}",
                            "score": away_line_score[-3]
                        }
                    }
                    extracted_data.append(extracted_game)

        # Cache the data in Redis with a 12-hour expiration
        redis.setex(cache_key, 60 * 60 * 12, json.dumps(extracted_data))

        return extracted_data

    except Exception as e:
        return {"error": f"Error fetching NBA data: {str(e)}"}

@app.route("/api/nbadata/")
def get_nba_data():
    try:
        date = request.args.get('date')
        if not date:
            return jsonify({"error": "Date parameter is missing"}), 400
        # Fetch NBA data with Redis caching
        return jsonify(fetch_nba_data(date))

    except Exception as e:
        return jsonify({"error": f"Error fetching NBA data: {str(e)}"}), 500

if __name__ == "__main__":
    from gevent.pywsgi import WSGIServer
    http_server = WSGIServer(('127.0.0.1', 8282), app)
    http_server.serve_forever()
    

redis_instance = Redis.from_url(redis_url)


@app.post("/clear_cache")
async def clear_cache():
    redis_instance.flushdb()
    return {"message": "Cache cleared successfully"}