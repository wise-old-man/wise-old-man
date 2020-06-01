import { toMap } from '../../utils';

export const TRACK_PLAYER_REQUEST = 'players/TRACK_PLAYER_REQUEST';
export const TRACK_PLAYER_SUCCESS = 'players/TRACK_PLAYER_SUCCESS';
export const TRACK_PLAYER_FAILURE = 'players/TRACK_PLAYER_FAILURE';

export const ASSERT_TYPE_REQUEST = 'players/ASSERT_PLAYER_TYPE_REQUEST';
export const ASSERT_TYPE_SUCCESS = 'players/ASSERT_PLAYER_TYPE_SUCCESS';
export const ASSERT_TYPE_FAILURE = 'players/ASSERT_PLAYER_TYPE_FAILURE';

export const ASSERT_NAME_REQUEST = 'players/ASSERT_PLAYER_NAME_REQUEST';
export const ASSERT_NAME_SUCCESS = 'players/ASSERT_PLAYER_NAME_SUCCESS';
export const ASSERT_NAME_FAILURE = 'players/ASSERT_PLAYER_NAME_FAILURE';

export const FETCH_PLAYER_REQUEST = 'players/FETCH_PLAYER_REQUEST';
export const FETCH_PLAYER_SUCCESS = 'players/FETCH_PLAYER_SUCCESS';
export const FETCH_PLAYER_FAILURE = 'players/FETCH_PLAYER_FAILURE';

export const SEARCH_PLAYERS_REQUEST = 'players/SEARCH_PLAYERS_REQUEST';
export const SEARCH_PLAYERS_SUCCESS = 'players/SEARCH_PLAYERS_SUCCESS';
export const SEARCH_PLAYERS_FAILURE = 'players/SEARCH_PLAYERS_FAILURE';

const initialState = {
  isFetching: false,
  isSearching: false,
  isTracking: false,
  isAssertingType: false,
  isAssertingName: false,
  players: {},
  searchResults: {},
  updating: []
};

export default function playersReducer(state = initialState, action) {
  switch (action.type) {
    case TRACK_PLAYER_REQUEST:
      return { ...state, isTracking: true, updating: [...state.updating, action.username] };

    case TRACK_PLAYER_SUCCESS:
      return {
        ...state,
        isTracking: false,
        updating: [...state.updating.filter(username => username !== action.username)],
        players: { ...state.players, [action.data.id]: { ...action.data } }
      };

    case TRACK_PLAYER_FAILURE:
      return {
        ...state,
        isTracking: false,
        updating: [...state.updating.filter(username => username !== action.username)]
      };

    case ASSERT_TYPE_REQUEST:
      return { ...state, isAssertingType: true };

    case ASSERT_TYPE_SUCCESS:
      return {
        ...state,
        isAssertingType: false,
        players: {
          ...state.players,
          [action.playerId]: { ...state.players[action.playerId], type: action.playerType }
        }
      };

    case ASSERT_TYPE_FAILURE:
      return {
        ...state,
        isAssertingType: false
      };

    case ASSERT_NAME_REQUEST:
      return { ...state, isAssertingName: true };

    case ASSERT_NAME_SUCCESS:
      return {
        ...state,
        isAssertingName: false,
        players: {
          ...state.players,
          [action.playerId]: { ...state.players[action.playerId], displayName: action.displayName }
        }
      };

    case ASSERT_NAME_FAILURE:
      return {
        ...state,
        isAssertingName: false
      };

    case FETCH_PLAYER_REQUEST:
      return { ...state, isFetching: true };

    case FETCH_PLAYER_SUCCESS:
      return {
        ...state,
        isFetching: false,
        players: { ...state.players, [action.player.id]: action.player }
      };

    case FETCH_PLAYER_FAILURE:
      return { ...state, isFetching: false, error: action.error };

    case SEARCH_PLAYERS_REQUEST:
      return { ...state, isSearching: true };

    case SEARCH_PLAYERS_SUCCESS:
      return {
        ...state,
        isSearching: false,
        searchResults: { ...toMap(action.players, 'id') },
        players: { ...state.players, ...toMap(action.players, 'id') }
      };

    case SEARCH_PLAYERS_FAILURE:
      return { ...state, isSearching: false, error: action.error };

    default:
      return state;
  }
}
