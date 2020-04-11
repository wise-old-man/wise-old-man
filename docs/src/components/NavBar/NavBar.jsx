import React from 'react';
import './NavBar.scss';

function NavBar() {
  return (
    <div className="navigation-bar">
      <div className="navigation-bar__wrapper">
        <div className="nav-brand">
          <img className="nav-logo-img" src="/img/logo.png" alt="" />
          <div className="nav-logo-text">
            <span>WISE</span>
            <span>OLD MAN</span>
          </div>
        </div>
        <a href="/">Return to the full site</a>
      </div>
    </div>
  );
}

export default NavBar;
