import React from 'react';
import PropTypes from 'prop-types';
import './Badge.scss';

function Badge({ color, text, hoverText }) {
  return (
    <abbr className="badge" title={hoverText} style={{ color, borderColor: color }}>
      <span>{text}</span>
    </abbr>
  );
}

Badge.defaultProps = {
  color: null
};

Badge.propTypes = {
  color: PropTypes.string,
  text: PropTypes.string.isRequired,
  hoverText: PropTypes.string.isRequired
};

export default Badge;
