import React, { useEffect, useState, useCallback } from 'react';
import { PERIODS } from '@wise-old-man/utils';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import saveCsv from 'save-csv';
import { ALL_METRICS } from 'config';
import { useUrlContext } from 'hooks';
import { Loading, Tabs } from 'components';
import { isValidDate } from 'utils';
import { groupActions, groupSelectors } from 'redux/groups';
import { competitionActions } from 'redux/competitions';
import URL from 'utils/url';
import DeleteGroupModal from 'modals/DeleteGroupModal';
import UpdateAllModal from 'modals/UpdateAllModal';
import {
  Header,
  Widgets,
  MembersTable,
  CompetitionsTable,
  AchievementsTable,
  GainedTable,
  HiscoresTable,
  RecordsTable,
  Statistics,
  NameChangesTable
} from './containers';
import { GroupInfo } from './components';
import { GroupContext } from './context';
import './Group.scss';

const TABS = [
  'Members',
  'Competitions',
  'Hiscores',
  'Gained',
  'Records',
  'Achievements',
  'Name Changes',
  'Statistics'
];

function Group() {
  const dispatch = useDispatch();
  const router = useHistory();

  const { context, updateContext } = useUrlContext(encodeContext, decodeURL);
  const { id, section } = context;

  const [showUpdateAllModal, setShowUpdateAllModal] = useState(false);

  const selectedTabIndex = getSelectedTabIndex(section);
  const group = useSelector(groupSelectors.getGroup(id));

  const showDeleteModal = section === 'delete' && !!group;

  const handleUpdateAll = verificationCode => {
    dispatch(groupActions.updateAll(id, verificationCode)).then(r => {
      if (!r.payload.error) setShowUpdateAllModal(false);
    });
  };

  const handleRedirect = path => {
    router.push(path);
  };

  const handleExport = () => {
    const filename = `${group.name} Members.csv`;
    const namesOnly = group.members.map(member => ({ name: member.player.displayName }));
    saveCsv(namesOnly, { filename });
  };

  const handleTabSelected = index => {
    updateContext({ section: TABS[index].toLowerCase() });
  };

  const fetchGroupDetails = useCallback(() => {
    if (!group || !group.memberships) {
      dispatch(groupActions.fetchDetails(id)).then(action => {
        // Group not found, redirect to 404
        if (!action.payload.data) router.push(`/404`);

        dispatch(groupActions.fetchMonthlyTop(id));
        dispatch(competitionActions.fetchGroupCompetitions(id));
      });
    }
  }, [dispatch, router, id, group]);

  // Fetch group details, on mount
  useEffect(fetchGroupDetails, [fetchGroupDetails]);

  if (!group) {
    return <Loading />;
  }

  return (
    <GroupContext.Provider value={{ context, updateContext }}>
      <div className="group__container container">
        <Helmet>
          <title>{group.name}</title>
        </Helmet>
        <div className="group__header row">
          <div className="col">
            <Header
              group={group}
              handleUpdateAll={() => setShowUpdateAllModal(true)}
              handleRedirect={handleRedirect}
              handleExport={handleExport}
            />
          </div>
        </div>
        <div className="group__widgets row">
          <Widgets />
        </div>
        <div className="group__content row">
          <div className="col-12">
            <Tabs tabs={TABS} selectedIndex={selectedTabIndex} onTabSelected={handleTabSelected} />
          </div>
          <div className="col-md-4">
            <GroupInfo group={group} />
          </div>
          <div className="col-md-8">
            {(section === 'members' || section === 'delete') && <MembersTable />}
            {section === 'hiscores' && <HiscoresTable />}
            {section === 'gained' && <GainedTable />}
            {section === 'records' && <RecordsTable />}
            {section === 'achievements' && <AchievementsTable />}
            {section === 'name changes' && <NameChangesTable />}
            {section === 'statistics' && <Statistics />}
            {section === 'competitions' && <CompetitionsTable />}
          </div>
        </div>
        {showDeleteModal && (
          <DeleteGroupModal group={group} onCancel={() => updateContext({ section: 'members' })} />
        )}
        {showUpdateAllModal && (
          <UpdateAllModal
            entityName="group"
            onCancel={() => setShowUpdateAllModal(false)}
            onSubmit={handleUpdateAll}
          />
        )}
      </div>
    </GroupContext.Provider>
  );
}

function getSelectedTabIndex(section) {
  if (!section || section === 'delete') return 0;
  return TABS.map(t => t.toLowerCase()).indexOf(section);
}

function encodeContext({ id, section, metric, period, startDate, endDate }) {
  const nextURL = new URL(`/groups/${id}`);
  const metricSections = ['hiscores', 'gained', 'records'];
  const periodSections = ['gained', 'records'];

  if (section && section !== 'members') {
    nextURL.appendToPath(`/${section.replace(' ', '-')}`);
  }

  if (metric && section && metricSections.includes(section.toLowerCase())) {
    nextURL.appendSearchParam('metric', metric);
  }

  if (period && period !== 'week' && section && periodSections.includes(section.toLowerCase())) {
    nextURL.appendSearchParam('period', period);
  }

  const periodUrlParam = nextURL.getSearchParam('period');

  if (
    periodUrlParam &&
    periodUrlParam.value === 'custom' &&
    startDate &&
    endDate &&
    isValidDate(startDate) &&
    isValidDate(endDate)
  ) {
    nextURL.appendSearchParam('startDate', startDate.toISOString());
    nextURL.appendSearchParam('endDate', endDate.toISOString());
  }

  return nextURL.getPath();
}

function decodeURL(params, query) {
  const { id, section } = params;
  const validSections = ['delete', ...TABS.map(t => t.toLowerCase())];
  const isValidMetric = query.metric && ALL_METRICS.includes(query.metric.toLowerCase());
  const isValidPeriod = query.period && PERIODS.includes(query.period.toLowerCase());
  const isValidStartDate = query.startDate && !isValidPeriod && isValidDate(query.startDate);
  const isValidEndDate = query.endDate && !isValidPeriod && isValidDate(query.endDate);
  const metric = isValidMetric ? query.metric : 'overall';
  const startDate = isValidStartDate ? new Date(query.startDate) : null;
  const endDate = isValidEndDate ? new Date(query.endDate) : null;
  const period =
    isValidPeriod || (query.period === 'custom' && section === 'gained') ? query.period : 'week';

  const formattedSection = section ? section.replace('-', ' ') : undefined;

  return {
    id: parseInt(id, 10),
    section: section && validSections.includes(formattedSection) ? formattedSection : 'members',
    metric,
    period,
    startDate,
    endDate
  };
}

export default Group;
