import React from 'react';
import PropTypes from 'prop-types';
import './PageHeader.scss';

function PageHeader({ title, icon, iconTooltip, children }) {
  return (
    <div className="page-header">
      {icon && <abbr title={iconTooltip}><img className="page-header__icon" src={icon} alt="" /></abbr>}
      <h1 className="page-header__title">{title}</h1>
      <div className="page-header__actions">{children}</div>
    </div>
  );
}

PageHeader.defaultProps = {
  icon: undefined,
  iconTooltip: undefined
};

PageHeader.propTypes = {
  // The title to be displayed on the header
  title: PropTypes.string.isRequired,

  // The icon URL to be displayed on the left side of the title
  icon: PropTypes.string,

  // The tooltip for the icon
  iconTooltip: PropTypes.string
};

export default React.memo(PageHeader);
