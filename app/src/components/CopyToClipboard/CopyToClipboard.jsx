import React, { useState, memo } from 'react';
import classNames from 'classnames';
import './CopyToClipboard.scss';

const CopyToClipboard = props => {
  const { children } = props;
  const [hover, setHover] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mousePos, setMousePos] = useState({});

  const popupClass = classNames('popup', { '-show': hover, '-success': copied });

  const handleClick = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);

    // mobile
    if (!hover) {
      setHover(true);
      setTimeout(() => {
        setHover(false);
      }, 1500);
    }
  };

  const handleHover = event => {
    if (event.type === 'mouseenter') {
      setMousePos({ left: `${event.clientX}px`, top: `${event.clientY}px` });
    }
    setHover(!hover);
  };

  return (
    <>
      <span style={{ left: mousePos.left, top: mousePos.top }} className={popupClass}>
        {copied ? '✔ Copied!' : 'Click to copy'}
      </span>
      <span
        onClick={handleClick}
        onKeyDown={handleClick}
        onMouseEnter={handleHover}
        onMouseLeave={handleHover}
        className="hover"
        role="button"
        tabIndex={0}
      >
        {children}
      </span>
    </>
  );
};

export default memo(CopyToClipboard);
