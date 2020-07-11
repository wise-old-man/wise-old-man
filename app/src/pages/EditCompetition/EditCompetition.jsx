import React, { useEffect, useMemo, useState, useCallback } from 'react';
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import moment from 'moment';
import PageTitle from '../../components/PageTitle';
import TextInput from '../../components/TextInput';
import TextButton from '../../components/TextButton';
import Selector from '../../components/Selector';
import Button from '../../components/Button';
import DateRangeSelector from '../../components/DateRangeSelector';
import ParticipantsSelector from '../../components/ParticipantsSelector';
import ImportPlayersModal from '../../modals/ImportPlayersModal';
import { getMetricIcon, getMetricName } from '../../utils';
import { ALL_METRICS } from '../../config';
import fetchDetailsAction from '../../redux/modules/competitions/actions/fetchDetails';
import editAction from '../../redux/modules/competitions/actions/edit';
import { getCompetition, isEditing, getError } from '../../redux/selectors/competitions';
import './EditCompetition.scss';

function getMetricOptions() {
  return ALL_METRICS.map(metric => ({
    label: getMetricName(metric),
    icon: getMetricIcon(metric, true),
    value: metric
  }));
}

function EditCompetition() {
  const { id } = useParams();
  const router = useHistory();
  const dispatch = useDispatch();

  const metricOptions = useMemo(getMetricOptions, []);

  const today = useMemo(() => moment().startOf('day'), []);
  const initialStartMoment = useMemo(() => today.clone().add(1, 'days'), [today]);
  const initialEndMoment = useMemo(() => today.clone().add(8, 'days'), [today]);

  const [title, setTitle] = useState('');
  const [metric, setMetric] = useState(metricOptions[0].value);
  const [startDate, setStartDate] = useState(initialStartMoment.toDate());
  const [endDate, setEndDate] = useState(initialEndMoment.toDate());
  const [participants, setParticipants] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');

  const [showingImportModal, toggleImportModal] = useState(false);

  const competition = useSelector(state => getCompetition(state, parseInt(id, 10)));
  const isSubmitting = useSelector(state => isEditing(state));
  const error = useSelector(state => getError(state));

  const selectedMetricIndex = metricOptions.findIndex(o => o.value === metric);

  const fetchDetails = () => {
    dispatch(fetchDetailsAction(id));
  };

  // Populate all the editable fields
  const populate = () => {
    if (competition) {
      setTitle(competition.title);
      setMetric(competition.metric);
      setStartDate(competition.startsAt);
      setEndDate(competition.endsAt);
      setParticipants(competition.participants.map(p => p.displayName));
    }
  };

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
    setParticipants(p =>
      p.map(f => f.toLowerCase()).includes(username.toLowerCase()) ? p : [...p, username]
    );
  };

  const handleRemoveParticipant = username => {
    setParticipants(ps => [...ps.filter(p => p !== username)]);
  };

  const handleVerificationCodeChanged = e => {
    setVerificationCode(e.target.value);
  };

  const handleSubmit = async () => {
    const formData = {
      title,
      metric,
      startDate,
      endDate,
      participants,
      verificationCode
    };

    dispatch(editAction(competition.id, formData)).then(a => {
      if (a && a.competition) {
        router.push(`/competitions/${competition.id}`);
      }
    });
  };

  const handleImportModalSubmit = (usernames, replace) => {
    setParticipants(currentParticipants => {
      if (replace) {
        return [..._.uniq(usernames)];
      }

      const existingUsernames = currentParticipants.map(e => e.toLowerCase());
      const newUsernames = usernames.filter(u => !existingUsernames.includes(u.toLowerCase()));

      return [...currentParticipants, ..._.uniq(newUsernames)];
    });

    toggleImportModal(false);
  };

  const hideParticipantsModal = useCallback(() => toggleImportModal(false), []);
  const showParticipantsModal = useCallback(() => toggleImportModal(true), []);

  const onTitleChanged = useCallback(handleTitleChanged, []);
  const onMetricSelected = useCallback(handleMetricSelected, []);
  const onDateRangeChanged = useCallback(handleDateRangeChanged, []);
  const onParticipantAdded = useCallback(handleAddParticipant, [participants]);
  const onParticipantRemoved = useCallback(handleRemoveParticipant, [participants]);
  const onVerificationCodeChanged = useCallback(handleVerificationCodeChanged, []);
  const onSubmitImportModal = useCallback(handleImportModalSubmit, []);
  const onSubmit = useCallback(handleSubmit, [
    title,
    metric,
    startDate,
    endDate,
    participants,
    verificationCode
  ]);

  // Fetch competition details, on mount
  useEffect(fetchDetails, [dispatch, id]);
  useEffect(populate, [competition]);

  if (!competition) {
    return null;
  }

  return (
    <div className="edit-competition__container container">
      <Helmet>
        <title>{`Edit: ${competition.title}`}</title>
      </Helmet>

      <div className="col">
        <PageTitle title="Edit competition" />

        <div className="form-row">
          <span className="form-row__label">Title</span>
          <TextInput
            value={title}
            placeholder="Ex: Varrock Titan's firemaking comp"
            onChange={onTitleChanged}
          />
        </div>

        <div className="form-row">
          <span className="form-row__label">Metric</span>
          <Selector
            options={metricOptions}
            onSelect={onMetricSelected}
            selectedIndex={selectedMetricIndex}
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
        </div>

        {competition.createdAt < new Date('2020-07-11 00:00') && (
          <div className="warning">
            <b>Attention:</b>
            As of the 11th of July, group competitions use the group&quot;s verification code, and not
            the competition verification code you were given when you created it.
          </div>
        )}

        <div className="form-row">
          <span className="form-row__label">
            {competition.groupId ? 'Group verification code' : 'Verification code'}
            <span className="form-row__label-info -right">
              {`Lost your${competition.groupId ? ' group' : ''} verification code?`}
              <a href="https://wiseoldman.net/discord" target="_blank" rel="noopener noreferrer">
                Join our discord
              </a>
            </span>
          </span>
          <TextInput
            type="password"
            placeholder="Ex: 123-456-789"
            onChange={onVerificationCodeChanged}
          />
        </div>

        <div className="form-row form-actions">
          <Button text="Confirm" onClick={onSubmit} loading={isSubmitting} />
        </div>
      </div>
      {showingImportModal && (
        <ImportPlayersModal onClose={hideParticipantsModal} onConfirm={onSubmitImportModal} />
      )}
    </div>
  );
}

export default EditCompetition;
