import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import InfoPanel from '../../../../components/InfoPanel';
import { formatDate, capitalize } from '../../../../utils';
import './CompetitionInfo.scss';

function formatData(competition) {
  const { id, metric, status, participants, duration, startsAt, endsAt } = competition;

  const statusClass = classNames({
    '-positive': status === 'ongoing',
    '-neutral': status === 'upcoming',
    '-negative': status === 'finished'
  });

  return [
    { key: 'Id', value: id },
    { key: 'Skill', value: capitalize(metric) },
    { key: 'Status', value: capitalize(status), className: statusClass },
    { key: 'Participants', value: participants ? participants.length : 'Unknown' },
    { key: 'Duration', value: capitalize(duration) },
    { key: status === 'upcoming' ? 'Starts at' : 'Started at', value: formatDate(startsAt) },
    { key: status === 'finished' ? 'Ended at' : 'Ends at', value: formatDate(endsAt) }
  ];
}

function CompetitionInfo({ competition }) {
  const data = useMemo(() => formatData(competition), [competition]);
  return <InfoPanel data={data} />;
}

CompetitionInfo.propTypes = {
  competition: PropTypes.shape().isRequired
};

export default React.memo(CompetitionInfo);
