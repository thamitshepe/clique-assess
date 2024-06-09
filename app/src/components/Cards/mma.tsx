import React, { useEffect, useState, useMemo } from 'react';
import { isSameDay } from 'date-fns';
import axios from 'axios';
import * as mmaIcons from '../../images/mma'; // Import MMA icons
import { useAppSelector } from '../../store/hooks'; // Import the useAppSelector hook

interface Fight {
  homeFighter: {
    name: string;
  };
  awayFighter: {
    name: string;
  };
}

export const MMAFights: React.FC<{ fights: Fight[]; selectedDate: Date; gamesLoaded: boolean; predictions?: any[]; }> = ({ fights, selectedDate, gamesLoaded }) => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const selectedSport = useAppSelector((state) => state.selectedSport.selectedSport);

  const isCurrentDate = useMemo(() => {
    const currentDate = new Date();
    return isSameDay(selectedDate, currentDate);
  }, [selectedDate]);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        if (isCurrentDate && gamesLoaded && (selectedSport === 'mma')) {
          const response = await axios.get('https://betvision-ai.onrender.com/ufcpredictions');
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
    return fights.map((fight, index) => {
      const matchedPrediction = predictions && predictions.find((prediction) => {
        const homeFighterMatch = prediction['Home Fighter'].includes(fight.homeFighter.name());
        const awayFighterMatch = prediction['Away Fighter'].includes(fight.awayFighter.name());
        return homeFighterMatch && awayFighterMatch;
      });

      return (
        <div
          key={index}
          className="h-18 rounded-md bg-black mb-4 p-6 px-10 flex items-center justify-between"
          style={{ display: 'flex', justifyContent: 'space-between' }}
        >
          {/* Render fight details */}
          {/* Home fighter section */}
          <div style={{ width: '25%' }} className="flex items-center">
            {/* SVG for home fighter */}
            <img
              alt={fight.homeFighter.name}
              className="w-8 h-8 mr-6"
            />
            <p className="text-center align-center text-white text-sm" style={{ width: '80%' }}>
              {fight.homeFighter.name}
            </p>
          </div>
          {/* Away fighter section */}
          <div style={{ width: '25%' }} className="flex items-center">
            {/* SVG for away fighter */}
            <img
              alt={fight.awayFighter.name}
              className="w-8 h-8 mr-6"
            />
            <p className="text-center align-center text-white text-sm" style={{ width: '80%' }}>
              {fight.awayFighter.name}
            </p>
          </div>
          {/* Render the "Predicted Win" and "Probability" sections based on matched prediction */}
          {matchedPrediction && isCurrentDate && gamesLoaded && (
            <>
              {/* Predicted win section */}
              <div style={{ width: '10%' }} className="flex flex-col items-center justify-center">
                <p className="text-center align-center text-white text-sm">{matchedPrediction['Predicted Winner']}</p>
              </div>
              {/* Probability section */}
              <div style={{ width: '10%' }} className="flex flex-col items-center justify-center">
                <p className="text-center align-center text-white text-sm">{matchedPrediction['Probability (%)'].toFixed(2)}%</p>
              </div>
            </>
          )}
        </div>
      );
    });
  }, [fights, isCurrentDate, predictions, gamesLoaded]);

  return (
    <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent scrollbar-thumb-rounded-full" style={{ height: '59vh' }}>
      {items}
    </div>
  );
};

export const MMALeagues: React.FC = () => (
  <div className="p-2">
    {/* Render MMA league */}
    <div className="h-10 rounded-md mb-2 flex items-center" style={{ minWidth: 'max-content' }}>
      {/* Use the MMA emblem */}
      {mmaIcons['ufc'] && (
        <img className='h-14 w-14 mr-4 ml-1' src={mmaIcons['ufc']} alt="UFC Emblem" />
      )}
      <div>
        <p className="text-md text-white">UFC</p>
        <p className="text-sm" style={{ color: 'darkgray' }}>
          United States
        </p>
      </div>
    </div>
  </div>
);
