import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet';
import { useUrlContext } from 'hooks';
import { getMetricName } from 'utils';
import { ALL_METRICS, PLAYER_BUILDS, PLAYER_TYPES } from 'config';
import { PageTitle } from 'components';
import { recordActions } from 'redux/records';
import URL from 'utils/url';
import { Controls, List } from './containers';
import { RecordsContext } from './context';
import './Records.scss';

const PERIODS = ['day', 'week', 'month', '6h', 'year'];

function Records() {
  const dispatch = useDispatch();

  const { context, updateContext } = useUrlContext(encodeContext, decodeURL);
  const { metric, type, build } = context;

  const reloadList = () => {
    PERIODS.forEach(period => {
      dispatch(recordActions.fetchLeaderboards(metric, period, type, build));
    });
  };

  useEffect(reloadList, [metric, type, build]);

  return (
    <RecordsContext.Provider value={{ context, updateContext }}>
      <div className="records__container container">
        <Helmet>
          <title>{`${getMetricName(metric)} records`}</title>
        </Helmet>
        <div className="records__header row">
          <div className="col">
            <PageTitle title="Records" />
          </div>
        </div>
        <div className="records__filters row">
          <Controls />
        </div>
        <div className="records__list row">
          {PERIODS.map(period => (
            <div key={period} className="col-lg-4 col-md-6">
              <List period={period} />
            </div>
          ))}
        </div>
      </div>
    </RecordsContext.Provider>
  );
}

function encodeContext({ metric, type, build }) {
  const nextURL = new URL(`/records`);

  if (metric && metric !== 'overall' && ALL_METRICS.includes(metric)) {
    nextURL.appendToPath(`/${metric}`);
  }

  if (type && PLAYER_TYPES.includes(type.toLowerCase())) {
    nextURL.appendSearchParam('type', type.toLowerCase());
  }

  if (build && PLAYER_BUILDS.includes(build.toLowerCase())) {
    nextURL.appendSearchParam('build', build.toLowerCase());
  }

  return nextURL.getPath();
}

function decodeURL(params, query) {
  const { metric } = params;
  const { type, build } = query;

  return {
    metric: metric && ALL_METRICS.includes(metric.toLowerCase()) ? metric.toLowerCase() : 'overall',
    type: type && PLAYER_TYPES.includes(type.toLowerCase()) ? type.toLowerCase() : null,
    build: build && PLAYER_BUILDS.includes(build.toLowerCase()) ? build.toLowerCase() : null
  };
}

export default Records;
