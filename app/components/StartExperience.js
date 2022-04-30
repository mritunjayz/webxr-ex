import React from 'react';
import startEX from 'assets/startEx.png';
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
  return (
    <div>
      <div
        id="overlay"
        style={{
          background: `url(${startEX}) no-repeat center fixed`,
          backgroundSize: 'cover',
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
                <p>Tracking surface...</p>
                {/* <img src={mobileTrack} alt="mobile track" /> */}
              </div>
            ) : !isObjPlaced ? (
              <p>Place cursor and tap</p>
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
