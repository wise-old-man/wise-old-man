import React, { useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import { PageHeader, Dropdown, Button } from 'components';
import { CompetitionContext } from '../context';

function Header({ competition, handleUpdateAll, handleEditRedirect, handleSelectMetric }) {
  const { updateContext } = useContext(CompetitionContext);

  const menuOptions = useMemo(() => getMenuOptions(competition), [competition]);

  const handleOptionSelected = option => {
    if (option.value === 'DELETE_COMPETITION') {
      updateContext({ section: 'delete' });
    } else if (option.value === 'EDIT_COMPETITION') {
      handleEditRedirect();
    } else if (option.value === 'PREVIEW_OTHER_METRIC') {
      handleSelectMetric();
    }
  };

  if (!competition) return null;

  return (
    <PageHeader
      title={competition.title}
      renderRight={() => (
        <>
          {competition.status !== 'finished' && <Button text="Update all" onClick={handleUpdateAll} />}
          <Dropdown options={menuOptions} onSelect={handleOptionSelected}>
            <button className="header__options-btn" type="button">
              <img src="/img/icons/options.svg" alt="" />
            </button>
          </Dropdown>
        </>
      )}
    />
  );
}

function getMenuOptions(competition) {
  if (!competition) return [];

  const options = [
    { label: 'Preview Other Metric', value: 'PREVIEW_OTHER_METRIC' },
    { label: 'Delete Competition', value: 'DELETE_COMPETITION' }
  ];

  if (competition.status !== 'finished') {
    options.splice(1, 0, { label: 'Edit Competition', value: 'EDIT_COMPETITION' });
  }

  return options;
}

Header.defaultProps = {
  competition: undefined
};

Header.propTypes = {
  competition: PropTypes.shape(),
  handleUpdateAll: PropTypes.func.isRequired,
  handleSelectMetric: PropTypes.func.isRequired,
  handleEditRedirect: PropTypes.func.isRequired
};

export default Header;
