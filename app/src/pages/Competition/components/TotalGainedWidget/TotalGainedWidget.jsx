import React from 'react';
import PropTypes from 'prop-types';
import { formatNumber, getMetricIcon, getMetricName } from '../../../../utils';
import './TotalGainedWidget.scss';

function TotalGainedWidget({ competition }) {
  const { metric, totalGained } = competition;

  const label = `${getMetricName(metric)}`;
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

TotalGainedWidget.propTypes = {
  competition: PropTypes.shape().isRequired
};

export default TotalGainedWidget;
