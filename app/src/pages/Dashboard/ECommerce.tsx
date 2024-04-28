import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import BG from '../../images/icons/BG.svg';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import CalendarIcon from '../../images/icons/calender.png';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { addDays, getYear, isBefore } from 'date-fns';
import { toZonedTime, format } from 'date-fns-tz';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../store/hooks'; // Import the useAppSelector hook
import { setSelectedSport } from '../../store/selectedSportSlice'; // Import the action creator
import { setSelectedLeague } from '../../store/selectedLeagueSlice'; // Import the action creator

interface DateWithIndex {
  date: string;
  day: string;
}

interface DatesWithIndex {
  [year: number]: DateWithIndex[];
}

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

interface Game {
  gameDate: string;
  status: string;
  homeTeam: {
    name: string;
    abbreviation?: string;
    score: number | null;
    logo?: string; 
  };
  awayTeam: {
    name: string;
    abbreviation?: string;
    score: number | null;
    logo?: string; 
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
const NHLLeagues = lazy(() => import('../../components/Cards/nhl').then(module => ({ default: module.NHLLeagues })));
const NHLGames = lazy(() => import('../../components/Cards/nhl').then(module => ({ default: module.NHLGames })));
const NBALeagues = lazy(() => import('../../components/Cards/nba').then(module => ({ default: module.NBALeagues })));
const NBAGames = lazy(() => import('../../components/Cards/nba').then(module => ({ default: module.NBAGames })));

const ECommerce: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date()); // Directly set to today's date
  const selectedLeague = useAppSelector((state) => state.selectedLeague.selectedLeague);
  const [currentYear, setCurrentYear] = useState<number>(getYear(new Date()));
  const [datesWithIndex, setDatesWithIndex] = useState<DatesWithIndex>({});
  const [matches, setMatches] = useState<Competition[]>([]);
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
          const response = await axios.get(`https://sportsvision.onrender.com/nbadata?game_date=${formatDate(selectedDate)}`);
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
  }, [selectedDate, selectedSport]);
  
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
    // Reset state variables for soccer data
    if (selectedSport === 'soccer') {
      // Set selectedLeague to "PL" when the page loads
      useEffect(() => {
        dispatch(setSelectedLeague("PL"));
      }, [dispatch]);
      
      setMatches([]);
      setPredictions([]);
      setMatchesLoading(true); // Set loading state to true immediately when the selected date changes
  
      const fetchSoccerData = async () => {
        try {
  
          // Fetch soccer data with the competition code query parameter
          const soccerResponse = await axios.get(`https://sportsvision.onrender.com/api/soccerdata?competition_code=${selectedLeague}&date_from=${formatDate(selectedDate)}&date_to=${formatDate(selectedDate)}`);
  
          // Process the soccer data response
          const soccerData: Competition[] = Object.values(soccerResponse.data).map((leagueData: any) => ({
            name: leagueData.matches.competition_info.competition.name,
            code: leagueData.matches.competition_info.competition.code,
            emblem: leagueData.matches.competition_info.competition.emblem,
            competition_info: {
              area: {
                name: leagueData.matches.competition_info.area.name,
              },
            },
            matches: leagueData.matches.matches
          }));
  
          // Set the leagues state with the fetched data
          setMatches(soccerData);
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
        case 'NHL':
          return <NHLGames games={games} selectedDate={selectedDate} predictions={predictions} gamesLoaded={gamesLoaded} />;
        case 'nba':
          return <NBAGames games={games} selectedDate={selectedDate} predictions={predictions} gamesLoaded={gamesLoaded} />;
        default:
        return <MLBGames games={games} predictions={predictions}  selectedDate={selectedDate} gamesLoaded={gamesLoaded} />;
      }
    };

    
    const LeaguesSkeletonLoader: React.FC = () => (
      <div className="p-2">
      {/* Placeholder for league items */}
      <div className="h-18 bg-black rounded-md mb-2 flex items-center animate-pulse">
        {/* Placeholder for league icon */}
        <div className="w-14 h-14 bg-black rounded-full mr-4"></div>
        {/* Placeholder for league details */}
        <div>
          {/* Placeholder for league name */}
          <div className="w-48 h-6 bg-black rounded-md mb-2"></div>
          {/* Placeholder for league country */}
          <div className="w-24 h-4 bg-black rounded-md"></div>
        </div>
      </div>
    </div>
    );

const MatchesSkeletonLoader: React.FC = () => (
  <div className="p-2">
    {/* Placeholder for match items */}
    <div className="h-19 rounded-md bg-black mb-4 p-6 flex items-center justify-between animate-pulse">
      {/* Placeholder for time section */}
      <div style={{ width: '8%' }} className="h-6 bg-black rounded-md"></div>

      {/* Placeholder for status section */}
      <div style={{ width: '12%' }} className="h-6 bg-black rounded-md"></div>

      {/* Placeholder for home team section */}
      <div style={{ width: '20%' }} className="h-6 bg-black rounded-md flex items-center">
        <div className="w-14 h-14 bg-black rounded-full mr-4"></div>
        <div className="w-16 h-4 bg-black rounded-md"></div>
      </div>

      {/* Placeholder for score section */}
      <div style={{ width: '5%' }} className="h-6 bg-black rounded-md"></div>

      {/* Placeholder for away team section */}
      <div style={{ width: '20%' }} className="h-6 bg-black rounded-md flex items-center">
        <div className="w-14 h-14 bg-black rounded-full mr-4"></div>
        <div className="w-16 h-4 bg-black rounded-md"></div>
      </div>

      {/* Placeholder for predicted win section */}
      <div style={{ width: '10%' }} className="h-6 bg-black rounded-md"></div>
      
      {/* Placeholder for probability section */}
      <div style={{ width: '10%' }} className="h-6 bg-black rounded-md"></div>
    </div>
  </div>
);

useEffect(() => {
  const generatedDatesWithIndex = generateDatesWithIndex();
  setDatesWithIndex(generatedDatesWithIndex);
  const currentDateIndex = generatedDatesWithIndex[currentYear]?.findIndex(
    (d) => d.date === format(selectedDate, 'yyyy-MM-dd')
  );
  setSelectedItem(currentDateIndex); // Update selected item when the selected date changes
}, [currentYear, selectedDate]);

const generateDatesWithIndex = (): DatesWithIndex => {
  const startDate = new Date(2002, 8, 1); // August 1, 2002
  const endDate = new Date(2025, 11, 31); // December 31, 2025
  const datesWithIndex: DatesWithIndex = {};

  let date = startDate;
  while (isBefore(date, endDate) || date.getTime() === endDate.getTime()) {
    const year = getYear(date);
    if (!datesWithIndex[year]) {
      datesWithIndex[year] = [];
    }
    datesWithIndex[year].push({
      date: format(date, 'yyyy-MM-dd'),
      day: format(date, 'EEEE'),
    });
    date = addDays(date, 1);
  }
  return datesWithIndex;
};

// Function to handle day click
const handleDayClick = (value: Date) => {
  setSelectedDate(value); // Dispatch action to update selectedDate
  setCurrentYear(getYear(value));

  // Find the index of the clicked date in the current year's datesWithIndex array
  const clickedDateIndex = datesWithIndex[getYear(value)]?.findIndex(
    (d) => d.date === format(value, 'yyyy-MM-dd')
  );

  if (clickedDateIndex !== undefined && selectedItem !== null) {
    // Scroll to the new index by updating selectedItem
    setSelectedItem(clickedDateIndex);

    // Hide the calendar after a date is clicked
    setShowCalendar(false);
  }
};

useEffect(() => {
  console.log('Selected Date:', selectedDate);
}, [selectedDate]);


const renderCarouselItems = useMemo(() => {
  const itemsToRender = datesWithIndex[currentYear] || [];
  return itemsToRender.map((date: DateWithIndex, index: number) => (
    <div key={index} style={{ width: '100%', cursor: 'pointer' }} onClick={() => handleDayClick(new Date(date.date))}>
      <p className="text-sm font-medium text-white">{date.date}</p>
      <p className="text-lg font-medium text-white">{date.day}</p>
    </div>
  ));
}, [datesWithIndex, currentYear]);

// Function to handle carousel change
const handleCarouselChange = (index: number) => {
  setSelectedItem(index);
  const itemsToRender = datesWithIndex[currentYear] || [];
  const selectedDate = new Date(itemsToRender[index].date);
  setSelectedDate(selectedDate); 
};

const [centerSlidePercentage, setCenterSlidePercentage] = useState(20);

useEffect(() => {
  const updateCenterSlidePercentage = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 1200) {
      setCenterSlidePercentage(35);
    } else {
      setCenterSlidePercentage(20);
    }
  };

  // Call the function initially and on window resize
  updateCenterSlidePercentage();
  window.addEventListener('resize', updateCenterSlidePercentage);

  // Remove the event listener on component unmount
  return () => {
    window.removeEventListener('resize', updateCenterSlidePercentage);
  };
}, []);  


  return (
    <DefaultLayout>
      <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-1 relative">
        <div className="bg-black rounded-xl px-8 flex relative">
          <div className="flex-1 mr-6">
            <h2 className="text-3xl font-semibold text-white mt-12 mb-10">BetVision AI</h2>
            <div className="max-w-xs">
              <p className="text-sm text-white mb-10">
                Maximize your winnings and minimize risks with our advanced prediction algorithms
              </p>
            </div>
            <button className="bg-[#623CEA] text-white px-8 py-2 rounded-lg hover:bg-[#5A31A3] transition duration-300 ease-in-out shadow-md shadow-white/30 mb-12">Props Picks</button>
          </div>
        </div>
        <div className="absolute right-0 top-0">
          <img
            src={BG}
            alt="Background"
            className="w-auto h-full"
            style={{ transform: "translateY(-30.5%) translateX(11%) scale(0.86)"}} 
          />
        </div>
      </div>

      <div className="mt-4 md:mt-6 2xl:mt-7.5 relative flex flex-col md:flex-row gap-4" style={{ gap: '2rem' }}>
        <div className="w-full md:w-1/3 lg:w-1/3 xl:w-1/3 flex-col items-center mb-4 md:mb-0">
          <h2 className="text-white text-lg font-medium mb-6">Leagues</h2>
          <div className="flex-1 bg-black rounded-md h-[76vh] overflow-y-scroll scrollbar-thin scrollbar-thumb-body scrollbar-track-transparent scrollbar-thumb-rounded-full">
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
            <h2 className="text-white text-lg font-medium mb-6 mr-4 cursor-pointer">Matches</h2>
          </div>
          <div className="flex-1">
            <div className="flex flex-col h-full">
              <div className="relative carousel-container">
                <div className="h-21 rounded-md bg-black p-4 flex items-center justify-between mb-4">
                  <div className="flex-1 h-full w-full md:w-md lg:w-2/3 xl:w-2/3 relative">
                    {selectedItem !== null && (
                      <Carousel
                        showThumbs={false}
                        selectedItem={selectedItem}
                        showStatus={false}
                        showIndicators={false}
                        infiniteLoop={false}
                        swipeable={true}
                        emulateTouch={true}
                        onChange={handleCarouselChange}
                        showArrows={true}
                        centerMode={true}
                        centerSlidePercentage={centerSlidePercentage}
                      >
                        {renderCarouselItems}
                      </Carousel>
                    )}
                  </div>
                  <div className="relative h-full p-3">
                    <img className="h-6 w-6 cursor-pointer" src={CalendarIcon} alt="Calendar" onClick={() => setShowCalendar(!showCalendar)} />
                    <div className="absolute top-10 right-0 z-999">
                      {showCalendar && (
                        <Calendar
                          minDate={new Date(2002, 8, 1)}
                          maxDate={new Date(2025, 12, 31)}
                          value={selectedDate} // Set the value of the calendar to the selected date
                          onClickDay={handleDayClick}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
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
