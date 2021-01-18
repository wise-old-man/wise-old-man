import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { debounce } from 'lodash';
import { nameActions, nameSelectors } from 'redux/names';
import { Table, TablePlaceholder, TextButton, PageTitle } from 'components';
import { durationBetween } from 'utils';
import URL from 'utils/url';
import { useLazyLoading, useUrlContext } from 'hooks';
import { NamesListContext } from './context';
import { Controls } from './containers';
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
      key: 'arrow',
      className: () => '-break-small',
      transform: () => '→'
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

  // State variables
  const [usernameSearch, setUsernameSearch] = useState('');

  const { context, updateContext } = useUrlContext(encodeContext, decodeURL);
  const { status } = context;

  const { isFullyLoaded, reloadData } = useLazyLoading({
    resultsPerPage: 50,
    selector: nameSelectors.getNameChanges,
    action: handleLoadData
  });

  // Memoized redux variables
  const nameChanges = useSelector(nameSelectors.getNameChanges);
  const isLoading = useSelector(nameSelectors.isFetching);

  function handleLoadData(limit, offset) {
    dispatch(nameActions.fetchNameChanges(usernameSearch, status, limit, offset));
  }

  // Debounce search input keystrokes by 500ms
  const handleSubmitSearch = debounce(reloadData, 500, { leading: true, trailing: false });

  // Submit search each time any of the search variable change
  useEffect(handleSubmitSearch, [usernameSearch, status]);

  return (
    <NamesListContext.Provider value={{ context, updateContext }}>
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
        <div className="names__options row">
          <Controls onSearchInputChanged={e => setUsernameSearch(e.target.value)} />
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
    </NamesListContext.Provider>
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

function encodeContext({ status }) {
  const nextURL = new URL('/names');

  if (status !== undefined) {
    nextURL.appendSearchParam('status', status);
  }

  return nextURL.getPath();
}

function decodeURL(_, query) {
  const statusInt = parseInt(query.status, 10);
  const isValidStatus = query.status && statusInt >= 0 && statusInt <= 2;

  return { status: isValidStatus ? parseInt(query.status, 10) : null };
}

export default NamesList;
