import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { InfoPanel } from 'components';
import { MetricProps } from '@wise-old-man/utils';
import { formatDate, formatDateUTC, capitalize, durationBetween } from 'utils';

function CompetitionInfo({ competition }) {
  const data = useMemo(() => formatData(competition), [competition]);
  return <InfoPanel data={data} />;
}

function formatData(competition) {
  const { id, metric, status, participations, startsAt, endsAt, group } = competition;

  const statusClass = classNames({
    '-positive': status === 'ongoing',
    '-neutral': status === 'upcoming',
    '-negative': status === 'finished'
  });

  return [
    {
      key: 'Id',
      value: id
    },
    {
      key: capitalize(MetricProps[metric].type),
      value: MetricProps[metric].name
    },
    {
      key: 'Status',
      value: capitalize(status),
      className: statusClass
    },
    {
      key: 'Group',
      value: group ? <Link to={`/groups/${group.id}`}>{group.name}</Link> : '---'
    },
    {
      key: 'Participants',
      value: participations ? participations.length : 'Unknown'
    },
    {
      key: 'Duration',
      value: durationBetween(startsAt, endsAt, 3)
    },
    {
      key: status === 'upcoming' ? 'Starts at (local time)' : 'Started at (local time)',
      value: formatDate(startsAt, 'DD MMM YYYY, HH:mm')
    },
    {
      key: status === 'finished' ? 'Ended at (local time)' : 'Ends at (local time)',
      value: formatDate(endsAt, 'DD MMM YYYY, HH:mm')
    },
    {
      key: status === 'upcoming' ? 'Starts at (UTC)' : 'Started at (UTC)',
      value: formatDateUTC(startsAt, 'DD MMM YYYY, HH:mm')
    },
    {
      key: status === 'finished' ? 'Ended at (UTC)' : 'Ends at (UTC)',
      value: formatDateUTC(endsAt, 'DD MMM YYYY, HH:mm')
    }
  ];
}

CompetitionInfo.propTypes = {
  competition: PropTypes.shape().isRequired
};

export default React.memo(CompetitionInfo);
