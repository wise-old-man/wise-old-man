import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Selector from '../../../../components/Selector';
import Button from '../../../../components/Button';
import TextButton from '../../../../components/TextButton';
import './ParticipantsModal.scss';

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

function ParticipantsModal({ onConfirm, onClose }) {
  const [text, setText] = useState('');
  const [delimiter, setDelimiter] = useState(OPTIONS[0].value);

  const handleTextChange = e => {
    setText(e.target.value);
  };

  const handleDelimiterSelected = option => {
    setDelimiter(option.value);
  };

  const handleSubmit = () => {
    const participants = text.split(delimiter);
    onConfirm(participants);
  };

  const onTextChange = useCallback(handleTextChange, []);
  const onDelimiterSelected = useCallback(handleDelimiterSelected, []);
  const onSubmit = useCallback(handleSubmit, [text, delimiter]);

  return (
    <div className="participants-popup">
      <div className="participants-popup__modal">
        <h4 className="modal-title">Import participants list</h4>
        <Selector options={OPTIONS} onSelect={onDelimiterSelected} />
        <textarea
          className="modal-text"
          placeholder="Insert your username list here"
          onChange={onTextChange}
        />
        <div className="modal-actions">
          <TextButton text="Cancel" onClick={onClose} />
          <Button text="Confirm" onClick={onSubmit} />
        </div>
      </div>
    </div>
  );
}

ParticipantsModal.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default ParticipantsModal;
