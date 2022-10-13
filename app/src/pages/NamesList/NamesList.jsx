import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NameChangeStatus } from '@wise-old-man/utils';
import { Helmet } from 'react-helmet';
import { debounce } from 'lodash';
import { nameActions, nameSelectors } from 'redux/names';
import { Table, TablePlaceholder, TextButton, PageTitle } from 'components';
import { capitalize, durationBetween } from 'utils';
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
      transform: capitalize,
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

  function handleLoadData(limit, offset, query) {
    if (!query) return;
    dispatch(nameActions.fetchNameChanges(query, limit, offset));
  }

  // Debounce search input keystrokes by 500ms
  const debouncedReload = useCallback(debounce(reloadData, 500, { leading: true, trailing: true }), []);

  // Submit search each time any of the search query variables change
  useEffect(() => {
    debouncedReload({ username: usernameSearch, status });
  }, [usernameSearch, status, debouncedReload]);

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

function statusClassName(status) {
  switch (status) {
    case 'denied':
      return '-negative';
    case 'approved':
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
  return { status: Object.values(NameChangeStatus).includes(query.status) ? query.status : null };
}

export default NamesList;
