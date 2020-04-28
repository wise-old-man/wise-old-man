import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import Loading from '../../components/Loading';
import PageHeader from '../../components/PageHeader';
import Dropdown from '../../components/Dropdown';
import TopPlayerWidget from './components/TopPlayerWidget';
import TotalExperienceWidget from './components/TotalExperienceWidget';
import CompetitionWidget from './components/CompetitionWidget';
import GroupInfo from './components/GroupInfo';
import MembersTable from './components/MembersTable';
import DeleteGroupModal from './components/DeleteGroupModal';
import { getGroup, isFetchingDetails } from '../../redux/selectors/groups';
import { getGroupCompetitions } from '../../redux/selectors/competitions';
import fetchDetailsAction from '../../redux/modules/groups/actions/fetchDetails';
import fetchGroupCompetitionsAction from '../../redux/modules/competitions/actions/fetchGroupCompetitions';
import './Group.scss';

const MENU_OPTIONS = [
  {
    label: 'Edit group',
    value: 'edit'
  },
  {
    label: 'Delete group',
    value: 'delete'
  }
];

function Group() {
  const { id } = useParams();
  const router = useHistory();
  const dispatch = useDispatch();

  const [showingDeleteModal, setShowingDeleteModal] = useState(false);

  const isLoading = useSelector(state => isFetchingDetails(state));
  const group = useSelector(state => getGroup(state, parseInt(id, 10)));
  const competitions = useSelector(state => getGroupCompetitions(state, parseInt(id, 10)));

  const fetchDetails = () => {
    dispatch(fetchDetailsAction(id));
  };

  const fetchCompetitions = () => {
    dispatch(fetchGroupCompetitionsAction(id));
  };

  const handleDeleteModalClosed = () => {
    setShowingDeleteModal(false);
  };

  const handleOptionSelected = option => {
    if (option.value === 'delete') {
      setShowingDeleteModal(true);
    } else {
      const URL = `/groups/${group.id}/${option.value}`;
      router.push(URL);
    }
  };

  const onOptionSelected = useCallback(handleOptionSelected, [router, group]);
  const onDeleteModalClosed = useCallback(handleDeleteModalClosed, []);

  // Fetch group details, on mount
  useEffect(fetchDetails, [dispatch, id]);
  useEffect(fetchCompetitions, [dispatch, id]);

  if (!group) {
    return <Loading />;
  }

  return (
    <div className="group__container container">
      <Helmet>
        <title>{group.name}</title>
      </Helmet>
      <div className="group__header row">
        <div className="col">
          <PageHeader title={group.name}>
            <Dropdown options={MENU_OPTIONS} onSelect={onOptionSelected}>
              <button className="header__options-btn" type="button">
                <img src="/img/icons/options.svg" alt="" />
              </button>
            </Dropdown>
          </PageHeader>
        </div>
      </div>
      <div className="group__widgets row">
        <div className="col-md-4">
          <span className="widget-label">Featured Competition</span>
          <CompetitionWidget competitions={competitions} />
        </div>
        <div className="col-md-4 col-sm-6">
          <span className="widget-label">Monthly Top Player</span>
          <TopPlayerWidget group={group} />
        </div>
        <div className="col-md-4 col-sm-6">
          <span className="widget-label">Total overall experience</span>
          <TotalExperienceWidget group={group} />
        </div>
      </div>
      <div className="group__content row">
        <div className="col-md-4">
          <GroupInfo group={group} />
        </div>
        <div className="col-md-8">
          <MembersTable members={group.members} isLoading={isLoading} />
        </div>
      </div>
      {showingDeleteModal && group && <DeleteGroupModal group={group} onCancel={onDeleteModalClosed} />}
    </div>
  );
}

export default Group;
