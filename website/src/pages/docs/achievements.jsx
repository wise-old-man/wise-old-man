import React from 'react';
import PropTypes from 'prop-types';
import Docs from '../../containers/Docs';
import { loadConfig } from '../../utils/docs';
import '../../index.scss';

AchievementsDocs.getInitialProps = async () => {
  const config = await loadConfig('achievements');
  return { config };
};

function AchievementsDocs({ config }) {
  return <Docs config={config} />;
}

AchievementsDocs.propTypes = {
  config: PropTypes.shape().isRequired,
};

export default AchievementsDocs;
