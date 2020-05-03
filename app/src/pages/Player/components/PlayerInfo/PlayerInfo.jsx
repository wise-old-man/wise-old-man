import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import InfoPanel from '../../../../components/InfoPanel';
import { capitalize, formatNumber, formatDate } from '../../../../utils';
import './PlayerInfo.scss';

function formatData(player) {
  const { id, type, registeredAt, updatedAt, lastImportedAt, latestSnapshot } = player;

  const overallRank = latestSnapshot ? latestSnapshot.overall.rank : 'Unknown';

  return [
    {
      key: 'Id',
      value: id
    },
    {
      key: 'Type',
      value: capitalize(type)
    },
    {
      key: 'Overall Rank',
      value: formatNumber(overallRank)
    },
    {
      key: 'Registered at',
      value: formatDate(registeredAt, 'DD MMM YYYY, HH:mm')
    },
    {
      key: 'Last updated at',
      value: formatDate(updatedAt, 'DD MMM YYYY, HH:mm')
    },
    {
      key: 'Last imported at',
      value: lastImportedAt ? formatDate(lastImportedAt, 'DD MMM YYYY, HH:mm') : '---'
    }
  ];
}

function PlayerInfo({ player }) {
  const data = useMemo(() => formatData(player), [player]);
  return <InfoPanel data={data} />;
}

PlayerInfo.propTypes = {
  player: PropTypes.shape().isRequired
};

export default React.memo(PlayerInfo);
