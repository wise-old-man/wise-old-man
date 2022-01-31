import React from 'react';
import './Banner.scss';

function Banner() {
  return (
    <div className="banner__container">
      <p>Playing the Shattered Relics League? Check out our &nbsp;</p>
      <a href="https://league.wiseoldman.net">"Wise Old Man - League Edition"</a>
    </div>
  );
}

export default React.memo(Banner);
