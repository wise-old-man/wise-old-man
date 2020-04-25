import React, { useMemo, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import moment from 'moment';
import PageTitle from '../../components/PageTitle';
import TextInput from '../../components/TextInput';
import Switch from '../../components/Switch';
import TextButton from '../../components/TextButton';
import Selector from '../../components/Selector';
import Button from '../../components/Button';
import DateRangeSelector from '../../components/DateRangeSelector';
import ParticipantsSelector from './components/ParticipantsSelector';
import GroupSelector from './components/GroupSelector';
import ParticipantsPopup from './components/ParticipantsPopup';
import VerificationPopup from './components/VerificationPopup';
import { capitalize, getSkillIcon } from '../../utils';
import { SKILLS } from '../../config';
import createCompetitionAction from '../../redux/modules/competitions/actions/create';
import './CreateCompetition.scss';

function getMetricOptions() {
  return [
    ...SKILLS.map(skill => ({
      label: capitalize(skill),
      icon: getSkillIcon(skill, true),
      value: skill
    }))
  ];
}

function CreateCompetition() {
  const router = useHistory();
  const dispatch = useDispatch();

  const metricOptions = useMemo(getMetricOptions, [SKILLS]);

  const today = useMemo(() => moment().startOf('day'), []);
  const initialStartMoment = useMemo(() => today.clone().add(1, 'days'), [today]);
  const initialEndMoment = useMemo(() => today.clone().add(8, 'days'), [today]);

  const [title, setTitle] = useState('');
  const [metric, setMetric] = useState(metricOptions[0].value);
  const [startDate, setStartDate] = useState(initialStartMoment.toDate());
  const [endDate, setEndDate] = useState(initialEndMoment.toDate());
  const [participants, setParticipants] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [groupCompetition, setGroupCompetition] = useState(false);
  const [showingImportPopup, toggleImportPopup] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [createdId, setCreatedId] = useState(-1);

  const handleTitleChanged = e => {
    setTitle(e.target.value);
  };

  const handleMetricSelected = e => {
    setMetric((e && e.value) || null);
  };

  const handleDateRangeChanged = dates => {
    setStartDate(dates[0]);
    setEndDate(dates[1]);
  };

  const handleAddParticipant = username => {
    setParticipants(p => (p.includes(username) ? p : [...p, username]));
  };

  const handleRemoveParticipant = username => {
    setParticipants(ps => [...ps.filter(p => p !== username)]);
  };

  const handlePopupSubmit = usernames => {
    setParticipants(usernames);
    toggleImportPopup(false);
  };

  const handleConfirmVerification = () => {
    router.push(`/competitions/${createdId}`);
  };

  const handleSubmit = async () => {
    const formData = {
      title,
      metric,
      startDate,
      endDate,
      participants: !groupCompetition ? participants : null,
      groupId: groupCompetition && selectedGroup ? selectedGroup.id : null
    };

    dispatch(createCompetitionAction(formData)).then(a => {
      if (a && a.competition) {
        setVerificationCode(a.competition.verificationCode);
        setCreatedId(a.competition.id);
      }
    });
  };

  const handleToggleGroupCompetition = () => {
    setGroupCompetition(!groupCompetition);
  };

  const hideParticipantsPopup = useCallback(() => toggleImportPopup(false), []);
  const showParticipantsPopup = useCallback(() => toggleImportPopup(true), []);
  const toggleGroupCompetition = useCallback(handleToggleGroupCompetition, [groupCompetition]);

  const onTitleChanged = useCallback(handleTitleChanged, []);
  const onMetricSelected = useCallback(handleMetricSelected, []);
  const onDateRangeChanged = useCallback(handleDateRangeChanged, []);
  const onParticipantAdded = useCallback(handleAddParticipant, [participants]);
  const onParticipantRemoved = useCallback(handleRemoveParticipant, [participants]);
  const onSubmitParticipantsPopup = useCallback(handlePopupSubmit, []);
  const onConfirmVerification = useCallback(handleConfirmVerification, [createdId]);

  const onSubmit = useCallback(handleSubmit, [
    title,
    metric,
    startDate,
    endDate,
    participants,
    groupCompetition,
    selectedGroup
  ]);

  return (
    <div className="create-competition__container container">
      <Helmet>
        <title>Creat new competition</title>
      </Helmet>

      <div className="col">
        <PageTitle title="Create new competition" />

        <div className="form-row">
          <span className="form-row__label">Title</span>
          <TextInput placeholder="Ex: Varrock Titan's firemaking comp" onChange={onTitleChanged} />
        </div>

        <div className="form-row">
          <span className="form-row__label">Metric</span>
          <Selector options={metricOptions} onSelect={onMetricSelected} />
        </div>

        <div className="form-row">
          <span className="form-row__label">Time range</span>
          <DateRangeSelector start={startDate} end={endDate} onRangeChanged={onDateRangeChanged} />
        </div>

        <div className="form-row">
          <hr />
        </div>

        <div className="form-row">
          <div className="group-toggle">
            <Switch on={groupCompetition} onToggle={toggleGroupCompetition} />
            <span className="group-toggle__label">Group competition</span>
          </div>

          {groupCompetition ? (
            <GroupSelector group={selectedGroup} onGroupChanged={setSelectedGroup} />
          ) : (
            <>
              <span className="form-row__label">
                Participants
                <span className="form-row__label-info">{`(${participants.length} selected)`}</span>
                <TextButton text="Import list" onClick={showParticipantsPopup} />
              </span>

              <ParticipantsSelector
                participants={participants}
                onParticipantAdded={onParticipantAdded}
                onParticipantRemoved={onParticipantRemoved}
              />
            </>
          )}
        </div>

        <div className="form-row form-actions">
          <Button text="Confirm" onClick={onSubmit} />
        </div>
      </div>
      {showingImportPopup && (
        <ParticipantsPopup onClose={hideParticipantsPopup} onConfirm={onSubmitParticipantsPopup} />
      )}
      {verificationCode && (
        <VerificationPopup verificationCode={verificationCode} onConfirm={onConfirmVerification} />
      )}
    </div>
  );
}

export default CreateCompetition;
