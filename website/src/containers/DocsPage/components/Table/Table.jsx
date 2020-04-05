import React from 'react';
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

export default Table;
