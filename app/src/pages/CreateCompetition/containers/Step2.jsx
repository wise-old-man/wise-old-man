import React, { useContext } from 'react';
import { Switch, TextInput, GroupSelector } from 'components';
import { CreateCompetitionContext } from '../context';

function Step2() {
  const { data, setData } = useContext(CreateCompetitionContext);
  const { group, groupCompetition, groupVerificationCode } = data;

  function toggleGroupCompetition() {
    setData(d => ({ ...d, groupCompetition: !groupCompetition }));
  }

  function handleGroupSelected(newGroup) {
    setData(d => ({ ...d, group: newGroup }));
  }

  function handleGroupCodeChanged(e) {
    const newCode = e.target.value;
    setData(d => ({ ...d, groupVerificationCode: newCode }));
  }

  return (
    <div className="step2__container">
      <div className="form-row">
        <b className="info-title">Group competitions</b>
        <p className="info-body">
          If you associate your group to this competition, all your group members will be automatically
          synced up with this competition’s participants.
          <br />
          <br />
          You can also edit/delete the competition using the group’s master verification code, which
          helps with management.
        </p>
      </div>
      <div className="form-row">
        <span className="form-row__label">Is this a group competition?</span>
        <div className="group-toggle">
          <Switch on={groupCompetition} onToggle={toggleGroupCompetition} />
          <span className="group-toggle__label">{groupCompetition ? 'Yes' : 'No'}</span>
        </div>
      </div>
      <div className="form-row">
        {groupCompetition && (
          <>
            <GroupSelector group={group} onGroupChanged={handleGroupSelected} />
            <div className="form-row">
              <span className="form-row__label">
                Group Verification code
                <span className="form-row__label-info -right">
                  Lost your verification code?
                  <a href="https://wiseoldman.net/discord" target="_blank" rel="noopener noreferrer">
                    Join our discord
                  </a>
                </span>
              </span>
              <TextInput
                type="password"
                value={groupVerificationCode}
                placeholder="Ex: 123-456-789"
                onChange={handleGroupCodeChanged}
                disabled={!group}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Step2;
