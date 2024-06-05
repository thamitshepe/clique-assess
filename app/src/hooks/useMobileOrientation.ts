import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';

const useMobileOrientation = () => {
  const [showLandscapeWarning, setShowLandscapeWarning] = useState(false);

  const handleOrientationChange = () => {
    const { innerWidth: width, innerHeight: height } = window;
    if (height > width) {
      setShowLandscapeWarning(true); // portrait
    } else {
      setShowLandscapeWarning(false); // landscape
    }
  };

  useEffect(() => {
    if (isMobile) {
      handleOrientationChange(); // Initial check
      window.addEventListener('resize', handleOrientationChange);

      return () => {
        window.removeEventListener('resize', handleOrientationChange);
      };
    }
  }, []);

  return showLandscapeWarning;
};

export default useMobileOrientation;