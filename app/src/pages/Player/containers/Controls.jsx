import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Selector } from 'components';
import { SKILLS, BOSSES, ACTIVITIES } from 'config';
import { PlayerContext } from '../context';

const PERIOD_OPTIONS = [
  { label: '5 Min', value: '5min' },
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' }
];

const LEVEL_TYPE_OPTIONS = [
  { label: 'Show Regular Levels', value: 'regular' },
  { label: 'Show Virtual Levels', value: 'virtual' }
];

const METRIC_TYPE_OPTIONS = [
  { label: 'Skilling', value: 'skilling' },
  { label: 'Bossing', value: 'bossing' },
  { label: 'Activities', value: 'activities' }
];

function Controls({ tabs }) {
  const { context, updateContext } = useContext(PlayerContext);
  const { section, virtual, metricType, period } = context;

  const selectedTabIndex = tabs.findIndex(t => t.toLowerCase() === section);
  const levelTypeIndex = virtual ? 1 : 0;
  const metricTypeIndex = METRIC_TYPE_OPTIONS.findIndex(o => o.value === metricType);
  const periodIndex = PERIOD_OPTIONS.findIndex(o => o.value === period);

  function handleTabSelected(tabIndex) {
    updateContext({ section: tabs[tabIndex].toLowerCase() });
  }

  function handleMetricTypeSelected(e) {
    if (e.value === 'skilling') {
      updateContext({ metricType: e.value, metric: SKILLS[0] });
    } else if (e.value === 'bossing') {
      updateContext({ metricType: e.value, metric: BOSSES[0] });
    } else if (e.value === 'activities') {
      updateContext({ metricType: e.value, metric: ACTIVITIES[0] });
    }
  }

  function handlePeriodSelected(e) {
    updateContext({ period: e.value });
  }

  function handleLevelTypeSelected(e) {
    updateContext({ virtual: e.value === 'virtual' });
  }

  return (
    <>
      <div className="col-md-12">
        <Tabs
          tabs={tabs}
          selectedIndex={selectedTabIndex}
          align="space-between"
          onTabSelected={handleTabSelected}
        />
      </div>
      <div className="col-7" />

      {section === 'overview' && (
        <>
          <div className="col-md-6 col-lg-2">
            <Selector
              options={METRIC_TYPE_OPTIONS}
              selectedIndex={metricTypeIndex}
              onSelect={handleMetricTypeSelected}
            />
          </div>
          <div className="col-md-6 col-lg-3">
            <Selector
              options={LEVEL_TYPE_OPTIONS}
              selectedIndex={levelTypeIndex}
              onSelect={handleLevelTypeSelected}
              disabled={metricType !== 'skilling'}
            />
          </div>
        </>
      )}
      {section === 'gained' && (
        <>
          <div className="col-md-6 col-lg-2">
            <Selector
              options={METRIC_TYPE_OPTIONS}
              selectedIndex={metricTypeIndex}
              onSelect={handleMetricTypeSelected}
            />
          </div>
          <div className="col-md-6 col-lg-3">
            <Selector
              options={PERIOD_OPTIONS}
              selectedIndex={periodIndex}
              onSelect={handlePeriodSelected}
            />
          </div>
        </>
      )}
      {(section === 'records' || section === 'achievements') && (
        <>
          <div className="col-md-6 col-lg-2">
            <Selector
              options={METRIC_TYPE_OPTIONS}
              selectedIndex={metricTypeIndex}
              onSelect={handleMetricTypeSelected}
            />
          </div>
          <div className="col-md-6 col-lg-3">
            <Selector disabled />
          </div>
        </>
      )}
      {(section === 'competitions' || section === 'groups' || section === 'names') && (
        <>
          <div className="col-md-6 col-lg-2">
            <Selector disabled />
          </div>
          <div className="col-md-6 col-lg-3">
            <Selector disabled />
          </div>
        </>
      )}
    </>
  );
}

Controls.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default Controls;
