import React from 'react';
import { PageTitle, TextButton } from 'components';

function Header() {
  return (
    <>
      <div className="col">
        <PageTitle title="Competitions" />
      </div>
      <div className="col">
        <TextButton text="Create new" url="/competitions/create" />
      </div>
    </>
  );
}

export default Header;
