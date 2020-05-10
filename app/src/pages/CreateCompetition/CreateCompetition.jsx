import React, { useMemo, useState, useCallback } from 'react';
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
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
import ImportPlayersModal from '../../modals/ImportPlayersModal';
import VerificationModal from '../../modals/VerificationModal';
import ParticipantsSelector from './components/ParticipantsSelector';
import GroupSelector from './components/GroupSelector';
import { capitalize, getSkillIcon } from '../../utils';
import { SKILLS } from '../../config';
import createCompetitionAction from '../../redux/modules/competitions/actions/create';
import { isCreating } from '../../redux/selectors/competitions';
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

  const isSubmitting = useSelector(state => isCreating(state));

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
  const [showingImportModal, toggleImportModal] = useState(false);
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

  const handleImportModalSubmit = (usernames, replace) => {
    setParticipants(currentParticipants => {
      if (replace) {
        return [..._.uniq(usernames)];
      }

      const existingUsernames = currentParticipants;
      const newUsernames = usernames.filter(u => !existingUsernames.includes(u));

      return [...currentParticipants, ..._.uniq(newUsernames)];
    });

    toggleImportModal(false);
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

  const hideParticipantsModal = useCallback(() => toggleImportModal(false), []);
  const showParticipantsModal = useCallback(() => toggleImportModal(true), []);
  const toggleGroupCompetition = useCallback(handleToggleGroupCompetition, [groupCompetition]);

  const onTitleChanged = useCallback(handleTitleChanged, []);
  const onMetricSelected = useCallback(handleMetricSelected, []);
  const onDateRangeChanged = useCallback(handleDateRangeChanged, []);
  const onParticipantAdded = useCallback(handleAddParticipant, [participants]);
  const onParticipantRemoved = useCallback(handleRemoveParticipant, [participants]);
  const onSubmitParticipantsModal = useCallback(handleImportModalSubmit, []);
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
                <TextButton text="Import list" onClick={showParticipantsModal} />
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
          <Button text="Confirm" onClick={onSubmit} loading={isSubmitting} />
        </div>
      </div>
      {showingImportModal && (
        <ImportPlayersModal onClose={hideParticipantsModal} onConfirm={onSubmitParticipantsModal} />
      )}
      {verificationCode && (
        <VerificationModal
          entity="competition"
          verificationCode={verificationCode}
          onConfirm={onConfirmVerification}
        />
      )}
    </div>
  );
}

export default CreateCompetition;
