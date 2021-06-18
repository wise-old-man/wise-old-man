import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { Helmet } from 'react-helmet';
import { PageTitle, Button, FormSteps, Loading } from 'components';
import { competitionActions, competitionSelectors } from 'redux/competitions';
import { standardize } from 'utils';
import RemovePlayersModal from 'modals/RemovePlayersModal';
import { Step1, Step2, Step3 } from './containers';
import { EditCompetitionContext } from './context';
import './EditCompetition.scss';

const STEP_COUNT = 3;

function EditCompetition() {
  const router = useHistory();
  const params = useParams();
  const dispatch = useDispatch();

  const id = parseInt(params.id, 10);

  const today = useMemo(() => moment().startOf('day'), []);
  const start = useMemo(() => today.clone().add(1, 'days'), [today]);
  const end = useMemo(() => today.clone().add(8, 'days'), [today]);

  const competition = useSelector(competitionSelectors.getCompetition(id));
  const isSubmitting = useSelector(competitionSelectors.isEditing);

  const [data, setData] = useState(getDefaultState(start, end));
  const [removedPlayers, setRemovedPlayers] = useState([]);
  const [step, setStep] = useState(1);

  const fetchDetails = () => {
    dispatch(competitionActions.fetchDetails(id));
  };

  // Populate all the editable fields
  const populate = () => {
    if (competition) {
      const { title, metric, type, startsAt, endsAt, groupId, participants, teams } = competition;

      const formatParticipant = p => p.displayName;
      const formatTeam = t => ({ ...t, participants: t.participants.map(formatParticipant) });

      setData(d => ({
        ...d,
        title,
        metric,
        startDate: startsAt,
        endDate: endsAt,
        groupCompetition: !!groupId,
        type,
        participants: type === 'classic' ? participants.map(formatParticipant) : [],
        teams: type === 'team' ? teams.map(formatTeam) : []
      }));
    }
  };

  async function handleSubmit(skipRemovedCheck = false) {
    const removedParticipants = competition.participants
      .map(m => m.displayName)
      .filter(m => !data.participants.find(c => standardize(m) === standardize(c)));

    if (
      !skipRemovedCheck &&
      competition.type === 'classic' &&
      removedParticipants &&
      removedParticipants.length > 0
    ) {
      setRemovedPlayers(removedParticipants);
      return;
    }

    setRemovedPlayers([]);

    const { payload } = await dispatch(
      competitionActions.edit(
        competition.id,
        data.title,
        data.metric,
        data.startDate,
        data.endDate,
        data.participants,
        data.teams,
        data.verificationCode
      )
    );

    if (payload && !payload.error) {
      router.push(`/competitions/${competition.id}`);
    }
  }

  function previousStep() {
    setStep(step - 1);
  }

  function nextStep() {
    if (step < STEP_COUNT) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  }

  // Fetch competition details, on mount
  useEffect(fetchDetails, [dispatch, id]);
  useEffect(populate, [competition]);

  if (!competition) {
    return <Loading />;
  }

  return (
    <EditCompetitionContext.Provider value={{ data, setData }}>
      <div className="edit-competition__container container">
        <Helmet>
          <title>Edit competition</title>
        </Helmet>
        <div className="col">
          <PageTitle title={`Edit competition: ${competition.title}`} />
          <FormSteps steps={STEP_COUNT} currentIndex={step - 1} />

          {step === 1 && <Step1 />}
          {step === 2 && <Step2 />}
          {step === 3 && <Step3 />}

          <div className="form-row form-actions">
            <Button text="Previous" onClick={previousStep} disabled={step <= 1} />
            <Button
              text="Next"
              onClick={nextStep}
              loading={isSubmitting}
              disabled={!canSkipStep(data, step)}
            />
          </div>
        </div>
        {removedPlayers && removedPlayers.length > 0 && (
          <RemovePlayersModal
            modalView={`/competitions/${competition.id}/removeParticipants`}
            players={removedPlayers}
            onClose={() => setRemovedPlayers([])}
            onConfirm={() => handleSubmit(true)}
          />
        )}
      </div>
    </EditCompetitionContext.Provider>
  );
}

function getDefaultState(start, end) {
  return {
    title: '',
    metric: 'overall',
    startDate: start.toDate(),
    endDate: end.toDate(),
    type: null,
    groupCompetition: false,
    verificationCode: '',
    participants: [],
    teams: []
  };
}

function canSkipStep(data, step) {
  const { title, startDate, endDate, type, verificationCode, participants, teams } = data;

  if (step === 1) {
    return title.length > 0 && startDate && endDate;
  }

  if (step === 2) {
    return type && type === 'classic' ? participants.length > 1 : teams.length > 1;
  }

  if (step === 3) {
    return verificationCode.length > 0;
  }

  return true;
}

export default EditCompetition;
