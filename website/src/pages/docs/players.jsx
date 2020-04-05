import React from 'react';
import PropTypes from 'prop-types';
import Docs from '../../containers/Docs';
import { loadConfig } from '../../utils/docs';
import '../../index.scss';

PlayersDocs.getInitialProps = async () => {
  const config = await loadConfig('players');
  return { config };
};

function PlayersDocs({ config }) {
  return <Docs config={config} />;
}

PlayersDocs.propTypes = {
  config: PropTypes.shape().isRequired,
};

export default PlayersDocs;
