import React from 'react';
import PropTypes from 'prop-types';
import './InfoPanel.scss';

function InfoPanel({ data }) {
  return (
    <div className="info-panel">
      {data.map(({ key, value, className }) => (
        <div key={key} className="info-item">
          <span className="info-item__label">{key}</span>
          <b className={`info-item__value ${className || ''}`}>{value}</b>
        </div>
      ))}
    </div>
  );
}

InfoPanel.propTypes = {
  // The data array, must contain fields (key, value), optional fields (className)
  // Ex: [{key: "Username", value: "Psikoi", className: "username-label"}]
  data: PropTypes.arrayOf(PropTypes.shape()).isRequired
};

export default InfoPanel;
