import React from 'react';
import PropTypes from 'prop-types';
import Docs from '../../containers/Docs';
import { loadConfig } from '../../utils/docs';
import '../../index.scss';

CompetitionsDocs.getInitialProps = async () => {
  const config = await loadConfig('competitions');
  return { config };
};

function CompetitionsDocs({ config }) {
  return <Docs config={config} />;
}

CompetitionsDocs.propTypes = {
  config: PropTypes.shape().isRequired,
};

export default CompetitionsDocs;
