import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Loading from '../../components/Loading';
import PageHeader from '../../components/PageHeader';
import Dropdown from '../../components/Dropdown';
import TopPlayerWidget from './components/TopPlayerWidget';
import TotalExperienceWidget from './components/TotalExperienceWidget';
import { getGroup } from '../../redux/selectors/groups';
import fetchDetailsAction from '../../redux/modules/groups/actions/fetchDetails';
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
  const dispatch = useDispatch();

  const group = useSelector(state => getGroup(state, parseInt(id, 10)));

  const fetchDetails = () => {
    dispatch(fetchDetailsAction(id));
  };

  // Fetch group details, on mount
  useEffect(fetchDetails, [dispatch, id]);

  if (!group) {
    return <Loading />;
  }

  return (
    <div className="group__container container">
      <div className="group__header row">
        <div className="col">
          <PageHeader title={group.name}>
            <Dropdown options={MENU_OPTIONS} onSelect={() => {}}>
              <button className="header__options-btn" type="button">
                <img src="/img/icons/options.svg" alt="" />
              </button>
            </Dropdown>
          </PageHeader>
        </div>
      </div>
      <div className="group__widgets row">
        <div className="col-md-4">
          <span className="widget-label">Ongoing Competition</span>
          <div />
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
    </div>
  );
}

export default Group;
