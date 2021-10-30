import React, { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { capitalize } from 'utils';
import TableToolbar from '../TableToolbar';
import './Table.scss';

const SORT = {
  DEFAULT: 'default',
  ASCENDING: 'ascending',
  DESCENDING: 'descending'
};

const DEFAULT_SORTING = { type: SORT.DEFAULT, by: '' };

function Table({
  rows,
  columns,
  uniqueKeySelector,
  renderRowDetails,
  highlightedRowKey,
  listStyle,
  listStyleHeaders,
  showToolbar,
  onRowClicked,
  onExportClicked
}) {
  const [sorting, setSorting] = useState(DEFAULT_SORTING);

  const handleHeaderClicked = key => {
    let sortNext = SORT.DEFAULT;

    if (sorting.type === SORT.DEFAULT || sorting.by !== key) {
      sortNext = SORT.ASCENDING;
    } else if (sorting.type === SORT.ASCENDING) {
      sortNext = SORT.DESCENDING;
    }

    setSorting({ type: sortNext, by: key });
  };

  const handleSort = useCallback(
    (a, b) => {
      const column = columns.find(c => c.key === sorting.by);

      if (!column) {
        return 0;
      }

      const aValue = column.get ? column.get(a) : a[sorting.by];
      const bValue = column.get ? column.get(b) : b[sorting.by];

      const isString = typeof aValue === 'string' || typeof bValue === 'string';

      if (sorting.type === SORT.ASCENDING) {
        return isString ? String(aValue).localeCompare(String(bValue)) : aValue - bValue;
      }

      if (sorting.type === SORT.DESCENDING) {
        return isString ? String(bValue).localeCompare(String(aValue)) : bValue - aValue;
      }

      return 0;
    },
    [columns, sorting]
  );

  // When table gets unmounted, reset sorting to defualt
  useEffect(() => () => setSorting(DEFAULT_SORTING), [rows]);

  const tableClass = classNames('table', {
    '-clickable': !!onRowClicked,
    '-list': listStyle,
    '-details': !!renderRowDetails
  });

  const columnClass = className => (className && className()) || '';
  const columnLabel = (label, key) => (label || label === '' ? label : capitalize(key));
  const columnArrowClass = key =>
    classNames('arrow', {
      '-default': sorting.by !== key,
      '-ascending': sorting.type === 'ascending' && sorting.by === key,
      '-descending': sorting.type === 'descending' && sorting.by === key
    });

  const baseRowClass = (className, original, row) => (className ? className(original, row) : '');
  const cellClass = (rowClass, isHighlighted) => classNames(rowClass, { '-highlighted': isHighlighted });

  // Memoize the sorting, to avoid re-sorting on every re-render
  const sortedRows = useMemo(() => [...rows].sort(handleSort), [rows, handleSort]);

  return (
    <div>
      {showToolbar && columns.length > 0 && (
        <TableToolbar
          resultsSize={rows.length}
          sortingColumn={columns.find(c => c.key === sorting.by) || columns[0]}
          sortingDirection={sorting.type}
          bottomStroke={listStyleHeaders}
          onExportClicked={onExportClicked}
        />
      )}
      <table className={tableClass} cellSpacing="0" cellPadding="0">
        {/* Colgroups */}
        <colgroup>
          {columns && columns.map(({ key, width }) => <col key={`colgroup-${key}`} width={width} />)}
        </colgroup>
        {(!listStyle || listStyleHeaders) && (
          <thead>
            {/* Column headers */}
            <tr>
              {columns.map(({ key, label, className, isSortable = true }) => (
                <th
                  key={`col-${key}`}
                  className={columnClass(className)}
                  onClick={() => isSortable && handleHeaderClicked(key)}
                >
                  {columnLabel(label, key)}
                  {isSortable && <div className={columnArrowClass(key)} />}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {!rows || rows.length === 0 ? (
            <tr className="-empty">
              <td colSpan={2}>No results found</td>
            </tr>
          ) : (
            sortedRows.map((row, i) => {
              /* Rows */
              const rowUniqueKey = uniqueKeySelector(row);
              const onClick = () => onRowClicked && onRowClicked(rowUniqueKey);

              return (
                <Fragment key={rowUniqueKey}>
                  <tr onClick={onClick}>
                    {columns.map(({ key, transform, get, className }) => {
                      const cellUniqueKey = `${rowUniqueKey}/${key}`;
                      const isHighlighted = rowUniqueKey === highlightedRowKey;
                      const [formatted, original] = getCellValue(row, key, get, transform);
                      const rowClass = baseRowClass(className, original, row);

                      return (
                        <td className={cellClass(rowClass, isHighlighted)} key={cellUniqueKey}>
                          {formatted}
                        </td>
                      );
                    })}
                  </tr>
                  {renderRowDetails && (
                    <td colSpan="100%" className="details-cell">
                      {renderRowDetails(row, i)}
                    </td>
                  )}
                </Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function getCellValue(row, key, get, transform) {
  const value = get ? get(row) : row[key];
  return [transform ? transform(value, row) : value, value];
}

Table.defaultProps = {
  rows: [],
  onRowClicked: undefined,
  onExportClicked: undefined,
  renderRowDetails: undefined,
  listStyle: false,
  listStyleHeaders: false,
  showToolbar: false,
  highlightedRowKey: null
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

  renderRowDetails: PropTypes.func,

  // Since not all rows have an "id" field, the unique identifier must be defined
  uniqueKeySelector: PropTypes.func.isRequired,

  // The row to be displayed as highlighted (lighter color)
  highlightedRowKey: PropTypes.string,

  // If enabled, the table will be displayed as a list (no headers, seperate rows)
  listStyle: PropTypes.bool,

  listStyleHeaders: PropTypes.bool,

  showToolbar: PropTypes.bool,

  onExportClicked: PropTypes.func,

  // Event: fired when a row is clicked (if clickable)
  onRowClicked: PropTypes.func
};

export default React.memo(Table);
