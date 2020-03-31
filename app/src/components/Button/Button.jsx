/* eslint react/button-has-type: 0 */
import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import './Button.scss';
import { useHistory } from 'react-router-dom';

function Button({ text, className, icon, type, url, onClick, disabled, loading }) {
  const router = useHistory();

  const handleClick = () => {
    setTimeout(() => {
      if (onClick) {
        onClick();
      }

      if (url) {
        if (url.startsWith('http')) {
          window.location.href = url;
        } else {
          router.push(url);
        }
      }
    }, 150);
  };

  return (
    <button
      className={classNames({ button: true, [className]: true, '-loading': loading })}
      type={type}
      onClick={handleClick}
      disabled={disabled}
    >
      {icon && !loading && <img className="button__icon" src={icon} alt="" />}
      {loading && <img className="button__icon -loading" src="/img/icons/sync.svg" alt="" />}
      {loading ? 'Loading...' : text}
    </button>
  );
}

Button.defaultProps = {
  type: 'button',
  className: '',
  icon: undefined,
  url: undefined,
  onClick: undefined,
  disabled: false,
  loading: false
};

Button.propTypes = {
  // The button's inner text
  text: PropTypes.string.isRequired,

  // The button's optional class
  className: PropTypes.string,

  // The left-side icon
  icon: PropTypes.string,

  // The button's type (Ex: submit, button, reset)
  type: PropTypes.string,

  // Optional redirect url
  url: PropTypes.string,

  // Event: fired on click
  onClick: PropTypes.func,

  // Disables the button's click events darkens it
  disabled: PropTypes.bool,

  // If true, the button will be disabled and present a loading icon and text
  loading: PropTypes.bool
};

export default React.memo(Button);
