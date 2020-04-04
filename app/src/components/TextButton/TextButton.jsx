import React from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import './TextButton.scss';

function TextButton({ text, onClick, redirectTo }) {
  const router = useHistory();

  const handleClick = () => {
    // Slightly delay the click event, to allow
    // the clicked animation to be displayed
    // (this is better for UX)
    setTimeout(() => {
      if (onClick) {
        onClick();
      }

      if (redirectTo) {
        router.push(redirectTo);
      }
    }, 150);
  };

  return (
    <button className="text-button" type="button" onClick={handleClick}>
      {text}
    </button>
  );
}

TextButton.defaultProps = {
  onClick: undefined,
  redirectTo: undefined
};

TextButton.propTypes = {
  // The text to display on the button
  text: PropTypes.string.isRequired,

  // Event: fired on button click (optional)
  onClick: PropTypes.func,

  // The redirect URL, will be redirect to on click
  redirectTo: PropTypes.string
};

export default React.memo(TextButton);
