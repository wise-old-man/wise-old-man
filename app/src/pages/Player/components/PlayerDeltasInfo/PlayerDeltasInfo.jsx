import React from 'react';
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
      return 3600 * 24 * 30;
    default:
      return 3600 * 24 * 365;
  }
}

function PlayerDeltasInfo({ deltas, period }) {
  if (!deltas || !deltas[period]) {
    return null;
  }

  const selectedDelta = deltas[period];
  const seconds = getSeconds(period);

  const now = new Date();
  const earliestDate = selectedDelta.startsAt;
  const latestDate = selectedDelta.endsAt;

  const dateDiff = Date.now() - earliestDate;

  const xpDropIn = seconds * 1000 - dateDiff;

  const earliest = durationBetween(earliestDate, now, 2, true);
  const lastUpdated = durationBetween(latestDate, now, 2, true);
  const xpDrop = durationBetween(now, new Date(Date.now() + xpDropIn), 2, true);

  return (
    <div className="deltas-info">
      <div className="deltas-info__panel">
        <abbr title={formatDate(earliestDate)}>
          <span className="info-label">Earliest</span>
          <span className="info-value">{`${earliest} ago`}</span>
        </abbr>
      </div>
      <div className="deltas-info__panel">
        <abbr title={formatDate(latestDate)}>
          <span className="info-label">Last Updated</span>
          <span className="info-value">{`${lastUpdated} ago`}</span>
        </abbr>
      </div>
      <div className="deltas-info__panel">
        <span className="info-label">Exp. drop in</span>
        <span className="info-value">{xpDrop}</span>
      </div>
    </div>
  );
}

PlayerDeltasInfo.defaultProps = {
  deltas: undefined
};

PlayerDeltasInfo.propTypes = {
  deltas: PropTypes.shape(),
  period: PropTypes.string.isRequired
};

export default PlayerDeltasInfo;
