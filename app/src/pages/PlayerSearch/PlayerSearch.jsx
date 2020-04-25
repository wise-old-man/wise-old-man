import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Button from '../../components/Button';
import TableList from '../../components/TableList';
import PlayerTag from '../../components/PlayerTag';
import { durationBetween } from '../../utils';
import searchAction from '../../redux/modules/players/actions/search';
import trackAction from '../../redux/modules/players/actions/track';
import { getSearchResults } from '../../redux/selectors/players';
import './PlayerSearch.scss';

const TABLE_CONFIG = {
  uniqueKey: row => row.id,
  columns: [
    {
      key: 'username',
      className: () => '-primary',
      transform: (value, row) => <PlayerTag username={value} type={row.type} />
    },
    {
      key: 'updatedAt',
      transform: value => `Last updated ${durationBetween(value, new Date(), 2, true)} ago`
    }
  ]
};

function PlayerSearch() {
  const router = useHistory();
  const dispatch = useDispatch();
  const { username } = useParams();

  const [isTracking, setIsTracking] = useState(false);
  const searchResults = useSelector(state => getSearchResults(state));

  const searchPlayers = () => {
    dispatch(searchAction({ username }));
  };

  const trackPlayer = async () => {
    try {
      setIsTracking(true);
      const action = await dispatch(trackAction(username));

      if (action && action.data) {
        router.push(`/players/${action.data.id}`);
      }
    } finally {
      setIsTracking(false);
    }
  };

  const handleRowClicked = index => {
    router.push(`/players/${searchResults[index].id}`);
  };

  const onButtonClicked = useCallback(trackPlayer, [username]);
  const onRowClicked = useCallback(handleRowClicked, [router, searchResults]);

  useEffect(searchPlayers, [username]);

  return (
    <div className="player-search__container container">
      <Helmet>
        <title>{`Player search: ${username}`}</title>
      </Helmet>
      <div className="player-search__header row">
        <div className="col">
          <h1 className="header__title">{`Couldn't find "${username}"`}</h1>
          <p className="header__text">
            This player is not being tracked yet, would you like to start tracking it?
          </p>
          <Button text={`Track ${username}`} onClick={onButtonClicked} loading={isTracking} />
        </div>
      </div>
      {searchResults && searchResults.length > 0 && (
        <div className="player-search__list row">
          <div className="col">
            <b>{`Search results for "${username}":`}</b>
            <TableList
              uniqueKeySelector={TABLE_CONFIG.uniqueKey}
              columns={TABLE_CONFIG.columns}
              rows={searchResults}
              onRowClicked={onRowClicked}
              clickable
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayerSearch;
