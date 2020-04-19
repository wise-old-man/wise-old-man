import React from 'react';
import PropTypes from 'prop-types';
import { formatNumber, getSkillIcon } from '../../../../utils';
import './TotalExperienceWidget.scss';

function TotalExperienceWidget({ group }) {
  if (!group || group.totalExperience === undefined) {
    return (
      <div className="total-exp-widget">
        <img className="total-icon" src={getSkillIcon('overall')} alt="" />
        <div className="total-info">
          <span className="total-info__metric -placeholder" />
          <b className="total-info__gained -placeholder" />
        </div>
      </div>
    );
  }

  const { totalExperience } = group;

  return (
    <div className="total-exp-widget">
      <img className="total-icon" src={getSkillIcon('overall')} alt="" />
      <div className="total-info">
        <span className="total-info__metric">Overall exp</span>
        <b className="total-info__gained">{formatNumber(totalExperience)}</b>
      </div>
    </div>
  );
}

TotalExperienceWidget.propTypes = {
  group: PropTypes.shape().isRequired
};

export default TotalExperienceWidget;
