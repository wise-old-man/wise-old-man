import React, { useCallback, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { debounce } from 'lodash';
import { nameActions, nameSelectors } from 'redux/names';
import { Table, TablePlaceholder, PlayerTag } from 'components';
import { durationBetween } from 'utils';
import { useLazyLoading } from 'hooks';
import { GroupContext } from '../context';

const TABLE_CONFIG = {
  uniqueKey: row => row.id,
  columns: [
    {
      key: 'oldName',
      label: 'Old name',
      className: () => '-primary'
    },
    {
      key: 'arrow',
      label: '',
      isSortable: false,
      className: () => '-break-medium',
      transform: () => '→'
    },
    {
      key: 'newName',
      label: 'New name',
      className: () => '-primary'
    },
    {
      key: 'displayName',
      label: 'Current name',
      get: row => row.player.displayName,
      className: () => '-primary -break-medium',
      transform: (value, row) => (
        <Link to={`/players/${row.player.username}/names`}>
          <PlayerTag name={value} {...row.player} />
        </Link>
      )
    },
    {
      key: 'resolvedAt',
      label: 'Approval date',
      transform: value => `${durationBetween(value, new Date(), 2, true)} ago`
    }
  ]
};

function NameChangesTable() {
  const dispatch = useDispatch();

  const { context } = useContext(GroupContext);
  const { id } = context;

  const { isFullyLoaded, pageIndex, reloadData } = useLazyLoading({
    resultsPerPage: 20,
    action: handleReload,
    selector: nameSelectors.getGroupNameChanges(id)
  });

  const nameChanges = useSelector(nameSelectors.getGroupNameChanges(id));
  const isLoading = useSelector(nameSelectors.isFetchingGroupNameChanges);
  const isReloading = isLoading && pageIndex === 0;

  function handleReload(limit, offset, query) {
    if (!query) return;
    dispatch(nameActions.fetchGroupNameChanges(id, limit, offset));
  }

  const debouncedReload = useCallback(debounce(reloadData, 500, { leading: true }), [id]);

  useEffect(() => debouncedReload({}), [debouncedReload, id]);

  return (
    <>
      {isReloading ? (
        <TablePlaceholder size={20} />
      ) : (
        <Table
          uniqueKeySelector={TABLE_CONFIG.uniqueKey}
          rows={nameChanges}
          columns={TABLE_CONFIG.columns}
          listStyle
          listStyleHeaders
        />
      )}
      {!isFullyLoaded && <b className="loading-indicator">Loading...</b>}
    </>
  );
}

export default NameChangesTable;
