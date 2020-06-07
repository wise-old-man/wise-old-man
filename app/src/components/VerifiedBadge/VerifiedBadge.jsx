import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './VerifiedBadge.scss';

function VerifiedBadge({ version }) {
  return (
    <abbr
      className={classNames('verified-badge', `-${version}`)}
      title="Verified group: This group's leader is verified on our Discord server."
    >
      {version === 'full' && <span>Verified</span>}
      {version === 'icon' && <img src="/img/icons/verified.svg" alt="" />}
    </abbr>
  );
}

VerifiedBadge.defaultProps = {
  version: 'icon'
};

VerifiedBadge.propTypes = {
  version: PropTypes.string // (icon/full)
};

export default VerifiedBadge;
