from flask_cors import CORS
from flask import Flask, request, jsonify
from asgiref.wsgi import WsgiToAsgi
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

app = Flask(__name__)
asgi_app = WsgiToAsgi(app)
CORS(app)

CORS(app, resources={r"/api/*": {"origins": "https://dashboard.betvisionai.com"}})

# Redis Configuration
redis_url = os.getenv("REDIS_URL")
redis = Redis.from_url(redis_url)

# Rate Limiting Configuration
RATE_LIMIT_PERIOD = 60  # 60 seconds
RATE_LIMIT_REQUESTS = 10  # 10 requests per period

# Define a lock object
lock = asyncio.Lock()


class Competition:
    def __init__(self, name: str, code: Optional[str] = "PL", emblem: Optional[str] = None):
        self.name = name
        self.code = code
        self.emblem = emblem

class Team:
    def __init__(self, shortName: str, crest: str):
        self.shortName = shortName
        self.crest = crest

class Score:
    def __init__(self, winner: Optional[str], duration: str, fullTime: dict, halfTime: dict):
        self.winner = winner
        self.duration = duration
        self.fullTime = fullTime
        self.halfTime = halfTime

class Match:
    def __init__(self, utcDate: str, status: str, homeTeam: Team, awayTeam: Team, score: Score):
        self.utcDate = utcDate
        self.status = status
        self.homeTeam = homeTeam
        self.awayTeam = awayTeam
        self.score = score

class SoccerData:
    def __init__(self, competition: Competition, matches: List[Match]):
        self.competition = competition
        self.matches = matches

def fetch_soccer_data(competition_code: str, date_from: Optional[str] = None, date_to: Optional[str] = None) -> SoccerData:
    try:
        date_from = date_from or datetime.now(timezone.utc).strftime('%Y-%m-%d')
        date_to = date_to or date_from

        cache_key = f"soccer:{competition_code}:{date_from}-{date_to}"
        cached_data = redis.get(cache_key)
        if cached_data:
            cached_data_dict = json.loads(cached_data)
            return SoccerData(**cached_data_dict)

        base_url = os.getenv("FOOTBALL_DATA_API_URL")
        headers = {'X-Auth-Token': os.getenv("FOOTBALL_DATA_API_KEY")}
        url = f"{base_url}competitions/{competition_code}/matches?dateFrom={date_from}&dateTo={date_to}"

        with httpx.Client() as client:
            response = client.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()

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

        competition_name = "Premier League" if competition_code == "PL" else "Bundesliga" if competition_code == "BL1" else "Primeira Liga"

        soccer_data = SoccerData(
            competition=Competition(name=competition_name, code=competition_code),
            matches=processed_matches_data
        )

        if date_from == datetime.now(timezone.utc).strftime('%Y-%m-%d'):
            redis.setex(cache_key, 10, json.dumps(soccer_data.__dict__))
        else:
            redis.setex(cache_key, 43200, json.dumps(soccer_data.__dict__))
        
        return soccer_data

    except Exception as e:
        logging.error("Error fetching soccer data: %s", str(e))
        soccer_data = SoccerData(
            competition=Competition(name="", code=competition_code),
            matches=[]
        )
        return soccer_data

@app.route('/api/soccerdata')
def get_soccer_data_api():
    try:
        competition_code = request.args.get('competition_code')
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        return jsonify(fetch_soccer_data(competition_code, date_from, date_to).__dict__)

    except Exception as e:
        return jsonify({"error": f"Error fetching soccer data: {str(e)}"}), 500
    


# Function to fetch MLB data with Redis caching
def fetch_mlb_data(start_date: Optional[str] = None, end_date: Optional[str] = None) -> list:
    try:

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

        with httpx.Client() as client:
            response = client.get(mlb_date_url)
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
        return {"error": f"Error fetching MLB data: {str(e)}"}

@app.route('/api/mlbdata')
def get_mlb_data_api():
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        # Fetch MLB data with Redis caching
        return jsonify(fetch_mlb_data(start_date, end_date))

    except Exception as e:
        return jsonify({"error": f"Error fetching MLB data: {str(e)}"}), 500


# Function to fetch NHL data with Redis caching
def fetch_nhl_data(game_date: str) -> list:
    try:

        # Check if requested game date is in the cache
        cache_key = f"nhl_data:{game_date}"
        cached_data = redis.get(cache_key)

        if cached_data:
            time.sleep(1)  # Introduce a delay before returning cached data
            return json.loads(cached_data)

        nhl_base_url = os.getenv("NHL_API_URL")
        nhl_date_url = f"{nhl_base_url}/{game_date}"

        with httpx.Client() as client:
            response = client.get(nhl_date_url)
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
        return {"error": f"Error fetching NHL data: {str(e)}"}

@app.route('/api/nhldata')
def get_nhl_data_api():
    try:
        game_date = request.args.get('game_date')
        if not game_date:
            return jsonify({"error": "Date parameter is missing"}), 400
        # Fetch NHL data with Redis caching
        return jsonify(fetch_nhl_data(game_date))

    except Exception as e:
        return jsonify({"error": f"Error fetching NHL data: {str(e)}"}), 500



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