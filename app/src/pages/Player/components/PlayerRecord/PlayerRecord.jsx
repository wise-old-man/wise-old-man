import React from 'react';
import PropTypes from 'prop-types';
import { Table, NumberLabel } from 'components';
import { capitalize, getMetricIcon, formatDate, getMetricName } from 'utils';
import './PlayerRecord.scss';

const TABLE_CONFIG = {
  uniqueKey: row => `${row.period}/${row.metric}`,
  columns: [
    {
      key: 'period',
      className: () => '-primary',
      transform: value => capitalize(value)
    },
    {
      key: 'value',
      transform: val => <NumberLabel value={val} isColored isSigned />
    },
    {
      key: 'updatedAt',
      width: 110,
      transform: value => formatDate(value, 'DD MMM, YYYY')
    }
  ]
};

function PlayerRecord({ metricRecords, metric }) {
  if (!metricRecords) {
    return null;
  }

  const PERIOD_ORDER = ['6h', 'day', 'week', 'month', 'year'];

  const filteredRecords = metricRecords.sort(
    (a, b) => PERIOD_ORDER.indexOf(a.period) - PERIOD_ORDER.indexOf(b.period)
  );

  return (
    <div className="player-record">
      <div className="player-record__header">
        <img src={getMetricIcon(metric)} alt="" />
        <b className="player-record__title">{getMetricName(metric)}</b>
      </div>
      <div className="player-record__body">
        <Table
          rows={filteredRecords}
          uniqueKeySelector={TABLE_CONFIG.uniqueKey}
          columns={TABLE_CONFIG.columns}
          listStyle
        />
      </div>
    </div>
  );
}

PlayerRecord.propTypes = {
  metric: PropTypes.string.isRequired,
  metricRecords: PropTypes.arrayOf(PropTypes.shape).isRequired
};

export default PlayerRecord;
