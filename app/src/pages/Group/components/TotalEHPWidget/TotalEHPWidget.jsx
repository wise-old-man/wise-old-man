import React from 'react';
import PropTypes from 'prop-types';
import { formatNumber, getMetricIcon } from 'utils';
import './TotalEHPWidget.scss';

function TotalEHPWidget({ group, isLoading }) {
  if (!group || isLoading) {
    return (
      <div className="total-ehp-widget">
        <img className="total-icon" src={getMetricIcon('ehp')} alt="" />
        <div className="total-info">
          <b className="total-info__metric -placeholder" />
          <span className="total-info__gained -placeholder" />
        </div>
      </div>
    );
  }

  const { totalEHP } = group;

  return (
    <div className="total-ehp-widget">
      <img className="total-icon" src={getMetricIcon('ehp')} alt="" />
      <div className="total-info">
        <b className="total-info__metric">Hours Played</b>
        <span className="total-info__gained">{formatNumber(totalEHP)}</span>
      </div>
    </div>
  );
}

TotalEHPWidget.propTypes = {
  group: PropTypes.shape().isRequired,
  isLoading: PropTypes.bool.isRequired
};

export default TotalEHPWidget;
