import React, { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
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
      className: () => '-primary'
    },
    {
      key: 'arrow',
      className: () => '-break-small',
      transform: () => '→'
    },
    {
      key: 'displayName',
      get: row => row.player.displayName,
      className: () => '-primary',
      transform: (value, row) => (
        <Link to={`/players/${row.player.username}/names`}>
          <PlayerTag name={value} type={row.player.type} flagged={row.player.flagged} />
        </Link>
      )
    },
    {
      key: 'resolvedAt',
      className: () => '-break-medium',
      transform: value => `Approved ${durationBetween(value, new Date(), 2, true)} ago`
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
    selector: state => nameSelectors.getGroupNameChanges(state, id)
  });

  const nameChanges = useSelector(state => nameSelectors.getGroupNameChanges(state, id));
  const isLoading = useSelector(nameSelectors.isFetching);
  const isReloading = isLoading && pageIndex === 0;

  function handleReload(limit, offset) {
    dispatch(nameActions.fetchGroupNameChanges(id, limit, offset));
  }

  // When the selected metric changes, reload the name changes
  useEffect(reloadData, [id]);

  return (
    <>
      <span className="widget-label">Most recent name changes</span>
      {isReloading ? (
        <TablePlaceholder size={20} />
      ) : (
        <Table
          uniqueKeySelector={TABLE_CONFIG.uniqueKey}
          rows={nameChanges}
          columns={TABLE_CONFIG.columns}
          listStyle
        />
      )}
      {!isFullyLoaded && <b className="loading-indicator">Loading...</b>}
    </>
  );
}

export default NameChangesTable;
