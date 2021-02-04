import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Button, Switch, TextButton, TextInput, TextLabel } from 'components';
import { groupActions } from 'redux/groups';
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
    let re = /https:\/\/(?:www\.)?(crystalmathlabs|templeosrs)\.com\/(?:tracker\/virtualhiscores\.php\?page=statistics&group=|groups\/(?:stats|overview|members|records)\.php\?id=)(\d+)/;

    let matches = l.match(re) || [];

    if (!matches.length) {
      setGroupId(0);
      setSite('');
      return [null, null];
    }

    const gid = parseInt(matches[2]);
    const shortSite = calcShortName(matches[1]);
    setGroupId(gid);
    setSite(shortSite);

    return [gid, shortSite];
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
    const [gid, name] = validateLink(e.target.value);

    handleFetch(gid, name);
  };

  const toggleReplace = () => {
    setReplace(!replace);
  };

  const handleSubmit = () => {
    onConfirm(usernames, replace);
  };

  const handleFetch = async (groupId, site) => {
    if (!groupId || !site) {
      setUsernames([]);
      return;
    }

    const { payload } =
      site === 'CML'
        ? await dispatch(groupActions.fetchCMLMembers(groupId))
        : await dispatch(groupActions.fetchTempleMembers(groupId));

    if (payload && payload.data) {
      setUsernames(payload.data);
      setText(payload.data.join('\n'));
    }
  };

  const onLinkChange = useCallback(handleLinkChange, [link]);
  const onSwitchChanged = useCallback(toggleReplace, [replace]);
  const onSubmit = useCallback(handleSubmit, [usernames, replace]);

  return (
    <div className="migrate-players">
      <div className="migrate-players__modal">
        <h4 className="modal-title">Migrate from site</h4>
        <TextInput placeholder="Link to CML or TempleOSRS group" onChange={onLinkChange} />
        {usernames.length > 0 && (
          <div>
            <div className="import-info">
              <TextLabel value={`${site} Group ${groupId}`} />
              <TextLabel value={`${usernames.length} Members`} />
            </div>

            <textarea className="modal-text" placeholder="# Imported members" value={text} readOnly />
            <div className="modal-replace">
              <span className="modal-replace__label">Replace existing usernames</span>
              <Switch on={replace} onToggle={onSwitchChanged} />
            </div>
          </div>
        )}

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
