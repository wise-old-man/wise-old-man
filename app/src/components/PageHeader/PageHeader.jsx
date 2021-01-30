import React from 'react';
import PropTypes from 'prop-types';
import './PageHeader.scss';

function PageHeader({ title, icon, iconTooltip, renderRight, renderLeft }) {
  return (
    <div className="page-header">
      {icon && (
        <abbr title={iconTooltip}>
          <img className="page-header__icon" src={icon} alt="" />
        </abbr>
      )}
      <h1 className="page-header__title">{title}</h1>
      {renderLeft && <div className="page-header__left">{renderLeft()}</div>}
      {renderRight && <div className="page-header__right">{renderRight()}</div>}
    </div>
  );
}

PageHeader.defaultProps = {
  icon: undefined,
  iconTooltip: undefined,
  renderLeft: undefined,
  renderRight: undefined
};

PageHeader.propTypes = {
  // The title to be displayed on the header
  title: PropTypes.string.isRequired,

  // The icon URL to be displayed on the left side of the title
  icon: PropTypes.string,

  // The tooltip for the icon
  iconTooltip: PropTypes.string,

  // A renderable function to add left-aligned components
  renderLeft: PropTypes.func,

  // A renderable function to add right-aligned components
  renderRight: PropTypes.func
};

export default React.memo(PageHeader);
