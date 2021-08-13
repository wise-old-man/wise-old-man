import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { durationBetween, formatDate } from 'utils';
import './PlayerDeltasInfo.scss';

function PlayerDeltasInfo({ deltas, period }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (deltas && period && deltas[period]) {
        setTimeLeft(getSeconds(period) * 1000 - (Date.now() - deltas[period].startsAt));
      }
    }, 500);

    return () => clearInterval(timer);
  }, [deltas, period]);

  if (!deltas || !deltas[period]) {
    return null;
  }

  const selectedDelta = deltas[period];

  const now = new Date();
  const earliestDate = selectedDelta.startsAt;
  const latestDate = selectedDelta.endsAt;
  const isRefreshing = timeLeft <= 0 && earliestDate;

  const expDropDate = new Date(Date.now() + timeLeft);

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
        <span className="info-value">{isRefreshing ? 'Requires page refresh.' : expDrop}</span>
      </div>
    </div>
  );
}

function getSeconds(period) {
  switch (period) {
    case '5min':
      return 300;
    case 'day':
      return 3600 * 24;
    case 'week':
      return 3600 * 24 * 7;
    case 'month':
      return 3600 * 24 * 31;
    default:
      return 31556926;
  }
}

PlayerDeltasInfo.defaultProps = {
  deltas: undefined
};

PlayerDeltasInfo.propTypes = {
  deltas: PropTypes.shape(),
  period: PropTypes.string.isRequired
};

export default PlayerDeltasInfo;
