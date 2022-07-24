import React from 'react';
import startEX from 'assets/startExd.png';
import startEXC from 'assets/startExc.png';
import mobileTrack from 'assets/mobileTrack.png';
import classNames from 'classnames';

import './StartExperience.css';

function StartExperience({
  isWebXRStarted,
  isXRSupportedText,
  ARHtmlContent,
  isSurfaceTracked,
  isObjPlaced,
}) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isMobile = width < 768;
  const bgIamge = isMobile ? startEXC : startEX;
  return (
    <div>
      <div
        id="overlay"
        style={{
          background: `url(${bgIamge}) no-repeat center fixed`,
          backgroundSize: `${width}px ${height}px`,

        }}
      >
        <div className="info-area">
          <button
            id="xr-button"
            disabled
            className={classNames({
              'xr-button-start': !isWebXRStarted,
            })}
          >
            Not supported
          </button>
          <p className="support-text">{isXRSupportedText}</p>
          {/* <audio id="audio" src={require('./meow.wav')} /> */}
        </div>
        {isWebXRStarted && (
          <div className="common-ar-content">
            {!isSurfaceTracked ? (
              <div>
                {/* <p>Tracking surface...</p> */}
                {/* <img src={mobileTrack} alt="mobile track" /> */}
              </div>
            ) : !isObjPlaced ? (
              // <p>Place cursor and tap</p>
              <span></span>
            ) : (
              ''
            )}
          </div>
        )}
        <ARHtmlContent />
      </div>
    </div>
  );
}

export default StartExperience;
