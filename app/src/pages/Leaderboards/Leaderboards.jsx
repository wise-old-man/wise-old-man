import React, { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet';
import { useUrlContext, useLazyLoading } from 'hooks';
import { Loading, PageTitle } from 'components';
import { leaderboardsActions, leaderboardsSelectors } from 'redux/leaderboards';
import { PLAYER_BUILDS, PLAYER_TYPES, COUNTRIES } from 'config';
import URL from 'utils/url';
import { List, Controls } from './containers';
import { LeaderboardContext } from './context';
import './Leaderboards.scss';

const VALID_METRICS = ['ehp', 'ehb', 'ehp+ehb'];

function Leaderboards() {
  const dispatch = useDispatch();

  const { context, updateContext } = useUrlContext(encodeContext, decodeURL);
  const { metric, type, build, country } = context;

  const { data, isFullyLoaded, reloadData } = useLazyLoading({
    resultsPerPage: 20,
    selector: leaderboardsSelectors.getLeaderboards,
    action: handleLoadData
  });

  function handleLoadData(limit, offset, query) {
    if (!query) return;

    const searchQuery = {
      metric: query.metric,
      country: query.country,
      playerType: query.type,
      playerBuild: query.build
    };

    dispatch(leaderboardsActions.fetchLeaderboards(searchQuery, limit, offset));
  }

  const handleReloadData = useCallback(reloadData, []);

  // Reload the data each time any of the search query variables change
  useEffect(() => {
    handleReloadData({ metric, type, build, country });
  }, [metric, type, build, country, handleReloadData]);

  if (!data) {
    return <Loading />;
  }

  return (
    <LeaderboardContext.Provider value={{ context, updateContext }}>
      <div className="leaderboards__container container">
        <Helmet>
          <title>Leaderboards</title>
        </Helmet>
        <div className="leaderboards__header row">
          <div className="col">
            <PageTitle title="Leaderboards" />
          </div>
        </div>
        <div className="leaderboards__options row">
          <Controls />
        </div>
        <div className="leaderboards__list row">
          <div className="col">
            <List />
          </div>
        </div>
        <div className="row">
          <div className="col">{!isFullyLoaded && <b className="loading-indicator">Loading...</b>}</div>
        </div>
      </div>
    </LeaderboardContext.Provider>
  );
}

function encodeContext({ metric, type, build, country }) {
  const nextURL = new URL(`/leaderboards`);

  if (metric && metric !== 'ehp' && VALID_METRICS.includes(metric)) {
    nextURL.appendToPath(`/${metric}`);
  }

  if (type && type !== 'regular' && PLAYER_TYPES.includes(type.toLowerCase())) {
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

  const isValidMetric = metric && VALID_METRICS.includes(metric.toLowerCase());
  const isValidType = type && PLAYER_TYPES.includes(type.toLowerCase());
  const isValidBuild = build && PLAYER_BUILDS.includes(build.toLowerCase());
  const isValidCountry = country && COUNTRIES.map(c => c.code).includes(country.toUpperCase());

  return {
    metric: isValidMetric ? metric.toLowerCase() : 'ehp',
    type: isValidType ? type.toLowerCase() : 'regular',
    build: isValidBuild ? build.toLowerCase() : null,
    country: isValidCountry ? country.toUpperCase() : null
  };
}

export default Leaderboards;
