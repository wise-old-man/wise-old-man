import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { DateRangeSelector, Button } from 'components';
import './CustomPeriodSelectionModal.scss';

const WEEK_IN_MS = 604800000;

function CustomPeriodSelectionModal({ defaultStartDate, defaultEndDate, onConfirm, onCancel }) {
  const [startDate, setStartDate] = useState(defaultStartDate || new Date(Date.now() - WEEK_IN_MS));
  const [endDate, setEndDate] = useState(defaultEndDate || new Date());

  function handleDateRangedChanged(dates) {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  }

  function handleConfirm() {
    onConfirm({ startDate, endDate });
  }

  return (
    <div className="custom-period-selection">
      <div className="custom-period-selection__modal">
        <button className="modal-close-btn" type="button" onClick={onCancel}>
          <img src="/img/icons/clear.svg" alt="X" />
        </button>
        <h4 className="modal-title">Select a custom time range</h4>
        <b className="modal-label">Time range</b>
        <DateRangeSelector start={startDate} end={endDate} onRangeChanged={handleDateRangedChanged} />
        <Button text="Confirm" onClick={handleConfirm} disabled={!startDate || !endDate} />
      </div>
    </div>
  );
}

CustomPeriodSelectionModal.defaultProps = {
  defaultStartDate: undefined,
  defaultEndDate: undefined
};

CustomPeriodSelectionModal.propTypes = {
  defaultStartDate: PropTypes.instanceOf(Date),
  defaultEndDate: PropTypes.instanceOf(Date),
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default CustomPeriodSelectionModal;
