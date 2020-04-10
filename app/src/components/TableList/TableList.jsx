import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './TableList.scss';

function TableList({ uniqueKeySelector, rows, columns, onRowClicked, clickable }) {
  const tableClass = classNames({
    'table-list': true,
    '-clickable': clickable
  });

  return (
    <table className={tableClass}>
      <colgroup>
        {columns && columns.map(({ key, width }) => <col key={key} width={width} />)}
      </colgroup>
      <tbody>
        {rows && rows.length ? (
          rows.map((row, i) => {
            const rowKey = uniqueKeySelector(row);
            return (
              <tr key={rowKey} onClick={() => onRowClicked && onRowClicked(i)}>
                {columns.map(({ key, transform, className }) => {
                  const value = transform ? transform(row[key], row) : row[key];
                  return (
                    <td className={className && className(row[key])} key={`${rowKey}/${key}`}>
                      {value}
                    </td>
                  );
                })}
              </tr>
            );
          })
        ) : (
          <tr className="-empty">
            <td>No results found</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

TableList.defaultProps = {
  rows: [],
  clickable: false,
  onRowClicked: undefined
};

TableList.propTypes = {
  // Since not all rows have an "id" field, the unique identifier must be defined
  uniqueKeySelector: PropTypes.func.isRequired,

  // List of row objects to render
  rows: PropTypes.arrayOf(PropTypes.shape()),

  // An array of all the columns and their configurations parameters:
  //  - key - the column field/name
  //  - width (optional) - the column's forced width
  //  - label (optioanl) - the column's label, by default this is the key, capitlized.
  //  - className (optional) - custom styling class, a couple preset classes are: [-primary, -positive, -negative, -neutral, -low-positive, -break-large, -break-small]
  //  - transform (optional) - custom cell rendering (provide a component to render inside the cell)
  columns: PropTypes.arrayOf(PropTypes.shape()).isRequired,

  // If true, the rows will be clickable
  clickable: PropTypes.bool,

  // Event: fired when a row is clicked (if clickable)
  onRowClicked: PropTypes.func
};

export default React.memo(TableList);
