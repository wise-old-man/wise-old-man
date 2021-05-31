import React from 'react';
import PropTypes from 'prop-types';
import { getRoleTypeIcon, capitalize } from 'utils';
import './RoleTag.scss';

function RoleTag({ role }) {
  const icon = getRoleTypeIcon(role);

  return (
    <div className="role-tag">
      <div className="left">
        <abbr className="role-tag__img">
          <img src={icon} alt="" />
        </abbr>
        <span className="role-tag__name">{capitalize(role)}</span>
      </div>
    </div>
  );
}

RoleTag.propTypes = {
  role: PropTypes.string.isRequired
};

export default React.memo(RoleTag);
