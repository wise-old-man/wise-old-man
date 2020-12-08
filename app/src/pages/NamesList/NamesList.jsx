import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { nameActions, nameSelectors } from 'redux/names';
import { Table, TablePlaceholder, TextButton, PageTitle } from 'components';
import { durationBetween } from 'utils';
import { useLazyLoading } from 'hooks';
import './NamesList.scss';

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

function NamesList() {
  const dispatch = useDispatch();

  const { isFullyLoaded } = useLazyLoading({
    resultsPerPage: 20,
    selector: nameSelectors.getNameChanges,
    action: handleLoadData
  });

  // Memoized redux variables
  const nameChanges = useSelector(nameSelectors.getNameChanges);
  const isLoading = useSelector(nameSelectors.isFetching);

  function handleLoadData(limit, offset) {
    dispatch(nameActions.fetchNameChanges(limit, offset));
  }

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
        <div className="col">{!isFullyLoaded && <b className="loading-indicator">Loading...</b>}</div>
      </div>
    </div>
  );
}

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

export default NamesList;
