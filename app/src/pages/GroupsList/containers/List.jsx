import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { groupSelectors } from 'redux/groups';
import { Table, TablePlaceholder, VerifiedBadge } from 'components';

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
      transform: val => `${val} members`,
      width: 130
    }
  ]
};

function List() {
  const groups = useSelector(groupSelectors.getGroups);
  const isLoading = useSelector(groupSelectors.isFetchingList);

  return (
    <div className="col">
      {isLoading && (!groups || groups.length === 0) ? (
        <TablePlaceholder size={20} />
      ) : (
        <Table
          uniqueKeySelector={TABLE_CONFIG.uniqueKey}
          columns={TABLE_CONFIG.columns}
          rows={groups}
          listStyle
        />
      )}
    </div>
  );
}

export default List;
