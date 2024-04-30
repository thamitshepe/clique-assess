import React, { useEffect, useState, useMemo } from 'react';
import { isSameDay } from 'date-fns';
import * as nhlIcons from '../../images/nhl'; // Import NHL icons
import { format } from 'date-fns-tz';
import axios from 'axios';
import { useAppSelector } from '../../store/hooks'; // Import the useAppSelector hook

interface Game {
  gameDate: string;
  status: string;
  homeTeam: {
    name: string;
    score: number | null;
    logo: string;
  };
  awayTeam: {
    name: string;
    score: number | null;
    logo: string;
  };
}

export const NHLGames: React.FC<{ games: Game[]; selectedDate: Date; gamesLoaded: boolean; predictions?: any[]; }> = ({ games, selectedDate, gamesLoaded }) => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const selectedSport = useAppSelector((state) => state.selectedSport.selectedSport);

  const isCurrentDate = useMemo(() => {
    const currentDate = new Date();
    return isSameDay(selectedDate, currentDate);
  }, [selectedDate]);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        if (isCurrentDate && gamesLoaded && (selectedSport === 'nhl')) {
          const response = await axios.get('https://nhlvision.onrender.com/nhlpredictions');
          console.log('Predictions:', response.data);
          setPredictions(response.data);
        }
      } catch (error) {
        console.error('Error fetching predictions:', error);
      }
    };

    fetchPredictions();
  }, [isCurrentDate, gamesLoaded, selectedSport]);


  const items = useMemo(() => {
    return games.map((game, index) => {
      const matchedPrediction = predictions && predictions.find((prediction) => {
        const homeTeamMatch = prediction['Home Team'].toLowerCase().includes(game.homeTeam.name.toLowerCase());
        const awayTeamMatch = prediction['Away Team'].toLowerCase().includes(game.awayTeam.name.toLowerCase());
        return homeTeamMatch && awayTeamMatch;
      });

      return (
        <div
          key={index}
          className="h-18 rounded-md bg-black mb-4 p-6 px-10 flex items-center justify-between"
          style={{ display: 'flex', justifyContent: 'space-between' }}
        >
          {/* Render game details */}
          {/* Time section */}
          <p style={{ width: '6%' }} className="text-center align-center text-white text-md font-medium">
            {format(new Date(game.gameDate), 'HH:mm')}
          </p>
          {/* Home team section */}
          <div style={{ width: '20%' }} className="flex items-center">
            {/* SVG for home team */}
            <img src={game.homeTeam.logo} alt={game.homeTeam.name} className="w-8 h-8 mr-6" />
            <p className="text-center align-center text-white text-sm font-medium" style={{ width: '80%' }}>
              {game.homeTeam.name}
            </p>
          </div>
          {/* Score section */}
          <p style={{ width: '9%' }} className="text-center align-center text-white text-sm font-medium">
            {game.homeTeam.score !== null && game.awayTeam.score !== null
              ? `${game.homeTeam.score} - ${game.awayTeam.score}`
              : '0 - 0'}
          </p>
          {/* Away team section */}
          <div style={{ width: '20%' }} className="flex items-center">
            {/* SVG for away team */}
            <img src={game.awayTeam.logo} alt={game.awayTeam.name} className="w-8 h-8 mr-6" />
            <p className="text-center align-center text-white text-sm font-medium" style={{ width: '80%' }}>
              {game.awayTeam.name}
            </p>
          </div>
          {/* Render the "Predicted Win" and "Probability" sections based on matched prediction */}
          {matchedPrediction && isCurrentDate && gamesLoaded && (
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
    });
  }, [games, isCurrentDate, predictions, gamesLoaded]);

  return (
    <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent scrollbar-thumb-rounded-full" style={{ height: '59vh' }}>
      {items}
    </div>
  );
};

export const NHLLeagues: React.FC = () => (
  <div className="p-2">
    {/* Render NHL league */}
    <div className="h-18 rounded-md mb-2 flex items-center">
      {/* Use the NHL emblem */}
      {nhlIcons['NHL'] && (
        <img className='h-14 w-14 mr-4' src={nhlIcons['NHL']} alt="NHL Emblem" />
      )}
      <div>
        <p className="text-md font-medium text-white">NHL</p>
        <p className="text-sm font-medium" style={{ color: 'darkgray' }}>
          United States
        </p>
      </div>
    </div>
  </div>
);
