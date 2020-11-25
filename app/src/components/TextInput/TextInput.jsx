import React from 'react';
import PropTypes from 'prop-types';
import './TextInput.scss';

function TextInput({
  id,
  type,
  value,
  onChange,
  placeholder,
  search,
  disableAutocomplete,
  maxCharacters
}) {
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
        maxLength={maxCharacters}
      />
      {search && <img className="text-input__icon" src="/img/icons/search.svg" alt="" />}
      {maxCharacters && value && (
        <div className="text-input__counter">{`${
          maxCharacters - value.toString().length
        }/${maxCharacters}`}</div>
      )}
    </div>
  );
}

TextInput.defaultProps = {
  id: undefined,
  value: undefined,
  type: 'text',
  search: false,
  disableAutocomplete: true,
  maxCharacters: undefined
};

TextInput.propTypes = {
  id: PropTypes.string,

  // The type of input (ex: text, password, etc)
  type: PropTypes.string,

  // The input value
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  // The placeholder text to display
  placeholder: PropTypes.string.isRequired,

  // If true, a search icon will be displayed on the right side of the input
  search: PropTypes.bool,

  // Event: fired when the input's value is changed
  onChange: PropTypes.func.isRequired,

  // If enabled, no autofill/autocomplete will be used
  disableAutocomplete: PropTypes.bool,

  // The maximum number of characters that can be used and requires the value to be propogated into the child
  maxCharacters: PropTypes.number
};

export default React.memo(TextInput);
