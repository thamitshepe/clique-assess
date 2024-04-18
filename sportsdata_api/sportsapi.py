from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import json
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta, timezone
import asyncio
import uvicorn
from typing import Optional
import httpx


# Load environment variables from .env file
load_dotenv()

# Setup FastAPI app
app = FastAPI()

# Football-Data API Configuration
football_data_api_key = os.getenv('FOOTBALL_DATA_API_KEY')
base_url = 'https://api.football-data.org/v4/'

# Available competitions and their corresponding codes
competitions = {
    "PL": "PL"
}

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to restrict access to specific origins if needed
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Maintain the last updated time
last_update_time = datetime.now(timezone.utc)

async def fetch_matches_for_competition(competition_code, date_from=None, date_to=None):
    try:
        date_from = date_from or datetime.now(timezone.utc).strftime('%Y-%m-%d')
        date_to = date_to or date_from

        url = f"{base_url}competitions/{competition_code}/matches?dateFrom={date_from}&dateTo={date_to}"
        headers = {'X-Auth-Token': football_data_api_key}
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()  # Raise exception for non-200 status codes
            competition_data = response.json()

        if "matches" in competition_data:
            matches_data = competition_data["matches"]
        else:
            matches_data = []

        # Extract area data from the response
        area = competition_data.get("area", {})
        if not area and competition_code == "PL":
            area = {"name": "England"}

        competition = competition_data.get("competition", {})
        
        competition_info = {
            "area": {
                "id": area.get("id"),
                "name": area.get("name"),
                "code": area.get("code"),
                "flag": area.get("flag")
            },
            "competition": {
                "id": competition.get("id"),
                "name": competition.get("name"),
                "code": competition.get("code"),
                "emblem": competition.get("emblem")
            }
        }
        
        processed_matches_data = []
        for match in matches_data:
            processed_match = {
                "utcDate": match.get("utcDate"),
                "status": match.get("status"),
                "homeTeam": {
                    "shortName": match.get("homeTeam", {}).get("shortName"),
                    "crest": match.get("homeTeam", {}).get("crest"),
                },
                "awayTeam": {
                    "shortName": match.get("awayTeam", {}).get("shortName"),
                    "crest": match.get("awayTeam", {}).get("crest"),
                },
                "score": match.get("score"),
            }
            processed_matches_data.append(processed_match)
            
        return {"competition_info": competition_info, "matches": processed_matches_data}
        
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:  # No matches found
            return {"competition_info": {"area": {}, "competition": {}}, "matches": []}
        else:
            raise HTTPException(status_code=500, detail=f"Error fetching data for {competition_code}: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data for {competition_code}: {str(e)}")


# Expose an endpoint to fetch matches data
@app.get('/api/footballdata')
async def get_football_data(date_from: Optional[str] = None, date_to: Optional[str] = None):
    try:
        global last_update_time
        now = datetime.now(timezone.utc)

        # Check if the current time exceeds the last update time by more than 7 seconds
        if (now - last_update_time).total_seconds() >= 7:
            last_update_time = now

            # Fetch data for all competitions
            data = {}
            for code, name in competitions.items():
                # Await fetch_matches_for_competition here
                matches_data = await fetch_matches_for_competition(code, date_from, date_to)
                data[code] = {"name": name, "matches": matches_data}

            return data
        else:
            # Queue the request to wait until the next update time
            await asyncio.sleep((last_update_time + timedelta(seconds=7) - now).total_seconds())
            return await get_football_data(date_from, date_to)  # Await here
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")



# MLB-Data API Configuration
mlb_base_url = 'https://statsapi.mlb.com/api/v1/schedule/games/?sportId=1'
mlb_date_url = 'https://statsapi.mlb.com/api/v1/schedule/games/?sportId=1&startDate={}&endDate={}'

def fetch_mlb_data(start_date=None, end_date=None):
    try:
        url = mlb_base_url
        if start_date and end_date:
            url = mlb_date_url.format(start_date, end_date)
        response = requests.get(url)
        response.raise_for_status()  # Raise exception for non-200 status codes
        mlb_data = response.json()
        # Extract relevant information from the JSON response
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

# Expose an endpoint to fetch MLB data
@app.get('/api/mlbdata')
def get_mlb_data(start_date: str = None, end_date: str = None):
    return fetch_mlb_data(start_date, end_date)

async def fetch_and_store_all_data():
    # Fetch football data
    for code, name in competitions.items():
        await fetch_matches_for_competition(code)
    # Fetch MLB data synchronously (consider making this async as well)
    fetch_mlb_data()

scheduler = AsyncIOScheduler()
scheduler.add_job(fetch_and_store_all_data, 'interval', seconds=7)
scheduler.start()

# Run FastAPI using uvicorn
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv('FASTAPI_PORT')))
