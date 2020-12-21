import React from 'react';
import PropTypes from 'prop-types';
import Tab from '@material/react-tab';
import TabBar from '@material/react-tab-bar';
import './Tabs.scss';

function Tabs({ tabs, selectedIndex, onTabSelected }) {
  return (
    <TabBar className="tab-bar" activeIndex={selectedIndex} handleActiveIndexUpdate={onTabSelected}>
      {tabs.map(tab => (
        <Tab key={tab}>
          <span className="mdc-tab__text-label">{tab}</span>
        </Tab>
      ))}
    </TabBar>
  );
}

Tabs.defaultProps = {
  onTabSelected: undefined
};

Tabs.propTypes = {
  // A list of tabs to render
  tabs: PropTypes.arrayOf(PropTypes.string).isRequired,

  selectedIndex: PropTypes.number.isRequired,

  onTabSelected: PropTypes.func
};

export default React.memo(Tabs);
