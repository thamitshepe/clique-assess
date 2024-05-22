import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Logo from '../../images/logo/logo.svg';
import { useDispatch } from 'react-redux';
import { setSelectedSport } from '../../store/selectedSportSlice'; // Import the action creator
import soccerBall from '../../images/icons/soccer-ball.png';
import baseBall from '../../images/icons/baseball-bat.png';
import basketBall from '../../images/icons/basketball-ball.png';
import boxingGloves from '../../images/icons/boxing-gloves.png';
import footBall from '../../images/icons/football.png';
import hockey from '../../images/icons/Hockey.png';
import { isMobile } from 'react-device-detect';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = (props) => {
  // Get the selected sport using the useSport hook
  const dispatch = useDispatch();

  // Function to handle icon click
  const handleIconClick = (sport: string) => {
    dispatch(setSelectedSport(sport)); // Dispatch the action with the selected sport
  };



  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', props.sidebarOpen.toString());
    if (props.sidebarOpen) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [props.sidebarOpen]);

  return (
    <aside
      className={`relative left-0 top-0 z-9999 flex flex-col overflow-y-hidden bg-black duration-150 ease-linear lg:static lg:translate-x-0 ${sidebarExpanded ? 'w-46' : 'w-24'} dark:bg-0A203C `}
      onMouseEnter={() => setSidebarExpanded(true)}
      onMouseLeave={() => setSidebarExpanded(false)}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div className="flex items-center justify-center gap-2 py-8 lg:py-8">
        <NavLink to="/">
          <img src={Logo} alt="Logo" style={{ transform: 'scale(0.8)' }} />
        </NavLink>
      </div>
      {/* <!-- SIDEBAR HEADER --> */}

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        {/* <!-- Sidebar Menu --> */}
        <nav className="mt-5 py-4 px-6">
          {/* <!-- Menu Group --> */}
          <div>
            <ul className="mb-8 flex flex-col gap-3.5">


              {/* <!-- Menu Item Soccer --> */}
              <li className="relative">
                <NavLink
                    to="#"
                    className={`group relative flex items-center rounded-sm p-0 mb-3 duration-300 ease-in-out`}
                    onClick={() => handleIconClick('soccer')}
                  >
                  {/* Flex container to hold the icon and text */}
                  <div className="flex items-end"> {/* Changed items-center to items-end */}
                    {/* Icon */}
                    <img
                      src={soccerBall} // Use the imported PNG icon
                      alt="soccer" // Provide an alt attribute for accessibility
                      width={isMobile ? 55 : 44}
                      height={isMobile ? 55 : 44}
                      className="mr-3.5" // Add margin between icon and text
                      style={{ transform: 'scale(1)' }} // Set the scale to 1 to maintain original size
                    />
                    {/* Text */}
                    <span className={`ml-0 mb-2 ${sidebarExpanded ? 'block' : 'hidden'} font-satoshi font-normal text-base text-bodydark1 duration-300 ease-in-out`}>Soccer</span> {/* Added mb-1 for bottom margin */}
                  </div>
                </NavLink>
              </li>
              {/* <!-- Menu Item Soccer --> */}

              {/* <!-- Menu Item Football --> */}
              <li className="relative">
                <NavLink
                  to="#"
                  className={`group relative flex items-center rounded-sm p-0 mb-3 duration-300 ease-in-out`}
                  onClick={() => handleIconClick('nfl')}
                >
                  {/* Flex container to hold the icon and text */}
                  <div className="flex items-end"> {/* Changed items-center to items-end */}
                    {/* Icon */}
                    <img
                      src={footBall} // Use the imported PNG icon
                      alt="football" // Provide an alt attribute for accessibility
                      width={isMobile ? 55 : 44}
                      height={isMobile ? 55 : 44}
                      className="mr-3.5" // Add margin between icon and text
                      style={{ transform: 'scale(1)' }} // Set the scale to 1 to maintain original size
                    />
                    {/* Text */}
                    <span className={`ml-0 mb-2 ${sidebarExpanded ? 'block' : 'hidden'} font-satoshi font-normal text-base text-bodydark1 duration-300 ease-in-out`}>Football</span> {/* Added mb-1 for bottom margin */}
                  </div>
                </NavLink>
              </li>
              {/* <!-- Menu Item Football --> */}

              {/* <!-- Menu Item Hockey --> */}
              <li className="relative">
                <NavLink
                  to="#"
                  className={`group relative flex items-center rounded-sm p-0 mb-3 duration-300 ease-in-out`}
                  onClick={() => handleIconClick('nhl')}
                >
                  {/* Flex container to hold the icon and text */}
                  <div className="flex items-end"> {/* Changed items-center to items-end */}
                    {/* Icon */}
                    <img
                      src={hockey} // Use the imported PNG icon
                      alt="hockey" // Provide an alt attribute for accessibility
                      width={isMobile ? 55 : 44}
                      height={isMobile ? 55 : 44}
                      className="mr-3.5" // Add margin between icon and text
                      style={{ transform: 'scale(1)' }} // Set the scale to 1 to maintain original size
                    />
                    {/* Text */}
                    <span className={`ml-0 mb-2 ${sidebarExpanded ? 'block' : 'hidden'} font-satoshi font-normal text-base text-bodydark1 duration-300 ease-in-out`}>Hockey</span> {/* Added mb-1 for bottom margin */}
                  </div>
                </NavLink>
              </li>
              {/* <!-- Menu Item Hockey --> */}

              {/* <!-- Menu Item Basketball --> */}
              <li className="relative">
                <NavLink
                  to="#"
                  className={`group relative flex items-center rounded-sm p-0 mb-3 duration-300 ease-in-out`}
                  onClick={() => handleIconClick('nba')}
                >
                  {/* Flex container to hold the icon and text */}
                  <div className="flex items-end"> {/* Changed items-center to items-end */}
                    {/* Icon */}
                    <img
                      src={basketBall} // Use the imported PNG icon
                      alt="basketball" // Provide an alt attribute for accessibility
                      width={isMobile ? 55 : 44}
                      height={isMobile ? 55 : 44}
                      className="mr-3.5" // Add margin between icon and text
                      style={{ transform: 'scale(1)' }} // Set the scale to 1 to maintain original size
                    />
                    {/* Text */}
                    <span className={`ml-0 mb-2 ${sidebarExpanded ? 'block' : 'hidden'} font-satoshi font-normal text-base text-bodydark1 duration-300 ease-in-out`}>Basketball</span> {/* Added mb-1 for bottom margin */}
                  </div>
                </NavLink>
              </li>
              {/* <!-- Menu Item Basketball --> */}

              {/* <!-- Menu Item Baseball --> */}
              <li className="relative">
                <NavLink
                  to="#"
                  className={`group relative flex items-center rounded-sm p-0 mb-3 duration-300 ease-in-out}`}
                  onClick={() => handleIconClick('mlb')}
                >
                  {/* Flex container to hold the icon and text */}
                  <div className="flex items-end"> {/* Changed items-center to items-end */}
                    {/* Icon */}
                    <img
                      src={baseBall} // Use the imported PNG icon
                      alt="baseball" // Provide an alt attribute for accessibility
                      width={isMobile ? 55 : 44}
                      height={isMobile ? 55 : 44}
                      className="mr-3.5" // Add margin between icon and text
                      style={{ transform: 'scale(1)' }} // Set the scale to 1 to maintain original size
                    />
                    {/* Text */}
                    <span className={`ml-0 mb-2 ${sidebarExpanded ? 'block' : 'hidden'} font-satoshi font-normal text-base text-bodydark1 duration-300 ease-in-out`}>Baseball</span> {/* Added mb-1 for bottom margin */}
                  </div>
                </NavLink>
              </li>
              {/* <!-- Menu Item Baseball --> */}

              {/* <!-- Menu Item Boxing --> */}
              <li className="relative">
                <NavLink
                  to="#"
                  className={`group relative flex items-center rounded-sm p-0 mb-3 duration-300 ease-in-out}`}
                  onClick={() => handleIconClick('mma')}
                >
                  {/* Flex container to hold the icon and text */}
                  <div className="flex items-end"> {/* Changed items-center to items-end */}
                    {/* Icon */}
                    <img
                      src={boxingGloves} // Use the imported PNG icon
                      alt="boxing gloves" // Provide an alt attribute for accessibility
                      width={isMobile ? 55 : 44}
                      height={isMobile ? 55 : 44}
                      className="mr-3.5" // Add margin between icon and text
                      style={{ transform: 'scale(1)' }} // Set the scale to 1 to maintain original size
                    />
                    {/* Text */}
                    <span className={`ml-0 mb-2 ${sidebarExpanded ? 'block' : 'hidden'} font-satoshi font-normal text-base text-bodydark1 duration-300 ease-in-out`}>Boxing</span> {/* Added mb-1 for bottom margin */}
                  </div>
                </NavLink>
              </li>
              {/* <!-- Menu Item Boxing --> */}


            </ul>
          </div>
        </nav>
        {/* <!-- Sidebar Menu --> */}
      </div>
    </aside>
  );
};

export default Sidebar;