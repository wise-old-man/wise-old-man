import React from 'react';
import PropTypes from 'prop-types';
import { PERIODS, PeriodProps, MetricProps } from '@wise-old-man/utils';
import { Table, NumberLabel } from 'components';
import { getMetricIcon, formatDate } from 'utils';
import './PlayerRecord.scss';

const TABLE_CONFIG = {
  uniqueKey: row => `${row.period}/${row.metric}`,
  columns: [
    {
      key: 'period',
      className: () => '-primary',
      transform: value => PeriodProps[value].name
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

  const filteredRecords = metricRecords.sort(
    (a, b) => PERIODS.indexOf(a.period) - PERIODS.indexOf(b.period)
  );

  return (
    <div className="player-record">
      <div className="player-record__header">
        <img src={getMetricIcon(metric)} alt="" />
        <b className="player-record__title">{MetricProps[metric].name}</b>
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
