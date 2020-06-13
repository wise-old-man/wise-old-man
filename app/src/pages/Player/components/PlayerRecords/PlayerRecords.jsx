import React from 'react';
import PropTypes from 'prop-types';
import Table from '../../../../components/Table';
import NumberLabel from '../../../../components/NumberLabel';
import {
  capitalize,
  getMetricIcon,
  formatDate,
  getMetricName,
  isSkill,
  isActivity,
  isBoss
} from '../../../../utils';
import { ALL_METRICS } from '../../../../config';
import './PlayerRecords.scss';

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

function getFilteredRecords(records, metricType) {
  if (!records) {
    return [];
  }

  if (metricType === 'skilling') {
    return records.filter(r => isSkill(r.metric));
  }

  if (metricType === 'activities') {
    return records.filter(r => isActivity(r.metric));
  }

  return records.filter(r => isBoss(r.metric));
}

function PlayerRecord({ metricRecords, metric }) {
  if (!metricRecords) {
    return null;
  }

  const PERIOD_ORDER = ['day', 'week', 'month', 'year'];

  const filteredRecords = metricRecords.sort(
    (a, b) => PERIOD_ORDER.indexOf(a.period) - PERIOD_ORDER.indexOf(b.period)
  );

  return (
    <div className="record">
      <div className="record__header">
        <img src={getMetricIcon(metric)} alt="" />
        <b className="record__title">{getMetricName(metric)}</b>
      </div>
      <div className="record__body">
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

function PlayerRecords({ records, metricType }) {
  const typeRecords = getFilteredRecords(records, metricType);
  return (
    <div className="player-records__container row">
      {ALL_METRICS.map(metric => {
        const metricRecords = typeRecords.filter(r => r.metric === metric);
        return (
          metricRecords &&
          metricRecords.length > 0 && (
            <div key={`record-${metric}`} className="col-md-6 col-lg-4">
              <PlayerRecord metric={metric} metricRecords={metricRecords} />
            </div>
          )
        );
      })}
    </div>
  );
}

PlayerRecord.propTypes = {
  metricRecords: PropTypes.arrayOf(PropTypes.shape).isRequired,
  metric: PropTypes.string.isRequired
};

PlayerRecords.propTypes = {
  records: PropTypes.arrayOf(PropTypes.shape).isRequired,
  metricType: PropTypes.string.isRequired
};

export default PlayerRecords;
