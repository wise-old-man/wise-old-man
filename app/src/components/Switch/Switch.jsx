import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import './Switch.scss';

function Switch({ on, onToggle }) {
  return (
    <button className={classNames('switch', { '-on': on })} type="button" onClick={onToggle}>
      <div className="switch-thumb" />
    </button>
  );
}

Switch.propTypes = {
  // The switch's state
  on: PropTypes.bool.isRequired,

  // The onToggle event callback
  onToggle: PropTypes.func.isRequired
};

export default Switch;
