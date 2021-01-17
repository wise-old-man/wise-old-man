import React, { useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uniq } from 'lodash';
import { appActions } from 'redux/app';
import { TextButton, ParticipantsSelector, SelectableCard, TeamCard } from 'components';
import { competitionSelectors } from 'redux/competitions';
import { standardize } from 'utils/player';
import ImportPlayersModal from 'modals/ImportPlayersModal';
import TeamComposeModal from 'modals/TeamComposeModal';
import { CreateCompetitionContext } from '../context';

function Step3() {
  const { data, setData } = useContext(CreateCompetitionContext);
  const { type } = data;

  function handleSelectClassic() {
    setData(d => ({ ...d, type: 'classic' }));
  }

  function handleSelectTeam() {
    setData(d => ({ ...d, type: 'team' }));
  }

  return (
    <div className="step3__container">
      <div className="form-row">
        <span className="form-row__label">Competition type</span>
        <div className="cards-container">
          <SelectableCard
            title="Classic competition"
            bodyText="All participants compete against eachother."
            iconUrl="/img/icons/person.svg"
            selected={type === 'classic'}
            onSelected={handleSelectClassic}
          />
          <SelectableCard
            title="Team competition"
            bodyText="Participants are divided into competing teams."
            iconUrl="/img/icons/group.svg"
            selected={type === 'team'}
            onSelected={handleSelectTeam}
          />
        </div>
      </div>
      {type === 'classic' && <ParticipantsSelection />}
      {type === 'team' && <TeamsSelection />}
    </div>
  );
}

function TeamsSelection() {
  const dispatch = useDispatch();

  const [composingTeam, setComposingTeam] = useState(null);
  const [showingTeamComposer, setShowingTeamComposer] = useState(false);

  const { data, setData } = useContext(CreateCompetitionContext);
  const { teams } = data;

  const isEmpty = !teams || teams.length === 0;

  function handleComposeSubmit(team) {
    const hasRepeatedNames = teams
      .filter(t => (composingTeam ? t.name !== composingTeam.name : true))
      .map(t => standardize(t.name))
      .includes(standardize(team.name));

    if (hasRepeatedNames) {
      const errorMessage = 'Failed to add team: Repeated team name';
      dispatch(appActions.showNotification({ type: 'error', text: errorMessage, duration: 3000 }));
      return;
    }

    if (composingTeam) {
      setData(d => ({ ...d, teams: teams.map(t => (t.name === composingTeam.name ? team : t)) }));
    } else {
      setData(d => ({ ...d, teams: [...d.teams, team] }));
    }

    setShowingTeamComposer(false);
  }

  function handleEditTeam(team) {
    setComposingTeam(team);
    setShowingTeamComposer(true);
  }

  function handleDeleteTeam(team) {
    setData(d => ({ ...d, teams: d.teams.filter(t => t.name !== team.name) }));
  }

  useEffect(() => {
    if (!showingTeamComposer) {
      setComposingTeam(null);
    }
  }, [showingTeamComposer]);

  return (
    <>
      <div className="form-row" style={{ marginTop: 30 }}>
        <span className="form-row__label">
          Teams
          <TextButton text="Add new team" onClick={() => setShowingTeamComposer(true)} />
        </span>
        {isEmpty && (
          <span className="no-teams" style={{ marginTop: 20 }}>
            No teams selected, please click the button above to add one.
          </span>
        )}
        <div className="team-selection__container">
          {teams.map(team => (
            <TeamCard
              key={team.name}
              team={team}
              onEditClicked={handleEditTeam}
              onDeleteClicked={handleDeleteTeam}
            />
          ))}
        </div>
      </div>
      {showingTeamComposer && (
        <TeamComposeModal
          team={composingTeam}
          onCancel={() => setShowingTeamComposer(false)}
          onSubmit={handleComposeSubmit}
        />
      )}
    </>
  );
}

function ParticipantsSelection() {
  const { data, setData } = useContext(CreateCompetitionContext);
  const { group, participants } = data;

  const error = useSelector(competitionSelectors.getError);

  const [showingImportModal, setShowingImportModal] = useState(false);

  function handleAddParticipant(username) {
    setData(currentData => {
      if (currentData.participants.map(standardize).includes(standardize(username))) {
        return currentData;
      }

      return {
        ...currentData,
        participants: [...currentData.participants, username]
      };
    });
  }

  function handleRemoveParticipant(username) {
    setData(currentData => {
      return {
        ...currentData,
        participants: currentData.participants.filter(p => p !== username)
      };
    });
  }

  function handleImportModalSubmit(usernames, replace) {
    setData(currentData => {
      if (replace) {
        return { ...currentData, participants: uniq(usernames.map(standardize)) };
      }

      const newUsernames = usernames.filter(
        u => !currentData.participants.map(standardize).includes(standardize(u))
      );

      return { ...currentData, participants: [...currentData.participants, ...uniq(newUsernames)] };
    });

    setShowingImportModal(false);
  }

  return (
    <>
      <div className="form-row">
        <span className="form-row__label">
          Participants
          {!group && <TextButton text="Import list" onClick={() => setShowingImportModal(true)} />}
        </span>
        {group ? (
          <span className="no-teams" style={{ marginTop: 20 }}>
            {`All ${group.name} members will be automatically added as participants.`}
          </span>
        ) : (
          <ParticipantsSelector
            participants={participants}
            invalidUsernames={error.data}
            onParticipantAdded={handleAddParticipant}
            onParticipantRemoved={handleRemoveParticipant}
          />
        )}
      </div>
      {showingImportModal && (
        <ImportPlayersModal
          onClose={() => setShowingImportModal(false)}
          onConfirm={handleImportModalSubmit}
        />
      )}
    </>
  );
}

export default Step3;
