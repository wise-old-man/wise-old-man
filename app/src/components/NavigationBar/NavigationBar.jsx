import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import classNames from 'classnames';
import TextInput from '../TextInput';
import fetchPlayer from '../../redux/modules/players/actions/fetch';
import './NavigationBar.scss';

const LINKS = [
  {
    label: 'Current Top',
    url: '/top'
  },
  {
    label: 'Records',
    url: '/records'
  },
  {
    label: 'Competitions',
    url: '/competitions'
  },
  {
    label: 'Contribute',
    url: 'https://github.com/psikoi/wise-old-man',
    buttonStyle: true
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

      try {
        const { player } = await dispatch(fetchPlayer({ username }));
        router.push(`/players/${player.id}`);
      } catch (err) {
        router.push(`/players/search/${username}`);
      } finally {
        closeMenu();
      }
    }
  };

  const menuClass = classNames({
    'nav-links__list': true,
    '-collapsed': isCollapsed
  });

  const linkClass = buttonStyle => {
    return classNames({
      'nav-links__item': true,
      '-button': buttonStyle
    });
  };

  return (
    <nav className="nav-bar">
      <div className="container">
        <div className="row">
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
              <li className="nav-links__item">
                <form onSubmit={onSearchSubmit}>
                  <TextInput placeholder="Search player" onChange={onSearchChanged} />
                  <button type="submit" style={{ display: 'none' }} />
                </form>
              </li>
              {LINKS.map(({ label, url, buttonStyle }) => (
                <li key={label} className={linkClass(buttonStyle)}>
                  {url.startsWith('http') ? (
                    <a href={url} onClick={closeMenu}>
                      {label}
                    </a>
                  ) : (
                    <Link to={url} onClick={closeMenu}>
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavigationBar;
