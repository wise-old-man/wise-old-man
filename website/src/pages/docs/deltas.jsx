import React from 'react';
import PropTypes from 'prop-types';
import Docs from '../../containers/Docs';
import { loadConfig } from '../../utils/docs';
import '../../index.scss';

DeltasDocs.getInitialProps = async () => {
  const config = await loadConfig('deltas');
  return { config };
};

function DeltasDocs({ config }) {
  return <Docs config={config} />;
}

DeltasDocs.propTypes = {
  config: PropTypes.shape().isRequired,
};

export default DeltasDocs;
