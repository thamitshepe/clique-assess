import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { isSameDay } from 'date-fns';
import useLocalStorage from '../../hooks/useLocalStorage'; 
import * as mlbIcons from '../../images/mlb';
import { toZonedTime, format } from 'date-fns-tz';

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
  const selectedDate = localStorage.getItem('selectedDate') || '';
  const [matchesLoading, setMatchesLoading] = useState(true);

  useEffect(() => {
    const fetchMLBData = async () => {
      setMatchesLoading(true); // Set loading state to true before fetching data
      try {
        const response = await axios.get(`https://betvision-hz2w.onrender.com/api/mlbdata?startDate=${formatDate(selectedDate)}&endDate=${formatDate(selectedDate)}`);
        setGames(response.data);
      } catch (error) {
        console.error('Error fetching MLB data:', error);
      } finally {
        // Set loading state to false whether the data is fetched successfully or not
        setMatchesLoading(false);
      }
    };
    
    fetchMLBData();
  }, [selectedDate]);

  const formatDate = (dateInput: Date | string, timeZone: string = 'UTC') => {
    // Convert the input date to the required timezone
    const date = new Date(dateInput);
    const zonedDate = toZonedTime(date, timeZone);
    
    // Format the date as YYYY-MM-DD in the specified time zone
    return format(zonedDate, 'yyyy-MM-dd', { timeZone });
  };
  

  return (
    <div className="custom-scrollbar-container">
      <MLBGames games={games} />
    </div>
  );
};

export default MLB;

export const MLBGames: React.FC<{ games: Game[] }> = ({ games }) => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [selectedDate] = useLocalStorage('selectedDate', new Date());

  const isCurrentDate = useMemo(() => {
    const currentDate = new Date();
    return isSameDay(selectedDate, currentDate); // Check if selectedDate is the same as the current date
  }, [selectedDate]);

  // Fetch predictions data once when the component mounts
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await axios.get('https://betvision-ai.onrender.com/mlbpredictions');
        setPredictions(response.data);
      } catch (error) {
        console.error('Error fetching predictions:', error);
      }
    };

    fetchPredictions();
  }, []);

  useEffect(() => {
    console.log("Games:", games); // Debugging: Check if matches state is received correctly
  }, [games]);

  // Function to modify team names
  const modifyTeamName = (name: string): string => {
    return name.replace(/\s/g, '_').replace(/\./g, '');
  };

  // Type assertion to inform TypeScript about the type of mlbIcons
  const mlbIconsTyped: Record<string, any> = mlbIcons;

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
            <img
              src={mlbIconsTyped[modifyTeamName(game.homeTeam.name).replace(/\s/g, "_")]}
              alt={game.awayTeam.name}
              className="w-8 h-8 mr-6"
            />
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
            <img
              src={mlbIconsTyped[modifyTeamName(game.awayTeam.name).replace(/\s/g, "_")]}
              alt={game.awayTeam.name}
              className="w-8 h-8 mr-6"
            />
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


export const MLBLeagues: React.FC = () => (
  <div className="p-2">
    {/* Render MLB league */}
    <div className="h-18 rounded-md mb-2 flex items-center">
      {/* Use the MLB emblem */}
      {mlbIcons['mlb'] && (
        <img className='h-14 w-14 mr-4' src={mlbIcons['mlb']} alt="MLB Emblem" />
      )}
      <div>
        <p className="text-md font-medium text-white">MLB</p>
        <p className="text-sm font-medium" style={{ color: 'darkgray' }}>
          United States
        </p>
      </div>
    </div>
  </div>
);