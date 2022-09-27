import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { NameChangeStatus } from '@wise-old-man/utils';
import { TextInput, Selector } from 'components';
import { NamesListContext } from '../context';

const STATUS_OPTIONS = [
  { label: 'Any status', value: null },
  { label: 'Pending', value: NameChangeStatus.PENDING },
  { label: 'Denied', value: NameChangeStatus.DENIED },
  { label: 'Approved', value: NameChangeStatus.APPROVED }
];

function Controls({ onSearchInputChanged }) {
  const { context, updateContext } = useContext(NamesListContext);

  const selectedStatusIndex = STATUS_OPTIONS.findIndex(o => o.value === context.status);

  const onStatusSelected = e => {
    if (!e || e.value === undefined) return;
    updateContext({ status: e.value === undefined ? null : e.value });
  };

  return (
    <>
      <div className="col-lg-8 col-md-6 col-sm-6">
        <TextInput onChange={onSearchInputChanged} placeholder="Search username" />
      </div>
      <div className="col-lg-4 col-md-6 col-sm-6">
        <Selector
          options={STATUS_OPTIONS}
          selectedIndex={selectedStatusIndex}
          onSelect={onStatusSelected}
          search
        />
      </div>
    </>
  );
}

Controls.propTypes = {
  onSearchInputChanged: PropTypes.func.isRequired
};

export default Controls;
