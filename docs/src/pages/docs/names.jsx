import React from 'react';
import PropTypes from 'prop-types';
import DocsPage from '../../containers/DocsPage';
import { loadConfig } from '../../utils/docs';
import '../../index.scss';

NamesDocs.getInitialProps = async () => {
  const config = await loadConfig('names');
  return { config };
};

function NamesDocs({ config }) {
  return <DocsPage config={config} />;
}

NamesDocs.propTypes = {
  config: PropTypes.shape().isRequired
};

export default NamesDocs;
