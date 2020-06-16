import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper, Button, Menu, MenuItem } from 'react-aria-menubutton';
import classNames from 'classnames';
import './Dropdown.scss';

function Dropdown({ options, align, onSelect, children }) {
  const listClass = classNames({
    'dropdown-list': true,
    '-right': align === 'right',
    '-left': align === 'left'
  });

  return (
    <Wrapper className="dropdown__container">
      <Button className="dropdown__toggle">{children}</Button>
      <Menu className={listClass}>
        {options &&
          options.map(option => {
            return (
              <MenuItem
                key={option.label}
                className={classNames({ 'dropdown-list__item': true, 'dropdown-url': option.url })}
                onClick={!option.url ? () => onSelect(option) : undefined}
              >
                {option.url ? <a href={option.url}>{option.label}</a> : option.label}
              </MenuItem>
            );
          })}
      </Menu>
    </Wrapper>
  );
}

Dropdown.defaultProps = {
  align: 'right'
};

Dropdown.propTypes = {
  // The list of options to be displayed, must contain fields: (label, value)
  options: PropTypes.arrayOf(PropTypes.shape()).isRequired,

  // Event: to be fired when an option is selected
  onSelect: PropTypes.func.isRequired,

  // The alignment of the options (right/left)
  align: PropTypes.string
};

export default React.memo(Dropdown);
