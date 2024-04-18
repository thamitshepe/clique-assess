import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { format, isSameDay } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

interface Game {
  gameDate: string;
  status: string;
  homeTeam: {
    name: string;
    score: number | null;
  };
  awayTeam: {
    name: string;
    score: number | null;
  };
}

const MLB: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    const fetchMLBData = async () => {
      try {
        const response = await axios.get('https://betvision-hz2w.onrender.com/api/mlbdata');
        setGames(response.data);
      } catch (error) {
        console.error('Error fetching MLB data:', error);
      }
    };

    fetchMLBData();
    const intervalId = setInterval(fetchMLBData, 7000); // Fetch data every 70 seconds

    return () => {
      clearInterval(intervalId); // Clean up interval on unmount
    };
  }, []);

  return (
    <div className="custom-scrollbar-container">
      <MLBGames games={games} />
    </div>
  );
};

export default MLB;

export const MLBGames: React.FC<{ games: Game[] }> = ({ games }) => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const selectedDate = useSelector((state: RootState) => state.selectedDate.selectedDate ?? new Date());

  const isCurrentDate = useMemo(() => {
    const currentDate = new Date();
    return isSameDay(selectedDate, currentDate); // Check if selectedDate is the same as the current date
  }, [selectedDate]);

  // Fetch predictions data once when the component mounts
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await axios.get('http://localhost:8005/mlbpredictions');
        setPredictions(response.data);
      } catch (error) {
        console.error('Error fetching predictions:', error);
      }
    };

    fetchPredictions();
  }, []);

  const items = useMemo(() => {
    return games.map((game, index) => {
      // Find a matching or closely matching prediction based on home and away team names
      const matchedPrediction = predictions.find((prediction) => {
        const homeTeamMatch = prediction['Home Team'].toLowerCase().includes(game.homeTeam.name.toLowerCase());
        const awayTeamMatch = prediction['Away Team'].toLowerCase().includes(game.awayTeam.name.toLowerCase());
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
            {format(new Date(game.gameDate), 'HH:mm')}
          </p>

          {/* Status section */}
          <p
            style={{ width: '10%' }}
            className={`text-center align-center text-white text-sm font-medium ${game.status === 'Live' ? 'text-red2' : ''}`}
          >
            {game.status}
          </p>

          {/* Home team section */}
          <div style={{ width: '20%' }} className="flex items-center">
            {/* SVG for home team */}
            <img src={`app/src/images/mlb/${game.homeTeam.name}.svg`} alt={game.homeTeam.name} className="w-8 h-8" />
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
            <img src={`app/src/images/mlb/${game.awayTeam.name}.svg`} alt={game.awayTeam.name} className="w-8 h-8" />
            <p className="text-center align-center text-white text-sm font-medium" style={{ width: '80%' }}>
              {game.awayTeam.name}
            </p>
          </div>
          
          {/* Render the "Predicted Win" and "Probability" sections based on matched prediction */}
          {matchedPrediction && isCurrentDate && (
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
  }, [games, predictions, isCurrentDate]);

  return (
    <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent scrollbar-thumb-rounded-full" style={{ height: '59vh' }}>
      {items}
    </div>
  );
};


// Function to get SVG from URL
const getSVG = (url: string) => {
  return <img src={url} alt="SVG" className="w-8 h-8" />;
};

// Function to get league emblem or match crest based on type
const getLeagueSVG = (url: string) => {
  return getSVG(url);
};

export const MLBLeagues: React.FC = () => (
  <div className="p-2">
    {/* Render MLB league */}
    <div className="h-18 rounded-md mb-2 flex items-center">
      {/* Use the MLB emblem */}
      {getLeagueSVG('app/src/images/mlb/mlb.svg')}
      <div>
        <p className="text-md font-medium text-white">MLB</p>
        <p className="text-sm font-medium" style={{ color: 'darkgray' }}>
          United States
        </p>
      </div>
    </div>
  </div>
);
