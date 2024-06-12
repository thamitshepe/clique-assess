import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Logo from '../../images/logo/logo.svg';
import { useDispatch } from 'react-redux';
import { setSelectedState } from '../../store/selectedStateSlice'; // Import the action creator
import soccerBall from '../../images/icons/soccer-ball.png';
import baseBall from '../../images/icons/baseball-bat.png';
import { isMobile } from 'react-device-detect';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = (props) => {
  // Get the selected state using the useState hook
  const dispatch = useDispatch();

  // Function to handle icon click
  const handleIconClick = (state: string) => {
    dispatch(setSelectedState(state)); // Dispatch the action with the selected state
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
            <ul className="mb-8 flex flex-col gap-3.5 md:gap-4.5">


              {/* <!-- Menu Item Users --> */}
              <li className="relative">
                <NavLink
                    to="#"
                    className={`group relative flex items-center rounded-sm p-0 mb-3 duration-300 ease-in-out`}
                    onClick={() => handleIconClick('Users')}
                  >
                  {/* Flex container to hold the icon and text */}
                  <div className="flex items-end"> {/* Changed items-center to items-end */}
                    {/* Icon */}
                    <img
                      src={soccerBall} // Use the imported PNG icon
                      alt="soccer" // Provide an alt attribute for accessibility
                      width={44}
                      height={44}
                      className="state-icon mr-3.5" // Add margin between icon and text
                      style={{ transform: 'scale(1)' }} // Set the scale to 1 to maintain original size
                    />
                    {/* Text */}
                    <span className={`ml-0 mb-2 ${sidebarExpanded ? 'block' : 'hidden'} font-satoshi text-md text-bodydark1 duration-300 ease-in-out`}>Users</span> {/* Added mb-1 for bottom margin */}
                  </div>
                </NavLink>
              </li>
              {/* <!-- Menu Item Users --> */}

              {/* <!-- Menu Item Groups --> */}
              <li className="relative">
                <NavLink
                  to="#"
                  className={`group relative flex items-center rounded-sm p-0 mb-3 duration-300 ease-in-out}`}
                  onClick={() => handleIconClick('Groups')}
                >
                  {/* Flex container to hold the icon and text */}
                  <div className="flex items-end"> {/* Changed items-center to items-end */}
                    {/* Icon */}
                    <img
                      src={baseBall} // Use the imported PNG icon
                      alt="baseball" // Provide an alt attribute for accessibility
                      width={44}
                      height={44}
                      className="state-icon mr-3.5" // Add margin between icon and text
                      style={{ transform: 'scale(1)' }} // Set the scale to 1 to maintain original size
                    />
                    {/* Text */}
                    <span className={`ml-0 mb-2 ${sidebarExpanded ? 'block' : 'hidden'} font-satoshi text-md text-bodydark1 duration-300 ease-in-out`}>Groups</span> {/* Added mb-1 for bottom margin */}
                  </div>
                </NavLink>
              </li>
              {/* <!-- Menu Item Groups --> */}

            </ul>
          </div>
        </nav>
        {/* <!-- Sidebar Menu --> */}
      </div>
    </aside>
  );
};

export default Sidebar;