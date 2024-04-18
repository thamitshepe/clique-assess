import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { format, isSameDay } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import * as leagueIcons from '../../images/football/leagues'; // Import league SVGs

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
  competition_info: {
    area: {
      name: string;
    };
  };
  matches: Match[];
}


const Football: React.FC = () => {
  const [leagues, setLeagues] = useState<Competition[]>([]);

  useEffect(() => {
    const fetchLeaguesData = async () => {
      try {
        const response = await axios.get('http://localhost:8008/api/footballdata');
        const data: Competition[] = Object.values(response.data).map((leagueData: any) => ({
          name: leagueData.matches.competition_info.competition.name,
          code: leagueData.matches.competition_info.competition.code,
          emblem: leagueData.matches.competition_info.competition.emblem,
          competition_info: {
            area: {
              name: leagueData.matches.competition_info.area.name,
            },
          },
          matches: leagueData.matches.matches,
        }));
        setLeagues(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchLeaguesData();
    const intervalId = setInterval(fetchLeaguesData, 7000);
  
    return () => clearInterval(intervalId);
  }, []);
  

  return (
    <div className="custom-scrollbar-container">
      <FootballLeagues leagues={leagues} />
      <FootballMatches leagues={leagues} />
    </div>
  );
};

export default Football;

export const FootballMatches: React.FC<{ leagues: Competition[] }> = ({ leagues }) => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const selectedDate = useSelector((state: RootState) => state.selectedDate.selectedDate ?? new Date());

  const isCurrentDate = useMemo(() => {
    const currentDate = new Date();
    return isSameDay(selectedDate, currentDate); // Check if selectedDate is the same as the current date
  }, [selectedDate]);

  // Fetch soccer predictions data once when the component mounts
  useEffect(() => {
    const fetchSoccerPredictions = async () => {
      try {
        const response = await axios.get('http://localhost:8006/soccerpredictions');
        setPredictions(response.data);
      } catch (error) {
        console.error('Error fetching soccer predictions:', error);
      }
    };

    fetchSoccerPredictions();
  }, []);

  const items = useMemo(() => {
    return leagues.flatMap((competition) =>
      competition.matches.map((match: Match, index: number) => {
        // Find a matching or closely matching prediction based on home and away team names
        const matchedPrediction = predictions.find((prediction) => {
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
              <img src={match.homeTeam.crest} alt={match.homeTeam.shortName} className="w-8 h-8" />
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
              <img src={match.awayTeam.crest} alt={match.awayTeam.shortName} className="w-8 h-8" />
              <p className="text-center align-center text-white text-sm font-medium" style={{ width: '80%' }}>
                {match.awayTeam.shortName}
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
      })
    );
  }, [leagues, predictions, isCurrentDate]);

  return (
    <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent scrollbar-thumb-rounded-full" style={{ height: '59vh' }}>
      {items}
    </div>
  );
};


export const FootballLeagues: React.FC<{ leagues: Competition[] }> = ({ leagues }) => (
  <div className="p-2">
    {leagues.map((competition) => (
      <div key={competition.code} className="h-18 rounded-md mb-2 flex items-center">
        {leagueIcons[competition.code as keyof typeof leagueIcons] && (
          <img className='h-14 w-14 mr-4' src={leagueIcons[competition.code as keyof typeof leagueIcons]} alt={competition.name} />
        )}
        <div>
          <p className="text-md font-medium text-white">{competition.name}</p>
          <p className="text-sm font-medium text-gray-2">{competition.competition_info.area.name}</p>
        </div>
      </div>
    ))}
  </div>
);

