import HomePage from '../pages/Home';
import TopPage from '../pages/Top';
import RecordsPage from '../pages/Records';
import CompetitionsListPage from '../pages/CompetitionsList';
import CreateCompetitionPage from '../pages/CreateCompetition';
import EditCompetitionPage from '../pages/EditCompetition';
import CompetitionPage from '../pages/Competition';
import PlayerPage from '../pages/Player';
import PlayerSearchPage from '../pages/PlayerSearch';
import GroupsListPage from '../pages/GroupsList';
import GroupPage from '../pages/Group';
import CreateGroupPage from '../pages/CreateGroup';
import EditGroupPage from '../pages/EditGroup';

// Note: if you're adding a new route with a dynamic url param
// be sure to add it to the analytics.js file.
export const ROUTES = [
  {
    path: '/',
    component: HomePage
  },
  {
    path: '/top/:metric?/:playerType?',
    component: TopPage
  },
  {
    path: '/records/:metric?/:playerType?',
    component: RecordsPage
  },
  {
    path: '/competitions',
    component: CompetitionsListPage
  },
  {
    path: '/competitions/create',
    component: CreateCompetitionPage
  },
  {
    path: '/competitions/:id/edit',
    component: EditCompetitionPage
  },
  {
    path: '/competitions/:id/:section?',
    component: CompetitionPage
  },
  {
    path: '/groups',
    component: GroupsListPage
  },
  {
    path: '/groups/create',
    component: CreateGroupPage
  },
  {
    path: '/groups/:id/edit',
    component: EditGroupPage
  },
  {
    path: '/groups/:id',
    component: GroupPage
  },
  {
    path: '/players/search/:username',
    component: PlayerSearchPage
  },
  {
    path: '/players/:id/:section?/:metricType?',
    component: PlayerPage
  }
];
