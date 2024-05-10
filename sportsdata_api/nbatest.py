from fastapi import FastAPI, HTTPException, Query
from nba_api.stats.endpoints import scoreboardv2

app = FastAPI()

# Custom ScoreboardV2 class with custom headers
class CustomScoreboardV2(scoreboardv2.ScoreboardV2):
    def __init__(self, headers=None, game_date=None, **kwargs):
        super().__init__(game_date=game_date, **kwargs)
        self.headers = headers or {}

# Define custom headers
custom_headers = {
    'Host': 'stats.nba.com',
    'Connection': 'keep-alive',
    'Cache-Control': 'max-age=0',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
}

async def get_nba_data(date: str = Query(..., description="Date in the format 'YYYY-MM-DD'")):
    try:
        # Call the NBA API endpoint to fetch data
        nba_data = CustomScoreboardV2(
            headers=custom_headers,
            game_date=date,
            day_offset=0,
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
                away_line_score = line_scores[i+1]
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

        return extracted_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching NBA data: {str(e)}")

@app.get("/api/nbadata/")
async def fetch_nba_data_api(date: str = Query(..., description="Date in the format 'YYYY-MM-DD'")):
    return await get_nba_data(date)
