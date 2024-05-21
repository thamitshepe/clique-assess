import { useEffect, useState } from 'react';

function useMobileOrientation() {
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(true);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent;
      const isMobileDevice = /Mobi|Android/i.test(userAgent) || (window.innerWidth <= 800 && window.innerHeight <= 600);
      setIsMobile(isMobileDevice);

      if (isMobileDevice) {
        const orientation = window.screen.orientation;
        const isLandscapeOrientation = orientation.type.includes('landscape');

        setIsLandscape(isLandscapeOrientation);
      }
    };

    checkDevice();

    if (isMobile) {
      const handleOrientationChange = () => {
        const orientation = window.screen.orientation;
        const isLandscapeOrientation = orientation.type.includes('landscape');

        setIsLandscape(isLandscapeOrientation);
      };

      window.addEventListener('resize', checkDevice);
      window.addEventListener('orientationchange', handleOrientationChange);

      return () => {
        window.removeEventListener('resize', checkDevice);
        window.removeEventListener('orientationchange', handleOrientationChange);
      };
    }
  }, [isMobile]);

  return { isMobile, isLandscape };
}

export default useMobileOrientation;
