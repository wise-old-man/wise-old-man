import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './TextLabel.scss';

function TextLabel({ value, popupValue }) {
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const popupText = popupValue || value;

  const togglePopup = e => {
    e.stopPropagation();
    setIsPopupVisible(!isPopupVisible);
  };

  const hidePopup = () => setIsPopupVisible(false);

  return (
    <button className="text-label-btn" type="button" onClick={togglePopup} onBlur={hidePopup}>
      {isPopupVisible && <div className="text-label-popup">{popupText}</div>}
      <abbr className="text-label" title={popupText}>
        <span>{value}</span>
      </abbr>
    </button>
  );
}

TextLabel.defaultProps = {
  popupValue: undefined
};

TextLabel.propTypes = {
  value: PropTypes.string.isRequired,
  popupValue: PropTypes.string
};

export default React.memo(TextLabel);
