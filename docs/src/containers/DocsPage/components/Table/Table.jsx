import React from 'react';
import PropTypes from 'prop-types';
import './Table.scss';

function Table({ title, description, columns, rows }) {
  return (
    <div className="table__container block">
      <h4 className="block-title">{title}</h4>
      <p className="block-description">{description}</p>
      <table className="table" cellSpacing="1" cellPadding="0">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.field}>
              {Object.values(r).map((v) => (
                <td key={v}>{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

Table.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  columns: PropTypes.arrayOf(PropTypes.string).isRequired,
  rows: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export default Table;
