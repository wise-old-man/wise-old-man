import React from 'react';
import PropTypes from 'prop-types';
import { formatNumber, getMetricIcon } from '../../../../utils';
import './TotalExperienceWidget.scss';

function TotalExperienceWidget({ group, isLoading }) {
  if (!group || isLoading) {
    return (
      <div className="total-exp-widget">
        <img className="total-icon" src={getMetricIcon('overall')} alt="" />
        <div className="total-info">
          <b className="total-info__metric -placeholder" />
          <span className="total-info__gained -placeholder" />
        </div>
      </div>
    );
  }

  const { totalExperience } = group;

  return (
    <div className="total-exp-widget">
      <img className="total-icon" src={getMetricIcon('overall')} alt="" />
      <div className="total-info">
        <b className="total-info__metric">Overall Exp.</b>
        <span className="total-info__gained">{formatNumber(totalExperience)}</span>
      </div>
    </div>
  );
}

TotalExperienceWidget.propTypes = {
  group: PropTypes.shape().isRequired,
  isLoading: PropTypes.bool.isRequired
};

export default TotalExperienceWidget;
