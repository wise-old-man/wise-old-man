import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { PageHeader, Dropdown, Button } from 'components';
import { GroupContext } from '../context';

const VERIFIED_BADGE = {
  text: 'Verified',
  hoverText: "Verified group: This group's leader is verified on our Discord server."
};

const MENU_OPTIONS = [
  { label: 'Create competition', value: 'CREATE_GROUP_COMPETITION' },
  { label: 'Edit group', value: 'EDIT_GROUP' },
  { label: 'Export members list', value: 'EXPORT_MEMBERS' },
  { label: 'Delete group', value: 'DELETE_GROUP' }
];

function Header({ group, handleUpdateAll, handleRedirect, handleExport }) {
  const { context, updateContext } = useContext(GroupContext);
  const [isButtonDisabled, setButtonDisabled] = useState(false);

  const handleUpdateAllClicked = () => {
    handleUpdateAll();
    setButtonDisabled(true);
  };

  const handleOptionSelected = option => {
    if (option.value === 'DELETE_GROUP') {
      updateContext({ section: 'delete' });
    } else if (option.value === 'EDIT_GROUP') {
      handleRedirect(`/groups/${context.id}/edit`);
    } else if (option.value === 'CREATE_GROUP_COMPETITION') {
      handleRedirect(`/competitions/create?groupId=${context.id}`);
    } else if (option.value === 'EXPORT_MEMBERS') {
      handleExport();
    }
  };

  if (!group) {
    return null;
  }

  return (
    <PageHeader title={group.name} badges={group.verified ? [VERIFIED_BADGE] : []}>
      <Button text="Update all" onClick={handleUpdateAllClicked} disabled={isButtonDisabled} />
      <Dropdown options={MENU_OPTIONS} onSelect={handleOptionSelected}>
        <button className="header__options-btn" type="button">
          <img src="/img/icons/options.svg" alt="" />
        </button>
      </Dropdown>
    </PageHeader>
  );
}

Header.defaultProps = {
  group: undefined
};

Header.propTypes = {
  group: PropTypes.shape({
    name: PropTypes.string,
    verified: PropTypes.bool
  }),
  handleUpdateAll: PropTypes.func.isRequired,
  handleRedirect: PropTypes.func.isRequired,
  handleExport: PropTypes.func.isRequired
};

export default Header;
