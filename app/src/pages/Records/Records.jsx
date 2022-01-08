import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet';
import { useUrlContext } from 'hooks';
import { getMetricName } from 'utils';
import { ALL_METRICS, PLAYER_BUILDS, COUNTRIES } from 'config';
import { PageTitle } from 'components';
import { recordActions } from 'redux/records';
import URL from 'utils/url';
import { Controls, List } from './containers';
import { RecordsContext } from './context';
import './Records.scss';

const PERIODS = ['day', 'week', 'month', '5min', 'year'];

function Records() {
  const dispatch = useDispatch();

  const { context, updateContext } = useUrlContext(encodeContext, decodeURL);
  const { metric, build, country } = context;

  const reloadList = () => {
    PERIODS.forEach(period => {
      dispatch(recordActions.fetchLeaderboards(metric, period, build, country));
    });
  };

  useEffect(reloadList, [metric, build, country]);

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

function encodeContext({ metric, build, country }) {
  const nextURL = new URL(`/records`);

  if (metric && metric !== 'overall' && ALL_METRICS.includes(metric)) {
    nextURL.appendToPath(`/${metric}`);
  }

  if (build && PLAYER_BUILDS.includes(build.toLowerCase())) {
    nextURL.appendSearchParam('build', build.toLowerCase());
  }

  if (country && COUNTRIES.map(c => c.code).includes(country)) {
    nextURL.appendSearchParam('country', country);
  }

  return nextURL.getPath();
}

function decodeURL(params, query) {
  const { metric } = params;
  const { build, country } = query;

  const isValidMetric = metric && ALL_METRICS.includes(metric.toLowerCase());
  const isValidBuild = build && PLAYER_BUILDS.includes(build.toLowerCase());
  const isValidCountry = country && COUNTRIES.map(c => c.code).includes(country.toUpperCase());

  return {
    metric: isValidMetric ? metric.toLowerCase() : 'overall',
    build: isValidBuild ? build.toLowerCase() : null,
    country: isValidCountry ? country.toUpperCase() : null
  };
}

export default Records;
