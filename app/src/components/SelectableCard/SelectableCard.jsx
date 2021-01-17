import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import './SelectableCard.scss';

function SelectableCard({ title, bodyText, iconUrl, selected, disabled, onSelected }) {
  return (
    <button
      className={cn('selectable-card', { '-selected': selected, '-disabled': disabled })}
      type="button"
      onClick={disabled ? undefined : onSelected}
    >
      <div className="left">
        <img src={iconUrl} alt="" />
      </div>
      <div className="right">
        <b className="title">{title}</b>
        <p className="text">{bodyText}</p>
      </div>
    </button>
  );
}

SelectableCard.defaultProps = {
  disabled: false
};

SelectableCard.propTypes = {
  title: PropTypes.string.isRequired,
  bodyText: PropTypes.string.isRequired,
  iconUrl: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  onSelected: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

export default SelectableCard;
