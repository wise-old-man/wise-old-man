import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { capitalize } from 'utils';
import './TableToolbar.scss';

function TableToolbar({ resultsSize, sortingColumn, sortingDirection, bottomStroke, onExportClicked }) {
  const label = sortingColumn.label || capitalize(sortingColumn.key);
  const direction = sortingDirection === 'default' ? 'ascending' : sortingDirection;

  return (
    <div className={classNames('table-toolbar', { '-stroke': bottomStroke })}>
      <div className="table-toolbar__info">
        <span>{`Showing ${resultsSize} results`}</span>
        <span className="separator">|</span>
        <span>Ordered by</span>
        <span className="highlight">{`${label} (${direction})`}</span>
      </div>
      <button className="table-toolbar__btn" type="button" onClick={onExportClicked}>
        <img src="/img/icons/export.svg" alt="" />
        Export Table
      </button>
    </div>
  );
}

TableToolbar.propTypes = {
  resultsSize: PropTypes.number.isRequired,
  sortingColumn: PropTypes.shape().isRequired,
  sortingDirection: PropTypes.string.isRequired,
  bottomStroke: PropTypes.bool.isRequired,
  onExportClicked: PropTypes.func.isRequired
};

export default TableToolbar;
