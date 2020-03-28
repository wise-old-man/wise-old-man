import React from 'react';
import PropTypes from 'prop-types';
import Countdown from '../../../../components/Countdown';
import './CountdownWidget.scss';

function secondsDiff(competition) {
  const { status, startsAt, endsAt } = competition;
  const curDate = new Date();

  if (status === 'upcoming') {
    return startsAt - curDate;
  }

  if (status === 'ongoing') {
    return endsAt - curDate;
  }

  return 0;
}

function CountdownWidget({ competition }) {
  const secs = secondsDiff(competition);

  return (
    <div className="countdown-widget">
      <Countdown secondsDiff={secs} />
    </div>
  );
}

CountdownWidget.propTypes = {
  competition: PropTypes.shape().isRequired
};

export default CountdownWidget;
