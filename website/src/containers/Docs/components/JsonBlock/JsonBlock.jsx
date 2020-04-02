import React from 'react';
import PropTypes from 'prop-types';
import JSONPretty from 'react-json-pretty';

const MAIN_STYLE = 'background:#1e1e1e; font-family: monospace';
const KEY_STYLE = 'color:#97e05e';
const STRING_STYLE = 'color:#f7e160';
const VALUE_STYLE = 'color:#cc98f5';

function JsonBlock({ json }) {
  return (
    <JSONPretty
      data={json}
      mainStyle={MAIN_STYLE}
      keyStyle={KEY_STYLE}
      stringStyle={STRING_STYLE}
      valueStyle={VALUE_STYLE}
    />
  );
}

JsonBlock.propTypes = {
  json: PropTypes.string.isRequired,
};

export default JsonBlock;
