import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import * as playerActions from 'redux/players/actions';
import * as playerSelectors from 'redux/players/selectors';
import * as competitionActions from 'redux/competitions/actions';
import * as competitionSelectors from 'redux/competitions/selectors';
import Loading from '../../components/Loading';
import PageHeader from '../../components/PageHeader';
import LineChart from '../../components/LineChart';
import Dropdown from '../../components/Dropdown';
import Button from '../../components/Button';
import Tabs from '../../components/Tabs';
import DeleteCompetitionModal from '../../modals/DeleteCompetitionModal';
import CompetitionTable from './components/CompetitionTable';
import CompetitionInfo from './components/CompetitionInfo';
import TotalGainedWidget from './components/TotalGainedWidget';
import TopPlayerWidget from './components/TopPlayerWidget';
import CountdownWidget from './components/CountdownWidget';
import './Competition.scss';

const TABS = ['Progress Table', 'Top 5 progress chart'];

function getMenuOptions(competition) {
  if (!competition) {
    return [];
  }

  if (competition.status === 'finished') {
    return [
      {
        label: 'Delete competition',
        value: 'delete'
      }
    ];
  }

  return [
    {
      label: 'Edit competition',
      value: 'edit'
    },
    {
      label: 'Delete competition',
      value: 'delete'
    }
  ];
}

function Competition() {
  const { id, section } = useParams();
  const router = useHistory();
  const dispatch = useDispatch();

  const competitionId = parseInt(id, 10);
  const selectedSectionIndex = section && section === 'chart' ? 1 : 0;

  // State variables
  const [showingDeleteModal, setShowingDeleteModal] = useState(false);
  const [isButtonDisabled, setButtonDisabled] = useState(false);

  // Memoized redux variables
  const isLoading = useSelector(competitionSelectors.isFetchingDetails);
  const competition = useSelector(state => competitionSelectors.getCompetition(state, competitionId));
  const chartData = useSelector(state => competitionSelectors.getChartData(state, competitionId));
  const updatingUsernames = useSelector(playerSelectors.getUpdatingUsernames);

  const fetchDetails = () => {
    // Attempt to fetch competition of that id, if it fails redirect to 404
    dispatch(competitionActions.fetchDetails(competitionId)).then(action => {
      if (typeof action.payload === 'string') {
        router.push('/404');
      }
    });
  };

  const handleUpdatePlayer = username => {
    dispatch(playerActions.trackPlayer(username));
  };

  const handleUpdateAll = () => {
    dispatch(competitionActions.updateAll(id));
    setButtonDisabled(true);
  };

  const getSelectedTabUrl = i => {
    if (i === 1) {
      return `/competitions/${id}/chart`;
    }

    return `/competitions/${id}`;
  };

  const handleDeleteModalClosed = () => {
    setShowingDeleteModal(false);
  };

  const handleOptionSelected = option => {
    if (option.value === 'delete') {
      setShowingDeleteModal(true);
    } else {
      const URL = `/competitions/${competition.id}/${option.value}`;
      router.push(URL);
    }
  };

  // Memoized callbacks
  const onUpdatePlayer = useCallback(handleUpdatePlayer, [id, dispatch]);
  const onUpdateAllClicked = useCallback(handleUpdateAll, [id, dispatch]);
  const onOptionSelected = useCallback(handleOptionSelected, [router, competition]);
  const onDeleteModalClosed = useCallback(handleDeleteModalClosed, []);

  const menuOptions = useMemo(() => getMenuOptions(competition), [competition]);

  // Fetch competition details, on mount
  useEffect(fetchDetails, [dispatch, id]);

  if (!competition) {
    return <Loading />;
  }

  return (
    <div className="competition__container container">
      <Helmet>
        <title>{competition.title}</title>
      </Helmet>
      <div className="competition__header row">
        <div className="col">
          <PageHeader title={competition.title}>
            {competition.status !== 'finished' && (
              <Button text="Update all" onClick={onUpdateAllClicked} disabled={isButtonDisabled} />
            )}
            <Dropdown options={menuOptions} onSelect={onOptionSelected}>
              <button className="header__options-btn" type="button">
                <img src="/img/icons/options.svg" alt="" />
              </button>
            </Dropdown>
          </PageHeader>
        </div>
      </div>
      <div className="competition__widgets row">
        <div className="col-md-4">
          <span className="widget-label">
            {competition.status === 'upcoming' ? 'Starting in' : 'Time Remaining'}
          </span>
          <CountdownWidget competition={competition} />
        </div>
        <div className="col-md-4 col-sm-6">
          <span className="widget-label">Top Player</span>
          <TopPlayerWidget competition={competition} />
        </div>
        <div className="col-md-4 col-sm-6">
          <span className="widget-label">Total Gained</span>
          <TotalGainedWidget competition={competition} />
        </div>
      </div>
      <div className="competition__content row">
        <div className="col-md-4">
          <CompetitionInfo competition={competition} />
        </div>
        <div className="col-md-8">
          <Tabs tabs={TABS} selectedIndex={selectedSectionIndex} urlSelector={getSelectedTabUrl} />
          {selectedSectionIndex === 0 ? (
            <CompetitionTable
              competition={competition}
              updatingUsernames={updatingUsernames}
              onUpdateClicked={onUpdatePlayer}
              isLoading={isLoading}
            />
          ) : (
            <LineChart datasets={chartData} />
          )}
        </div>
      </div>
      {showingDeleteModal && competition && (
        <DeleteCompetitionModal competition={competition} onCancel={onDeleteModalClosed} />
      )}
    </div>
  );
}

export default Competition;
