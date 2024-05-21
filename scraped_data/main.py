from fastapi import FastAPI, Query
from datetime import datetime, timedelta
import asyncio
from redis import Redis
import json
from playwright.async_api import async_playwright

app = FastAPI()

# Redis connection URL
REDIS_URL = "rediss://red-coied35jm4es739mkrcg:cm9NhR9N5ivHKo6UF6sEOUn5sjstuEJT@oregon-redis.render.com:6379"

# Function to scrape NBA games data from the provided URL using Playwright
async def scrape_nba_games(page, date: str) -> list:
    try:
        print(f"Scraping NBA games data for date: {date}")
        await page.goto(f"https://www.nba.com/games?date={date}")

        # Wait for game elements to be loaded
        print("Waiting for game elements to load...")
        await page.wait_for_selector('.GameCardMatchup_wrapper__uUdW8')
        print("Game elements loaded.")

        # Collect all elements for team names, logos, and scores
        team_name_elements = await page.query_selector_all('.MatchupCardTeamName_teamName__9YaBA')
        team_logo_elements = await page.query_selector_all('.MatchupCardTeamLogo_base__WZl01 img')
        team_score_elements = await page.query_selector_all('.MatchupCardScore_p__dfNvc')

        # Initialize min_length to the length of team_name_elements and team_logo_elements
        min_length = len(team_name_elements)

        # If team_score_elements exists and is not empty, update min_length
        if team_score_elements:
            min_length = min(len(team_name_elements), len(team_logo_elements), len(team_score_elements))

        # Extract data for each pair of elements
        games_data = []
        for i in range(min_length // 2):
            # Extract home team data
            home_team_name = await team_name_elements[i].evaluate('(element) => element.textContent.trim()')
            home_team_logo = await team_logo_elements[i].evaluate('(element) => element.src')

            # Extract home team score if team_score_elements exists and is not empty
            if team_score_elements:
                home_team_score = await team_score_elements[i].evaluate('(element) => element.textContent.trim()') or '0'
                home_team_score = int(home_team_score)
            else:
                home_team_score = 0

            # Extract away team data
            away_team_name = await team_name_elements[i + 1].evaluate('(element) => element.textContent.trim()')
            away_team_logo = await team_logo_elements[i + 1].evaluate('(element) => element.src')

            # Extract away team score if team_score_elements exists and is not empty
            if team_score_elements:
                away_team_score = await team_score_elements[i + 1].evaluate('(element) => element.textContent.trim()') or '0'
                away_team_score = int(away_team_score)
            else:
                away_team_score = 0

            # Append data to games_data
            games_data.append({
                "homeTeam": {
                    "name": home_team_name,
                    "logo": home_team_logo,
                    "score": home_team_score
                },
                "awayTeam": {
                    "name": away_team_name,
                    "logo": away_team_logo,
                    "score": away_team_score
                }
            })

        return games_data

    except Exception as e:
        print(f"Error occurred while scraping: {e}")
        return []

# Function to scrape NBA games data for a specific date and cache it in Redis
async def scrape_and_cache_nba_games(page, date: str):
    redis = Redis.from_url(REDIS_URL)
    data = await scrape_nba_games(page, date)
    print(f"Data for date '{date}': {data}")
    redis.setex(date, 43200, json.dumps(data))  # Store data in cache with 12-hour expiration
    redis.close()

# Function to fetch NBA games data for a specific date from Redis cache
async def fetch_nba_games(redis, page, date: str) -> dict:
    cached_data = redis.get(date)
    if cached_data:
        return json.loads(cached_data)
    else:
        # Start a new scraping task for the specific date in a new tab
        await scrape_and_cache_nba_games(page, date)
        return await fetch_nba_games(redis, page, date)

async def fetch_and_cache_current_date_data(context):
    page = await context.new_page()
    while True:
        current_date = datetime.now().strftime("%Y-%m-%d")
        await scrape_and_cache_nba_games(page, current_date)
        await asyncio.sleep(5)  # Wait for 5 seconds before fetching data again

# Run the scraper for the current date and update cache every 5 seconds
@app.on_event("startup")
async def run_scraper():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch()
        context = await browser.new_context()
        
        await scrape_and_cache_nba_games(context, datetime.now().strftime("%Y-%m-%d"))
        asyncio.create_task(fetch_and_cache_current_date_data(context))

# Endpoint to retrieve NBA games data for a specific date
@app.get("/nba_games/")
async def get_nba_games(date: str = Query(...)):
    redis = Redis.from_url(REDIS_URL)
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch()
        context = await browser.new_context()
        
        return await fetch_nba_games(redis, context, date)
