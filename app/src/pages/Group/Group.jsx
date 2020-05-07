import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import Loading from '../../components/Loading';
import PageHeader from '../../components/PageHeader';
import Dropdown from '../../components/Dropdown';
import Button from '../../components/Button';
import DeleteGroupModal from '../../modals/DeleteGroupModal';
import TopPlayerWidget from './components/TopPlayerWidget';
import TotalExperienceWidget from './components/TotalExperienceWidget';
import CompetitionWidget from './components/CompetitionWidget';
import GroupInfo from './components/GroupInfo';
import MembersTable from './components/MembersTable';
import { getGroup, isFetchingMembers, isFetchingMonthlyTop } from '../../redux/selectors/groups';
import { getGroupCompetitions } from '../../redux/selectors/competitions';
import fetchDetailsAction from '../../redux/modules/groups/actions/fetchDetails';
import fetchMembersAction from '../../redux/modules/groups/actions/fetchMembers';
import fetchMonthlyTopAction from '../../redux/modules/groups/actions/fetchMonthlyTop';
import fetchGroupCompetitionsAction from '../../redux/modules/competitions/actions/fetchGroupCompetitions';
import updateAllAction from '../../redux/modules/groups/actions/updateAll';
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
  const [isButtonDisabled, setButtonDisabled] = useState(false);

  const isLoadingMembers = useSelector(state => isFetchingMembers(state));
  const isLoadingMonthlyTop = useSelector(state => isFetchingMonthlyTop(state));
  const group = useSelector(state => getGroup(state, parseInt(id, 10)));
  const competitions = useSelector(state => getGroupCompetitions(state, parseInt(id, 10)));

  const fetchDetails = () => {
    // Attempt to fetch group of that id, if it fails redirect to 404
    dispatch(fetchDetailsAction(id))
      .then(action => {
        if (action.error) throw new Error();
      })
      .catch(() => router.push('/404'));
  };

  const fetchCompetitions = () => {
    dispatch(fetchGroupCompetitionsAction(id));
  };

  const fetchMembers = () => {
    dispatch(fetchMembersAction(id));
  };

  const fetchMonthlyTop = () => {
    dispatch(fetchMonthlyTopAction(id));
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

  const handleUpdateAll = () => {
    dispatch(updateAllAction(id));
    setButtonDisabled(true);
  };

  const onOptionSelected = useCallback(handleOptionSelected, [router, group]);
  const onDeleteModalClosed = useCallback(handleDeleteModalClosed, []);
  const onUpdateAllClicked = useCallback(handleUpdateAll, [id, dispatch]);

  // Fetch group details, on mount
  useEffect(fetchDetails, [dispatch, id]);
  useEffect(fetchCompetitions, [dispatch, id]);
  useEffect(fetchMembers, [dispatch, id]);
  useEffect(fetchMonthlyTop, [dispatch, id]);

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
            <Button text="Update all" onClick={onUpdateAllClicked} disabled={isButtonDisabled} />
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
          <TopPlayerWidget group={group} isLoading={isLoadingMonthlyTop} />
        </div>
        <div className="col-md-4 col-sm-6">
          <span className="widget-label">Total overall experience</span>
          <TotalExperienceWidget group={group} isLoading={isLoadingMembers} />
        </div>
      </div>
      <div className="group__content row">
        <div className="col-md-4">
          <GroupInfo group={group} />
        </div>
        <div className="col-md-8">
          <MembersTable members={group.members} isLoading={isLoadingMembers} />
        </div>
      </div>
      {showingDeleteModal && group && <DeleteGroupModal group={group} onCancel={onDeleteModalClosed} />}
    </div>
  );
}

export default Group;
