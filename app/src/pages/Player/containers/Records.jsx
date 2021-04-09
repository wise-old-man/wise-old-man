import React, { useContext, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { isSkill, isActivity, isBoss } from 'utils';
import { ALL_METRICS, SKILLS, BOSSES, ACTIVITIES } from 'config';
import { Selector, Loading } from 'components';
import { recordSelectors, recordActions } from 'redux/records';
import { PlayerRecord } from '../components';
import { PlayerContext } from '../context';

const METRIC_TYPE_OPTIONS = [
  { label: 'Skilling', value: 'skilling' },
  { label: 'Bossing', value: 'bossing' },
  { label: 'Activities', value: 'activities' }
];

function Records() {
  const dispatch = useDispatch();
  const { context, updateContext } = useContext(PlayerContext);

  const { username, metricType } = context;
  const metricTypeIndex = METRIC_TYPE_OPTIONS.findIndex(o => o.value === metricType);

  const isLoading = useSelector(recordSelectors.isFetchingPlayerRecords);
  const records = useSelector(state => recordSelectors.getPlayerRecords(state, username));

  const typeRecords = getFilteredRecords(records, metricType);

  const handleMetricTypeSelected = e => {
    if (e.value === 'skilling') {
      updateContext({ metricType: e.value, metric: SKILLS[0] });
    } else if (e.value === 'bossing') {
      updateContext({ metricType: e.value, metric: BOSSES[0] });
    } else if (e.value === 'activities') {
      updateContext({ metricType: e.value, metric: ACTIVITIES[0] });
    }
  };

  const fetchRecords = useCallback(() => {
    // Fetch player records, if not loaded yet
    if (!records) {
      dispatch(recordActions.fetchPlayerRecords(username));
    }
  }, [dispatch, username, records]);

  useEffect(fetchRecords, [fetchRecords]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <div className="row records-controls">
        <div className="col-lg-4 col-sm-12">
          <Selector
            options={METRIC_TYPE_OPTIONS}
            selectedIndex={metricTypeIndex}
            onSelect={handleMetricTypeSelected}
          />
        </div>
      </div>
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
