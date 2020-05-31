/* eslint react/button-has-type: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import ConditionalWrap from 'conditional-wrap';
import './Button.scss';

function Button({ text, className, icon, type, url, onClick, disabled, loading }) {
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
    </ConditionalWrap>
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
