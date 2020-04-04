import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './CardList.scss';

function CardList({ items, onClick }) {
  function handleClick(i) {
    if (!onClick) {
      return;
    }

    // Slightly delay the click event, to allow
    // the clicked animation to be displayed
    // (this is better for UX)
    setTimeout(() => onClick(i), 150);
  }

  return (
    <ul className="card-list">
      {items.map((item, i) => (
        <li key={item.title} className={classNames('card-list__item', { '-clickable': !!onClick })}>
          <button type="button" onClick={() => handleClick(i)}>
            <div className="list-item__icon">
              <img src={item.icon} alt="" />
            </div>
            <div className="list-item__text">
              <span className="list-item__title">{item.title}</span>
              <span className="list-item__subtitle">{item.subtitle}</span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

CardList.defaultProps = {
  onClick: undefined
};

CardList.propTypes = {
  // The list items to render, must contain fields: (icon, title, subtitle)
  items: PropTypes.arrayOf(PropTypes.shape).isRequired,

  // The event to be fired when an item is clicked (Optional)
  onClick: PropTypes.func
};

export default CardList;
