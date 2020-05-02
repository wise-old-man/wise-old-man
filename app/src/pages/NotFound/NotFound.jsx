import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import './NotFound.scss';

function NotFound() {
  return (
    <div className="not-found__container container">
      <Helmet>
        <title>404 Page not found</title>
      </Helmet>
      <div className="panel">
        <h1 className="title">Ooops!</h1>
        <h2 className="text">That page could not be found.</h2>
        <Link to="/" className="cta">
          Return to the homepage
        </Link>
        <img className="troll" src="/img/notfound/troll.png" alt="" />
      </div>
    </div>
  );
}

export default NotFound;
