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

// Note: if you're adding a new route with a dynamic url param
// be sure to add it to the analytics.js file.
export const ROUTES = [
  {
    path: '/',
    component: HomePage
  },
  {
    path: '/top',
    component: TopPage
  },
  {
    path: '/records',
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
    path: '/competitions/:id',
    component: CompetitionPage
  },
  {
    path: '/groups',
    component: GroupsListPage
  },
  {
    path: '/players/:id',
    component: PlayerPage
  },
  {
    path: '/players/search/:username',
    component: PlayerSearchPage
  }
];
