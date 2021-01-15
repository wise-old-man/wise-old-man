import React from 'react';
import PropTypes from 'prop-types';
import './GlobalMessage.scss';

function GlobalMessage({ message }) {
  return <div className="global-message__container">{message}</div>;
}

GlobalMessage.propTypes = {
  message: PropTypes.string.isRequired
};

export default GlobalMessage;
