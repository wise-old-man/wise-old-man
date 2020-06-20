import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import _ from 'lodash';
import PageTitle from '../../components/PageTitle';
import VerifiedBadge from '../../components/VerifiedBadge';
import TextInput from '../../components/TextInput';
import TextButton from '../../components/TextButton';
import Table from '../../components/Table';
import TablePlaceholder from '../../components/TablePlaceholder';
import fetchGroupsAction from '../../redux/modules/groups/actions/fetchAll';
import { getGroups, isFetchingAll } from '../../redux/selectors/groups';
import './GroupsList.scss';

const RESULTS_PER_PAGE = 20;

const TABLE_CONFIG = {
  uniqueKey: row => row.id,
  columns: [
    {
      key: 'name',
      className: () => '-primary',
      transform: (val, row) => {
        if (row.verified) {
          return (
            <Link to={`/groups/${row.id}`}>
              <VerifiedBadge />
              {val}
            </Link>
          );
        }

        return <Link to={`/groups/${row.id}`}>{val}</Link>;
      }
    },
    {
      key: 'memberCount',
      className: () => '-break-small',
      transform: val => `${val} members`,
      width: 130
    }
  ]
};

function GroupsList() {
  const dispatch = useDispatch();

  // State variables
  const [nameSearch, setNameSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(0);

  // Memoized redux variables
  const groups = useSelector(state => getGroups(state));
  const isLoading = useSelector(state => isFetchingAll(state));

  const isFullyLoaded = groups.length < RESULTS_PER_PAGE * (pageIndex + 1);

  const handleSubmitSearch = _.debounce(
    () => {
      setPageIndex(0); // Reset pagination when the search changes
      dispatch(fetchGroupsAction({ name: nameSearch }, RESULTS_PER_PAGE, 0));
    },
    500,
    { leading: true, trailing: false }
  );

  const handleLoadMore = () => {
    if (pageIndex === 0) return;

    const limit = RESULTS_PER_PAGE;
    const offset = RESULTS_PER_PAGE * pageIndex;
    dispatch(fetchGroupsAction({ name: nameSearch }, limit, offset));
  };

  const handleNextPage = () => {
    setPageIndex(pageIndex + 1);
  };

  const handleNameSearchInput = e => {
    setNameSearch(e.target.value);
  };

  const handleScrolling = () => {
    const margin = 300;

    window.onscroll = _.debounce(() => {
      // If has no more content to load, ignore the scrolling
      if (groups.length < RESULTS_PER_PAGE * (pageIndex + 1)) {
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
  const onSubmitSearch = useCallback(handleSubmitSearch, [nameSearch]);
  const onLoadMore = useCallback(handleLoadMore, [pageIndex]);
  const onNameSearchInput = useCallback(handleNameSearchInput, [setNameSearch]);

  // Submit search each time any of the search variable change
  useEffect(onLoadMore, [pageIndex]);
  useEffect(handleScrolling, [groups, pageIndex]);
  useEffect(onSubmitSearch, [nameSearch]);

  return (
    <div className="groups__container container">
      <Helmet>
        <title>Groups</title>
      </Helmet>
      <div className="groups__header row">
        <div className="col">
          <PageTitle title="Groups" />
        </div>
        <div className="col">
          <TextButton text="Create new" url="/groups/create" />
        </div>
      </div>
      <div className="groups__options row">
        <div className="col-12">
          <TextInput onChange={onNameSearchInput} placeholder="Search group" />
        </div>
      </div>
      <div className="groups__list row">
        <div className="col">
          {isLoading && (!groups || groups.length === 0) ? (
            <TablePlaceholder size={5} />
          ) : (
            <Table
              uniqueKeySelector={TABLE_CONFIG.uniqueKey}
              columns={TABLE_CONFIG.columns}
              rows={groups}
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

export default GroupsList;
