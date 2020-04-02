import React from 'react';
import PropTypes from 'prop-types';
import Docs from '../../containers/Docs';
import { loadConfig } from '../../utils/docs';
import '../../index.scss';

RecordsDocs.getInitialProps = async () => {
  const config = await loadConfig('records');
  return { config };
};

function RecordsDocs({ config }) {
  return <Docs config={config} />;
}

RecordsDocs.propTypes = {
  config: PropTypes.shape().isRequired,
};

export default RecordsDocs;
