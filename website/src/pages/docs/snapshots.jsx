import React from 'react';
import PropTypes from 'prop-types';
import DocsPage from '../../containers/DocsPage';
import { loadConfig } from '../../utils/docs';
import '../../index.scss';

SnapshotsDocs.getInitialProps = async () => {
  const config = await loadConfig('snapshots');
  return { config };
};

function SnapshotsDocs({ config }) {
  return <DocsPage config={config} />;
}

SnapshotsDocs.propTypes = {
  config: PropTypes.shape().isRequired,
};

export default SnapshotsDocs;
