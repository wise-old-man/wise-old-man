import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Selector, Button, Switch, TextButton, TextInput } from 'components';
import { groupActions, groupSelectors } from 'redux/groups';
import './MigratePlayersModal.scss';

function MigratePlayersModal({ onConfirm, onClose }) {
  const [text, setText] = useState('');
  const [usernames, setUsernames] = useState([]);
  const [link, setLink] = useState('');
  const [site, setSite] = useState('');
  const [replace, setReplace] = useState(false);
  const [groupId, setGroupId] = useState(0);
  const dispatch = useDispatch();

  const validateLink = l => {
    let re = /https:\/\/(?:www\.)?(crystalmathlabs|templeosrs)\.com\/(?:tracker\/virtualhiscores\.php\?page=statistics&group=|groups\/(?:stats|overview|members)\.php\?id=)(\d+)/;

    let matches = l.match(re) || [];

    if (!matches.length) {
      setGroupId(0);
      return;
    }

    const gid = parseInt(matches[2]);
    const shortSite = calcShortName(matches[1]);
    setGroupId(gid);
    setSite(shortSite);
  };

  const calcShortName = s => {
    switch (s) {
      case 'crystalmathlabs':
        return 'CML';
      case 'templeosrs':
        return 'TempleOSRS';
      default:
        return '';
    }
  };

  const handleLinkChange = e => {
    setLink(e.target.value);
    validateLink(e.target.value);
  };

  const toggleReplace = () => {
    setReplace(!replace);
  };

  const handleSubmit = () => {
    onConfirm(usernames, replace);
  };

  const handleFetch = async () => {
    console.log(groupId);
    const { payload } = await dispatch(groupActions.fetchTempleMembers(groupId));

    if (payload && payload.data) {
      setUsernames(payload.data);
      setText(payload.data.join('\n'));
      console.log(payload.data);
    }
  };

  const onLinkChange = useCallback(handleLinkChange, [link, groupId, site, usernames]);
  const onSwitchChanged = useCallback(toggleReplace, [replace]);
  const onSubmit = useCallback(handleSubmit, [usernames, replace]);
  const onImport = useCallback(handleFetch, [groupId, text]);

  return (
    <div className="migrate-players">
      <div className="migrate-players__modal">
        <h4 className="modal-title">Migrate from site</h4>
        <TextInput placeholder="Link to group" onChange={onLinkChange} />
        <div className="import-actions">
          <TextButton text={`${site} Group ${groupId || ''}`} />
          <Button text="Import" onClick={onImport} />
        </div>
        <textarea className="modal-text" placeholder="# Imported members" value={text} readOnly />
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

MigratePlayersModal.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default MigratePlayersModal;
