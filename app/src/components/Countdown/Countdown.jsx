import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { padNumber, durationOf } from 'utils';
import './Countdown.scss';

function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));

  useEffect(() => {
    // Start a half second timer on mount
    const timer = setTimeout(() => setTimeLeft(getTimeLeft(targetDate)), 500);

    // Clear the timer on unmount
    return () => clearTimeout(timer);
  });

  const { days, hours, minutes, seconds } = durationOf(timeLeft);

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

function getTimeLeft(targetDate) {
  return Math.max(0, targetDate.getTime() - Date.now());
}

Countdown.propTypes = {
  // The target date that the timer should count down to
  targetDate: PropTypes.instanceOf(Date).isRequired
};

export default React.memo(Countdown);
