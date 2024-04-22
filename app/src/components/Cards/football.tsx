import React, { useState, useEffect, useMemo } from 'react';
import { isSameDay } from 'date-fns';
import { format } from 'date-fns-tz';
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

const Football: React.FC<{ leagues: Competition[], predictions: any[], selectedDate: Date }> = ({ predictions, selectedDate }) => {
  const [leagues] = useState<Competition[]>([]);
  

  return (
    <div className="custom-scrollbar-container">
      <FootballLeagues leagues={leagues} />
      <FootballMatches leagues={leagues} predictions={predictions} selectedDate={selectedDate}/>
    </div>
  );
};

export default Football;

export const FootballMatches: React.FC<{ leagues: Competition[]; selectedDate: Date; predictions?: any[] }> = ({ leagues, predictions, selectedDate }) => {
  const isCurrentDate = useMemo(() => {
    const currentDate = new Date();
    return isSameDay(selectedDate, currentDate); // Check if selectedDate is the same as the current date
  }, [selectedDate]);


  useEffect(() => {
    console.log("Games:", leagues); // Debugging: Check if matches state is received correctly
  }, [leagues]);

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