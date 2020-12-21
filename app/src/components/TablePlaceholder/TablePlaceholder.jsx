import React from 'react';
import PropTypes from 'prop-types';
import { times } from 'lodash';
import './TablePlaceholder.scss';

function Row() {
  const randomWidth = 50 + Math.floor(Math.random() * 250);

  return (
    <li className="table-placeholder__item">
      <div className="placeholder-text" style={{ width: randomWidth }} />
    </li>
  );
}

function TablePlaceholder({ size }) {
  return (
    <ul className="table-placeholder">
      {times(size, i => (
        <Row key={i} />
      ))}
    </ul>
  );
}

TablePlaceholder.propTypes = {
  // The amount of fake rows to render
  size: PropTypes.number.isRequired
};

export default React.memo(TablePlaceholder);
