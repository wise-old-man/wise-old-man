import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './StatusDot.scss';

const STATUSES = ['NEUTRAL', 'POSITIVE', 'NEGATIVE'];

function StatusDot({ status }) {
  const className = classNames({
    'status-dot': true,
    '-neutral': status === STATUSES[0],
    '-positive': status === STATUSES[1],
    '-negative': status === STATUSES[2]
  });
  return <div className={className} />;
}

StatusDot.propTypes = {
  // The status string, must be one of [NEUTRAL, POSITIVE, NEGATIVE]
  status: PropTypes.string.isRequired
};

export default React.memo(StatusDot);
