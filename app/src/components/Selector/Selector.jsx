import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Wrapper, Button, Menu, MenuItem } from 'react-aria-menubutton';
import './Selector.scss';

function Selector({ options, defaultOption, selectedIndex, onSelect, disabled }) {
  const initialState = selectedIndex !== undefined ? options[selectedIndex] : defaultOption;
  const [selectedOption, setSelectedOption] = useState(initialState || null);

  const toggleOption = selectedOption || defaultOption || options[0];
  const opts = defaultOption ? [defaultOption, ...options] : options;

  const handleSelection = selectedValue => {
    const option = options.find(o => o.value === selectedValue);
    setSelectedOption(option);

    if (onSelect) {
      onSelect(option);
    }
  };

  const onSelection = useCallback(handleSelection, [options, setSelectedOption, onSelect]);

  useEffect(() => {
    if (selectedIndex && selectedIndex > -1) {
      onSelection(opts[selectedIndex].value);
    }
  }, [onSelection, opts, selectedIndex]);

  const toggleClass = classNames({ selector__toggle: true, '-disabled': disabled });

  return (
    <Wrapper className="selector__container" onSelection={onSelection}>
      <Button className={toggleClass}>
        {toggleOption.icon && <img className="toggle__icon" src={toggleOption.icon} alt="" />}
        <span className="toggle__text">{toggleOption.label}</span>
        <img className="toggle__icon" src="/img/icons/dropdown_arrow_down.svg" alt="" />
      </Button>
      <Menu className="selector-list">
        {opts.map(option => {
          const itemClass = classNames({
            'selector-list__item': true,
            '-selected': selectedOption && option.label === selectedOption.label
          });

          return (
            <MenuItem key={option.label} className={itemClass} value={option.value}>
              {option.icon && <img className="selector-item__icon" src={option.icon} alt="" />}
              <span className="selector-item__label">{option.label}</span>
            </MenuItem>
          );
        })}
      </Menu>
    </Wrapper>
  );
}

Selector.defaultProps = {
  defaultOption: undefined,
  onSelect: undefined,
  disabled: false,
  selectedIndex: undefined
};

Selector.propTypes = {
  // A list of options, each of which should contain the fields (label, value) and optionally (icon)
  options: PropTypes.arrayOf(PropTypes.shape).isRequired,

  // The default option to display, usually useful for a "All" or "Any" option
  defaultOption: PropTypes.shape(),

  // The selected index (controlled)
  selectedIndex: PropTypes.number,

  // Event: fired on option selected
  onSelect: PropTypes.func,

  // If true, the selector will be unclickable and visually darker
  disabled: PropTypes.bool
};

export default React.memo(Selector);
