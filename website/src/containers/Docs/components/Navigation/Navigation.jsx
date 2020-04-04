import React from 'react';
import classNames from 'classnames';
import './Navigation.scss';

const sections = [
  {
    key: 'general',
    title: null,
    links: [
      {
        label: 'Introduction',
        url: '/docs',
      },
    ],
  },
  {
    key: 'resources',
    title: 'Resources',
    links: [
      {
        label: 'Players',
        url: '/docs/players',
      },
      {
        label: 'Competitions',
        url: '/docs/competitions',
      },
      {
        label: 'Deltas',
        url: '/docs/deltas',
      },
      {
        label: 'Snapshots',
        url: '/docs/snapshots',
      },
      {
        label: 'Records',
        url: '/docs/records',
      },
    ],
  },
];

function Navigation({ selectedUrl }) {
  const linkClass = ({ url }) => classNames('nav-list__item', { '-selected': url === selectedUrl });

  return (
    <div className="docs__navigation">
      <div className="docs__navigation-wrapper">
        {sections.map((s) => (
          <ul key={s.key} className="nav-list">
            <li className="nav-list__item -title">{s.title}</li>
            {s.links.map((link) => (
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

export default Navigation;
