import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { competitionActions, competitionSelectors } from 'redux/competitions';
import { debounce } from 'lodash';
import { Helmet } from 'react-helmet';
import { COMPETITION_STATUSES, ALL_METRICS } from 'config';
import { useUrlContext } from 'utils/hooks';
import { Header, Controls, List } from './containers';
import { CompetitionsListContext } from './context';
import './CompetitionsList.scss';

const RESULTS_PER_PAGE = 20;

function CompetitionsList() {
  const dispatch = useDispatch();

  const { context, updateContext } = useUrlContext(encodeContext, decodeURL);
  const { metric, status } = context;

  // State variables
  const [titleSearch, setTitleSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(0);

  const competitions = useSelector(competitionSelectors.getCompetitions);
  const isFullyLoaded = competitions.length < RESULTS_PER_PAGE * (pageIndex + 1);

  const handleSubmitSearch = debounce(
    () => {
      setPageIndex(0); // Reset pagination when the search changes
      dispatch(competitionActions.fetchList(titleSearch, metric, status, RESULTS_PER_PAGE, 0));
    },
    500,
    { leading: true, trailing: false }
  );

  const handleLoadMore = () => {
    if (pageIndex === 0) return;
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

  const handleScrolling = () => {
    const margin = 300;

    window.onscroll = debounce(() => {
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
  const onSubmitSearch = useCallback(handleSubmitSearch, [titleSearch, metric, status]);
  const onLoadMore = useCallback(handleLoadMore, [pageIndex]);

  // Submit search each time any of the search variable change
  useEffect(onSubmitSearch, [titleSearch, metric, status]);
  useEffect(onLoadMore, [pageIndex]);
  useEffect(handleScrolling, [competitions, pageIndex]);

  return (
    <CompetitionsListContext.Provider value={{ context, updateContext }}>
      <div className="competitions__container container">
        <Helmet>
          <title>Competitions</title>
        </Helmet>
        <div className="competitions__header row">
          <Header />
        </div>
        <div className="competitions__options row">
          <Controls onSearchInputChanged={handleSearchInput} />
        </div>
        <div className="competitions__list row">
          <div className="col">
            <List />
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
    </CompetitionsListContext.Provider>
  );
}

function encodeContext(ctx) {
  const { metric, status } = ctx;
  const queries = [];

  if (metric && metric !== 'overall') {
    queries.push(`metric=${metric}`);
  }

  if (status) {
    queries.push(`status=${status}`);
  }

  const queryString = queries.length > 0 ? `?${queries.join('&')}` : '';

  return `/competitions${queryString}`;
}

function decodeURL(_, query) {
  const status = query.status && COMPETITION_STATUSES.includes(query.status) ? query.status : null;
  const metric = query.metric && ALL_METRICS.includes(query.metric) ? query.metric : null;

  return { status, metric };
}

export default CompetitionsList;
