import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { capitalize } from '../../utils';
import './Table.scss';

const SORT = {
  DEFAULT: 'default',
  ASCENDING: 'ascending',
  DESCENDING: 'descending'
};

const DEFAULT_SORTING = { type: SORT.DEFAULT, by: '' };

function getValue(row, key, get, transform) {
  const value = get ? get(row) : row[key];
  return [transform ? transform(value, row) : value, value];
}

function Table({ rows, columns, highlightedIndex, onRowClicked, clickable }) {
  const [sorting, setSorting] = useState(DEFAULT_SORTING);

  const handleClick = key => {
    let sortNext = SORT.DEFAULT;

    if (sorting.type === SORT.DEFAULT || sorting.by !== key) {
      sortNext = SORT.ASCENDING;
    } else if (sorting.type === SORT.ASCENDING) {
      sortNext = SORT.DESCENDING;
    }

    setSorting({ type: sortNext, by: key });
  };

  const handleSort = (a, b) => {
    if (sorting.type === SORT.ASCENDING) {
      return b[sorting.by] - a[sorting.by];
    }

    if (sorting.type === SORT.DESCENDING) {
      return a[sorting.by] - b[sorting.by];
    }

    return 0;
  };

  useEffect(() => {
    return () => setSorting(DEFAULT_SORTING);
  }, [rows]);

  const tableClass = classNames({ table: true, '-clickable': clickable });

  return (
    <table className={tableClass} cellSpacing="0" cellPadding="0">
      <colgroup>
        {columns && columns.map(({ key, width }) => <col key={`colgroup-${key}`} width={width} />)}
      </colgroup>
      <thead>
        <tr>
          {columns.map(({ key, label, className, isSortable = true }) => {
            const customClass = (className && className()) || '';
            const arrowClass = classNames('arrow', {
              '-default': sorting.by !== key,
              '-ascending': sorting.type === 'ascending' && sorting.by === key,
              '-descending': sorting.type === 'descending' && sorting.by === key
            });
            return (
              <th
                className={customClass}
                key={`col-${key}`}
                onClick={() => isSortable && handleClick(key)}
              >
                {label || label === '' ? label : capitalize(key)}
                {isSortable && <div className={arrowClass} />}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {rows && rows.length ? (
          [...rows].sort(handleSort).map((row, i) => (
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
  //  - isSortable (true by default) - if false, will not show the sorting arrow (or allow sorting)
  columns: PropTypes.arrayOf(PropTypes.shape()).isRequired,

  highlightedIndex: PropTypes.number,

  // If true, the rows will be clickable
  clickable: PropTypes.bool,

  // Event: fired when a row is clicked (if clickable)
  onRowClicked: PropTypes.func
};

export default React.memo(Table);
