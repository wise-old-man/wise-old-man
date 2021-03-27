import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { groupActions, groupSelectors } from 'redux/groups';
import { debounce } from 'lodash';
import { Helmet } from 'react-helmet';
import { useLazyLoading } from 'hooks';
import { PageTitle, TextButton, TextInput } from 'components';
import { List } from './containers';
import './GroupsList.scss';

function GroupsList() {
  const dispatch = useDispatch();

  // State variables
  const [nameSearch, setNameSearch] = useState('');

  const { isFullyLoaded, reloadData } = useLazyLoading({
    resultsPerPage: 20,
    selector: groupSelectors.getGroups,
    action: handleLoadData
  });

  function handleLoadData(limit, offset, query) {
    if (!query) return;
    dispatch(groupActions.fetchList(query, limit, offset));
  }

  // Debounce search input keystrokes by 500ms
  const debouncedReload = useCallback(debounce(reloadData, 500, { leading: true, trailing: true }), []);

  // Submit search each time any of the search query variables change
  useEffect(() => debouncedReload({ name: nameSearch }), [nameSearch]);

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
          <TextInput onChange={e => setNameSearch(e.target.value)} placeholder="Search group" />
        </div>
      </div>
      <div className="groups__list row">
        <List />
      </div>
      <div className="row">
        <div className="col">{!isFullyLoaded && <b className="loading-indicator">Loading...</b>}</div>
      </div>
    </div>
  );
}

export default GroupsList;
