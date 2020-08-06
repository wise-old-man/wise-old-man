import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import classNames from 'classnames';
import TextInput from '../TextInput';
import fetchPlayer from '../../redux/modules/players/actions/fetch';
import './NavigationBar.scss';

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
            <li className="nav-links__item">
              <form onSubmit={onSearchSubmit}>
                <TextInput placeholder="Search player" onChange={onSearchChanged} />
                <button type="submit" style={{ display: 'none' }} />
              </form>
            </li>

            <li className="nav-links__item">
              <Link to="/top" onClick={closeMenu}>
                Current Top
              </Link>
            </li>

            <li className="nav-links__item">
              <Link to="/records" onClick={closeMenu}>
                Records
              </Link>
            </li>

            <li className="nav-links__item">
              <Link to="/competitions" onClick={closeMenu}>
                Competitions
              </Link>
            </li>

            <li className="nav-links__item">
              <Link to="/groups" onClick={closeMenu}>
                Groups
              </Link>
            </li>

            <li className="nav-links__item">
              <Link to="/names" onClick={closeMenu}>
                Names
              </Link>
            </li>

            <li className="nav-links__item -spacing">|</li>

            <li className="nav-links__item">
              <a href="/docs" onClick={closeMenu}>
                API
              </a>
            </li>

            <li className="nav-links__item">
              <a href="https://bot.wiseoldman.net" onClick={closeMenu}>
                Discord Bot
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default NavigationBar;
