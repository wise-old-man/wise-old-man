import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import './SelectableCard.scss';

function SelectableCard({ title, bodyText, iconUrl, selected, onSelected }) {
  return (
    <button
      className={cn('selectable-card', { '-selected': selected })}
      type="button"
      onClick={onSelected}
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

SelectableCard.propTypes = {
  title: PropTypes.string.isRequired,
  bodyText: PropTypes.string.isRequired,
  iconUrl: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  onSelected: PropTypes.func.isRequired
};

export default SelectableCard;
