import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './Tabs.scss';

function Tabs({ tabs, selectedIndex, align, urlSelector, specialHighlightIndex }) {
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
        const url = urlSelector && urlSelector(i);

        return (
          <a key={tab} href={url} className={tabClass}>
            {tab}
            {i === specialHighlightIndex && <div className="new-dot" />}
          </a>
        );
      })}
    </div>
  );
}

Tabs.defaultProps = {
  align: 'left',
  specialHighlightIndex: -1
};

Tabs.propTypes = {
  // A list of tabs to render
  tabs: PropTypes.arrayOf(PropTypes.string).isRequired,

  selectedIndex: PropTypes.number.isRequired,

  urlSelector: PropTypes.func.isRequired,

  // The alignment of the tabs (optional), must be one of (right, left, center, space-between)
  align: PropTypes.string,

  specialHighlightIndex: PropTypes.number
};

export default React.memo(Tabs);
