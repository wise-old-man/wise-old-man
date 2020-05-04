import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { formatNumber } from '../../utils';
import './NumberLabel.scss';

function signNumber(value, formattedValue) {
  return value <= 0 ? formattedValue : `+${formattedValue}`;
}

function getNumberClass(value, lowThreshold) {
  if (value === 0) {
    return '';
  }

  if (value < 0) {
    return '-negative';
  }

  if (value < lowThreshold) {
    return '-low-positive';
  }

  return '-positive';
}

function NumberLabel({ value, isColored, isSigned, lowThreshold }) {
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const className = isColored ? getNumberClass(value, lowThreshold) : '';

  const formattedValue = formatNumber(value, true);
  const formattedFullValue = formatNumber(value, false);

  const finalValue = isSigned ? signNumber(value, formattedValue) : formattedValue;

  const togglePopup = e => {
    e.stopPropagation();
    setIsPopupVisible(!isPopupVisible);
  };

  const hidePopup = () => setIsPopupVisible(false);

  return (
    <button className="number-label-btn" type="button" onClick={togglePopup} onBlur={hidePopup}>
      {isPopupVisible && <div className="number-label-popup">{formattedFullValue}</div>}
      <abbr className={`number-label ${className}`} title={formattedFullValue}>
        <span>{finalValue}</span>
      </abbr>
    </button>
  );
}

NumberLabel.defaultProps = {
  isColored: false,
  isSigned: false,
  lowThreshold: 0
};

NumberLabel.propTypes = {
  value: PropTypes.number.isRequired,
  isColored: PropTypes.bool,
  isSigned: PropTypes.bool,
  lowThreshold: PropTypes.number
};

export default NumberLabel;
