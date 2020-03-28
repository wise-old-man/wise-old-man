import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import './TableListPlaceholder.scss';

function Row() {
  const randomWidth = 50 + Math.floor(Math.random() * 250);

  return (
    <li className="table-list-placeholder__item">
      <div className="placeholder-text" style={{ width: randomWidth }} />
    </li>
  );
}

function TableListPlaceholder({ size }) {
  return (
    <ul className="table-list-placeholder">
      {_.times(size, i => (
        <Row key={i} />
      ))}
    </ul>
  );
}

TableListPlaceholder.propTypes = {
  // The amount of fake rows to render
  size: PropTypes.number.isRequired
};

export default React.memo(TableListPlaceholder);
