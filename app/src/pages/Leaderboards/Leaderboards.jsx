import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useParams, useHistory } from 'react-router-dom';
import _ from 'lodash';
import { Helmet } from 'react-helmet';
import PageTitle from '../../components/PageTitle';
import Selector from '../../components/Selector';
import Table from '../../components/Table';
import PlayerTag from '../../components/PlayerTag';
import TablePlaceholder from '../../components/TablePlaceholder';
import fetchLeaderboardsAction from '../../redux/modules/leaderboards/actions/fetchLeaderboards';
import { getLeaderboards, isFetchingAll } from '../../redux/selectors/leaderboards';
import {
  capitalize,
  getPlayerIcon,
  getPlayerBuild,
  durationBetween,
  formatNumber,
  getMetricIcon,
  getMetricName
} from '../../utils';
import { PLAYER_TYPES, PLAYER_BUILDS, VIRTUALS } from '../../config';
import './Leaderboards.scss';

const RESULTS_PER_PAGE = 20;

function getNextUrl(nextMetric, nextType, nextBuild) {
  const baseUrl = `/leaderboards/${nextMetric}?`;
  const queries = [];

  if (nextType !== null) {
    queries.push(`type=${nextType}`);
  }

  if (nextBuild !== null) {
    queries.push(`build=${nextBuild}`);
  }

  return `${baseUrl}${queries.join('&')}`;
}

const getTableConfig = metric => {
  return {
    uniqueKey: row => row.id,
    columns: [
      {
        key: 'rank',
        label: 'Rank',
        className: () => '-break-small'
      },
      {
        key: 'displayName',
        label: 'Name',
        className: () => '-primary',
        transform: (value, row) => (
          <Link to={`/players/${row.username}`}>
            <PlayerTag name={row.displayName} type={row.type} flagged={row.flagged} />
          </Link>
        )
      },
      {
        key: metric,
        transform: val => `${formatNumber(val)} hours`
      },
      {
        key: 'updatedAt',
        label: 'Last updated',
        className: () => '-break-small',
        transform: (value, row) => `Updated ${durationBetween(row.updatedAt, new Date(), 2, true)} ago`
      }
    ]
  };
};

function useQuery(keys) {
  const urlQuery = new URLSearchParams(useLocation().search);
  const result = {};

  keys.forEach(k => {
    result[k] = urlQuery.get(k);
  });

  return result;
}

function getPlayerTypeOptions() {
  return PLAYER_TYPES.map(type => ({
    label: capitalize(type),
    icon: getPlayerIcon(type),
    value: type
  }));
}

function getPlayerBuildOptions() {
  const options = PLAYER_BUILDS.map(type => ({
    label: getPlayerBuild(type),
    value: type
  }));

  return [{ label: 'All player builds', value: null }, ...options];
}

function getMetricOptions() {
  return [...VIRTUALS, 'ehp+ehb'].map(metric => ({
    label: getMetricName(metric),
    icon: getMetricIcon(metric, true),
    value: metric
  }));
}

function Leaderboards() {
  const router = useHistory();
  const dispatch = useDispatch();
  const { metric } = useParams();
  const { type, build } = useQuery(['type', 'build']);

  const [pageIndex, setPageIndex] = useState(0);

  const selectedMetric = metric || 'ehp';
  const selectedPlayerType = type || 'regular';
  const selectedPlayerBuild = build || null;

  const tableConfig = useMemo(() => getTableConfig(selectedMetric), [selectedMetric]);
  const metricOptions = useMemo(() => getMetricOptions(), []);
  const playerTypeOptions = useMemo(() => getPlayerTypeOptions(), []);
  const playerBuildOptions = useMemo(() => getPlayerBuildOptions(), []);

  const metricIndex = metricOptions.findIndex(o => o.value === selectedMetric);
  const playerTypeIndex = playerTypeOptions.findIndex(o => o.value === selectedPlayerType);
  const playerBuildIndex = playerBuildOptions.findIndex(o => o.value === selectedPlayerBuild);

  // Memoized redux variables
  const leaderboards = useSelector(state => getLeaderboards(state));
  const isLoading = useSelector(state => isFetchingAll(state));

  const isFullyLoaded = leaderboards.length < RESULTS_PER_PAGE * (pageIndex + 1);

  const handleFetchData = (resetList = true) => {
    const query = {
      metric: selectedMetric,
      playerType: selectedPlayerType || null,
      playerBuild: selectedPlayerBuild || null
    };

    const limit = RESULTS_PER_PAGE;
    const offset = resetList ? 0 : RESULTS_PER_PAGE * pageIndex;

    if (resetList) {
      setPageIndex(0); // Reset pagination when the search changes
    }

    dispatch(fetchLeaderboardsAction(query, limit, offset));
  };

  const handleLoadMore = () => {
    if (pageIndex === 0) return;
    handleFetchData(false);
  };

  const handleNextPage = () => {
    setPageIndex(pageIndex + 1);
  };

  const handleMetricSelected = e => {
    if (!e || !e.value) return;
    router.push(getNextUrl(e.value, selectedPlayerType, selectedPlayerBuild));
  };

  const handleTypeSelected = e => {
    router.push(getNextUrl(selectedMetric, e.value, selectedPlayerBuild));
  };

  const handleBuildSelected = e => {
    router.push(getNextUrl(selectedMetric, selectedPlayerType, e.value));
  };

  const handleScrolling = () => {
    const margin = 300;

    window.onscroll = _.debounce(() => {
      // If has no more content to load, ignore the scrolling
      if (leaderboards.length < RESULTS_PER_PAGE * (pageIndex + 1)) {
        return;
      }

      const { innerHeight } = window;
      const { scrollTop, offsetHeight } = document.documentElement;

      // If has reached the bottom of the page, load more data
      if (innerHeight + scrollTop + margin > offsetHeight) {
        // This timeout is simply to wait for the scrolling
        // inertia to stop, to then load the contents, otherwise
        // it will resume the inertia and scroll to the bottom of the page again
        setTimeout(() => handleNextPage(), 800);
      }
    }, 100);
  };

  // Memoized callbacks
  const onLoadMore = useCallback(handleLoadMore, [pageIndex]);

  // Submit search each time any of the search variable change

  useEffect(handleFetchData, [selectedMetric, selectedPlayerType, selectedPlayerBuild]);
  useEffect(handleFetchData, []);
  useEffect(onLoadMore, [pageIndex]);
  useEffect(handleScrolling, [leaderboards, pageIndex]);

  return (
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
        <div className="col-lg-4 col-md-3">
          <Selector
            options={metricOptions}
            selectedIndex={metricIndex}
            onSelect={handleMetricSelected}
            search
          />
        </div>
        <div className="col-lg-4 col-md-5">
          <Selector
            options={playerTypeOptions}
            selectedIndex={playerTypeIndex}
            onSelect={handleTypeSelected}
          />
        </div>
        <div className="col-lg-4 col-md-5">
          <Selector
            options={playerBuildOptions}
            selectedIndex={playerBuildIndex}
            onSelect={handleBuildSelected}
          />
        </div>
      </div>
      <div className="leaderboards__list row">
        <div className="col">
          {isLoading && (!leaderboards || leaderboards.length === 0) ? (
            <TablePlaceholder size={20} />
          ) : (
            <Table
              uniqueKeySelector={tableConfig.uniqueKey}
              columns={tableConfig.columns}
              rows={leaderboards}
              listStyle
            />
          )}
        </div>
      </div>
      <div className="row">
        <div className="col">
          {!isFullyLoaded && (
            <b id="loading" className="loading-indicator">
              Loading...
            </b>
          )}
        </div>
      </div>
    </div>
  );
}

export default Leaderboards;
