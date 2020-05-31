import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import InfoPanel from '../../../../components/InfoPanel';
import { formatDate } from '../../../../utils';
import './GroupInfo.scss';

function formatData(group) {
  const { id, members, clanChat, createdAt, updatedAt } = group;

  return [
    { key: 'Id', value: id },
    { key: 'Clan chat', value: clanChat || 'Unknown' },
    { key: 'Members', value: members ? members.length : 'Unknown' },
    { key: 'Created at', value: formatDate(createdAt, 'DD MMM YYYY, HH:mm') },
    { key: 'Last updated at', value: formatDate(updatedAt, 'DD MMM YYYY, HH:mm') }
  ];
}

function GroupInfo({ group }) {
  const data = useMemo(() => formatData(group), [group]);
  return <InfoPanel data={data} />;
}

GroupInfo.propTypes = {
  group: PropTypes.shape().isRequired
};

export default React.memo(GroupInfo);
