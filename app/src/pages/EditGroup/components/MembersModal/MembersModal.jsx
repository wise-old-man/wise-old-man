import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Selector from '../../../../components/Selector';
import Button from '../../../../components/Button';
import TextButton from '../../../../components/TextButton';
import './MembersModal.scss';

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

function MembersModal({ onConfirm, onClose }) {
  const [text, setText] = useState('');
  const [delimiter, setDelimiter] = useState(OPTIONS[0].value);

  const handleTextChange = e => {
    setText(e.target.value);
  };

  const handleDelimiterSelected = option => {
    setDelimiter(option.value);
  };

  const handleSubmit = () => {
    const members = text.split(delimiter);
    onConfirm(members);
  };

  const onTextChange = useCallback(handleTextChange, []);
  const onDelimiterSelected = useCallback(handleDelimiterSelected, []);
  const onSubmit = useCallback(handleSubmit, [text, delimiter]);

  return (
    <div className="members-popup">
      <div className="members-popup__modal">
        <h4 className="modal-title">Import members list</h4>
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

MembersModal.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default MembersModal;
