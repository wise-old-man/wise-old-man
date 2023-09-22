import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'components';
import URL from 'utils/url';
import { BASE_URL } from 'services/api';
import './ExportTableModal.scss';

function ExportTableModal({ exportConfig, onCancel }) {
  const [copied, setCopied] = useState(false);

  const url = getExportURL(exportConfig);

  function handleCopyClicked() {
    navigator.clipboard.writeText(url);
    setCopied(true);
  }

  return (
    <div className="export-table">
      <div className="export-table__modal">
        <button className="close-btn" type="button" onClick={onCancel}>
          <img src="/img/icons/clear.svg" alt="X" />
        </button>
        <b className="modal-title">Exporting Competition Table</b>
        <span className="modal-warning">
          You can import this competition&apos;s data into a Google Sheets document by using the
          following function:
        </span>
        <div className="code-copy-container">
          <pre>{url}</pre>
          <Button
            text={copied ? '✔ Copied!' : 'Copy'}
            className={copied ? '-copied' : ''}
            onClick={handleCopyClicked}
          />
        </div>
      </div>
    </div>
  );
}

function getExportURL(exportConfig) {
  const { competitionId, type, teamName, metric } = exportConfig;
  const nextURL = new URL(`${BASE_URL}/competitions/${competitionId}/csv`);

  nextURL.appendSearchParam('table', type);

  if (teamName) nextURL.appendSearchParam('teamName', encodeURIComponent(teamName));
  if (metric) nextURL.appendSearchParam('metric', metric);

  return `=IMPORTDATA("${nextURL.getPath()}")`;
}

ExportTableModal.propTypes = {
  exportConfig: PropTypes.shape({}).isRequired,
  onCancel: PropTypes.func.isRequired
};

export default ExportTableModal;
