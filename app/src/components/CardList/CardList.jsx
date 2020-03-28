import React from 'react';
import PropTypes from 'prop-types';
import './CardList.scss';

function CardList({ items }) {
  return (
    <ul className="card-list">
      {items.map(item => (
        <li key={item.title} className="card-list__item">
          <div className="list-item__icon">
            <img src={item.icon} alt="" />
          </div>
          <div className="list-item__text">
            <span className="list-item__title">{item.title}</span>
            <span className="list-item__subtitle">{item.subtitle}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

CardList.propTypes = {
  // The list items to render, must contain fields: (icon, title, subtitle)
  items: PropTypes.arrayOf(PropTypes.shape).isRequired
};

export default CardList;
