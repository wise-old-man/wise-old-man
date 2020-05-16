import React, { useMemo, useCallback } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import AutoSuggestInput from '../AutoSuggestInput';
import { getSearchResults } from '../../redux/selectors/players';
import searchAction from '../../redux/modules/players/actions/search';
import './ParticipantsSelector.scss';

const mapToSuggestion = player => ({ label: player.username, value: player.username });
const participantClass = isInvalid => classNames('participant-btn__label', { '-invalid': isInvalid });

function ParticipantsSelector({
  participants,
  invalidUsernames,
  onParticipantAdded,
  onParticipantRemoved
}) {
  const dispatch = useDispatch();
  const searchResults = useSelector(state => getSearchResults(state));

  const suggestions = useMemo(() => searchResults.map(s => mapToSuggestion(s)), [searchResults]);

  const searchPlayer = _.debounce(username => dispatch(searchAction({ username })), 500);

  const handleInputChange = text => {
    if (text && text.length) {
      searchPlayer(text);
    }
  };

  const handleSelection = username => {
    onParticipantAdded(username);
  };

  const handleDeselection = username => {
    onParticipantRemoved(username);
  };

  const onInputChange = useCallback(handleInputChange, []);
  const onSelected = useCallback(handleSelection, []);
  const onDeselected = useCallback(handleDeselection, []);

  return (
    <div className="participants-selector">
      <AutoSuggestInput
        suggestions={suggestions}
        onInput={onInputChange}
        onSelected={onSelected}
        placeholder="Search players"
        clearOnSelect
      />
      <ul className="participants-selector__list">
        {participants && participants.length > 0 ? (
          participants.map(l => (
            <li key={l}>
              <button className="participant-btn" type="button" onClick={() => onDeselected(l)}>
                <span className={participantClass(invalidUsernames && invalidUsernames.includes(l))}>
                  {l}
                </span>
                <img className="participant-btn__icon" src="/img/icons/clear.svg" alt="x" />
              </button>
            </li>
          ))
        ) : (
          <span className="empty-selected">No players selected</span>
        )}
      </ul>
    </div>
  );
}

ParticipantsSelector.defaultProps = {
  invalidUsernames: []
};

ParticipantsSelector.propTypes = {
  participants: PropTypes.arrayOf(PropTypes.string).isRequired,
  invalidUsernames: PropTypes.arrayOf(PropTypes.string),
  onParticipantAdded: PropTypes.func.isRequired,
  onParticipantRemoved: PropTypes.func.isRequired
};

export default ParticipantsSelector;
