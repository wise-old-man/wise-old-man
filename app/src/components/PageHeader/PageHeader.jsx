import React from 'react';
import PropTypes from 'prop-types';
import Badge from '../Badge';
import './PageHeader.scss';

function PageHeader({ title, icon, iconTooltip, children, badges }) {
  return (
    <div className="page-header">
      {icon && (
        <abbr title={iconTooltip}>
          <img className="page-header__icon" src={icon} alt="" />
        </abbr>
      )}
      <h1 className="page-header__title">{title}</h1>
      {badges &&
        badges.map(badge => <Badge key={badge.text} text={badge.text} hoverText={badge.hoverText} />)}
      <div className="page-header__actions">{children}</div>
    </div>
  );
}

PageHeader.defaultProps = {
  icon: undefined,
  iconTooltip: undefined,
  badges: []
};

PageHeader.propTypes = {
  // The title to be displayed on the header
  title: PropTypes.string.isRequired,

  // The icon URL to be displayed on the left side of the title
  icon: PropTypes.string,

  // The tooltip for the icon
  iconTooltip: PropTypes.string,

  // If enabled, a verified badge will be displayed next to the title
  badges: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      hoverText: PropTypes.string.isRequired
    })
  )
};

export default React.memo(PageHeader);
