import React from 'react';
import PropTypes from 'prop-types';
import Table from './components/Table';
import Endpoint from './components/Endpoint';
import Navigation from './components/Navigation';
import './Docs.scss';

function Docs({ config }) {
  return (
    <div className="docs-page">
      <Navigation selectedUrl={config.url} />
      <div className="docs-content">
        <h1 className="docs-title row">{config.title}</h1>
        <p className="docs-description row">{config.description}</p>
        <div className="docs-entities section">
          {config.entities &&
            config.entities.map((e) =>
              e.values ? (
                <div className="entity-values block">
                  <b className="block-title">{e.name}</b>
                  <span className="block-description">{e.description}</span>
                  <div>
                    {e.values.map((v) => (
                      <span className="entity-value">{v}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <Table
                  key={e.name}
                  title={e.name}
                  description={e.description}
                  rows={e.structure}
                  columns={Object.keys(e.structure[0])}
                />
              )
            )}
        </div>
        <div className="docs-endpoints">
          {config.endpoints && config.endpoints.map((e) => <Endpoint key={e.title} endpoint={e} />)}
        </div>
      </div>
    </div>
  );
}

Docs.propTypes = {
  config: PropTypes.shape().isRequired,
};

export default Docs;
