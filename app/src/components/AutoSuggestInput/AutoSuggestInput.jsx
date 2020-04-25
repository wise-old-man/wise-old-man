import React, { useState, useCallback, useEffect } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import './AutoSuggestInput.scss';

function AutoSuggestInput({ suggestions, onInput, onSelected, clearOnSelect, placeholder }) {
  const [text, setText] = useState('');
  const [isShowing, setIsShowing] = useState(false);
  const [highlightedSuggestion, setHighlightedSuggestion] = useState(-1);

  const handleSelect = (value, forced) => {
    onSelected(value, forced);
    setIsShowing(false);
    highlightSuggestion(null);

    if (clearOnSelect) {
      setText('');
    }
  };

  const highlightSuggestion = useCallback(
    delta => {
      if (!delta) {
        // If delta is null, reset highlights
        setHighlightedSuggestion(-1);
      } else if (highlightedSuggestion + delta < 0) {
        // If index is < 0, highlight last item
        setHighlightedSuggestion(suggestions.length - 1);
      } else if (highlightedSuggestion + delta >= suggestions.length) {
        // If index is out of bounds, highlight first item
        setHighlightedSuggestion(0);
      } else if (highlightedSuggestion + delta < suggestions.length) {
        setHighlightedSuggestion(highlightedSuggestion + delta);
      }
    },
    [highlightedSuggestion, setHighlightedSuggestion, suggestions]
  );

  const handleChange = e => {
    const { value } = e.target;

    setText(value);
    setIsShowing(value.length > 0);
    onInput(value);
  };

  const handleKeyUp = e => {
    if (e.key === 'Enter') {
      if (highlightedSuggestion > -1) {
        handleSelect(suggestions[highlightedSuggestion].value, false);
      } else {
        handleSelect(e.target.value, true);
      }
    } else if (e.key === 'ArrowDown') {
      highlightSuggestion(1);
    } else if (e.key === 'ArrowUp') {
      highlightSuggestion(-1);
    }
  };

  const show = () => {
    setIsShowing(text.length > 0);
  };

  const hide = () => {
    setIsShowing(false);
    highlightSuggestion(null);
  };

  const onChange = useCallback(handleChange, []);
  const onKeyUp = useCallback(handleKeyUp, [highlightedSuggestion, suggestions]);
  const onFocus = useCallback(show, [text]);
  const onBlur = useCallback(hide, []);
  const onResetHighlight = useCallback(highlightSuggestion, []);

  // Clear highlights on mount
  useEffect(onResetHighlight, []);

  return (
    <div className="auto-suggest" onFocus={onFocus} onBlur={onBlur}>
      <input
        className="auto-suggest__input"
        type="text"
        value={text}
        placeholder={placeholder}
        onChange={onChange}
        onKeyUp={onKeyUp}
      />
      {isShowing && suggestions && suggestions.length > 0 && (
        <ul className="auto-suggest__list">
          {suggestions.map((s, i) => (
            <li key={s.label} className="suggestion-item">
              <button
                id={s.value}
                className={classNames({
                  'suggestion-item__btn': true,
                  '-highlighted': i === highlightedSuggestion
                })}
                type="button"
                onMouseDown={() => handleSelect(s.value)}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

AutoSuggestInput.defaultProps = {
  clearOnSelect: false,
  placeholder: ''
};

AutoSuggestInput.propTypes = {
  // The list of suggestions to render below the input
  suggestions: PropTypes.arrayOf(PropTypes.shape).isRequired,

  // Event: Fired by the input, on change
  onInput: PropTypes.func.isRequired,

  // Event: on selection, params: (value, isForced)
  onSelected: PropTypes.func.isRequired,

  // If true, the input will be cleared after every selection
  clearOnSelect: PropTypes.bool,

  // Placeholder text for the input
  placeholder: PropTypes.string
};

export default React.memo(AutoSuggestInput);
