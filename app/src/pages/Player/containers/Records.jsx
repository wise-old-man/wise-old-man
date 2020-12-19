import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { isSkill, isActivity, isBoss } from 'utils';
import { ALL_METRICS } from 'config';
import { recordSelectors } from 'redux/records';
import { PlayerRecord } from '../components';
import { PlayerContext } from '../context';

function Records() {
  const { context } = useContext(PlayerContext);
  const { username, metricType } = context;

  const records = useSelector(state => recordSelectors.getPlayerRecords(state, username));
  const typeRecords = getFilteredRecords(records, metricType);

  return (
    <>
      {ALL_METRICS.sort(a => {
        // Sort to make sure EHP and EHB always show up first
        return a.startsWith('eh') ? -5 : 0;
      }).map(metric => {
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
    </>
  );
}

function getFilteredRecords(records, metricType) {
  if (!records) {
    return [];
  }

  if (metricType === 'skilling') {
    return records.filter(r => isSkill(r.metric) || r.metric === 'ehp');
  }

  if (metricType === 'bossing') {
    return records.filter(r => isBoss(r.metric) || r.metric === 'ehb');
  }

  return records.filter(r => isActivity(r.metric));
}

export default Records;
