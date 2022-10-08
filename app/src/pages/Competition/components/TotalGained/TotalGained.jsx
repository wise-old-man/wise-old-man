import React from 'react';
import PropTypes from 'prop-types';
import { MetricProps } from '@wise-old-man/utils';
import { formatNumber, getMetricIcon } from 'utils';
import './TotalGained.scss';

function TotalGained({ metric, totalGained }) {
  const label = MetricProps[metric].name;
  const icon = getMetricIcon(metric);

  const backgroundImage = {
    backgroundImage: `url("/img/runescape/backgrounds/${metric}.png")`,
    backgroundSize: 'cover'
  };

  const showPlaceholder = totalGained === undefined;

  if (showPlaceholder) {
    return (
      <div className="total-gained-widget" style={backgroundImage}>
        <img className="total-icon" src={icon} alt="" />
        <div className="total-info">
          <span className="total-info__metric -placeholder" />
          <b className="total-info__gained -placeholder" />
        </div>
      </div>
    );
  }

  return (
    <div className="total-gained-widget" style={backgroundImage}>
      <img className="total-icon" src={icon} alt="" />
      <div className="total-info">
        <span className="total-info__metric">{label}</span>
        <b className="total-info__gained">{formatNumber(totalGained)}</b>
      </div>
    </div>
  );
}

TotalGained.defaultProps = {
  totalGained: undefined
};

TotalGained.propTypes = {
  metric: PropTypes.string.isRequired,
  totalGained: PropTypes.number
};

export default TotalGained;
