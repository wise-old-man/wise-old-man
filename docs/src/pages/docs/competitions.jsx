import React from 'react';
import PropTypes from 'prop-types';
import DocsPage from '../../containers/DocsPage';
import { loadConfig } from '../../utils/docs';
import '../../index.scss';

CompetitionsDocs.getInitialProps = async () => {
  const config = await loadConfig('competitions');
  return { config };
};

function CompetitionsDocs({ config }) {
  return <DocsPage config={config} />;
}

CompetitionsDocs.propTypes = {
  config: PropTypes.shape().isRequired,
};

export default CompetitionsDocs;
