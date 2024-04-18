import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import BG from '../../images/icons/BG.svg';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import CalendarIcon from '../../images/icons/calender.png';
import Calendar from 'react-calendar';
import { useAppSelector, useAppDispatch } from '../../redux/hooks'; // Import the useAppSelector hook
import { setSelectedDate } from '../../redux/selectedDateSlice'; // Import the setSelectedDate action
import 'react-calendar/dist/Calendar.css';
import { format, addDays, getYear, isBefore } from 'date-fns';
import axios from 'axios';

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
    score: number | null;
  };
  awayTeam: {
    name: string;
    score: number | null;
  };
}


// Lazy-loaded components for football and MLB
const FootballLeagues = lazy(() => import('../../components/Cards/football').then(module => ({ default: module.FootballLeagues })));
const FootballMatches = lazy(() => import('../../components/Cards/football').then(module => ({ default: module.FootballMatches })));
const MLBLeagues = lazy(() => import('../../components/Cards/mlb').then(module => ({ default: module.MLBLeagues })));
const MLBGames = lazy(() => import('../../components/Cards/mlb').then(module => ({ default: module.MLBGames })));


const ECommerce: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const selectedDate = useAppSelector((state) => state.selectedDate.selectedDate ?? new Date()); // Use selectedDate from Redux store
  const [currentYear, setCurrentYear] = useState<number>(getYear(new Date()));
  const [datesWithIndex, setDatesWithIndex] = useState<DatesWithIndex>({});
  const [leagues, setLeagues] = useState<Competition[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const selectedDateValue = selectedDate || new Date();
  const dispatch = useAppDispatch();
  // Access the selectedSport value from the Redux store
  const selectedSport = useAppSelector((state) => state.selectedSport.selectedSport);

    // Render the appropriate component based on selectedSport
    const renderLeagueComponent = () => {
      switch (selectedSport) {
        case 'mlb':
          return <MLBLeagues />;
        case 'soccer':
          return < FootballLeagues leagues={leagues} />;
        default:
          return < FootballLeagues leagues={leagues} />; 
      }
    };

    // Render the appropriate component based on selectedSport
    const renderMatchComponent = () => {
      switch (selectedSport) {
        case 'mlb':
          return <MLBGames games={games} />;
        case 'soccer':
          return < FootballMatches leagues={leagues} />;
        default:
          return < FootballMatches leagues={leagues} />; 
      }
    };

    useEffect(() => {
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
  
      const fetchLeaguesData = async () => {
        try {
          const response = await axios.get(`https://betvision-hz2w.onrender.com/api/footballdata?date_from=${formatDate(selectedDateValue)}&date_to=${formatDate(selectedDateValue)}`);
          // Fetch football data based on selected date
          // Modify the API endpoint to include date_from and date_to parameters with the selected date
          // Here, I'm using selectedDate as both date_from and date_to, you can adjust it as needed
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
    }, [selectedDate]);
    
  
    useEffect(() => {
      const fetchMLBData = async () => {
        try {
          const formatDate = (date: Date) => {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
          };
          
          const response = await axios.get(`https://betvision-hz2w.onrender.com/api/mlbdata?start_date=${formatDate(selectedDateValue)}&end_date=${formatDate(selectedDateValue)}`);
          // Fetch MLB data based on selected date range
          // Modify the API endpoint to include start_date and end_date parameters with the selected date
          // Here, I'm using selectedDate as both start_date and end_date, you can adjust it as needed
          setGames(response.data);
        } catch (error) {
          console.error('Error fetching MLB data:', error);
        }
      };
  
      fetchMLBData();
      const intervalId = setInterval(fetchMLBData, 7000); // Fetch data every 7 seconds
  
      return () => {
        clearInterval(intervalId); // Clean up interval on unmount
      };
    }, [selectedDate]);
    
  
const LeaguesSkeletonLoader: React.FC = () => (
  <div className="p-2">
  {/* Placeholder for league items */}
  <div className="h-18 bg-gray-200 rounded-md mb-2 flex items-center animate-pulse">
    {/* Placeholder for league icon */}
    <div className="w-14 h-14 bg-gray-300 rounded-full mr-4"></div>
    {/* Placeholder for league details */}
    <div>
      {/* Placeholder for league name */}
      <div className="w-48 h-6 bg-gray-300 rounded-md mb-2"></div>
      {/* Placeholder for league country */}
      <div className="w-24 h-4 bg-gray-300 rounded-md"></div>
    </div>
  </div>
</div>
);

const MatchesSkeletonLoader: React.FC = () => (
  <div className="p-2">
    {/* Placeholder for match items */}
    <div className="h-19 rounded-md bg-gray-200 mb-4 p-6 flex items-center justify-between animate-pulse">
      {/* Placeholder for time section */}
      <div style={{ width: '8%' }} className="h-6 bg-gray-300 rounded-md"></div>

      {/* Placeholder for status section */}
      <div style={{ width: '12%' }} className="h-6 bg-gray-300 rounded-md"></div>

      {/* Placeholder for home team section */}
      <div style={{ width: '20%' }} className="h-6 bg-gray-300 rounded-md flex items-center">
        <div className="w-14 h-14 bg-gray-300 rounded-full mr-4"></div>
        <div className="w-16 h-4 bg-gray-300 rounded-md"></div>
      </div>

      {/* Placeholder for score section */}
      <div style={{ width: '5%' }} className="h-6 bg-gray-300 rounded-md"></div>

      {/* Placeholder for away team section */}
      <div style={{ width: '20%' }} className="h-6 bg-gray-300 rounded-md flex items-center">
        <div className="w-14 h-14 bg-gray-300 rounded-full mr-4"></div>
        <div className="w-16 h-4 bg-gray-300 rounded-md"></div>
      </div>

      {/* Placeholder for predicted win section */}
      <div style={{ width: '10%' }} className="h-6 bg-gray-300 rounded-md"></div>
      
      {/* Placeholder for probability section */}
      <div style={{ width: '10%' }} className="h-6 bg-gray-300 rounded-md"></div>
    </div>
  </div>
);

  useEffect(() => {
    const generatedDatesWithIndex = generateDatesWithIndex();
    setDatesWithIndex(generatedDatesWithIndex);
    const currentDateIndex = generatedDatesWithIndex[currentYear]?.findIndex(
      (d) => d.date === format(selectedDateValue, 'yyyy-MM-dd')
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
    dispatch(setSelectedDate(value)); // Dispatch action to update selectedDate
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
    dispatch(setSelectedDate(selectedDate)); // Dispatch action to update selected date in Redux store
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
              {/* Conditionally render football or MLB leagues based on selectedSport */}
              <Suspense fallback={<LeaguesSkeletonLoader />}>
                {/* Render the appropriate sport component */}
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
                {/* Render the appropriate sport component */}
                {renderMatchComponent()}
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

