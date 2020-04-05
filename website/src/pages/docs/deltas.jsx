import React from 'react';
import PropTypes from 'prop-types';
import DocsPage from '../../containers/DocsPage';
import { loadConfig } from '../../utils/docs';
import '../../index.scss';

DeltasDocs.getInitialProps = async () => {
  const config = await loadConfig('deltas');
  return { config };
};

function DeltasDocs({ config }) {
  return <DocsPage config={config} />;
}

DeltasDocs.propTypes = {
  config: PropTypes.shape().isRequired,
};

export default DeltasDocs;
