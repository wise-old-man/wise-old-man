import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './Menu.scss';

const sections = [
  {
    key: 'general',
    title: null,
    links: [
      {
        label: 'Introduction',
        url: '/docs'
      }
    ]
  },
  {
    key: 'resources',
    title: 'Resources',
    links: [
      {
        label: 'Players',
        url: '/docs/players'
      },
      {
        label: 'Competitions',
        url: '/docs/competitions'
      },
      {
        label: 'Groups',
        url: '/docs/groups'
      },
      {
        label: 'Deltas',
        url: '/docs/deltas'
      },
      {
        label: 'Snapshots',
        url: '/docs/snapshots'
      },
      {
        label: 'Records',
        url: '/docs/records'
      },
      {
        label: 'Achievements',
        url: '/docs/achievements'
      },
      {
        label: 'Names',
        url: '/docs/names'
      }
    ]
  }
];

function Menu({ selectedUrl }) {
  const linkClass = ({ url }) => classNames('menu-list__item', { '-selected': url === selectedUrl });

  return (
    <div className="docs__menu">
      <div className="docs__menu-wrapper">
        {sections.map(s => (
          <ul key={s.key} className="menu-list">
            <li className="menu-list__item -title">{s.title}</li>
            {s.links.map(link => (
              <li key={link.url} className={linkClass(link)}>
                <a href={link.url}>{link.label}</a>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

Menu.propTypes = {
  selectedUrl: PropTypes.string.isRequired
};

export default Menu;
