import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { padNumber, durationOf } from 'utils';
import './Countdown.scss';

function Countdown({ secondsDiff }) {
  const [secondsLeft, setSecondsLeft] = useState(secondsDiff);

  useEffect(() => {
    // Start a 1 second timer on mount
    const nextValue = Math.max(0, secondsLeft - 1000);
    const timer = setTimeout(() => setSecondsLeft(nextValue), 1000);

    // Clear the timer on unmount
    return () => clearTimeout(timer);
  });

  const { days, hours, minutes, seconds } = durationOf(secondsLeft);

  return (
    <div className="countdown">
      <div className="countdown__slot">
        <b className="slot__value">{padNumber(days)}</b>
        <span className="slot__label">{days === 1 ? 'day' : 'days'}</span>
      </div>
      <div className="countdown__slot">
        <b className="slot__value">{padNumber(hours)}</b>
        <span className="slot__label">{hours === 1 ? 'hour' : 'hours'}</span>
      </div>
      <div className="countdown__slot">
        <b className="slot__value">{padNumber(minutes)}</b>
        <span className="slot__label">{minutes === 1 ? 'min' : 'mins'}</span>
      </div>
      <div className="countdown__slot">
        <b className="slot__value">{padNumber(seconds)}</b>
        <span className="slot__label">{seconds === 1 ? 'sec' : 'secs'}</span>
      </div>
    </div>
  );
}

Countdown.propTypes = {
  // The initial difference in seconds (Ex: 50 will start a 0 hour, 0 minute, 50 secs countdown)
  secondsDiff: PropTypes.number.isRequired
};

export default React.memo(Countdown);
