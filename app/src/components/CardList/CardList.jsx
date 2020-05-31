import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ConditionalWrap from 'conditional-wrap';
import './CardList.scss';

function CardList({ items, urlSelector, emptyMessage }) {
  return (
    <ul className="card-list">
      {items.length === 0 ? (
        <li className="card-list__item">
          <div className="list-item__text">
            <span className="list-item__title">{emptyMessage}</span>
          </div>
        </li>
      ) : (
        items.map(item => {
          const url = urlSelector && urlSelector(item);
          const isExternal = url && url.startsWith('http');
          const link = c => (isExternal ? <a href={url}>{c}</a> : <Link to={url}>{c}</Link>);

          return (
            <ConditionalWrap key={item.title} condition={!!url} wrap={link}>
              <li className={classNames('card-list__item', { '-clickable': !!url })}>
                <div className="list-item__icon">
                  <img src={item.icon} alt="" />
                </div>
                <div className="list-item__text">
                  <span className="list-item__title">{item.title}</span>
                  <span className="list-item__subtitle">{item.subtitle}</span>
                </div>
              </li>
            </ConditionalWrap>
          );
        })
      )}
    </ul>
  );
}

CardList.defaultProps = {
  urlSelector: undefined,
  emptyMessage: undefined
};

CardList.propTypes = {
  // The list items to render, must contain fields: (icon, title, subtitle)
  items: PropTypes.arrayOf(PropTypes.shape).isRequired,

  emptyMessage: PropTypes.string,

  urlSelector: PropTypes.func
};

export default CardList;
