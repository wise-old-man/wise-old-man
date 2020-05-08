import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import TextInput from '../TextInput';
import './Selector.scss';

const itemClass = (isSelected, isSearchMatch) =>
  classNames('selector-list__item', { '-selected': isSelected, '-hidden': !isSearchMatch });

const menuClass = isOpen => classNames('selector-menu', { '-closed': !isOpen });

const buttonClass = isDisabled => classNames({ 'selector-toggle': true, '-disabled': isDisabled });

function Selector({ options, selectedIndex, onSelect, disabled, search }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const inputId = `selector-search-${options[0].value}`;

  function handleSelection(option) {
    if (onSelect) {
      onSelect(option);
    }

    close();
    setSearchText('');
  }

  function handleSearch(e) {
    setSearchText(e.target.value);
  }

  function handleBlur(e) {
    // If focus was lost to an elementbesides the search bar
    if (!e || !e.relatedTarget || e.relatedTarget.id !== inputId) {
      close();
    }
  }

  const onSelection = useCallback(handleSelection, [options, onSelect]);
  const onSearch = useCallback(handleSearch, [options]);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(o => !o), [isOpen]);

  const selectedOption = options && options[selectedIndex];

  const label = selectedOption ? selectedOption.label : '---';
  const icon = selectedOption && selectedOption.icon;

  return (
    <div className="selector" onBlur={handleBlur}>
      <button className={buttonClass(disabled)} type="button" onClick={toggle}>
        {icon && <img className="toggle__icon" src={icon} alt="" />}
        <span className="toggle__text">{disabled ? '' : label}</span>
        <img className="toggle__icon" src="/img/icons/dropdown_arrow_down.svg" alt="" />
      </button>
      <div className={menuClass(isOpen)}>
        {options && (
          <>
            {search && (
              <TextInput
                id={inputId}
                value={searchText}
                placeholder="Search..."
                onChange={onSearch}
                search
              />
            )}
            <div className="selector-list">
              {options.map((o, i) => (
                <button
                  key={o.value}
                  type="button"
                  className={itemClass(i === selectedIndex, o.label.toLowerCase().includes(searchText))}
                  onMouseDown={() => onSelection(o)}
                >
                  {o.icon && <img className="selector-item__icon" src={o.icon} alt="" />}
                  <span className="selector-item__label">{o.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

Selector.defaultProps = {
  options: undefined,
  onSelect: undefined,
  selectedIndex: undefined,
  disabled: false,
  search: false
};

Selector.propTypes = {
  // A list of options, each of which should contain the fields (label, value) and optionally (icon)
  options: PropTypes.arrayOf(PropTypes.shape),

  // The selected index (controlled)
  selectedIndex: PropTypes.number,

  // Event: fired on option selected
  onSelect: PropTypes.func,

  // If true, the selector will be unclickable and visually darker
  disabled: PropTypes.bool,

  // If true, the search bar will be enabled
  search: PropTypes.bool
};

export default React.memo(Selector);
