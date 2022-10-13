import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { competitionSelectors } from 'redux/competitions';
import { groupSelectors } from 'redux/groups';
import {
  CompetitionWidget,
  TopPlayerWidget,
  TotalExperienceWidget,
  TotalEHPWidget
} from '../components';
import { GroupContext } from '../context';

function Widgets() {
  const { context } = useContext(GroupContext);
  const { id } = context;

  const isLoadingMonthlyTop = useSelector(groupSelectors.isFetchingMonthlyTop);

  const group = useSelector(groupSelectors.getGroup(id));
  const competitions = useSelector(competitionSelectors.getGroupCompetitions(id));

  return (
    <>
      <div className="col-lg-3 col-md-6">
        <span className="widget-label">Featured Competition</span>
        <CompetitionWidget competitions={competitions} />
      </div>
      <div className="col-lg-3 col-md-6">
        <span className="widget-label">Monthly Top Player</span>
        <TopPlayerWidget group={group} isLoading={isLoadingMonthlyTop} />
      </div>
      <div className="col-lg-3 col-md-6">
        <span className="widget-label">Total Experience</span>
        <TotalExperienceWidget group={group} isLoading={!group.memberships} />
      </div>
      <div className="col-lg-3 col-md-6">
        <span className="widget-label">Total EHP</span>
        <TotalEHPWidget group={group} isLoading={!group.memberships} />
      </div>
    </>
  );
}

export default Widgets;
