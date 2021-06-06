import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
import { useDispatch } from 'react-redux';
import { Button, Switch, TextButton, TextInput } from 'components';
import { groupActions } from 'redux/groups';
import './MigratePlayersModal.scss';

const REGEX = /https:\/\/(?:www\.)?(crystalmathlabs|templeosrs)\.com\/(?:tracker\/virtualhiscores\.php\?page=statistics&group=|groups\/(?:stats|overview|members|records)\.php\?id=)(\d+)/;

function MigratePlayersModal({ onConfirm, onClose }) {
  const dispatch = useDispatch();

  const [replace, setReplace] = useState(false);
  const [players, setPlayers] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [name, setName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);

  const handleLinkChange = e => {
    const group = validateLink(e.target.value);

    if (group) {
      setSelectedGroup(group);
    }
  };

  // Debounce input keystrokes by 500ms
  const handleFetch = debounce(async () => {
    if (!selectedGroup) return;

    const { payload } =
      selectedGroup.site === 'CML'
        ? await dispatch(groupActions.fetchCMLMembers(selectedGroup.groupId))
        : await dispatch(groupActions.fetchTempleMembers(selectedGroup.groupId));

    if (!payload || !payload.data) return;

    const { data } = payload;

    setPlayers(data.members || []);
    setLeaders(data.leaders || []);
    setName(data.name || '');
  }, 500);

  const toggleReplace = () => {
    setReplace(!replace);
  };

  const handleSubmit = () => {
    onConfirm(players, leaders, replace);
  };

  useEffect(handleFetch, [selectedGroup]);

  return (
    <div className="migrate-players">
      <div className="migrate-players__modal">
        <h4 className="modal-title">Migrate from site</h4>
        <TextInput placeholder="Link to CML or TempleOSRS group" onChange={handleLinkChange} />
        {(players.length > 0 || leaders.length > 0) && (
          <div>
            <div className="import-info">
              <span className="group-name">
                {name || `${selectedGroup.site} Group ${selectedGroup.groupId}`}
              </span>
              <span className="member-stats">
                {`${players.length} Members | ${leaders.length} Leaders`}
              </span>
            </div>
            <textarea
              className="modal-text"
              placeholder="# Imported members"
              value={[...leaders, ...players].join('\n')}
              readOnly
            />
            <div className="modal-replace">
              <span className="modal-replace__label">Replace existing usernames</span>
              <Switch on={replace} onToggle={toggleReplace} />
            </div>
          </div>
        )}
        <div className="modal-actions">
          <TextButton text="Cancel" onClick={onClose} />
          <Button text="Confirm" onClick={handleSubmit} />
        </div>
      </div>
    </div>
  );
}

function validateLink(link) {
  const matches = link.match(REGEX) || [];

  if (!matches.length) {
    return null;
  }

  const groupId = parseInt(matches[2], 10);
  const site = getShortName(matches[1]);

  return { link, site, groupId };
}

function getShortName(name) {
  switch (name) {
    case 'crystalmathlabs':
      return 'CML';
    case 'templeosrs':
      return 'TempleOSRS';
    default:
      return '';
  }
}

MigratePlayersModal.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default MigratePlayersModal;
