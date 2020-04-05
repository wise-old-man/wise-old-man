import React from 'react';
import PropTypes from 'prop-types';
import DocsPage from '../../containers/DocsPage';
import { loadConfig } from '../../utils/docs';
import '../../index.scss';

RecordsDocs.getInitialProps = async () => {
  const config = await loadConfig('records');
  return { config };
};

function RecordsDocs({ config }) {
  return <DocsPage config={config} />;
}

RecordsDocs.propTypes = {
  config: PropTypes.shape().isRequired,
};

export default RecordsDocs;
