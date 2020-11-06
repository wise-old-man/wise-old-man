import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import classNames from 'classnames';
import * as playerActions from 'redux/players/actions';
import TextInput from '../TextInput';
import './NavigationBar.scss';

const MENU_CONFIG = [
  {
    type: 'dropdown',
    label: 'Leaderboards',
    links: [
      {
        icon: '/img/icons/rising.svg',
        label: 'Current Top',
        url: '/top'
      },
      {
        icon: '/img/icons/medal.svg',
        label: 'Records',
        url: '/records'
      },
      {
        icon: '/img/icons/hiscores.svg',
        label: 'Virtual Hiscores',
        url: '/leaderboards'
      }
    ]
  },
  {
    type: 'dropdown',
    label: 'Community',
    links: [
      {
        icon: '/img/icons/group.svg',
        label: 'Groups',
        url: '/groups'
      },
      {
        icon: '/img/icons/trophy.svg',
        label: 'Competitions',
        url: '/competitions'
      },
      {
        icon: '/img/icons/label.svg',
        label: 'Name changes',
        url: '/names'
      }
    ]
  },
  {
    type: 'dropdown',
    label: 'Efficiency',
    links: [
      {
        icon: '/img/icons/skilling.svg',
        label: 'EHP Rates',
        url: '/rates/ehp'
      },
      {
        icon: '/img/icons/sword.svg',
        label: 'EHB Rates',
        url: '/rates/ehb'
      }
    ]
  },
  {
    type: 'link',
    label: 'API',
    url: 'https://wiseoldman.net/docs'
  },
  {
    type: 'link',
    label: 'Discord Bot',
    url: 'https://bot.wiseoldman.net'
  }
];

function NavigationBar() {
  const router = useHistory();
  const dispatch = useDispatch();

  const [usernameSearch, setUsernameSearch] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleMenu = () => {
    setIsCollapsed(!isCollapsed);
  };

  const closeMenu = () => {
    setIsCollapsed(true);
  };

  const onSearchChanged = e => {
    setUsernameSearch(e.target.value);
  };

  const onSearchSubmit = async e => {
    e.preventDefault();

    if (usernameSearch && usernameSearch.length) {
      const username = usernameSearch;

      const { payload } = await dispatch(playerActions.fetchPlayer(username));

      if (payload.data && payload.data.username) {
        router.push(`/players/${payload.data.username}`);
      } else {
        router.push(`/players/search/${username}`);
      }

      closeMenu();
    }
  };

  const menuClass = classNames({
    'nav-items__list': true,
    '-collapsed': isCollapsed
  });

  const itemClass = item => (item.type === 'dropdown' ? 'nav-item -dropdown' : 'nav-item -link');

  return (
    <nav className="nav-bar">
      <div className="nav-bar__wrapper">
        <Link className="nav-brand col-md-3 col-8" to="/" onClick={closeMenu}>
          <img className="nav-logo-img" src="/img/logo.png" alt="" />
          <div className="nav-logo-text">
            <span>WISE</span>
            <span>OLD MAN</span>
          </div>
        </Link>
        <div className="nav-menu col-md-9 col-4">
          <button className="nav-toggle" type="button" onClick={toggleMenu}>
            {isCollapsed ? (
              <img src="/img/icons/menu.svg" alt="" />
            ) : (
              <img src="/img/icons/clear.svg" alt="" />
            )}
          </button>
          <ul className={menuClass}>
            <li className="nav-item -search">
              <form onSubmit={onSearchSubmit}>
                <TextInput placeholder="Search player" onChange={onSearchChanged} />
                <button type="submit" style={{ display: 'none' }} />
              </form>
            </li>
            {MENU_CONFIG.map(item => (
              <li key={item.label} className={itemClass(item)}>
                {item.type === 'link' ? (
                  <a href={item.url}>{item.label}</a>
                ) : (
                  <>
                    <div className="dropdown__wrapper">
                      <b>{item.label}</b>
                      <img src="/img/icons/dropdown_arrow_down.svg" alt="" />
                    </div>
                    <ul className="dropdown__content">
                      {item.links.map(link => (
                        <li key={link.url} className="dropdown__link">
                          <img src={link.icon} alt="" />
                          <Link to={link.url} onClick={closeMenu}>
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default NavigationBar;
