import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getMetricIcon } from '../../../../utils';
import './CompetitionWidget.scss';

function CompetitionWidget({ competitions }) {
  if (!competitions) {
    return (
      <div className="competition-widget">
        <div className="competition-icon -placeholder" />
        <div className="competition-info">
          <span className="competition-info__title -placeholder" />
          <b className="competition-info__time -placeholder" />
        </div>
      </div>
    );
  }

  const ongoing = competitions.filter(c => c.status === 'ongoing');
  const upcoming = competitions.filter(c => c.status === 'upcoming');

  if (ongoing.length > 0) {
    const featured = ongoing.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())[0];

    return (
      <Link className="competition-widget -clickable" to={`/competitions/${featured.id}`}>
        <img className="competition-icon" src={getMetricIcon(featured.metric)} alt="" />
        <div className="competition-info">
          <b className="competition-info__title">{featured.title}</b>
          <span className="competition-info__time">{featured.countdown}</span>
        </div>
      </Link>
    );
  }

  if (upcoming.length > 0) {
    const featured = upcoming.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())[0];

    return (
      <Link className="competition-widget -clickable" to={`/competitions/${featured.id}`}>
        <img className="competition-icon" src={getMetricIcon(featured.metric)} alt="" />
        <div className="competition-info">
          <b className="competition-info__title">{featured.title}</b>
          <span className="competition-info__time">{featured.countdown}</span>
        </div>
      </Link>
    );
  }

  return (
    <div className="competition-widget">
      <b className="no-competitions">No upcoming competitions</b>
    </div>
  );
}

CompetitionWidget.defaultProps = {
  competitions: undefined
};

CompetitionWidget.propTypes = {
  competitions: PropTypes.arrayOf(PropTypes.shape)
};

export default CompetitionWidget;
