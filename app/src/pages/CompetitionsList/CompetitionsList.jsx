import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import _ from 'lodash';
import { Helmet } from 'react-helmet';
import PageTitle from '../../components/PageTitle';
import TextInput from '../../components/TextInput';
import Selector from '../../components/Selector';
import TextButton from '../../components/TextButton';
import TableList from '../../components/TableList';
import TableListPlaceholder from '../../components/TableListPlaceholder';
import StatusDot from '../../components/StatusDot';
import fetchCompetitionsAction from '../../redux/modules/competitions/actions/fetchAll';
import { getCompetitions, isFetchingAll } from '../../redux/selectors/competitions';
import { capitalize, getSkillIcon } from '../../utils';
import { COMPETITION_SATUSES, SKILLS } from '../../config';
import './CompetitionsList.scss';

const DEFAULT_METRICS_OPTION = { label: 'Any skill', value: null };
const DEFAULT_STATUS_OPTION = { label: 'Any status', value: null };

function convertStatus(status) {
  switch (status) {
    case 'upcoming':
      return 'NEUTRAL';
    case 'ongoing':
      return 'POSITIVE';
    case 'finished':
      return 'NEGATIVE';
    default:
      return null;
  }
}

const TABLE_CONFIG = {
  uniqueKey: row => row.id,
  columns: [
    {
      key: 'metric',
      width: 30,
      transform: value => <img src={getSkillIcon(value)} alt="" />
    },
    { key: 'title', className: () => '-primary' },
    { key: 'duration', className: () => '-break-large' },
    {
      key: 'status',
      className: () => '-break-small',
      transform: (value, row) => {
        return (
          <div className="status-cell">
            <StatusDot status={convertStatus(value)} />
            <span>{row && row.countdown}</span>
          </div>
        );
      }
    }
  ]
};

function getStatusOptions() {
  return [...COMPETITION_SATUSES.map(s => ({ label: capitalize(s), value: s }))];
}

function getMetricOptions() {
  return [
    ...SKILLS.map(skill => ({
      label: capitalize(skill),
      icon: getSkillIcon(skill, true),
      value: skill
    }))
  ];
}

function CompetitionsList() {
  const router = useHistory();
  const dispatch = useDispatch();

  // State variables
  const [titleSearch, setTitleSearch] = useState('');
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  // Memoized redux variables
  const competitions = useSelector(state => getCompetitions(state));
  const isFetching = useSelector(state => isFetchingAll(state));

  const fetchCompetitions = query => {
    dispatch(fetchCompetitionsAction(query));
  };

  const handleSubmitSearch = _.debounce(
    () => {
      fetchCompetitions({
        title: titleSearch,
        metric: selectedMetric || null,
        status: selectedStatus || null
      });
    },
    500,
    { leading: true, trailing: false }
  );

  const handleSearchInput = e => {
    setTitleSearch(e.target.value);
  };

  const handleMetricSelected = e => {
    setSelectedMetric((e && e.value) || null);
  };

  const handleStatusSelected = e => {
    setSelectedStatus((e && e.value) || null);
  };

  const handleRowClicked = index => {
    router.push(`/competitions/${competitions[index].id}`);
  };

  // Memoized callbacks
  const onSubmitSearch = useCallback(handleSubmitSearch, [fetchCompetitions]);
  const onSearchInput = useCallback(handleSearchInput, [setTitleSearch]);
  const onMetricSelected = useCallback(handleMetricSelected, [setSelectedMetric]);
  const onStatusSelected = useCallback(handleStatusSelected, [setSelectedStatus]);
  const onRowClicked = useCallback(handleRowClicked, [router, competitions]);

  // Memoized variables
  const metricOptions = useMemo(getMetricOptions, []);
  const statusOptions = useMemo(getStatusOptions, []);

  // Submit search each time any of the search variable change
  useEffect(onSubmitSearch, [titleSearch, selectedMetric, selectedStatus]);

  return (
    <div className="competitions__container container">
      <Helmet>
        <title>Competitions</title>
      </Helmet>
      <div className="competitions__header row">
        <div className="col">
          <PageTitle title="Competitions" />
        </div>
        <div className="col">
          <TextButton text="Create new" redirectTo="/competitions/create" />
        </div>
      </div>
      <div className="competitions__options row">
        <div className="col-md-4 col-sm-12">
          <TextInput onChange={onSearchInput} placeholder="Search competition" />
        </div>
        <div className="col-md-4 col-sm-6">
          <Selector
            options={metricOptions}
            onSelect={onMetricSelected}
            defaultOption={DEFAULT_METRICS_OPTION}
          />
        </div>
        <div className="col-md-4 col-sm-6">
          <Selector
            options={statusOptions}
            onSelect={onStatusSelected}
            defaultOption={DEFAULT_STATUS_OPTION}
          />
        </div>
      </div>
      <div className="competitions__list row">
        <div className="col">
          {isFetching && (!competitions || competitions.length === 0) ? (
            <TableListPlaceholder size={5} />
          ) : (
            <TableList
              uniqueKeySelector={TABLE_CONFIG.uniqueKey}
              columns={TABLE_CONFIG.columns}
              rows={competitions}
              onRowClicked={onRowClicked}
              clickable
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default CompetitionsList;
