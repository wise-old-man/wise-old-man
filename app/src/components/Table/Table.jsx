import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { capitalize } from '../../utils';
import './Table.scss';

const DEFAULT = 0;
const ASCENDING = 1;
const DESCENDING = 2;

function getValue(row, key, get, transform) {
  const value = get ? get(row) : row[key];
  return [transform ? transform(value, row) : value, value];
}

function Table({ rows, columns, highlightedIndex, onRowClicked, clickable }) {
  const [sortedRows, setSortedRows] = useState(rows);
  const [sortStatus, setSortStatus] = useState(DEFAULT);

  const handleSort = key => {
    const sorted = Object.assign([], rows);
    if (sortStatus === DEFAULT) {
      sorted.sort((a, b) => b[key] - a[key]);
      setSortStatus(ASCENDING);
    } else if (sortStatus === ASCENDING) {
      sorted.sort((a, b) => a[key] - b[key]);
      setSortStatus(DESCENDING);
    } else {
      setSortStatus(DEFAULT);
    }

    setSortedRows(sorted);
  };

  useEffect(() => {
    setSortedRows(rows);
  }, [rows]);

  const tableClass = classNames({
    table: true,
    '-clickable': clickable
  });

  return (
    <table className={tableClass} cellSpacing="0" cellPadding="0">
      <colgroup>
        {columns && columns.map(({ key, width }) => <col key={`colgroup-${key}`} width={width} />)}
      </colgroup>
      <thead>
        <tr>
          {columns.map(({ key, label, className }) => {
            return (
              <th
                className={className && className()}
                key={`col-${key}`}
                onClick={() => handleSort(key)}
              >
                {label || label === '' ? label : capitalize(key)}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {sortedRows && sortedRows.length ? (
          sortedRows.map((row, i) => (
            <tr key={i} onClick={() => clickable && onRowClicked && onRowClicked(i)}>
              {columns.map(({ key, transform, get, className }) => {
                const [formatted, original] = getValue(row, key, get, transform);
                const customClass = className ? className(original) : '';
                const cellClass = classNames(customClass, { '-highlighted': i === highlightedIndex });
                return (
                  <td className={cellClass} key={i + key}>
                    {formatted}
                  </td>
                );
              })}
            </tr>
          ))
        ) : (
          <tr className="-empty">
            <td colSpan={2}>No results found</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

Table.defaultProps = {
  rows: [],
  clickable: false,
  onRowClicked: undefined,
  highlightedIndex: -1
};

Table.propTypes = {
  // The list of row objects to render
  rows: PropTypes.arrayOf(PropTypes.shape()),

  // An array of all the columns and their configurations parameters:
  //  - key - the column field/name
  //  - width (optional) - the column's forced width
  //  - label (optioanl) - the column's label, by default this is the key, capitlized.
  //  - className (optional) - custom styling class, a couple preset classes are: [-primary, -positive, -negative, -neutral, -low-positive, -break-large, -break-small]
  //  - transform (optional) - custom cell rendering (provide a component to render inside the cell)
  //  - get (optional) - alternate way of fetching data from the row object, by default it will fetch row[key]
  columns: PropTypes.arrayOf(PropTypes.shape()).isRequired,

  highlightedIndex: PropTypes.number,

  // If true, the rows will be clickable
  clickable: PropTypes.bool,

  // Event: fired when a row is clicked (if clickable)
  onRowClicked: PropTypes.func
};

export default React.memo(Table);
