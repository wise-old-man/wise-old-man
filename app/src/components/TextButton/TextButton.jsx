import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import ConditionalWrap from 'conditional-wrap';
import './TextButton.scss';

function TextButton({ text, onClick, url }) {
  const handleClick = () => {
    // Slightly delay the click event, to allow
    // the clicked animation to be displayed
    // (this is better for UX)
    setTimeout(() => {
      if (onClick) {
        onClick();
      }
    }, 150);
  };

  const isExternal = url && url.startsWith('http');
  const link = c => (isExternal ? <a href={url}>{c}</a> : <Link to={url}>{c}</Link>);

  return (
    <ConditionalWrap condition={!!url} wrap={link}>
      <button className="text-button" type="button" onClick={handleClick}>
        {text}
      </button>
    </ConditionalWrap>
  );
}

TextButton.defaultProps = {
  onClick: undefined,
  url: undefined
};

TextButton.propTypes = {
  // The text to display on the button
  text: PropTypes.string.isRequired,

  // Event: fired on button click (optional)
  onClick: PropTypes.func,

  url: PropTypes.string
};

export default React.memo(TextButton);
