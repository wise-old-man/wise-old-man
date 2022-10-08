import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Period, PERIODS, METRICS, PLAYER_BUILDS, PLAYER_TYPES, MetricProps } from '@wise-old-man/utils';
import { Helmet } from 'react-helmet';
import { useUrlContext } from 'hooks';
import { COUNTRIES } from 'config';
import { PageTitle } from 'components';
import { recordActions } from 'redux/records';
import URL from 'utils/url';
import { Controls, List } from './containers';
import { RecordsContext } from './context';
import './Records.scss';

function Records() {
  const dispatch = useDispatch();

  const { context, updateContext } = useUrlContext(encodeContext, decodeURL);
  const { metric, type, build, country } = context;

  const reloadList = () => {
    PERIODS.forEach(period => {
      dispatch(recordActions.fetchLeaderboards(metric, period, type, build, country));
    });
  };

  useEffect(reloadList, [metric, type, build, country]);

  return (
    <RecordsContext.Provider value={{ context, updateContext }}>
      <div className="records__container container">
        <Helmet>
          <title>{`${MetricProps[metric].name} records`}</title>
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
          <div className="col-lg-4 col-md-6">
            <List period={Period.DAY} />
          </div>
          <div className="col-lg-4 col-md-6">
            <List period={Period.WEEK} />
          </div>
          <div className="col-lg-4 col-md-6">
            <List period={Period.MONTH} />
          </div>
          <div className="col-lg-4 col-md-6">
            <List period={Period.FIVE_MIN} />
          </div>
          <div className="col-lg-4 col-md-6">
            <List period={Period.YEAR} />
          </div>
        </div>
      </div>
    </RecordsContext.Provider>
  );
}

function encodeContext({ metric, type, build, country }) {
  const nextURL = new URL(`/records`);

  if (metric && metric !== 'overall' && METRICS.includes(metric)) {
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

  const isValidMetric = metric && METRICS.includes(metric.toLowerCase());
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

export default Records;
