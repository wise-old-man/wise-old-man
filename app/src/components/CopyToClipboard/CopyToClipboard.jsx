import React, { useState } from 'react';
import classNames from 'classnames';
import './CopyToClipboard.scss';

const CopyToClipboard = props => {
  const { children } = props;
  const [hover, setHover] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mousePos, setMousePos] = useState({ left: '50%', top: '50%' });

  const popupClass = classNames('popup', { '-show': hover, '-success': copied });

  const handleClick = () => {
    navigator.clipboard.writeText(children).then(
      function () {
        setCopied(true);
      },
      function () {
        /* clipboard write failed */
      }
    );
  };

  const handleHover = event => {
    const x = event.clientX;
    const y = event.clientY;
    setMousePos({ left: `${x}px`, top: `${y}px` });
    setHover(true);
  };

  return (
    <>
      <span style={{ left: mousePos.left, top: mousePos.top }} className={popupClass}>
        {copied ? '✔' : 'Click to copy'}
      </span>
      <span
        onClick={handleClick}
        onMouseEnter={e => handleHover(e)}
        onMouseLeave={() => setHover(false)}
        className="hover"
      >
        {children}
      </span>
    </>
  );
};

export default CopyToClipboard;
