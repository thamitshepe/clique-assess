import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';

const useMobileOrientation = () => {
  const [showLandscapeWarning, setShowLandscapeWarning] = useState(false);

  const handleOrientationChange = () => {
    if (window.innerHeight > window.innerWidth) {
      setShowLandscapeWarning(true); // portrait
    } else {
      setShowLandscapeWarning(false); // landscape
    }
  };

  useEffect(() => {
    if (isMobile) {
      handleOrientationChange(); // Initial check
      window.addEventListener('orientationchange', handleOrientationChange);

      return () => {
        window.removeEventListener('orientationchange', handleOrientationChange);
      };
    }
  }, []);

  return showLandscapeWarning;
};

export default useMobileOrientation;
