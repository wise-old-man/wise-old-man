import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { capitalize } from '../../utils';
import './Table.scss';

function getRowValue(row, key, get, transform) {
  const value = get ? get(row) : row[key];
  return [transform ? transform(value, row) : value, value];
}

function Table({ rows, columns, uniqueKeySelector, highlightedIndex, onRowClicked }) {
  const clickable = !!onRowClicked;
  const tableClass = classNames('table', { '-clickable': clickable });

  const columnClass = className => (className && className()) || '';
  const columnLabel = (label, key) => (label || label === '' ? label : capitalize(key));

  const baseRowClass = (className, originalValue) => (className ? className(originalValue) : '');
  const cellClass = (rowClass, isHighlighted) => classNames(rowClass, { '-highlighted': isHighlighted });

  return (
    <table className={tableClass} cellSpacing="0" cellPadding="0">
      {/* Colgroups */}
      <colgroup>
        {columns && columns.map(({ key, width }) => <col key={`colgroup-${key}`} width={width} />)}
      </colgroup>
      <thead>
        {/* Column headers */}
        <tr>
          {columns.map(({ key, label, className }) => (
            <th key={`col-${key}`} className={columnClass(className)}>
              {columnLabel(label, key)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {!rows || rows.length === 0 ? (
          <tr className="-empty">
            <td colSpan={2}>No results found</td>
          </tr>
        ) : (
          rows.map((row, i) => {
            /* Rows */
            const rowUniqueKey = uniqueKeySelector(row);
            const onClick = () => onRowClicked && onRowClicked(i);

            return (
              <tr key={rowUniqueKey} onClick={onClick}>
                {columns.map(({ key, transform, get, className }) => {
                  const cellUniqueKey = `${rowUniqueKey}/${key}`;
                  const isHighlighted = i === highlightedIndex;
                  const [formatted, original] = getRowValue(row, key, get, transform);
                  const rowClass = baseRowClass(className, original);

                  return (
                    <td className={cellClass(rowClass, isHighlighted)} key={cellUniqueKey}>
                      {formatted}
                    </td>
                  );
                })}
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}

Table.defaultProps = {
  rows: [],
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

  // Since not all rows have an "id" field, the unique identifier must be defined
  uniqueKeySelector: PropTypes.func.isRequired,

  highlightedIndex: PropTypes.number,

  // Event: fired when a row is clicked (if clickable)
  onRowClicked: PropTypes.func
};

export default React.memo(Table);
