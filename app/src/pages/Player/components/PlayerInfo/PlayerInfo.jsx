import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import InfoPanel from '../../../../components/InfoPanel';
import { capitalize, formatNumber, formatDate } from '../../../../utils';
import './PlayerInfo.scss';

function getEHPLabel(type, build) {
  if (type === 'ironman' || type === 'hardcore' || type === 'ultimate') {
    return 'Ironman EHP';
  }

  switch (build) {
    case 'f2p':
      return 'F2P EHP';
    case 'lvl3':
      return 'Lvl3 EHP';
    default:
      return 'EHP';
  }
}

function getEHBLabel(type, build) {
  if (type === 'ironman' || type === 'hardcore' || type === 'ultimate') {
    return 'Ironman EHB';
  }

  switch (build) {
    case 'f2p':
      return 'F2P EHB';
    default:
      return 'EHB';
  }
}

function formatData(player) {
  const { id, type, build, ehp, ehb, combatLevel, registeredAt, updatedAt, latestSnapshot } = player;

  const overallRank = latestSnapshot ? latestSnapshot.overall.rank : 'Unknown';
  const ehpLabel = getEHPLabel(type, build);
  const ehbLabel = getEHBLabel(type, build);

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
      key: 'Build',
      value: capitalize(build)
    },
    {
      key: ehpLabel,
      value: formatNumber(ehp)
    },
    {
      key: ehbLabel,
      value: formatNumber(ehb)
    },
    {
      key: 'Overall Rank',
      value: formatNumber(overallRank)
    },
    {
      key: 'Combat Level',
      value: combatLevel || '-'
    },
    {
      key: 'Registered at',
      value: formatDate(registeredAt, 'DD MMM YYYY, HH:mm')
    },
    {
      key: 'Last updated at',
      value: formatDate(updatedAt, 'DD MMM YYYY, HH:mm')
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
