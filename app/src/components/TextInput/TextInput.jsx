import React from 'react';
import PropTypes from 'prop-types';
import './TextInput.scss';

function TextInput({ id, type, value, onChange, placeholder, search, disableAutocomplete }) {
  return (
    <div className="text-input">
      <input
        id={id}
        className="text-input__input"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        autoComplete={disableAutocomplete ? 'off' : 'on'}
      />
      {search && <img className="text-input__icon" src="/img/icons/search.svg" alt="" />}
    </div>
  );
}

TextInput.defaultProps = {
  id: undefined,
  value: undefined,
  type: 'text',
  search: false,
  disableAutocomplete: true
};

TextInput.propTypes = {
  id: PropTypes.string,

  // The type of input (ex: text, password, etc)
  type: PropTypes.string,

  // The input value
  value: PropTypes.string,

  // The placeholder text to display
  placeholder: PropTypes.string.isRequired,

  // If true, a search icon will be displayed on the right side of the input
  search: PropTypes.bool,

  // Event: fired when the input's value is changed
  onChange: PropTypes.func.isRequired,

  // If enabled, no autofill/autocomplete will be used
  disableAutocomplete: PropTypes.bool
};

export default React.memo(TextInput);
