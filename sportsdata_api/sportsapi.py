from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
import asyncio
from datetime import datetime, timezone
from typing import Optional, Dict, List
from pydantic import BaseModel
from redis import Redis
from dotenv import load_dotenv
import logging
import json

# Add logging setup if not already present
logging.basicConfig(level=logging.INFO)

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your allowed origins
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

class Competition(BaseModel):
    id: int
    name: str
    code: str
    emblem: str

class Area(BaseModel):
    id: Optional[int]
    name: str
    code: Optional[str]
    flag: Optional[str]

class CompetitionInfo(BaseModel):
    area: Area
    competition: Competition

class FootballData(BaseModel):
    competition_info: CompetitionInfo
    matches: list[Match]

# Function to fetch football data with Redis caching
async def fetch_football_data(competition_code: str, date_from: Optional[str] = None, date_to: Optional[str] = None) -> FootballData:
    try:
        # Throttle requests
        await throttle_requests()

        date_from = date_from or datetime.now(timezone.utc).strftime('%Y-%m-%d')
        date_to = date_to or date_from

        cache_key = f"football:{competition_code}:{date_from}-{date_to}"
        cached_data = redis.get(cache_key)
        if cached_data:
            # Load cached JSON data and create FootballData object directly
            cached_data_dict = json.loads(cached_data)
            return FootballData(**cached_data_dict)

        base_url = os.getenv("FOOTBALL_DATA_API_URL")
        headers = {'X-Auth-Token': os.getenv("FOOTBALL_DATA_API_KEY")}
        url = f"{base_url}competitions/{competition_code}/matches?dateFrom={date_from}&dateTo={date_to}"

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()  # Raise exception for non-200 status codes
            
            # Log the response for debugging
            logging.info("Response from football data API: %s", response.text)
            
            # Extract the data from the response JSON
            data = response.json()

        # Extract competition data from the response
        competition_info = CompetitionInfo(
            area=Area(
                id=data["matches"][0]["area"]["id"],
                name=data["matches"][0]["area"]["name"],
                code=data["matches"][0]["area"]["code"],
                flag=data["matches"][0]["area"]["flag"]
            ),
            competition=Competition(
                id=data["competition"]["id"],
                name=data["competition"]["name"],
                code=data["competition"]["code"],
                emblem=data["competition"]["emblem"]
            )
        )

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

        # Create a FootballData instance with the processed data
        football_data = FootballData(competition_info=competition_info, matches=processed_matches_data)

        # Cache the data
        redis.setex(cache_key, RATE_LIMIT_PERIOD, football_data.json())
        return football_data

    except Exception as e:
        # Log the exception for debugging
        logging.error("Error fetching football data: %s", str(e))
        raise HTTPException(status_code=500, detail=f"Error fetching football data: {str(e)}")


@app.get('/api/footballdata', response_model=FootballData)
async def get_football_data_api(date_from: Optional[str] = None, date_to: Optional[str] = None):
    competition_code = "PL"  # Hardcoded to Premier League
    return await fetch_football_data(competition_code, date_from, date_to)

    
# Function to fetch MLB data with Redis caching
async def fetch_mlb_data(start_date: Optional[str] = None, end_date: Optional[str] = None) -> list:
    try:
        # Throttle requests
        await throttle_requests()

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

        return extracted_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching MLB data: {str(e)}")

@app.get('/api/mlbdata')
async def get_mlb_data_api(start_date: Optional[str] = None, end_date: Optional[str] = None):
    return await fetch_mlb_data(start_date, end_date)

redis_instance = Redis.from_url(redis_url)


@app.post("/clear_cache")
async def clear_cache():
    redis_instance.flushdb()
    return {"message": "Cache cleared successfully"}