import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { Helmet } from 'react-helmet';
import { PageTitle, Button, FormSteps } from 'components';
import { competitionActions, competitionSelectors } from 'redux/competitions';
import { groupActions } from 'redux/groups';
import { useQuery } from 'hooks';
import VerificationModal from 'modals/VerificationModal';
import CustomConfirmationModal from 'modals/CustomConfirmationModal';
import { Step1, Step2, Step3 } from './containers';
import { CreateCompetitionContext } from './context';
import './CreateCompetition.scss';

const STEP_COUNT = 3;

function CreateCompetition() {
  const router = useHistory();
  const dispatch = useDispatch();

  const { groupId } = useQuery();

  const today = useMemo(() => moment().startOf('day'), []);
  const start = useMemo(() => today.clone().add(1, 'days'), [today]);
  const end = useMemo(() => today.clone().add(8, 'days'), [today]);

  const isSubmitting = useSelector(competitionSelectors.isCreating);

  const [data, setData] = useState(getDefaultState(start, end));
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(1);

  const onFetch = useCallback(handleGroupFetch, []);

  async function handleGroupFetch() {
    const { payload } = await dispatch(groupActions.fetchDetails(groupId));

    if (payload && payload.data) {
      setData(d => ({ ...d, groupCompetition: true, group: payload.data }));
    }
  }

  async function handleSubmit() {
    const isGroupCompetition = data.groupCompetition && data.group;
    const isTeamCompetition = data.type === 'team' && data.teams.length > 0;

    const { payload } = await dispatch(
      competitionActions.create(
        data.title,
        data.metric,
        data.startDate,
        data.endDate,
        isGroupCompetition ? null : data.participants,
        isGroupCompetition ? data.groupVerificationCode : null,
        isGroupCompetition ? data.group.id : null,
        isTeamCompetition ? data.teams : null
      )
    );

    if (payload && payload.data) {
      setResult(payload.data);
    }
  }

  function handleRedirect() {
    router.push(`/competitions/${result.id}`);
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

  useEffect(() => {
    onFetch();
  }, [dispatch, groupId, onFetch]);

  return (
    <CreateCompetitionContext.Provider value={{ data, setData }}>
      <div className="create-competition__container container">
        <Helmet>
          <title>Create new competition</title>
        </Helmet>
        <div className="col">
          <PageTitle title="Create competition" />
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
        {result && !result.groupId && (
          <VerificationModal
            entity="competition"
            verificationCode={result.verificationCode}
            onConfirm={handleRedirect}
          />
        )}
        {result && result.groupId && (
          <CustomConfirmationModal
            title="Verification code"
            message="To edit this competition in the future, please use your group verification code on submission."
            onConfirm={handleRedirect}
          />
        )}
      </div>
    </CreateCompetitionContext.Provider>
  );
}

function getDefaultState(start, end) {
  return {
    title: '',
    metric: 'overall',
    startDate: start.toDate(),
    endDate: end.toDate(),
    type: null,
    group: null,
    groupCompetition: false,
    groupVerificationCode: '',
    participants: [],
    teams: []
  };
}

function canSkipStep(data, step) {
  const {
    title,
    startDate,
    endDate,
    type,
    groupCompetition,
    group,
    groupVerificationCode,
    participants,
    teams
  } = data;

  if (step === 1) {
    return title.length > 0 && startDate && endDate;
  }

  if (step === 2) {
    return !groupCompetition || (group && groupVerificationCode.length > 0);
  }

  if (step === 3) {
    if (type === 'classic' && group) return true;
    return type && type === 'classic' ? participants.length > 1 : teams.length > 1;
  }

  return true;
}

export default CreateCompetition;
