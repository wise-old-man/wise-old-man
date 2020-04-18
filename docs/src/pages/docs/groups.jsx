import React from 'react';
import PropTypes from 'prop-types';
import DocsPage from '../../containers/DocsPage';
import { loadConfig } from '../../utils/docs';
import '../../index.scss';

GroupsDocs.getInitialProps = async () => {
  const config = await loadConfig('groups');
  return { config };
};

function GroupsDocs({ config }) {
  return <DocsPage config={config} />;
}

GroupsDocs.propTypes = {
  config: PropTypes.shape().isRequired
};

export default GroupsDocs;
