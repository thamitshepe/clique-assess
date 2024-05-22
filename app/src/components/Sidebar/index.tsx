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
                    <svg
                      width={isMobile ? 55 : 44}
                      height={isMobile ? 55 : 44}
                      viewBox="24 18 50 50"
                      preserveAspectRatio="xMidYMid meet"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                      className="mr-3.5" // Add margin between icon and text
                      style={{ transform: 'scale(1)' }} // Set the scale to 1 to maintain original size
                      
                    >
                      <g filter="url(#filter0_d_2_1407)">
                        <rect x="24" y="18" width="50" height="50" rx="14" fill="#623CEA"/>
                      </g>
                      <path d="M48.5 30C41.6078 30 36 35.6078 36 42.5C36 49.3922 41.6078 55 48.5 55C55.3922 55 61 49.3922 61 42.5C61 35.6078 55.3922 30 48.5 30ZM49.2938 34.0609L52.5078 32.3328C54.2875 33.0375 55.8406 34.1922 57.0219 35.6609L56.2563 39.1953L53.8047 40.3969L49.2938 37.1109V34.0609ZM44.5188 32.3234L47.7328 34.0578V37.1109L43.225 40.3969L40.7609 39.1937L39.9953 35.6375C41.1797 34.1719 42.7359 33.0234 44.5188 32.3234ZM39.4844 48.6781C38.4641 47.1938 37.8 45.4484 37.6172 43.5625L40.2625 40.6891L42.675 41.8688L44.4922 47.0297L42.9563 48.8703L39.4844 48.6781ZM51.2859 53.0641C50.3938 53.3 49.4641 53.4375 48.5 53.4375C47.3344 53.4375 46.2125 53.25 45.1578 52.9109L44.175 49.8516L45.7422 47.9688H51.2641L52.8031 49.7906L51.2859 53.0641ZM54.0219 48.8172L52.5109 47.0281L54.3531 41.8688L56.7547 40.6922L59.3844 43.5641C59.2266 45.1906 58.7031 46.7078 57.9078 48.05L54.0219 48.8172Z" fill="white"/>
                      <image href={soccerBall} xlinkHref={soccerBall} width={isMobile ? 55 : 44} height={isMobile ? 55 : 44}/>
                    </svg>
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
                    <svg
                      width={isMobile ? 55 : 44}
                      height={isMobile ? 55 : 44}
                      viewBox="0 0 50 50"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                      className="mr-3.5" // Add margin between icon and text
                      style={{ transform: 'scale(1)' }} // Set the scale to 1 to maintain original size
                    >
                      <rect width="50" height="50" rx="14" fill="white"/>
                      <path d="M27.0511 12.574C25.6605 12.8466 24.3532 13.2137 23.1468 13.6727C20.8212 14.5576 18.8622 15.7861 17.3241 17.3241C15.7861 18.8622 14.5576 20.8212 13.6727 23.1469C13.2152 24.3492 12.8491 25.6519 12.5766 27.0374L21.9627 36.4234C23.3482 36.151 24.6508 35.7848 25.8532 35.3273C28.1789 34.4425 30.1379 33.214 31.6759 31.6759C33.214 30.1379 34.4425 28.1789 35.3273 25.8532C35.7863 24.6469 36.1534 23.3396 36.4261 21.9489L27.0511 12.574ZM18.6798 27.1478L19.7392 28.2072L21.7784 26.168L20.719 25.1086L21.7563 24.0713L22.8157 25.1307L25.1307 22.8157L24.0713 21.7563L25.1085 20.719L26.168 21.7784L28.4054 19.5409L27.346 18.4815L28.3833 17.4443L31.5394 20.6003L30.5021 21.6376L29.4427 20.5782L27.2052 22.8157L28.2646 23.8751L27.2274 24.9123L26.168 23.8529L23.8529 26.168L24.9123 27.2274L23.8751 28.2646L22.8157 27.2052L20.7765 29.2444L21.8359 30.3038L20.7986 31.3411L17.6426 28.1851L18.6798 27.1478Z" fill="#951B81"/>
                      <path d="M36.7178 20.1661C36.7384 20.0095 36.7583 19.8523 36.7768 19.694C37.2211 15.8828 36.8675 12.9112 36.8523 12.7865L36.7826 12.2174L36.2134 12.1477C36.0888 12.1325 33.1172 11.7789 29.306 12.2233C29.1477 12.2417 28.9904 12.2616 28.8339 12.2823L36.7178 20.1661Z" fill="#951B81"/>
                      <path d="M12.2842 28.8195C12.2628 28.9808 12.2423 29.1428 12.2232 29.306C11.7789 33.1172 12.1325 36.0889 12.1477 36.2135L12.2174 36.7826L12.7866 36.8523C12.8635 36.8618 14.025 37.0001 15.7992 37.0001C16.8994 37.0001 18.2352 36.9469 19.694 36.7768C19.8572 36.7578 20.0192 36.7372 20.1805 36.7158L12.2842 28.8195Z" fill="#951B81"/>
                      <image href={footBall} xlinkHref={footBall} width={isMobile ? 55 : 44} height={isMobile ? 55 : 44}/>
                    </svg>
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
                    <svg
                      width={isMobile ? 55 : 44}
                      height={isMobile ? 55 : 44}
                      viewBox="0 0 50 50"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                      className="mr-3.5" // Add margin between icon and text
                      style={{ transform: 'scale(1)' }} // Set the scale to 1 to maintain original size
                    >
                      <rect width="50" height="50" rx="14" fill="white"/>
                      <g filter="url(#filter0_d_43_44)">
                        <path d="M12.3126 32.1781C11.8958 32.595 11.8958 33.2708 12.3126 33.6877L13.8222 35.2026C14.2391 35.6194 14.9149 35.6194 15.3317 35.2026L19.1068 31.4307L16.0876 28.4083L12.3126 32.1781Z" fill="#E30613"/>
                        <path d="M16.8424 27.6536L19.8617 30.6728C21.1374 29.397 23.3698 30.5158 26.0207 30.7923L16.7218 21.4934C16.9994 24.1454 18.1172 26.3788 16.8424 27.6536Z" fill="#E30613"/>
                        <path d="M32.6911 28.4052C36.4438 24.705 36.4863 18.6633 32.7862 14.9106C32.7851 14.9095 32.784 14.9084 32.7829 14.9073C29.0891 11.1073 23.014 11.0212 19.2139 14.7151C19.1779 14.7501 19.1423 14.7853 19.1068 14.8208C17.6682 16.152 16.8011 17.9886 16.6876 19.9454L27.5666 30.8243C29.5233 30.7108 31.36 29.8438 32.6911 28.4052Z" fill="#E30613"/>
                        <path d="M33.7972 37.0891C35.566 37.0891 37 35.6552 37 33.8863C37 32.1174 35.566 30.6835 33.7972 30.6835C32.0283 30.6835 30.5943 32.1174 30.5943 33.8863C30.5943 35.6552 32.0283 37.0891 33.7972 37.0891Z" fill="#E30613"/>
                        <image href={hockey} xlinkHref={hockey} width={isMobile ? 55 : 44} height={isMobile ? 55 : 44}/>
                      </g>
                    </svg>
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
                    <svg
                      width={isMobile ? 55 : 44}
                      height={isMobile ? 55 : 44}
                      viewBox="0 0 50 50"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                      className="mr-3.5" // Add margin between icon and text
                      style={{ transform: 'scale(1)' }} // Set the scale to 1 to maintain original size
                    >
                      <rect width="50" height="50" rx="14" fill="white"/>
                      <path d="M18.1556 36.2633C19.8188 37.2461 21.7276 37.855 23.7662 37.9736V33.0363C21.5307 33.2509 19.4669 34.4361 18.1556 36.2633Z" fill="#F18800"/>
                      <path d="M23.7662 17.9373V13C21.7276 13.1185 19.8188 13.7274 18.1556 14.7103C19.4669 16.5375 21.5307 17.7227 23.7662 17.9373Z" fill="#F18800"/>
                      <path d="M25.2338 33.0361V37.9736C27.2726 37.855 29.1816 37.246 30.8448 36.263C29.5326 34.4327 27.4759 33.2498 25.2338 33.0361Z" fill="#F18800"/>
                      <path d="M32.063 15.5302C30.4785 17.7619 27.9651 19.191 25.2338 19.4098V24.4667H36.9671C36.6719 20.8272 34.8121 17.6235 32.063 15.5302Z" fill="#F18800"/>
                      <path d="M16.9374 35.4437C17.7269 34.3305 18.7571 33.3987 19.949 32.7271C21.1216 32.0665 22.4283 31.6704 23.7661 31.5637V25.9344H12C12.137 29.8095 14.0448 33.2412 16.9374 35.4437Z" fill="#F18800"/>
                      <path d="M25.2338 25.9344V31.5637C27.9651 31.7825 30.4785 33.2116 32.063 35.4434C34.9554 33.2409 36.863 29.8094 37 25.9344H25.2338Z" fill="#F18800"/>
                      <path d="M30.8448 14.7105C29.1816 13.7275 27.2726 13.1185 25.2338 13V17.9374C27.4759 17.7238 29.5326 16.5409 30.8448 14.7105Z" fill="#F18800"/>
                      <path d="M16.9374 15.5299C14.188 17.6233 12.3281 20.8271 12.0329 24.4668H23.7662V19.41C22.4284 19.3032 21.1216 18.9072 19.9491 18.2465C18.7571 17.5748 17.7269 16.643 16.9374 15.5299Z" fill="#F18800"/>
                      <image href={basketBall} xlinkHref={basketBall} width={isMobile ? 55 : 44} height={isMobile ? 55 : 44}/>
                    </svg>
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
                    <svg
                      width={isMobile ? 55 : 44}
                      height={isMobile ? 55 : 44}
                      viewBox="0 0 50 50"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                      className="mr-3.5" // Add margin between icon and text
                      style={{ transform: 'scale(1)' }} // Set the scale to 1 to maintain original size
                    >
                      <rect width="50" height="50" rx="14" fill="white"/>
                      <path d="M36.1002 29.866C35.1481 30.3819 34.5 31.3901 34.5 32.5469C34.5 33.7037 35.1481 34.7119 36.1002 35.2278C36.6647 34.4814 37 33.5527 37 32.5469C37 31.5412 36.6647 30.6124 36.1002 29.866Z" fill="#0090D7"/>
                      <path d="M33.0937 32.5469C33.0937 31.0174 33.8689 29.6657 35.0469 28.8636C34.3337 28.378 33.4729 28.0938 32.5468 28.0938C31.6208 28.0938 30.76 28.378 30.0469 28.8636C31.2248 29.6658 32 31.0174 32 32.5469C32 34.0763 31.2248 35.4281 30.0469 36.2301C30.76 36.7158 31.6208 37 32.5468 37C33.4729 37 34.3337 36.7158 35.0468 36.2301C33.8689 35.4281 33.0937 34.0763 33.0937 32.5469Z" fill="#0090D7"/>
                      <path d="M28.9935 29.866C28.429 30.6124 28.0938 31.5412 28.0938 32.5469C28.0938 33.5527 28.429 34.4814 28.9936 35.2278C29.9457 34.7119 30.5937 33.7037 30.5937 32.5469C30.5937 31.3901 29.9456 30.3819 28.9935 29.866Z" fill="#0090D7"/>
                      <path d="M36.2261 13.7739C35.1485 12.6962 33.3849 12.7513 32.3766 13.8941L19.788 28.1612L21.8388 30.2121L36.106 17.6234C37.2487 16.6151 37.3038 14.8516 36.2261 13.7739Z" fill="#0090D7"/>
                      <path d="M16.6009 35.3878L20.8134 31.1754L18.8247 29.1866L14.6122 33.3991L14.2003 32.9872C13.9258 32.7127 13.4805 32.7127 13.2059 32.9872C12.9314 33.2618 12.9314 33.707 13.2059 33.9816L16.0184 36.7941C16.1557 36.9313 16.3357 37 16.5156 37C16.6956 37 16.8755 36.9313 17.0128 36.794C17.2874 36.5195 17.2874 36.0743 17.0128 35.7997L16.6009 35.3878Z" fill="#0090D7"/>
                      <image href={baseBall} xlinkHref={baseBall} width={isMobile ? 55 : 44} height={isMobile ? 55 : 44}/>
                    </svg>
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
                    <svg
                      width={isMobile ? 55 : 44}
                      height={isMobile ? 55 : 44}
                      viewBox="0 0 50 50"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                      className="mr-3.5" // Add margin between icon and text
                      style={{ transform: 'scale(1)' }} // Set the scale to 1 to maintain original size
                    >
                      <rect width="50" height="50" rx="14" fill="white"/>
                      <path d="M22.0077 30.8259C22.0059 30.8276 22.0038 30.8296 22.0016 30.8315L22.2426 32.2038L23.6145 32.4443C23.6166 32.4426 23.6183 32.4406 23.6203 32.4382L23.3584 31.0878L22.0077 30.8259Z" fill="#004F9F"/>
                      <path d="M34.158 20.2881C28.833 14.9634 25.7767 17.6994 25.2835 19.5567C25.0477 20.4444 25.0703 20.8133 25.0703 20.8133C24.2698 20.4192 22.2268 19.8652 20.4724 26.3036L16.699 30.9492C17.5446 32.4087 18.5147 33.685 19.6378 34.8084C20.7611 35.9313 22.0377 36.9016 23.4969 37.7472L28.1424 33.9739C29.6499 33.2734 32.1004 32.9961 33.6671 31.4289C36.8791 28.2167 38.9779 25.1079 34.158 20.2881ZM26.6314 31.7195C26.3147 32.0361 25.8016 32.0361 25.485 31.7195C25.4101 31.6448 25.3533 31.5585 25.3141 31.4666L24.3237 31.2746L24.5154 32.2649C24.6072 32.3048 24.6936 32.3615 24.7684 32.4363C25.0851 32.7528 25.0851 33.2661 24.7684 33.5828C24.4518 33.8994 23.9386 33.8994 23.622 33.5828C23.5506 33.5114 23.4964 33.4297 23.4572 33.3427L22.4103 33.1593L22.5939 34.2061C22.6808 34.245 22.7626 34.2992 22.8339 34.3709C23.1505 34.6874 23.1505 35.2007 22.8339 35.5174C22.5172 35.834 22.004 35.8339 21.6875 35.5174C21.3708 35.2007 21.3708 34.6874 21.6875 34.3709C21.6901 34.368 21.6931 34.366 21.6958 34.3632L21.455 32.9913L20.0829 32.7502C20.0804 32.7531 20.078 32.7559 20.0754 32.7587C19.7587 33.0754 19.2456 33.0754 18.9289 32.7586C18.6123 32.4421 18.6123 31.9288 18.9289 31.6123C19.2456 31.2956 19.7587 31.2956 20.0754 31.6123C20.1468 31.6834 20.2012 31.7652 20.2402 31.8521L21.2873 32.0359L21.1034 30.989C21.0166 30.95 20.9349 30.8953 20.8636 30.8241C20.547 30.5076 20.5469 29.9943 20.8636 29.6777C21.1802 29.3611 21.6934 29.3611 22.0099 29.6777C22.085 29.7526 22.1416 29.8385 22.181 29.9308L23.1715 30.1225L22.9794 29.1323C22.8876 29.0926 22.8015 29.036 22.7264 28.9609C22.4099 28.6442 22.41 28.131 22.7264 27.8145C23.043 27.4978 23.5562 27.4979 23.8728 27.8145C24.1888 28.1305 24.1893 28.6421 23.8748 28.9589L24.1365 30.3094L25.4871 30.5713C25.804 30.2565 26.3156 30.2577 26.6314 30.5731C26.9479 30.8897 26.948 31.4029 26.6314 31.7195Z" fill="#004F9F"/>
                      <path d="M18.3469 27.6198L18.0035 27.1773L16.6802 27.5539C16.6794 27.5568 16.6783 27.5591 16.6775 27.5621L17.5006 28.6616L18.3469 27.6198Z" fill="#004F9F"/>
                      <path d="M15.3116 29.1286C15.4076 29.16 15.4928 29.2081 15.5672 29.2682L16.584 28.9589L15.947 28.108C15.852 28.1123 15.7546 28.101 15.6586 28.0693C15.2331 27.9299 15.0012 27.4722 15.1406 27.0466C15.2801 26.621 15.7379 26.389 16.1634 26.5286C16.264 26.5615 16.3537 26.6131 16.4303 26.677L17.4005 26.4006L16.7819 25.604C16.6822 25.6103 16.5796 25.5989 16.4789 25.5658C16.0535 25.4264 15.8216 24.9686 15.961 24.543C16.1005 24.1175 16.5583 23.8858 16.9838 24.025C17.408 24.1638 17.6398 24.6201 17.5023 25.0448L18.3461 26.1318L19.6692 25.7548C19.7105 25.6305 19.7794 25.5236 19.8663 25.4369C20.6123 22.9891 21.3985 21.653 21.3985 21.653C21.3985 21.653 20.5871 19.4849 18.1153 20.4503C21.042 19.0637 18.9161 16.8455 18.9161 16.8455C18.9161 16.8455 21.4329 18.7616 23.8645 19.8069C23.9844 19.789 24.1056 19.7791 24.2282 19.7791C24.2804 19.7791 24.3324 19.7807 24.3844 19.7841C24.4134 19.6515 24.4485 19.5058 24.4909 19.3461C24.8299 18.0697 25.989 16.7079 27.7975 16.4169C27.1962 15.0679 25.7594 13.6466 22.7585 12.6634C16.281 10.5411 14.4559 13.8185 13.0413 18.1347C12.3515 20.2407 13.2109 22.5522 13.2674 24.2136L12 30.0625C13.4138 30.9822 14.8556 31.6826 16.3651 32.1772C16.4161 32.1941 16.4673 32.2098 16.5184 32.2261C16.3376 31.9451 16.1613 31.6568 15.9894 31.36L15.706 30.8709L16.4522 29.9522L15.8325 30.1406C15.8312 30.144 15.8308 30.1477 15.8295 30.1513C15.6901 30.5768 15.2323 30.8086 14.8067 30.6691C14.3813 30.5297 14.1494 30.072 14.2888 29.6465C14.4281 29.2208 14.8861 28.9889 15.3116 29.1286Z" fill="#004F9F"/>
                      <image href={boxingGloves} xlinkHref={boxingGloves} width={isMobile ? 55 : 44} height={isMobile ? 55 : 44}/>
                    </svg>
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