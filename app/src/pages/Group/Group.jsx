import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { hiscoresActions, hiscoresSelectors } from 'redux/hiscores';
import { recordActions, recordSelectors } from 'redux/records';
import { deltasActions, deltasSelectors } from 'redux/deltas';
import { achievementActions, achievementSelectors } from 'redux/achievements';
import { competitionActions, competitionSelectors } from 'redux/competitions';
import { groupActions, groupSelectors } from 'redux/groups';
import Loading from '../../components/Loading';
import PageHeader from '../../components/PageHeader';
import Selector from '../../components/Selector';
import Dropdown from '../../components/Dropdown';
import Button from '../../components/Button';
import Tabs from '../../components/Tabs';
import DeleteGroupModal from '../../modals/DeleteGroupModal';
import TopPlayerWidget from './components/TopPlayerWidget';
import TotalExperienceWidget from './components/TotalExperienceWidget';
import TotalEHPWidget from './components/TotalEHPWidget';
import CompetitionWidget from './components/CompetitionWidget';
import GroupCompetitions from './components/GroupCompetitions';
import GroupHiscores from './components/GroupHiscores';
import GroupDeltas from './components/GroupDeltas';
import GroupRecords from './components/GroupRecords';
import GroupAchievements from './components/GroupAchievements';
import GroupStatistics from './components/GroupStatistics';
import GroupInfo from './components/GroupInfo';
import MembersTable from './components/MembersTable';
import { ALL_METRICS } from '../../config';
import { getMetricName, getMetricIcon } from '../../utils';
import './Group.scss';

const PERIOD_OPTIONS = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' }
];

const VERIFIED_BADGE = {
  text: 'Verified',
  hoverText: "Verified group: This group's leader is verified on our Discord server."
};

const TABS = ['Members', 'Competitions', 'Hiscores', 'Gained', 'Records', 'Achievements', 'Statistics'];

const MENU_OPTIONS = [
  {
    label: 'Edit group',
    value: 'edit'
  },
  {
    label: 'Delete group',
    value: 'delete'
  }
];

function getMetricOptions() {
  return ALL_METRICS.map(metric => ({
    label: getMetricName(metric),
    icon: getMetricIcon(metric, true),
    value: metric
  }));
}

function getSelectedTabIndex(section) {
  const index = TABS.findIndex(t => section && section === t.toLowerCase());
  return Math.max(0, index);
}

function Group() {
  const { id, section } = useParams();
  const router = useHistory();
  const dispatch = useDispatch();

  const groupId = parseInt(id, 10);
  const selectedSectionIndex = getSelectedTabIndex(section);

  const [selectedMetric, setSelectedMetric] = useState(ALL_METRICS[0]);
  const [selectedPeriod, setSelectedPeriod] = useState(PERIOD_OPTIONS[1].value);
  const [showingDeleteModal, setShowingDeleteModal] = useState(false);
  const [isButtonDisabled, setButtonDisabled] = useState(false);

  const selectedMetricIndex = ALL_METRICS.indexOf(selectedMetric);
  const selectedPeriodIndex = PERIOD_OPTIONS.findIndex(p => p.value === selectedPeriod);

  const isLoadingMembers = useSelector(groupSelectors.isFetchingMembers);
  const isLoadingMonthlyTop = useSelector(groupSelectors.isFetchingMonthlyTop);
  const isLoadingStatistics = useSelector(groupSelectors.isFetchingStatistics);
  const isLoadingAchievements = useSelector(achievementSelectors.isFetchingGroupAchievements);
  const isLoadingHiscores = useSelector(hiscoresSelectors.isFetching);
  const isLoadingDeltas = useSelector(deltasSelectors.isFetchingGroupDeltas);
  const isLoadingRecords = useSelector(recordSelectors.isFetchingGroupRecords);

  const group = useSelector(state => groupSelectors.getGroup(state, groupId));
  const competitions = useSelector(state => competitionSelectors.getGroupCompetitions(state, groupId));
  const achievements = useSelector(state => achievementSelectors.getGroupAchievements(state, groupId));
  const hiscores = useSelector(state => hiscoresSelectors.getGroupHiscores(state, groupId));
  const deltas = useSelector(state => deltasSelectors.getGroupDeltas(state, groupId));
  const records = useSelector(state => recordSelectors.getGroupRecords(state, groupId));

  const fetchAll = () => {
    // Attempt to fetch group of that id, if it fails redirect to 404
    dispatch(groupActions.fetchDetails(id))
      .then(action => {
        if (!action.payload.data) throw new Error();
      })
      .catch(() => router.push('/404'));

    dispatch(groupActions.fetchMembers(id));
    dispatch(groupActions.fetchMonthlyTop(id));
    dispatch(competitionActions.fetchGroupCompetitions(id));
    dispatch(achievementActions.fetchGroupAchievements(id));
    dispatch(groupActions.fetchStatistics(id));
  };

  const fetchHiscores = () => {
    dispatch(hiscoresActions.fetchGroupHiscores(id, selectedMetric));
  };

  const fetchDeltas = () => {
    dispatch(deltasActions.fetchGroupDeltas(id, selectedMetric, selectedPeriod));
  };

  const fetchRecords = () => {
    dispatch(recordActions.fetchGroupRecords(id, selectedMetric, selectedPeriod));
  };

  const handleDeleteModalClosed = () => {
    setShowingDeleteModal(false);
  };

  const handleOptionSelected = option => {
    if (option.value === 'delete') {
      setShowingDeleteModal(true);
    } else {
      router.push(`/groups/${group.id}/${option.value}`);
    }
  };

  const getSelectedTabUrl = i => {
    const nextSection = TABS[i].toLowerCase();
    return `/groups/${id}/${nextSection}`;
  };

  const handleMetricSelected = e => {
    if (e && e.value) {
      setSelectedMetric(e.value);
    }
  };

  const handlePeriodSelected = e => {
    if (e && e.value) {
      setSelectedPeriod(e.value);
    }
  };

  const handleUpdateAll = () => {
    dispatch(groupActions.updateAll(id));
    setButtonDisabled(true);
  };

  const metricOptions = useMemo(() => getMetricOptions(), []);

  const onMetricSelected = useCallback(handleMetricSelected, []);
  const onPeriodSelected = useCallback(handlePeriodSelected, []);
  const onOptionSelected = useCallback(handleOptionSelected, [router, group]);
  const onDeleteModalClosed = useCallback(handleDeleteModalClosed, []);
  const onUpdateAllClicked = useCallback(handleUpdateAll, [id, dispatch]);

  useEffect(fetchAll, [dispatch, id]);
  useEffect(fetchHiscores, [dispatch, id, selectedMetric]);
  useEffect(fetchDeltas, [dispatch, id, selectedMetric, selectedPeriod]);
  useEffect(fetchRecords, [dispatch, id, selectedMetric, selectedPeriod]);

  if (!group) {
    return <Loading />;
  }

  return (
    <div className="group__container container">
      <Helmet>
        <title>{group.name}</title>
      </Helmet>
      <div className="group__header row">
        <div className="col">
          <PageHeader title={group.name} badges={group.verified ? [VERIFIED_BADGE] : []}>
            <Button text="Update all" onClick={onUpdateAllClicked} disabled={isButtonDisabled} />
            <Dropdown options={MENU_OPTIONS} onSelect={onOptionSelected}>
              <button className="header__options-btn" type="button">
                <img src="/img/icons/options.svg" alt="" />
              </button>
            </Dropdown>
          </PageHeader>
        </div>
      </div>
      <div className="group__widgets row">
        <div className="col-lg-3 col-md-6">
          <span className="widget-label">Featured Competition</span>
          <CompetitionWidget competitions={competitions} />
        </div>
        <div className="col-lg-3 col-md-6">
          <span className="widget-label">Monthly Top Player</span>
          <TopPlayerWidget group={group} isLoading={isLoadingMonthlyTop} />
        </div>
        <div className="col-lg-3 col-md-6">
          <span className="widget-label">Total Experience</span>
          <TotalExperienceWidget group={group} isLoading={isLoadingMembers} />
        </div>
        <div className="col-lg-3 col-md-6">
          <span className="widget-label">Total EHP</span>
          <TotalEHPWidget group={group} isLoading={isLoadingMembers} />
        </div>
      </div>
      <div className="group__content row">
        <div className="col-md-4">
          <GroupInfo group={group} />
        </div>
        <div className="col-md-8">
          <Tabs
            tabs={TABS}
            selectedIndex={selectedSectionIndex}
            urlSelector={getSelectedTabUrl}
            align="space-between"
          />
          {selectedSectionIndex === 0 && (
            <MembersTable members={group.members} isLoading={isLoadingMembers} />
          )}
          {selectedSectionIndex === 1 && <GroupCompetitions competitions={competitions} />}
          {selectedSectionIndex === 2 && (
            <>
              <Selector
                options={metricOptions}
                selectedIndex={selectedMetricIndex}
                onSelect={onMetricSelected}
                search
              />
              <GroupHiscores hiscores={hiscores} metric={selectedMetric} isLoading={isLoadingHiscores} />
            </>
          )}
          {selectedSectionIndex === 3 && (
            <>
              <div className="options-bar">
                <Selector
                  options={metricOptions}
                  selectedIndex={selectedMetricIndex}
                  onSelect={onMetricSelected}
                  search
                />
                <Selector
                  options={PERIOD_OPTIONS}
                  selectedIndex={selectedPeriodIndex}
                  onSelect={onPeriodSelected}
                />
              </div>
              <GroupDeltas deltas={deltas} isLoading={isLoadingDeltas} />
            </>
          )}
          {selectedSectionIndex === 4 && (
            <>
              <div className="options-bar">
                <Selector
                  options={metricOptions}
                  selectedIndex={selectedMetricIndex}
                  onSelect={onMetricSelected}
                  search
                />
                <Selector
                  options={PERIOD_OPTIONS}
                  selectedIndex={selectedPeriodIndex}
                  onSelect={onPeriodSelected}
                />
              </div>
              <GroupRecords records={records} isLoading={isLoadingRecords} />
            </>
          )}
          {selectedSectionIndex === 5 && (
            <GroupAchievements achievements={achievements} isLoading={isLoadingAchievements} />
          )}
          {selectedSectionIndex === 6 && (
            <GroupStatistics
              statistics={group ? group.statistics : null}
              isLoading={isLoadingStatistics}
            />
          )}
        </div>
      </div>
      {showingDeleteModal && group && <DeleteGroupModal group={group} onCancel={onDeleteModalClosed} />}
    </div>
  );
}

export default Group;
