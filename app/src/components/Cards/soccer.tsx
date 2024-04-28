import React, { useEffect, useMemo, useState } from 'react';
import { isSameDay } from 'date-fns';
import { format } from 'date-fns-tz';
import * as leagueIcons from '../../images/soccer'; // Import league SVGs
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setSelectedLeague } from '../../store/selectedLeagueSlice'; // Import the action creator
import { useAppSelector } from '../../store/hooks'; // Import the useAppSelector hook


interface Match {
  utcDate: string;
  status: string;
  homeTeam: {
    shortName: string; // Change 'name' to 'shortName'
    crest: string;
  };
  awayTeam: {
    shortName: string; // Change 'name' to 'shortName'
    crest: string;
  };
  score: {
    fullTime: {
      home: number | null; // Change 'homeTeam' to 'home'
      away: number | null; // Change 'awayTeam' to 'away'
    };
    halfTime: {
      home: number | null; // Change 'homeTeam' to 'home'
      away: number | null; // Change 'awayTeam' to 'away'
    };
  };
}

interface Competition {
  name: string;
  code: string;
  emblem: string;
  matches: Match[];
}


export const SoccerMatches: React.FC<{ leagues: Competition[]; selectedDate: Date; predictions?: any[];  gamesLoaded: boolean; }> = ({ leagues, selectedDate, gamesLoaded }) => {
  const [predictions, setPredictions] = useState<any[]>([]);
    const selectedLeague = useAppSelector((state) => state.selectedLeague.selectedLeague);

  const isCurrentDate = useMemo(() => {
    const currentDate = new Date();
    return isSameDay(selectedDate, currentDate);
  }, [selectedDate]);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        if (isCurrentDate && gamesLoaded) {
          let predictionURL = '';

          // Determine the prediction URL based on the selected league
          if (selectedLeague === 'PL') {
            predictionURL = 'https://plvision.onrender.com/soccerpredictions';
          } else if (selectedLeague === 'PPL') {
            predictionURL = 'https://pplvision.onrender.com/soccerpredictions';
          } else if (selectedLeague === 'BL1') {
            predictionURL = 'https://bl1vision.onrender.com/soccerpredictions';
          }
  
          if (predictionURL) {
            const response = await axios.get(predictionURL);
            console.log('Predictions:', response.data);
            setPredictions(response.data);
          }
        }
      } catch (error) {
        console.error('Error fetching predictions:', error);
      }
    };
  
    fetchPredictions();
  }, [isCurrentDate, gamesLoaded]);

  const items = useMemo(() => {
    return leagues.flatMap((competition) =>
      competition.matches.map((match: Match, index: number) => {
        // Find a matching or closely matching prediction based on home and away team names
        const matchedPrediction = predictions && predictions.find((prediction) => { // Check if predictions exist
          const homeTeamMatch = prediction['Home Team'].toLowerCase().includes(match.homeTeam.shortName.toLowerCase());
          const awayTeamMatch = prediction['Away Team'].toLowerCase().includes(match.awayTeam.shortName.toLowerCase());
          return homeTeamMatch && awayTeamMatch;
        });

        return (
          <div
            key={index}
            className="h-15 rounded-md bg-black mb-4 p-6 px-10 flex items-center justify-between"
            style={{ display: 'flex', justifyContent: 'space-between' }}
          >
            {/* Time section */}
            <p style={{ width: '6%' }} className="text-center align-center text-white text-md font-medium">
              {format(new Date(match.utcDate), 'HH:mm')}
            </p>

            {/* Status section */}
            <p
              style={{ width: '10%' }}
              className={`text-center align-center text-white text-sm font-medium ${match.status === 'Live' ? 'text-red2' : ''}`}
            >
              {match.status}
            </p>

            {/* Home team section */}
            <div style={{ width: '20%' }} className="flex items-center">
              {/* SVG for home team */}
              <img src={match.homeTeam.crest} alt={match.homeTeam.shortName} className="w-8 h-8 mr-6" />
              <p className="text-center align-center text-white text-sm font-medium" style={{ width: '80%' }}>
                {match.homeTeam.shortName}
              </p>
            </div>

            {/* Score section */}
            <p style={{ width: '9%' }} className="text-center align-center text-white text-sm font-medium ml-2 mr-2">
              {match.score?.fullTime?.home !== null && match.score?.fullTime?.away !== null
                ? `${match.score.fullTime.home} - ${match.score.fullTime.away}`
                : match.score?.halfTime?.home !== null && match.score?.halfTime?.away !== null
                ? `${match.score.halfTime.home} - ${match.score.halfTime.away}`
                : '0 - 0'}
            </p>

            {/* Away team section */}
            <div style={{ width: '20%' }} className="flex items-center">
              {/* SVG for away team */}
              <img src={match.awayTeam.crest} alt={match.awayTeam.shortName} className="w-8 h-8 mr-6" />
              <p className="text-center align-center text-white text-sm font-medium" style={{ width: '80%' }}>
                {match.awayTeam.shortName}
              </p>
            </div>
            
            {/* Render the "Predicted Win" and "Probability" sections based on matched prediction */}
            {matchedPrediction && isCurrentDate &&  gamesLoaded && (
              <>
                {/* Predicted win section */}
                <div style={{ width: '10%' }} className="flex flex-col items-center justify-center">
                  <p className="text-center align-center text-white text-sm font-medium">{matchedPrediction['Predicted Winner']}</p>
                </div>

                {/* Probability section */}
                <div style={{ width: '10%' }} className="flex flex-col items-center justify-center">
                  <p className="text-center align-center text-white text-sm font-medium">{matchedPrediction['Probability (%)'].toFixed(2)}%</p>
                </div>
              </>
            )}
          </div>
        );
      })
    );
  }, [leagues, predictions, isCurrentDate]);

  return (
    <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent scrollbar-thumb-rounded-full" style={{ height: '59vh' }}>
      {items}
    </div>
  );
};

export const FootballLeagues: React.FC = () => (
  <div className="p-2">
      <div className="h-18 rounded-md mb-2 flex items-center">
        {leagueIcons['PL'] && (
          <img className='h-14 w-14 mr-4' src={leagueIcons['PL']} alt="MLB Emblem" />
        )}
        <div>
          <p className="text-md font-medium text-white">Premier League</p>
          <p className="text-sm font-medium" style={{ color: 'darkgray' }}>
            England
          </p>
        </div>
      </div>
    )
  </div>
);

export const SoccerLeagues: React.FC = () => {

    const dispatch = useDispatch();
    // Function to handle icon click
    const handleLeagueClick = (leaguecode: string) => {
      dispatch(setSelectedLeague(leaguecode)); // Dispatch the action with the selected league
    };

  return (
    <div className="p-2">
      {/* Premier League */}
      <div className="h-18 rounded-md mb-4 flex items-center" onClick={() => handleLeagueClick('PL')} style={{ cursor: 'pointer' }}>
        {leagueIcons['PL'] && (
          <img className='h-14 w-14 mr-4' src={leagueIcons['PL']} alt="Premier League Emblem" />
        )}
        <div>
          <p className="text-md font-medium text-white">Premier League</p>
          <p className="text-sm font-medium" style={{ color: 'darkgray' }}>
            England
          </p>
        </div>
      </div>
      
      {/* Primeira Liga */}
      <div className="h-18 rounded-md mb-4 flex items-center" onClick={() => handleLeagueClick('PPL')} style={{ cursor: 'pointer' }}>
        {leagueIcons['PPL'] && (
          <img className='h-14 w-14 mr-4' src={leagueIcons['PPL']} alt="Primeira Liga Emblem" />
        )}
        <div>
          <p className="text-md font-medium text-white">Primeira Liga</p>
          <p className="text-sm font-medium" style={{ color: 'darkgray' }}>
            Portugal
          </p>
        </div>
      </div>
      
      {/* Bundesliga */}
      <div className="h-18 rounded-md mb-4 flex items-center" onClick={() => handleLeagueClick('BL1')} style={{ cursor: 'pointer' }}>
        {leagueIcons['BL1'] && (
          <img className='h-14 w-14 mr-4' src={leagueIcons['BL1']} alt="Bundesliga Emblem" />
        )}
        <div>
          <p className="text-md font-medium text-white">Bundesliga</p>
          <p className="text-sm font-medium" style={{ color: 'darkgray' }}>
            Germany
          </p>
        </div>
      </div>
    </div>
  );
};
