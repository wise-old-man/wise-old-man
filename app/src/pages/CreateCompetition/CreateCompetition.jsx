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
import ParticipantsSelector from '../../components/ParticipantsSelector';
import ImportPlayersModal from '../../modals/ImportPlayersModal';
import VerificationModal from '../../modals/VerificationModal';
import EmptyCompetitionModal from '../../modals/EmptyCompetitionModal';
import GroupSelector from './components/GroupSelector';
import { getMetricIcon, getMetricName } from '../../utils';
import { ALL_METRICS } from '../../config';
import createCompetitionAction from '../../redux/modules/competitions/actions/create';
import { isCreating, getError } from '../../redux/selectors/competitions';
import './CreateCompetition.scss';

function getMetricOptions() {
  return ALL_METRICS.map(metric => ({
    label: getMetricName(metric),
    icon: getMetricIcon(metric, true),
    value: metric
  }));
}

function CreateCompetition() {
  const router = useHistory();
  const dispatch = useDispatch();

  const isSubmitting = useSelector(state => isCreating(state));
  const error = useSelector(state => getError(state));

  const metricOptions = useMemo(getMetricOptions, []);

  const today = useMemo(() => moment().startOf('day'), []);
  const initialStartMoment = useMemo(() => today.clone().add(1, 'days'), [today]);
  const initialEndMoment = useMemo(() => today.clone().add(8, 'days'), [today]);

  const [title, setTitle] = useState('');
  const [metric, setMetric] = useState(metricOptions[0].value);
  const [startDate, setStartDate] = useState(initialStartMoment.toDate());
  const [endDate, setEndDate] = useState(initialEndMoment.toDate());
  const [participants, setParticipants] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupVerificationCode, setGroupVerificationCode] = useState('');

  const [groupCompetition, setGroupCompetition] = useState(false);
  const [showingImportModal, toggleImportModal] = useState(false);
  const [showingEmptyCompetitionModal, toggleEmptyCompetitionModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [createdId, setCreatedId] = useState(-1);

  const selectedMetricIndex = metricOptions.findIndex(o => o.value === metric);

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

  const handleGroupVerificationCodeChanged = e => {
    setGroupVerificationCode(e.target.value);
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
      groupVerificationCode,
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
  const hideEmptyCompetitionModal = useCallback(() => toggleEmptyCompetitionModal(false), []);
  const showEmptyCompetitionModal = useCallback(() => toggleEmptyCompetitionModal(true), []);
  const toggleGroupCompetition = useCallback(handleToggleGroupCompetition, [groupCompetition]);

  const onTitleChanged = useCallback(handleTitleChanged, []);
  const onMetricSelected = useCallback(handleMetricSelected, []);
  const onDateRangeChanged = useCallback(handleDateRangeChanged, []);
  const onGroupVerificationCodeChanged = useCallback(handleGroupVerificationCodeChanged, []);
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
    groupVerificationCode,
    selectedGroup
  ]);

  const isEmpty =
    (!groupCompetition && participants.length === 0) || (groupCompetition && !selectedGroup);

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
          <Selector
            options={metricOptions}
            selectedIndex={selectedMetricIndex}
            onSelect={onMetricSelected}
            search
          />
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
            <>
              <GroupSelector group={selectedGroup} onGroupChanged={setSelectedGroup} />
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
                  placeholder="Ex: 123-456-789"
                  onChange={onGroupVerificationCodeChanged}
                />
              </div>
            </>
          ) : (
            <>
              <span className="form-row__label">
                Participants
                <span className="form-row__label-info">{`(${participants.length} selected)`}</span>
                <TextButton text="Import list" onClick={showParticipantsModal} />
              </span>

              <ParticipantsSelector
                participants={participants}
                invalidUsernames={error.data}
                onParticipantAdded={onParticipantAdded}
                onParticipantRemoved={onParticipantRemoved}
              />
            </>
          )}
        </div>
        <div className="form-row form-actions">
          <Button
            text="Confirm"
            onClick={isEmpty ? showEmptyCompetitionModal : onSubmit}
            loading={isSubmitting}
          />
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
      {showingEmptyCompetitionModal && (
        <EmptyCompetitionModal onConfirm={onSubmit} onClose={hideEmptyCompetitionModal} />
      )}
    </div>
  );
}

export default CreateCompetition;
