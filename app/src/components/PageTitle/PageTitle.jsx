import React from 'react';
import PropTypes from 'prop-types';
import './PageTitle.scss';

function PageTitle({ title }) {
  return <h1 className="page__title">{title}</h1>;
}

PageTitle.propTypes = {
  // The title to be displayed
  title: PropTypes.string.isRequired
};

export default React.memo(PageTitle);
