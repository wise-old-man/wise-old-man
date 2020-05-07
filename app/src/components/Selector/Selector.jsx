import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './Selector.scss';

const itemClass = isSelected => classNames('selector-list__item', { '-selected': isSelected });
const menuClass = isOpen => classNames('selector-list', { '-open': isOpen });
const buttonClass = isDisabled => classNames({ 'selector-toggle': true, '-disabled': isDisabled });

function Selector({ options, selectedIndex, onSelect, disabled }) {
  const [isOpen, setIsOpen] = useState(false);

  function handleSelection(option) {
    if (onSelect) {
      onSelect(option);
    }

    close();
  }

  const onSelection = useCallback(handleSelection, [options, onSelect]);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const selectedOption = options && options[selectedIndex];

  const label = selectedOption ? selectedOption.label : '---';
  const icon = selectedOption && selectedOption.icon;

  return (
    <div className="selector" onBlur={close}>
      <button className={buttonClass(disabled)} type="button" onClick={open}>
        {icon && <img className="toggle__icon" src={icon} alt="" />}
        <span className="toggle__text">{disabled ? '' : label}</span>
        <img className="toggle__icon" src="/img/icons/dropdown_arrow_down.svg" alt="" />
      </button>
      <div className={menuClass(isOpen)}>
        {options &&
          options.map((o, i) => (
            <button
              key={o.value}
              type="button"
              className={itemClass(i === selectedIndex)}
              onMouseDown={() => onSelection(o)}
            >
              {o.label}
            </button>
          ))}
      </div>
    </div>
  );
}

Selector.defaultProps = {
  options: undefined,
  onSelect: undefined,
  selectedIndex: undefined,
  disabled: false
};

Selector.propTypes = {
  // A list of options, each of which should contain the fields (label, value) and optionally (icon)
  options: PropTypes.arrayOf(PropTypes.shape),

  // The selected index (controlled)
  selectedIndex: PropTypes.number,

  // Event: fired on option selected
  onSelect: PropTypes.func,

  // If true, the selector will be unclickable and visually darker
  disabled: PropTypes.bool
};

export default React.memo(Selector);
