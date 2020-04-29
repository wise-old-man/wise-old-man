import React from 'react';
import './NavBar.scss';

function NavBar() {
  return (
    <div className="navigation-bar">
      <div className="navigation-bar__wrapper">
        <a href="/">
          <div className="nav-brand">
            <img className="nav-logo-img" src="/img/logo.png" alt="" />
            <div className="nav-logo-text">
              <span>WISE</span>
              <span>OLD MAN</span>
              <span className="tag">BETA</span>
            </div>
          </div>
        </a>

        <a href="/">
          <span className="link">Return to the full site</span>
        </a>
      </div>
    </div>
  );
}

export default NavBar;
