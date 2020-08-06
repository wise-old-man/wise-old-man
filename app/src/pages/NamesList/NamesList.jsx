import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { debounce } from 'lodash';
import { Helmet } from 'react-helmet';
import PageTitle from '../../components/PageTitle';
import TextButton from '../../components/TextButton';
import Table from '../../components/Table';
import TablePlaceholder from '../../components/TablePlaceholder';
import fetchNameChangesAction from '../../redux/modules/names/actions/fetchAll';
import { getNameChanges, isFetchingAll } from '../../redux/selectors/names';
import { durationBetween } from '../../utils';
import './NamesList.scss';

const RESULTS_PER_PAGE = 20;

const TABLE_CONFIG = {
  uniqueKey: row => row.id,
  columns: [
    {
      key: 'id'
    },
    {
      key: 'oldName',
      className: () => '-primary'
    },
    {
      key: 'newName',
      className: () => '-break-small',
      transform: () => '-->'
    },
    {
      key: 'newName',
      className: () => '-primary'
    },
    {
      key: 'createdAt',
      className: () => '-break-medium',
      transform: value => `Submitted ${durationBetween(value, new Date(), 2, true)} ago`
    },
    {
      key: 'status',
      transform: statusTransform,
      className: statusClassName
    }
  ]
};

function statusTransform(status) {
  switch (status) {
    case 1:
      return 'Denied';
    case 2:
      return 'Approved';
    default:
      return 'Pending';
  }
}

function statusClassName(status) {
  switch (status) {
    case 1:
      return '-negative';
    case 2:
      return '-positive';
    default:
      return '';
  }
}

function NamesList() {
  const dispatch = useDispatch();

  // State variables
  const [pageIndex, setPageIndex] = useState(0);

  // Memoized redux variables
  const nameChanges = useSelector(getNameChanges);
  const isLoading = useSelector(isFetchingAll);

  const isFullyLoaded = nameChanges.length < RESULTS_PER_PAGE * (pageIndex + 1);

  const handleLoadMore = () => {
    const limit = RESULTS_PER_PAGE;
    const offset = RESULTS_PER_PAGE * pageIndex;
    dispatch(fetchNameChangesAction(limit, offset));
  };

  const handleNextPage = () => {
    setPageIndex(pageIndex + 1);
  };

  const handleScrolling = () => {
    const margin = 300;

    window.onscroll = debounce(() => {
      // If has no more content to load, ignore the scrolling
      if (nameChanges.length < RESULTS_PER_PAGE * (pageIndex + 1)) {
        return;
      }

      const { innerHeight } = window;
      const { scrollTop, offsetHeight } = document.documentElement;

      // If has reached the bottom of the page, load more data
      if (innerHeight + scrollTop + margin > offsetHeight) {
        // This timeout is simply to wait for the scrolling
        // inertia to stop, to then load the contents, otherwise
        // it will resume the inertia and scroll to the bottom of the page again
        setTimeout(() => handleNextPage(), 1000);
      }
    }, 100);
  };

  // Submit search each time any of the search variable change
  useEffect(handleLoadMore, [pageIndex]);
  useEffect(handleScrolling, [nameChanges, pageIndex]);

  return (
    <div className="names__container container">
      <Helmet>
        <title>Name changes</title>
      </Helmet>
      <div className="names__header row">
        <div className="col">
          <PageTitle title="Name changes" />
        </div>
        <div className="col">
          <TextButton text="Submit new" url="/names/submit" />
        </div>
      </div>
      <div className="names__list row">
        <div className="col">
          {isLoading && (!nameChanges || nameChanges.length === 0) ? (
            <TablePlaceholder size={5} />
          ) : (
            <Table
              uniqueKeySelector={TABLE_CONFIG.uniqueKey}
              columns={TABLE_CONFIG.columns}
              rows={nameChanges}
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

export default NamesList;
