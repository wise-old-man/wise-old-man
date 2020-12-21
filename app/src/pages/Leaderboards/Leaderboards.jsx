import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet';
import { useUrlContext, useLazyLoading } from 'hooks';
import { Loading, PageTitle } from 'components';
import { leaderboardsActions, leaderboardsSelectors } from 'redux/leaderboards';
import { PLAYER_BUILDS, PLAYER_TYPES } from 'config/player';
import URL from 'utils/url';
import { List, Controls } from './containers';
import { LeaderboardContext } from './context';
import './Leaderboards.scss';

const VALID_METRICS = ['ehp', 'ehb', 'ehp+ehb'];

function Leaderboards() {
  const dispatch = useDispatch();

  const { context, updateContext } = useUrlContext(encodeContext, decodeURL);
  const { metric, type, build } = context;

  const { data, isFullyLoaded, reloadData } = useLazyLoading({
    resultsPerPage: 20,
    selector: leaderboardsSelectors.getLeaderboards,
    action: handleLoadData
  });

  function handleLoadData(limit, offset) {
    const query = { metric, playerType: type, playerBuild: build };
    dispatch(leaderboardsActions.fetchLeaderboards(query, limit, offset));
  }

  // Reload the data each time any of the search variable change
  useEffect(reloadData, [metric, type, build]);

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

function encodeContext({ metric, type, build }) {
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

  return nextURL.getPath();
}

function decodeURL(params, query) {
  const { metric } = params;
  const { type, build } = query;

  return {
    metric: metric && VALID_METRICS.includes(metric.toLowerCase()) ? metric.toLowerCase() : 'ehp',
    type: type && PLAYER_TYPES.includes(type.toLowerCase()) ? type.toLowerCase() : 'regular',
    build: build && PLAYER_BUILDS.includes(build.toLowerCase()) ? build.toLowerCase() : null
  };
}

export default Leaderboards;
