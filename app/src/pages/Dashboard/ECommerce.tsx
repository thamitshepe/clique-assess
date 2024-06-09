import React, { useState, useEffect, lazy, Suspense } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import BG from '../../images/icons/BG.png';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import 'react-calendar/dist/Calendar.css';
import { toZonedTime, format } from 'date-fns-tz';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../store/hooks'; // Import the useAppSelector hook
import { setSelectedSport } from '../../store/selectedSportSlice'; // Import the action creator
import { setSelectedLeague } from '../../store/selectedLeagueSlice';


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
  matches: Match[];
}

interface Game {
  gameDate: string;
  status: string;
  homeTeam: {
    name: string;
    abbreviation: string;
    score: number | null;
    logo: string; 
  };
  awayTeam: {
    name: string;
    abbreviation: string;
    score: number | null;
    logo: string; 
  };
}

interface Fight {
  homeFighter: {
    name: string;
  };
  awayFighter: {
    name: string;
  };
}

export interface SportState {
  selectedSport: string;
}

// Lazy-loaded components for soccer and MLB
const SoccerLeagues = lazy(() => import('../../components/Cards/soccer').then(module => ({ default: module.SoccerLeagues })));
const SoccerMatches = lazy(() => import('../../components/Cards/soccer').then(module => ({ default: module.SoccerMatches })));
const MLBLeagues = lazy(() => import('../../components/Cards/mlb').then(module => ({ default: module.MLBLeagues })));
const MLBGames = lazy(() => import('../../components/Cards/mlb').then(module => ({ default: module.MLBGames })));
const NBALeagues = lazy(() => import('../../components/Cards/nba').then(module => ({ default: module.NBALeagues })));
const NBAGames = lazy(() => import('../../components/Cards/nba').then(module => ({ default: module.NBAGames })));
const NHLGames = lazy(() => import('../../components/Cards/nhl').then(module => ({ default: module.NHLGames })));
const NHLLeagues = lazy(() => import('../../components/Cards/nhl').then(module => ({ default: module.NHLLeagues })));
const MMAFights = lazy(() => import('../../components/Cards/mma').then(module => ({ default: module.MMAFights })));
const MMALeagues = lazy(() => import('../../components/Cards/mma').then(module => ({ default: module.MMALeagues })));


const ECommerce: React.FC = () => {
  const [selectedDate] = useState(new Date()); // Directly set to today's date
  const selectedLeague = useAppSelector((state) => state.selectedLeague.selectedLeague);
  const [matches, setMatches] = useState<Competition[]>([]);
  const [fights, setFights] = useState<Fight[]>([]); // Define fights as state
  const [games, setGames] = useState<Game[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const selectedSport = useAppSelector((state) => state.selectedSport.selectedSport);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [gamesLoaded, setGamesLoaded] = useState(false); // Track whether games have been loaded
  const [predictionsLoading, setPredictionsLoading] = useState<boolean>(true);
  const dispatch = useDispatch();

  // Set selectedSport to "mlb" when the page loads
  useEffect(() => {
    dispatch(setSelectedSport("mlb"));
  }, [dispatch]);

    // Set selectedLeague to "PL" when the page loads
    useEffect(() => {
      dispatch(setSelectedLeague("PL"));
    }, [dispatch]);

  useEffect(() => {
    console.log('Selected Sport:', selectedSport);
  }, [selectedSport]);
  
  useEffect(() => {
    console.log('Selected League:', selectedLeague);
  }, [selectedLeague]);
  
  useEffect(() => {
    setMatchesLoading(true); // Set loading state to true immediately when the selected date changes
    setGamesLoaded(false); // Reset gamesLoaded state when selectedDate changes
    setPredictionsLoading(false)
  }, [selectedDate]);
  
  const formatDate = (dateInput: Date | string, timeZone: string = 'UTC') => {
    // Convert the input date to the required timezone
    const date = new Date(dateInput);
    const zonedDate = toZonedTime(date, timeZone);
  
    // Format the date as YYYY-MM-DD in the specified time zone
    return format(zonedDate, 'yyyy-MM-dd', { timeZone });
  };
  
  useEffect(() => {
    // Reset state variables for MLB data
    if (selectedSport === 'mlb') {
      setGames([]);
      setPredictions([]);
      setMatchesLoading(true); // Set loading state to true immediately when the selected date changes
  
      const fetchMLBData = async () => {
        try {
          const response = await axios.get(`https://sportsvision.onrender.com/api/mlbdata?start_date=${formatDate(selectedDate)}&end_date=${formatDate(selectedDate)}`);
          setGames(response.data);
  
        } finally {
          // Set gamesLoaded to true after games are fetched and set
          setGamesLoaded(true);
          if (predictionsLoading) {
            setMatchesLoading(true);
          }
          // Wait for 2 seconds before setting loading to false
          setTimeout(() => {
            setMatchesLoading(false);
          }, 3000);
        }
      };
  
      fetchMLBData();
    }
  }, [selectedDate, selectedSport]);
  
  useEffect(() => {
    // Reset state variables for NBA data
    if (selectedSport === 'nba') {
      setGames([]);
      setPredictions([]);
      setMatchesLoading(true); // Set loading state to true immediately when the selected date changes
  
      const fetchNBAData = async () => {
        try {
          const response = await axios.get(`https://sportsvision.onrender.com/api/nbadata`);
          setGames(response.data);
  
        } finally {
          // Set gamesLoaded to true after games are fetched and set
          setGamesLoaded(true);
          if (predictionsLoading) {
            setMatchesLoading(true);
          }
          // Wait for 2 seconds before setting loading to false
          setTimeout(() => {
            setMatchesLoading(false);
          }, 3000);
        }
      };
  
      fetchNBAData();
    }
  }, [ selectedSport]);
  
  useEffect(() => {
    // Reset state variables for NHL data
    if (selectedSport === 'nhl') {
      setGames([]);
      setPredictions([]);
      setMatchesLoading(true); // Set loading state to true immediately when the selected date changes
  
      const fetchNHLData = async () => {
        try {
          const response = await axios.get(`https://sportsvision.onrender.com/api/nhldata?game_date=${formatDate(selectedDate)}`);
          setGames(response.data);
  
        } finally {
          // Set gamesLoaded to true after games are fetched and set
          setGamesLoaded(true);
          if (predictionsLoading) {
            setMatchesLoading(true);
          }
          // Wait for 2 seconds before setting loading to false
          setTimeout(() => {
            setMatchesLoading(false);
          }, 3000);
        }
      };
  
      fetchNHLData();
    }
  }, [selectedDate, selectedSport]);


  useEffect(() => {
  // Reset state variables for MMA data
  if (selectedSport === 'mma') {
    setFights([]); // Reset fights data
    setMatchesLoading(true); // Set loading state to true immediately when the selected date changes

    const fetchMMAData = async () => {
      try {
        const response = await axios.get(`https://sportsvision.onrender.com/api/mmadata?date=${formatDate(selectedDate)}`);
        setFights(response.data); // Set MMA fights data
      } finally {
        // Set fightsLoaded to true after fights are fetched and set
        setMatchesLoading(true);
        // Wait for 3 seconds before setting loading to false
        setTimeout(() => {
          setMatchesLoading(false);
        }, 3000);
      }
    };

    fetchMMAData();
  }
}, [selectedDate, selectedSport]);

  useEffect(() => {
    if (selectedSport === 'soccer') {
      // Reset state variables for soccer data
      setMatches([]);
      setPredictions([]);
      setMatchesLoading(true); // Set loading state to true immediately when the selected date changes
  
      const fetchSoccerData = async () => {
        try {
          // Fetch soccer data with the competition code query parameter
          const soccerResponse = await axios.get(`https://sportsvision.onrender.com/api/soccerdata?competition_code=${selectedLeague}&date_from=${formatDate(selectedDate)}&date_to=${formatDate(selectedDate)}`);
  
          // Process the soccer data response
          const soccerData: Competition = {
            matches: soccerResponse.data.matches // Assuming the response directly contains matches array
          };
  
          // Set the matches state with the fetched data
          setMatches([soccerData]); // Wrap soccerData in an array as it's of type Competition
        } catch (error) {
          console.error('Error fetching soccer data:', error);
        } finally {
          // Set gamesLoaded to true after games are fetched and set
          setGamesLoaded(true);
          // Wait for 2 seconds before setting loading to false
          setTimeout(() => {
            setMatchesLoading(false);
          }, 3000);
        }
      };
  
      fetchSoccerData();
    }
  }, [selectedDate, selectedLeague, selectedSport]);  


    // Render the appropriate component based on selectedSport
    const renderLeagueComponent = () => {
      switch (selectedSport) {
        case 'mlb':
          return <MLBLeagues />;
        case 'soccer':
          return < SoccerLeagues/>;
        case 'nhl':
          return < NHLLeagues/>;
        case 'nba':
          return < NBALeagues/>;
        case 'mma':
          return < MMALeagues/>;
        default:
          return <MLBLeagues />;
      }
    };

    // Render the appropriate component based on selectedSport
    const renderMatchComponent = () => {
      switch (selectedSport) {
        case 'mlb':
          return <MLBGames games={games} selectedDate={selectedDate} predictions={predictions} gamesLoaded={gamesLoaded} />;
        case 'soccer':
          return <SoccerMatches leagues={matches} selectedDate={selectedDate} predictions={predictions} gamesLoaded={gamesLoaded} />;
        case 'nhl':
          return <NHLGames games={games} selectedDate={selectedDate} predictions={predictions} gamesLoaded={gamesLoaded} />;
        case 'nba':
          return <NBAGames games={games} selectedDate={selectedDate} predictions={predictions} gamesLoaded={gamesLoaded} />;
        case 'mma':
          return <MMAFights fights={fights} selectedDate={selectedDate} predictions={predictions} gamesLoaded={gamesLoaded} />;
        default:
        return <MLBGames games={games} predictions={predictions}  selectedDate={selectedDate} gamesLoaded={gamesLoaded} />;
      }
    };

    
    const LeaguesSkeletonLoader: React.FC = () => (
      <div className="p-2">
      {/* Placeholder for league items */}
      <div className="h-10 bg-black rounded-md mb-2 flex items-center animate-pulse">
      </div>
    </div>
    );

const MatchesSkeletonLoader: React.FC = () => (
  <div className="p-2">
    {/* Placeholder for match items */}
    <div className="h-19 rounded-md bg-black mb-4 p-6 flex items-center justify-between animate-pulse">
    </div>
  </div>
);


useEffect(() => {
  console.log('Selected Date:', selectedDate);
}, [selectedDate]);


  return (
    <DefaultLayout>
      <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-1 relative">
        <div className="bg-black rounded-xl px-8 flex relative">
          <div className="flex-1 mr-6">
            <h2 className="text-3xl md:text-md font-semibold text-white mt-12 mb-10">BetVision AI</h2>
            <div className="max-w-xs">
              <p className="text-sm text-white mb-10">
                Maximize your winnings and minimize risks with our advanced prediction algorithms
              </p>
            </div>
            <button className="bg-[#623CEA] text-white px-8 py-2 rounded-lg hover:bg-[#5A31A3] transition duration-300 ease-in-out shadow-md shadow-white/30 mb-12">Props Picks</button>
          </div>
        </div>
        <div className="static">
        <img
          src={BG}
          alt="Background"
          className="absolute top-0 right-0 banner-image w-auto h-full"        
        />
      </div>
      </div>

      <div className="mt-4 md:mt-6 2xl:mt-7.5 relative flex 3xl:flex-row gap-4 2xl:flex-row gap-4 1xl:flex-row gap-4 0.5xl:flex-col md:flex-col sm:flex-col" style={{ gap: '2rem' }}>
        <div className="w-full md:w-1/3 lg:w-1/3 xl:w-1/3 flex-col items-center mb-4 md:mb-0">
          <h2 className="text-white lg:text-lg md:text-md mb-6">Leagues</h2>
          <div className="flex-1 bg-black rounded-md overflow-y-auto scrollbar-thin scrollbar-thumb-body scrollbar-track-transparent scrollbar-thumb-rounded-full" style={{ minWidth: 'max-content' }}>
            <div className="p-2">
              {/* Conditionally render soccer or MLB leagues based on selectedSport */}
                {/* Render the appropriate sport component */}
                <Suspense fallback={<LeaguesSkeletonLoader />}>
                {renderLeagueComponent()}
                </Suspense>
            </div>
          </div>
        </div>

        <div className="w-full md:w-md lg:w-2/3 xl:w-2/3 flex-col items-center relative">
          <div className="flex gap-4">
            <h2 className="text-white lg:text-lg md:text-md mb-6 mr-4 cursor-pointer">Matches</h2>
            <h2 className="text-white lg:text-lg md:text-md mb-6 mr-4 cursor-pointer">Money Line</h2>
          </div>
          <div className="flex-1">
            <div className="flex flex-col h-full">
              <div className="flex-1 w-full">
              <Suspense fallback={<MatchesSkeletonLoader />}>
              {matchesLoading ? <MatchesSkeletonLoader /> : renderMatchComponent()}
              </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
  
};



export default ECommerce;
