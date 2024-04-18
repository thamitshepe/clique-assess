import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

const Header = () => {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollableArea = document.querySelector('.overflow-y-scroll');
      if (scrollableArea) {
        const scrollPosition = scrollableArea.scrollTop;

        if (scrollPosition > 50) {
          setIsHeaderVisible(false);
        } else {
          setIsHeaderVisible(true);
        }
      }
    };

    const scrollableArea = document.querySelector('.overflow-y-scroll');
    if (scrollableArea) {
      scrollableArea.addEventListener('scroll', handleScroll);

      return () => {
        scrollableArea.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);


  return (
    <header className={`fixed top-0 z-999 w-full bg-06264D dark:bg-06264D transition-opacity ${isHeaderVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex items-center justify-between px-8 py-8 md:px-8 2xl:px-11 text-white">
        <ul className="flex items-center gap-8 lg:gap-10 lg:text-lg">
          {/* Live Score Link with red dot */}
          <li className="flex items-center">
            <span className="h-2 w-2 bg-red-500 rounded-full mr-1"></span>
            <NavLink to="/live-score">
              Join Discord
            </NavLink>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
