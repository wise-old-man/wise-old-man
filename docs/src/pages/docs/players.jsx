import React from 'react';
import PropTypes from 'prop-types';
import DocsPage from '../../containers/DocsPage';
import { loadConfig } from '../../utils/docs';
import '../../index.scss';

PlayersDocs.getInitialProps = async () => {
  const config = await loadConfig('players');
  return { config };
};

function PlayersDocs({ config }) {
  return <DocsPage config={config} />;
}

PlayersDocs.propTypes = {
  config: PropTypes.shape().isRequired,
};

export default PlayersDocs;
