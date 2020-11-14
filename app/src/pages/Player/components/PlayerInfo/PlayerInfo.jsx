import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { InfoPanel } from 'components';
import { capitalize, formatDate } from 'utils';

function formatData(player) {
  const { id, type, build, registeredAt, updatedAt, lastChangedAt } = player;

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
      key: 'Last updated at',
      value: formatDate(updatedAt, 'DD MMM YYYY, HH:mm')
    },
    {
      key: 'Last changed at',
      value: lastChangedAt ? formatDate(lastChangedAt, 'DD MMM YYYY, HH:mm') : 'Unknown'
    },
    {
      key: 'Registered at',
      value: formatDate(registeredAt, 'DD MMM YYYY, HH:mm')
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
