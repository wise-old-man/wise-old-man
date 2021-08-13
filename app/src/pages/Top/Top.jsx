import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet';
import { useUrlContext } from 'hooks';
import { getMetricName } from 'utils';
import { ALL_METRICS, PLAYER_BUILDS, PLAYER_TYPES, COUNTRIES } from 'config';
import { PageTitle } from 'components';
import { deltasActions } from 'redux/deltas';
import URL from 'utils/url';
import { Controls, List } from './containers';
import { TopContext } from './context';
import './Top.scss';

const PERIODS = ['day', 'week', 'month', '5min', 'year'];

function Top() {
  const dispatch = useDispatch();

  const { context, updateContext } = useUrlContext(encodeContext, decodeURL);
  const { metric, type, build, country } = context;

  const reloadList = () => {
    PERIODS.forEach(period => {
      dispatch(deltasActions.fetchLeaderboards(metric, period, type, build, country));
    });
  };

  useEffect(reloadList, [metric, type, build, country]);

  return (
    <TopContext.Provider value={{ context, updateContext }}>
      <div className="top__container container">
        <Helmet>
          <title>{`${getMetricName(metric)} current top`}</title>
        </Helmet>
        <div className="top__header row">
          <div className="col">
            <PageTitle title="Current Top" />
          </div>
        </div>
        <div className="top__filters row">
          <Controls />
        </div>
        <div className="top__list row">
          {PERIODS.map(period => (
            <div key={period} className="col-lg-4 col-md-6">
              <List period={period} />
            </div>
          ))}
        </div>
      </div>
    </TopContext.Provider>
  );
}

function encodeContext({ metric, type, build, country }) {
  const nextURL = new URL(`/top`);

  if (metric && metric !== 'overall' && ALL_METRICS.includes(metric)) {
    nextURL.appendToPath(`/${metric}`);
  }

  if (type && PLAYER_TYPES.includes(type.toLowerCase())) {
    nextURL.appendSearchParam('type', type.toLowerCase());
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
  const { type, build, country } = query;

  const isValidMetric = metric && ALL_METRICS.includes(metric.toLowerCase());
  const isValidType = type && PLAYER_TYPES.includes(type.toLowerCase());
  const isValidBuild = build && PLAYER_BUILDS.includes(build.toLowerCase());
  const isValidCountry = country && COUNTRIES.map(c => c.code).includes(country.toUpperCase());

  return {
    metric: isValidMetric ? metric.toLowerCase() : 'overall',
    type: isValidType ? type.toLowerCase() : null,
    build: isValidBuild ? build.toLowerCase() : null,
    country: isValidCountry ? country.toUpperCase() : null
  };
}

export default Top;
