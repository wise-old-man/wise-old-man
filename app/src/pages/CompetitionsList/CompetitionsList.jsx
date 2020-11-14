import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import { Helmet } from 'react-helmet';
import { competitionActions, competitionSelectors } from 'redux/competitions';
import PageTitle from '../../components/PageTitle';
import TextInput from '../../components/TextInput';
import Selector from '../../components/Selector';
import TextButton from '../../components/TextButton';
import Table from '../../components/Table';
import TablePlaceholder from '../../components/TablePlaceholder';
import StatusDot from '../../components/StatusDot';
import { capitalize, getMetricIcon, getMetricName } from '../../utils';
import { COMPETITION_SATUSES, ALL_METRICS } from '../../config';
import './CompetitionsList.scss';

const DEFAULT_METRICS_OPTION = { label: 'Any metric', value: null };
const DEFAULT_STATUS_OPTION = { label: 'Any status', value: null };

const RESULTS_PER_PAGE = 20;

function convertStatus(status) {
  switch (status) {
    case 'upcoming':
      return 'NEUTRAL';
    case 'ongoing':
      return 'POSITIVE';
    case 'finished':
      return 'NEGATIVE';
    default:
      return null;
  }
}

const TABLE_CONFIG = {
  uniqueKey: row => row.id,
  columns: [
    {
      key: 'metric',
      width: 30,
      transform: value => <img src={getMetricIcon(value)} alt="" />
    },
    {
      key: 'title',
      className: () => '-primary',
      transform: (val, row) => <Link to={`/competitions/${row.id}`}>{val}</Link>
    },
    {
      key: 'status',
      className: () => '-break-small',
      transform: (value, row) => {
        return (
          <div className="status-cell">
            <StatusDot status={convertStatus(value)} />
            <span>{row && row.countdown}</span>
          </div>
        );
      }
    },
    {
      key: 'participantCount',
      transform: val => `${val} participants`,
      className: () => '-break-large'
    }
  ]
};

function getStatusOptions() {
  return [DEFAULT_STATUS_OPTION, ...COMPETITION_SATUSES.map(s => ({ label: capitalize(s), value: s }))];
}

function getMetricOptions() {
  return [
    DEFAULT_METRICS_OPTION,
    ...ALL_METRICS.map(metric => ({
      label: getMetricName(metric),
      icon: getMetricIcon(metric, true),
      value: metric
    }))
  ];
}

function CompetitionsList() {
  const dispatch = useDispatch();

  // State variables
  const [titleSearch, setTitleSearch] = useState('');
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);

  // Memoized variables
  const metricOptions = useMemo(getMetricOptions, []);
  const statusOptions = useMemo(getStatusOptions, []);

  // Memoized redux variables
  const competitions = useSelector(competitionSelectors.getCompetitions);
  const isLoading = useSelector(competitionSelectors.isFetchingList);

  const isFullyLoaded = competitions.length < RESULTS_PER_PAGE * (pageIndex + 1);

  const selectedMetricIndex = metricOptions.findIndex(o => o.value === selectedMetric);
  const selectedStatusIndex = statusOptions.findIndex(o => o.value === selectedStatus);

  const handleSubmitSearch = _.debounce(
    () => {
      const metric = selectedMetric || null;
      const status = selectedStatus || null;

      setPageIndex(0); // Reset pagination when the search changes
      dispatch(competitionActions.fetchList(titleSearch, metric, status, RESULTS_PER_PAGE, 0));
    },
    500,
    { leading: true, trailing: false }
  );

  const handleLoadMore = () => {
    if (pageIndex === 0) return;

    const metric = selectedMetric || null;
    const status = selectedStatus || null;
    const limit = RESULTS_PER_PAGE;
    const offset = RESULTS_PER_PAGE * pageIndex;

    dispatch(competitionActions.fetchList(titleSearch, metric, status, limit, offset));
  };

  const handleNextPage = () => {
    setPageIndex(pageIndex + 1);
  };

  const handleSearchInput = e => {
    setTitleSearch(e.target.value);
  };

  const handleMetricSelected = e => {
    setSelectedMetric((e && e.value) || null);
  };

  const handleStatusSelected = e => {
    setSelectedStatus((e && e.value) || null);
  };

  const handleScrolling = () => {
    const margin = 300;

    window.onscroll = _.debounce(() => {
      // If has no more content to load, ignore the scrolling
      if (competitions.length < RESULTS_PER_PAGE * (pageIndex + 1)) {
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
  const onSubmitSearch = useCallback(handleSubmitSearch, [titleSearch, selectedMetric, selectedStatus]);
  const onLoadMore = useCallback(handleLoadMore, [pageIndex]);
  const onSearchInput = useCallback(handleSearchInput, [setTitleSearch]);
  const onMetricSelected = useCallback(handleMetricSelected, [setSelectedMetric]);
  const onStatusSelected = useCallback(handleStatusSelected, [setSelectedStatus]);

  // Submit search each time any of the search variable change
  useEffect(onSubmitSearch, [titleSearch, selectedMetric, selectedStatus]);
  useEffect(onLoadMore, [pageIndex]);
  useEffect(handleScrolling, [competitions, pageIndex]);

  return (
    <div className="competitions__container container">
      <Helmet>
        <title>Competitions</title>
      </Helmet>
      <div className="competitions__header row">
        <div className="col">
          <PageTitle title="Competitions" />
        </div>
        <div className="col">
          <TextButton text="Create new" url="/competitions/create" />
        </div>
      </div>
      <div className="competitions__options row">
        <div className="col-md-4 col-sm-12">
          <TextInput onChange={onSearchInput} placeholder="Search competition" />
        </div>
        <div className="col-md-4 col-sm-6">
          <Selector
            options={metricOptions}
            selectedIndex={selectedMetricIndex}
            onSelect={onMetricSelected}
            search
          />
        </div>
        <div className="col-md-4 col-sm-6">
          <Selector
            options={statusOptions}
            selectedIndex={selectedStatusIndex}
            onSelect={onStatusSelected}
          />
        </div>
      </div>
      <div className="competitions__list row">
        <div className="col">
          {isLoading && (!competitions || competitions.length === 0) ? (
            <TablePlaceholder size={5} />
          ) : (
            <Table
              uniqueKeySelector={TABLE_CONFIG.uniqueKey}
              columns={TABLE_CONFIG.columns}
              rows={competitions}
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

export default CompetitionsList;
