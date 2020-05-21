import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './Tabs.scss';

function Tabs({ tabs, selectedIndex, onChange, align }) {
  const handleSelection = e => {
    const index = parseInt(e.target.dataset.index, 10);

    if (index === selectedIndex) {
      return;
    }

    onChange(index);
  };

  const onSelect = useCallback(handleSelection, [selectedIndex, onChange]);

  const barClass = classNames({
    'tab-bar': true,
    '-align-left': align === 'left',
    '-align-center': align === 'center',
    '-align-right': align === 'right',
    '-align-space-between': align === 'space-between'
  });

  return (
    <div className={barClass}>
      {tabs.map((tab, i) => {
        const tabClass = classNames({ tab: true, '-highlighted': selectedIndex === i });

        return (
          <button key={tab} data-index={i} className={tabClass} type="button" onClick={onSelect}>
            {tab}
          </button>
        );
      })}
    </div>
  );
}

Tabs.defaultProps = {
  align: 'left'
};

Tabs.propTypes = {
  // A list of tabs to render
  tabs: PropTypes.arrayOf(PropTypes.string).isRequired,

  selectedIndex: PropTypes.number.isRequired,

  // Event: fired on tab selected
  onChange: PropTypes.func.isRequired,

  // The alignment of the tabs (optional), must be one of (right, left, center, space-between)
  align: PropTypes.string
};

export default React.memo(Tabs);
