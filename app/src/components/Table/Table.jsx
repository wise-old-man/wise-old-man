import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { capitalize, formatNumber } from '../../utils';
import './Table.scss';

function getValue(row, key, get, transform) {
  const value = get ? get(row) : row[key];
  return transform ? transform(value, row) : value;
}

function Table({ rows, columns, onRowClicked, clickable }) {
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
              <th className={className && className()} key={`col-${key}`}>
                {label || label === '' ? label : capitalize(key)}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {rows && rows.length ? (
          rows.map((row, i) => (
            <tr key={i} onClick={() => clickable && onRowClicked && onRowClicked(i)}>
              {columns.map(({ key, transform, get, className, formatNumbers }) => {
                const value = getValue(row, key, get, transform);
                return (
                  <td className={className && className(value)} key={i + key}>
                    {formatNumbers ? formatNumber(value) : value}
                  </td>
                );
              })}
            </tr>
          ))
        ) : (
          <tr className="-empty">
            <td>No results found</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

Table.defaultProps = {
  rows: [],
  clickable: false,
  onRowClicked: undefined
};

Table.propTypes = {
  // The list of row objects to render
  rows: PropTypes.arrayOf(PropTypes.shape()),

  // An array of all the columns and their configurations parameters:
  //  - key - the column field/name
  //  - width (optional) - the column's forced width
  //  - label (optioanl) - the column's label, by default this is the key, capitlized.
  //  - className (optional) - custom styling class, a couple preset classes are: [-primary, -positive, -negative, -neutral, -low-positive, -break-large, -break-small]
  //  - transform (optioanl) - custom cell rendering (provide a component to render inside the cell)
  //  - get (optional) - alternate way of fetching data from the row object, by default it will fetch row[key]
  //  - formatNumbers (optional) - if true, 256757 will be rendered as 256,757
  columns: PropTypes.arrayOf(PropTypes.shape()).isRequired,

  // If true, the rows will be clickable
  clickable: PropTypes.bool,

  // Event: fired when a row is clicked (if clickable)
  onRowClicked: PropTypes.func
};

export default React.memo(Table);
