import React from 'react';

const LandscapeWarning = () => {
  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#06264D',
      }}
    >
      <div style={{ textAlign: 'center', color: 'white' }}>
        <h1 className="text-lg">Please rotate your device</h1>
        <p className="text-lg">This app works best in landscape mode. Please rotate your phone to continue.</p>
      </div>
    </div>
  );
};

export default LandscapeWarning;
