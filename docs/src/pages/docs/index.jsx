import React from 'react';
import PropTypes from 'prop-types';
import DocsPage from '../../containers/DocsPage';
import { loadConfig } from '../../utils/docs';
import '../../index.scss';

IntroductionDocs.getInitialProps = async () => {
  const config = await loadConfig('introduction');
  return { config };
};

function IntroductionDocs({ config }) {
  return <DocsPage config={config} />;
}

IntroductionDocs.propTypes = {
  config: PropTypes.shape().isRequired,
};

export default IntroductionDocs;
