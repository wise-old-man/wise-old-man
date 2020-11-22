import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import './Tabs.scss';

function Tabs({ tabs, selectedIndex, align, urlSelector, onTabSelected }) {
  const wrapperClass = classNames({
    'tab-bar__wrapper': true,
    '-align-left': align === 'left',
    '-align-center': align === 'center',
    '-align-right': align === 'right',
    '-align-space-between': align === 'space-between'
  });

  // When the tab changes, scroll it to the center of the tab bar
  useEffect(() => {
    const parent = document.getElementById('tab-bar__wrapper');
    const selectedTab = document.getElementById(`tab-${selectedIndex}`);

    parent.scrollTo(selectedTab.offsetLeft - 80, 0);
  }, [selectedIndex]);

  return (
    <div className="tab-bar">
      <div id="tab-bar__wrapper" className={wrapperClass}>
        {tabs.map((tab, i) => {
          const tabClass = classNames({ tab: true, '-highlighted': selectedIndex === i });
          const url = urlSelector && urlSelector(i);

          return urlSelector ? (
            <Link key={tab} id={`tab-${i}`} to={url} className={tabClass}>
              <span>{tab}</span>
            </Link>
          ) : (
            <button
              type="button"
              key={tab}
              id={`tab-${i}`}
              className={tabClass}
              onClick={() => onTabSelected(i)}
            >
              <span>{tab}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

Tabs.defaultProps = {
  align: 'left',
  urlSelector: undefined,
  onTabSelected: undefined
};

Tabs.propTypes = {
  // A list of tabs to render
  tabs: PropTypes.arrayOf(PropTypes.string).isRequired,

  selectedIndex: PropTypes.number.isRequired,

  onTabSelected: PropTypes.func,

  urlSelector: PropTypes.func,

  // The alignment of the tabs (optional), must be one of (right, left, center, space-between)
  align: PropTypes.string
};

export default React.memo(Tabs);
