import React from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import Table from './components/Table';
import Endpoint from './components/Endpoint';
import NavBar from '../../components/NavBar';
import Menu from './components/Menu';
import './DocsPage.scss';

function DocsPage({ config }) {
  return (
    <>
      <Head>
        <title>{`${config.title} API Docs - Wise Old Man`}</title>
        <meta
          property="og:description"
          content={`${config.title} api documentation - Open source Oldschool Runescape player progres tracker.`}
        />
      </Head>
      <NavBar />
      <div className="docs-page">
        <Menu selectedUrl={config.url} />
        <div className="docs-content">
          <h1 className="docs-title row">{config.title}</h1>
          <p className="docs-description row">{config.description}</p>

          <div className="docs-info">
            {config.content &&
              config.content.map((c) => {
                if (c.type === 'paragraph') {
                  return <p className="docs-paragraph">{c.content}</p>;
                }

                if (c.type === 'code') {
                  return <pre className="docs-code">{c.content}</pre>;
                }

                if (c.type === 'title') {
                  return <h5 className="docs-title">{c.text}</h5>;
                }

                if (c.type === 'link') {
                  return (
                    <div className="docs-link row">
                      <span>{c.label}</span>
                      <a href={c.url}>{c.url}</a>
                    </div>
                  );
                }
              })}
          </div>

          <div className="docs-entities section">
            {config.entities &&
              config.entities.map((e) =>
                e.values ? (
                  <div key={e.name} className="entity-values block">
                    <b className="block-title">{e.name}</b>
                    <span className="block-description">{e.description}</span>
                    <div>
                      {e.values.map((v) => (
                        <span key={v} className="entity-value">
                          {v}
                        </span>
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
    </>
  );
}

DocsPage.propTypes = {
  config: PropTypes.shape().isRequired,
};

export default DocsPage;
