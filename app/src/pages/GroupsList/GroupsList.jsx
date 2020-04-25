import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import _ from 'lodash';
import PageTitle from '../../components/PageTitle';
import TextInput from '../../components/TextInput';
import TextButton from '../../components/TextButton';
import TableList from '../../components/TableList';
import TableListPlaceholder from '../../components/TableListPlaceholder';
import fetchGroupsAction from '../../redux/modules/groups/actions/fetchAll';
import { getGroups, isFetchingAll } from '../../redux/selectors/groups';
import './GroupsList.scss';

const TABLE_CONFIG = {
  uniqueKey: row => row.id,
  columns: [
    {
      key: 'name',
      className: () => '-primary'
    },
    {
      key: 'memberCount',
      transform: val => `${val} members`,
      width: 130
    }
  ]
};

function GroupsList() {
  const router = useHistory();
  const dispatch = useDispatch();

  // State variables
  const [nameSearch, setNameSearch] = useState('');
  const [playerSearch, setPlayerSearch] = useState('');

  // Memoized redux variables
  const groups = useSelector(state => getGroups(state));
  const isFetching = useSelector(state => isFetchingAll(state));

  const fetchGroups = query => {
    dispatch(fetchGroupsAction(query));
  };

  const handleSubmitSearch = _.debounce(
    () => {
      fetchGroups({ name: nameSearch, username: playerSearch });
    },
    500,
    { leading: true, trailing: false }
  );

  const handleNameSearchInput = e => {
    setNameSearch(e.target.value);
  };

  const handlePlayerSearchInput = e => {
    setPlayerSearch(e.target.value);
  };

  const handleRowClicked = index => {
    router.push(`/groups/${groups[index].id}`);
  };

  // Memoized callbacks
  const onSubmitSearch = useCallback(handleSubmitSearch, [fetchGroups]);
  const onNameSearchInput = useCallback(handleNameSearchInput, [setNameSearch]);
  const onPlayerSearchInput = useCallback(handlePlayerSearchInput, [setPlayerSearch]);
  const onRowClicked = useCallback(handleRowClicked, [router, groups]);

  // Submit search each time any of the search variable change
  useEffect(onSubmitSearch, [nameSearch, playerSearch]);

  return (
    <div className="groups__container container">
      <div className="groups__header row">
        <div className="col">
          <PageTitle title="Groups" />
        </div>
        <div className="col">
          <TextButton text="Create new" redirectTo="/groups/create" />
        </div>
      </div>
      <div className="groups__options row">
        <div className="col-md-6 col-sm-12">
          <TextInput onChange={onNameSearchInput} placeholder="Search group" />
        </div>
        <div className="col-md-6 col-sm-12">
          <TextInput onChange={onPlayerSearchInput} placeholder="Search by username" />
        </div>
      </div>
      <div className="groups__list row">
        <div className="col">
          {isFetching && (!groups || groups.length === 0) ? (
            <TableListPlaceholder size={5} />
          ) : (
            <TableList
              uniqueKeySelector={TABLE_CONFIG.uniqueKey}
              columns={TABLE_CONFIG.columns}
              rows={groups}
              onRowClicked={onRowClicked}
              clickable
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default GroupsList;
