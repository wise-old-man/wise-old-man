import React from 'react';
import PropTypes from 'prop-types';
import './TextInput.scss';

function TextInput({ type, value, onChange, placeholder, search }) {
  return (
    <div className="text-input">
      <input
        className="text-input__input"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
      />
      {search && <img className="text-input__icon" src="/img/icons/search.svg" alt="" />}
    </div>
  );
}

TextInput.defaultProps = {
  value: undefined,
  type: 'text',
  search: false
};

TextInput.propTypes = {
  // The type of input (ex: text, password, etc)
  type: PropTypes.string,

  // The input value
  value: PropTypes.string,

  // The placeholder text to display
  placeholder: PropTypes.string.isRequired,

  // If true, a search icon will be displayed on the right side of the input
  search: PropTypes.bool,

  // Event: fired when the input's value is changed
  onChange: PropTypes.func.isRequired
};

export default React.memo(TextInput);
