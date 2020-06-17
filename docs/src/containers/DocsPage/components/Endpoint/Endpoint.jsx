import React from 'react';
import PropTypes from 'prop-types';
import Table from '../Table';
import JsonBlock from '../JsonBlock';
import { dynamicClass } from '../../../../utils/styling';
import './Endpoint.scss';

function Endpoint({ endpoint }) {
  const paths = [];

  if (endpoint.url) {
    paths.push(endpoint.url);
  }

  if (endpoint.urls) {
    paths.push(...endpoint.urls);
  }

  return (
    <div className="endpoint section">
      <h3 className="endpoint__title">{endpoint.title}</h3>

      {paths.map(url => (
        <div key={url} className="endpoint__path">
          <b className={dynamicClass('endpoint__method', endpoint.method.toLowerCase())}>
            {endpoint.method}
          </b>
          <span className="endpoint__url">{url}</span>
        </div>
      ))}

      {endpoint.comments &&
        endpoint.comments.map((comment, i) => (
          <p key={`comment-${i}`} className={dynamicClass('endpoint__comment', comment.type)}>
            {comment.content}
          </p>
        ))}

      {endpoint.params && (
        <Table title="Params" rows={endpoint.params} columns={Object.keys(endpoint.params[0])} />
      )}

      {endpoint.query && (
        <Table
          title="Query string params"
          rows={endpoint.query}
          columns={Object.keys(endpoint.query[0])}
        />
      )}

      {endpoint.body && (
        <div className="endpoint__body block">
          <b className="block-title">Example request body</b>
          <JsonBlock json={JSON.stringify(endpoint.body)} />
        </div>
      )}

      {endpoint.successResponses &&
        endpoint.successResponses.map((response, i) => (
          <div key={i} className="endpoint__response block">
            <b className="block-title">Example success response</b>
            <span className="block-description">{response.description}</span>
            <JsonBlock json={JSON.stringify(response.body)} />
          </div>
        ))}

      {endpoint.errorResponses &&
        endpoint.errorResponses.map((response, i) => (
          <div key={i} className="endpoint__response block">
            <b className="block-title">Example error response</b>
            <span className="block-description">{response.description}</span>
            <JsonBlock json={JSON.stringify(response.body)} />
          </div>
        ))}
    </div>
  );
}

Endpoint.propTypes = {
  endpoint: PropTypes.shape().isRequired
};

export default Endpoint;
