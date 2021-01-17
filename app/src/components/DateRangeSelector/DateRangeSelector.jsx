/* eslint react/jsx-props-no-spreading: 0 */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { enGB } from 'date-fns/locale';
import { DateRangePicker } from 'react-nice-dates';
import { durationBetween } from 'utils';
import 'react-nice-dates/build/style.css';
import './DateRangeSelector.scss';

function DateRangeSelector({ onRangeChanged, start, end }) {
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);

  const diff = durationBetween(startDate, endDate, 3, true);

  useEffect(() => onRangeChanged([startDate, endDate]), [startDate, endDate, onRangeChanged]);
  useEffect(() => setStartDate(start), [start]);
  useEffect(() => setEndDate(end), [end]);

  return (
    <DateRangePicker
      startDate={startDate}
      endDate={endDate}
      onStartDateChange={setStartDate}
      onEndDateChange={setEndDate}
      format="dd MMM yyyy HH:mm"
      locale={enGB}
    >
      {({ startDateInputProps, endDateInputProps, focus }) => (
        <div className="date-range-selector">
          <input
            className={classNames({ 'date-input': true, '-focus': focus })}
            {...startDateInputProps}
          />
          <input
            className={classNames({ 'date-input': true, '-focus': focus })}
            {...endDateInputProps}
          />
          <span className="duration-label">{`Duration: ${diff || 'Unknown'}`}</span>
        </div>
      )}
    </DateRangePicker>
  );
}

DateRangeSelector.propTypes = {
  // The start date
  start: PropTypes.instanceOf(Date).isRequired,
  // The end date
  end: PropTypes.instanceOf(Date).isRequired,
  // Event: to be fired on any date change
  onRangeChanged: PropTypes.func.isRequired
};

export default React.memo(DateRangeSelector);
