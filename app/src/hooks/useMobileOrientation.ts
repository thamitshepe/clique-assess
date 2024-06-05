import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { useOrientation } from '@uidotdev/usehooks';

const useMobileOrientation = () => {
  const [showLandscapeWarning, setShowLandscapeWarning] = useState(false);
  const { type } = useOrientation();

  useEffect(() => {
    if (isMobile) {
      if (!type.includes('landscape')) {
        setShowLandscapeWarning(true);
      } else {
        setShowLandscapeWarning(false);
      }
    }
  }, [type]);

  return showLandscapeWarning;
};

export default useMobileOrientation;
