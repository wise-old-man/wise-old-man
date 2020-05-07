import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Selector from '../../components/Selector';
import Button from '../../components/Button';
import Switch from '../../components/Switch';
import TextButton from '../../components/TextButton';
import './ImportPlayersModal.scss';

const OPTIONS = [
  {
    label: 'Separated by line',
    value: '\n'
  },
  {
    label: 'Separated by comma',
    value: ','
  },
  {
    label: 'Separated by semicolon',
    value: ';'
  }
];

function ImportPlayersModal({ onConfirm, onClose }) {
  const [text, setText] = useState('');
  const [delimiter, setDelimiter] = useState(OPTIONS[0].value);
  const [replace, setReplace] = useState(false);

  const handleTextChange = e => {
    setText(e.target.value);
  };

  const handleDelimiterSelected = option => {
    setDelimiter(option.value);
  };

  const toggleReplace = () => {
    setReplace(!replace);
  };

  const handleSubmit = () => {
    const usernames = text.split(delimiter);
    onConfirm(usernames, replace);
  };

  const onTextChange = useCallback(handleTextChange, []);
  const onDelimiterSelected = useCallback(handleDelimiterSelected, []);
  const onSwitchChanged = useCallback(toggleReplace, [replace]);
  const onSubmit = useCallback(handleSubmit, [text, delimiter, replace]);

  return (
    <div className="import-players">
      <div className="import-players__modal">
        <h4 className="modal-title">Import username list</h4>
        <Selector options={OPTIONS} onSelect={onDelimiterSelected} />
        <textarea
          className="modal-text"
          placeholder="Insert your username list here"
          onChange={onTextChange}
        />
        <div className="modal-replace">
          <span className="modal-replace__label">Replace existing usernames</span>
          <Switch on={replace} onToggle={onSwitchChanged} />
        </div>
        <div className="modal-actions">
          <TextButton text="Cancel" onClick={onClose} />
          <Button text="Confirm" onClick={onSubmit} />
        </div>
      </div>
    </div>
  );
}

ImportPlayersModal.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default ImportPlayersModal;
