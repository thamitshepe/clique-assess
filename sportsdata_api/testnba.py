from fastapi import FastAPI, Query
from nba_api.stats.endpoints import scoreboardv2

app = FastAPI()

@app.get("/nbadata/")
async def get_nba_data(
    date: str = Query(..., description="Date in the format 'YYYY-MM-DD'")
):
    # Call the NBA API endpoint to fetch data
    nba_data = scoreboardv2.ScoreboardV2(
        day_offset=0,
        game_date=date,
        league_id="00"  # NBA league ID
    )
    # Return the JSON response
    return nba_data.get_dict()
