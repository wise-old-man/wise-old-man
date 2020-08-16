import React from 'react';
import PropTypes from 'prop-types';
import './PageBadge.scss';

function PageBadge({ text, hoverText }) {
  return (
    <abbr className="page-badge" title={hoverText}>
      <span>{text}</span>
    </abbr>
  );
}

PageBadge.propTypes = {
  text: PropTypes.string.isRequired,
  hoverText: PropTypes.string.isRequired
};

export default PageBadge;
