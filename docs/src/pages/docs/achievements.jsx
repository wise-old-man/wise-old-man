import React from 'react';
import PropTypes from 'prop-types';
import DocsPage from '../../containers/DocsPage';
import { loadConfig } from '../../utils/docs';
import '../../index.scss';

AchievementsDocs.getInitialProps = async () => {
  const config = await loadConfig('achievements');
  return { config };
};

function AchievementsDocs({ config }) {
  return <DocsPage config={config} />;
}

AchievementsDocs.propTypes = {
  config: PropTypes.shape().isRequired,
};

export default AchievementsDocs;
