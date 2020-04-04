import React from 'react';
import PropTypes from 'prop-types';
import Docs from '../../containers/Docs';
import { loadConfig } from '../../utils/docs';
import '../../index.scss';

SnapshotsDocs.getInitialProps = async () => {
  const config = await loadConfig('snapshots');
  return { config };
};

function SnapshotsDocs({ config }) {
  return <Docs config={config} />;
}

SnapshotsDocs.propTypes = {
  config: PropTypes.shape().isRequired,
};

export default SnapshotsDocs;
