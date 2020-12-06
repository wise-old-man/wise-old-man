import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useUrlContext } from 'hooks';
import { Loading, Tabs } from 'components';
import { groupActions, groupSelectors } from 'redux/groups';
import { competitionActions } from 'redux/competitions';
import { achievementActions } from 'redux/achievements';
import URL from 'utils/url';
import DeleteGroupModal from 'modals/DeleteGroupModal';
import {
  Header,
  Widgets,
  MembersTable,
  CompetitionsTable,
  AchievementsTable,
  GainedTable,
  HiscoresTable,
  RecordsTable,
  Statistics
} from './containers';
import { GroupInfo } from './components';
import { GroupContext } from './context';
import './Group.scss';

const TABS = ['Members', 'Competitions', 'Hiscores', 'Gained', 'Records', 'Achievements', 'Statistics'];

function Group() {
  const dispatch = useDispatch();
  const router = useHistory();

  const { context, updateContext } = useUrlContext(encodeContext, decodeURL);
  const { id, section } = context;

  const selectedTabIndex = getSelectedTabIndex(section);
  const group = useSelector(state => groupSelectors.getGroup(state, id));

  const showDeleteModal = section === 'delete' && !!group;

  const handleUpdateAll = () => {
    dispatch(groupActions.updateAll(id));
  };

  const handleRedirect = path => {
    router.push(path);
  };

  const handleTabSelected = index => {
    updateContext({ section: TABS[index].toLowerCase() });
  };

  // Fetch competition details, on mount
  useEffect(() => fetchDetails(id, router, dispatch), [router, dispatch, id]);

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
            <Header group={group} handleUpdateAll={handleUpdateAll} handleRedirect={handleRedirect} />
          </div>
        </div>
        <div className="group__widgets row">
          <Widgets />
        </div>
        <div className="group__content row">
          <div className="col-md-4">
            <GroupInfo group={group} />
          </div>
          <div className="col-md-8">
            <Tabs tabs={TABS} selectedIndex={selectedTabIndex} onTabSelected={handleTabSelected} />
            {(section === 'members' || section === 'delete') && <MembersTable />}
            {section === 'hiscores' && <HiscoresTable />}
            {section === 'gained' && <GainedTable />}
            {section === 'records' && <RecordsTable />}
            {section === 'achievements' && <AchievementsTable />}
            {section === 'statistics' && <Statistics />}
            {section === 'competitions' && <CompetitionsTable handleRedirect={handleRedirect} />}
          </div>
        </div>
        {showDeleteModal && (
          <DeleteGroupModal group={group} onCancel={() => updateContext({ section: 'members' })} />
        )}
      </div>
    </GroupContext.Provider>
  );
}

const fetchDetails = (id, router, dispatch) => {
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

function getSelectedTabIndex(section) {
  if (!section || section === 'delete') return 0;
  return TABS.map(t => t.toLowerCase()).indexOf(section);
}

function encodeContext({ id, section }) {
  const nextURL = new URL(`/groups/${id}`);

  if (section && section !== 'members') {
    nextURL.appendToPath(`/${section}`);
  }

  return nextURL.getPath();
}

function decodeURL(params) {
  const { id, section } = params;
  const validSections = ['delete', ...TABS.map(t => t.toLowerCase())];

  return {
    id: parseInt(id, 10),
    section: section && validSections.includes(section) ? section : 'members'
  };
}

export default Group;
