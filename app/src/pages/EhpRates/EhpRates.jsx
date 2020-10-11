import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import PageTitle from '../../components/PageTitle';
import Selector from '../../components/Selector';
import Table from '../../components/Table';
import { formatNumber, getMetricIcon, getMetricName } from '../../utils';
import fetchRatesActions from '../../redux/modules/rates/actions/fetchRates';
import { getEHPRates } from '../../redux/selectors/rates';
import './EhpRates.scss';

const RATES_TABLE_CONFIG = {
  uniqueKeySelector: row => row.startExp,
  columns: [
    {
      key: 'startExp',
      label: 'Exp.',
      isSortable: false,
      transform: value => formatNumber(value)
    },
    {
      key: 'rate',
      isSortable: false,
      transform: value => (value === 0 ? '---' : `${formatNumber(value)} per hour`)
    },
    {
      key: 'description',
      isSortable: false
    }
  ]
};

const BONUSES_TABLE_CONFIG = {
  uniqueKeySelector: row => `${row.skill}-${row.startExp}`,
  columns: [
    {
      key: 'startExp',
      label: 'Start Exp.',
      isSortable: false,
      transform: value => formatNumber(value)
    },
    {
      key: 'endExp',
      label: 'End Exp.',
      isSortable: false,
      transform: value => formatNumber(value, value === 200000000)
    },
    {
      key: 'bonusSkill',
      label: 'Skill',
      isSortable: false,
      transform: val => (
        <>
          <img src={getMetricIcon(val, true)} style={{ marginRight: 7 }} alt="" />
          <span>{getMetricName(val)}</span>
        </>
      )
    },
    {
      key: 'ratio',
      label: 'Bonus Ratio',
      isSortable: false
    },
    {
      key: 'bonusExp',
      label: 'Bonus Exp.',
      isSortable: false,
      transform: (val, row) => formatNumber((row.endExp - row.startExp) * row.ratio)
    }
  ]
};

function getTypeOptions() {
  return [
    { label: 'Main', value: 'main' },
    { label: 'Ironman', value: 'ironman' },
    { label: 'F2P', value: 'f2p' },
    { label: 'Level 3', value: 'lvl3' }
  ];
}

function Rates() {
  const dispatch = useDispatch();
  const router = useHistory();
  const { type } = useParams();

  const selectedType = type || 'main';

  const ehpRates = useSelector(getEHPRates);

  const typeOptions = useMemo(() => getTypeOptions(), []);
  const typeIndex = typeOptions.findIndex(o => o.value === selectedType);

  function handleFetchRates() {
    dispatch(fetchRatesActions('ehp', selectedType));
  }

  const handleTypeSelected = e => {
    const newType = e.value;
    router.push(`/rates/ehp/${newType}`);
  };

  useEffect(handleFetchRates, [selectedType]);

  if (!ehpRates) {
    return null;
  }

  return (
    <div className="ehp-rates__container container">
      <Helmet>
        <title>EHP rates</title>
      </Helmet>
      <div className="ehp-rates__header row">
        <div className="col-lg-8 col-sm-12">
          <PageTitle title="EHP Rates" />
        </div>
        <div className="col-lg-4">
          <Selector options={typeOptions} selectedIndex={typeIndex} onSelect={handleTypeSelected} />
        </div>
      </div>
      <div className="ehp-rates__content">
        {ehpRates.map(e => (
          <div key={e.skill} className="ehp-rates__section">
            <div className="section__header">
              <img className="section__icon" src={getMetricIcon(e.skill)} alt="" />
              <b className="section__title">{getMetricName(e.skill)}</b>
            </div>
            <div className="section__table-wrapper">
              <b>Rates</b>
              <Table
                rows={e.methods.sort((a, b) => a.startExp - b.startExp)}
                columns={RATES_TABLE_CONFIG.columns}
                uniqueKeySelector={RATES_TABLE_CONFIG.uniqueKeySelector}
              />
            </div>
            {e.bonuses && e.bonuses.length > 0 && (
              <div className="section__table-wrapper">
                <b>Bonuses</b>
                <Table
                  rows={e.bonuses.sort((a, b) => a.startExp - b.startExp)}
                  columns={BONUSES_TABLE_CONFIG.columns}
                  uniqueKeySelector={BONUSES_TABLE_CONFIG.uniqueKeySelector}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Rates;
