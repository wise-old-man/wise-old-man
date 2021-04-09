import React, { useContext, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { formatDate } from 'utils/dates';
import { Table, TablePlaceholder } from 'components';
import { nameSelectors, nameActions } from 'redux/names';
import { PlayerContext } from '../context';

const TABLE_CONFIG = {
  uniqueKey: row => row.id,
  columns: [
    {
      key: 'newName',
      className: () => '-primary'
    },
    {
      key: 'createdAt',
      className: () => '-break-large',
      transform: value => {
        if (!value) return 'Initial Name';
        return `Submitted at ${formatDate(value, 'DD MMM YYYY')}`;
      }
    },
    {
      key: 'resolvedAt',
      transform: value => {
        if (!value) return '---';
        return `Approved at ${formatDate(value, 'DD MMM YYYY')}`;
      }
    }
  ]
};

function Names() {
  const dispatch = useDispatch();
  const { context } = useContext(PlayerContext);

  const { username } = context;

  const isLoading = useSelector(nameSelectors.isFetchingPlayerNameChanges);
  const nameChanges = useSelector(nameSelectors.getPlayerNames(username));
  const adjustedNames = getAdjustedNames(nameChanges);

  const fetchNames = useCallback(() => {
    // Fetch player name changes, if not loaded yet
    if (!nameChanges) {
      dispatch(nameActions.fetchPlayerNameChanges(username));
    }
  }, [dispatch, username, nameChanges]);

  useEffect(fetchNames, [fetchNames]);

  return (
    <div className="col">
      {isLoading ? (
        <TablePlaceholder size={3} />
      ) : (
        <Table
          uniqueKeySelector={TABLE_CONFIG.uniqueKey}
          rows={adjustedNames}
          columns={TABLE_CONFIG.columns}
          listStyle
        />
      )}
    </div>
  );
}

/**
 * Adds the player's first known name as the last row in the table
 */
function getAdjustedNames(nameChanges) {
  if (!nameChanges || nameChanges.length === 0) return [];
  return [...nameChanges, { newName: nameChanges[nameChanges.length - 1].oldName }];
}

export default Names;
