import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { durationBetween, formatDate } from '../../../../utils';
import './PlayerDeltasInfo.scss';

function getSeconds(period) {
  switch (period) {
    case 'day':
      return 3600 * 24;
    case 'week':
      return 3600 * 24 * 7;
    case 'month':
      return 3600 * 24 * 31;
    default:
      return 3600 * 24 * 365;
  }
}

/**
 * The refresh behavior of this componente is a bit strange, here's the issue:
 *
 * Sometimes the date on the frontend is a few seconds ahead of the backend,
 * which makes the countdown reach 0 a bit before the deltas actually change.
 * To counter this, we make sure the page keeps refreshing the deltas every 3 seconds
 * until it finally does catch up with the frontend.
 *
 * There might be a better solution for this, but I haven't found it yet.
 */
function PlayerDeltasInfo({ deltas, period, onTimerEnded }) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    // Start a 1 second timer on mount
    const nextValue = Math.max(0, secondsLeft - 1);
    const timer = setTimeout(() => setSecondsLeft(nextValue), 1000);

    if (secondsLeft === 1) {
      setTimeout(onTimerEnded, 3000);
    }

    // Clear the timer on unmount
    return () => clearTimeout(timer);
  });

  useEffect(() => {
    if (deltas && deltas[period]) {
      const startDate = deltas[period].startsAt;
      const dateDiff = Date.now() - startDate;
      const secsLeft = Math.round(getSeconds(period) - dateDiff / 1000);

      if (secsLeft <= 0 && startDate) {
        setTimeout(onTimerEnded, 3000);
      }

      setSecondsLeft(secsLeft);
    }
  }, [deltas, period]);

  if (!deltas || !deltas[period]) {
    return null;
  }

  const selectedDelta = deltas[period];

  const now = new Date();
  const earliestDate = selectedDelta.startsAt;
  const latestDate = selectedDelta.endsAt;
  const isRefreshing = secondsLeft <= 0 && earliestDate;

  const expDropDate = new Date(Date.now() + secondsLeft * 1000);

  const earliest = durationBetween(earliestDate, now, 2, true);
  const lastUpdated = durationBetween(latestDate, now, 2, true);
  const expDrop = earliestDate ? durationBetween(now, expDropDate, 2, true) : 'Requires update.';

  return (
    <div className="deltas-info">
      <div className="deltas-info__panel">
        <abbr title={formatDate(earliestDate)}>
          <span className="info-label">Earliest</span>
          <span className="info-value">{earliestDate ? `${earliest} ago` : 'None'}</span>
        </abbr>
      </div>
      <div className="deltas-info__panel">
        <abbr title={formatDate(latestDate)}>
          <span className="info-label">Last Updated</span>
          <span className="info-value">{latestDate ? `${lastUpdated} ago` : 'None'}</span>
        </abbr>
      </div>
      <div className="deltas-info__panel">
        <span className="info-label">Exp. drop in</span>
        <span className="info-value">{isRefreshing ? 'Refreshing...' : expDrop}</span>
      </div>
    </div>
  );
}

PlayerDeltasInfo.defaultProps = {
  deltas: undefined
};

PlayerDeltasInfo.propTypes = {
  deltas: PropTypes.shape(),
  period: PropTypes.string.isRequired,
  onTimerEnded: PropTypes.func.isRequired
};

export default PlayerDeltasInfo;
