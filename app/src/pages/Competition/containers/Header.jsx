import React, { useState, useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import { PageHeader, Dropdown, Button } from 'components';
import { CompetitionContext } from '../context';

function Header({ competition, handleUpdateAll, handleEditRedirect }) {
  const { updateContext } = useContext(CompetitionContext);
  const [isButtonDisabled, setButtonDisabled] = useState(false);

  const menuOptions = useMemo(() => getMenuOptions(competition), [competition]);

  const handleUpdateAllClicked = () => {
    handleUpdateAll();
    setButtonDisabled(true);
  };

  const handleOptionSelected = option => {
    if (option.value === 'DELETE_COMPETITION') {
      updateContext({ section: 'delete' });
    } else if (option.value === 'EDIT_COMPETITION') {
      handleEditRedirect();
    }
  };

  if (!competition) {
    return null;
  }

  return (
    <PageHeader title={competition.title}>
      {competition.status !== 'finished' && (
        <Button text="Update all" onClick={handleUpdateAllClicked} disabled={isButtonDisabled} />
      )}
      <Dropdown options={menuOptions} onSelect={handleOptionSelected}>
        <button className="header__options-btn" type="button">
          <img src="/img/icons/options.svg" alt="" />
        </button>
      </Dropdown>
    </PageHeader>
  );
}

function getMenuOptions(competition) {
  if (!competition) {
    return [];
  }

  if (competition.status === 'finished') {
    return [{ label: 'Delete competition', value: 'DELETE_COMPETITION' }];
  }

  return [
    { label: 'Edit competition', value: 'EDIT_COMPETITION' },
    { label: 'Delete competition', value: 'DELETE_COMPETITION' }
  ];
}

Header.defaultProps = {
  competition: undefined
};

Header.propTypes = {
  competition: PropTypes.shape(),
  handleUpdateAll: PropTypes.func.isRequired,
  handleEditRedirect: PropTypes.func.isRequired
};

export default Header;
