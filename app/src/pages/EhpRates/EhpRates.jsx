import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { MetricProps } from '@wise-old-man/utils';
import { Helmet } from 'react-helmet';
import { ratesActions, ratesSelectors } from 'redux/rates';
import { PageTitle, Selector, Table } from 'components';
import { formatNumber, getMetricIcon } from 'utils';
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
      transform: (value, row) => {
        if (value === 0) return '---';

        if (row.realRate) {
          return (
            <div className="scaled-rate">
              {`${formatNumber(value)} per hour`}
              <span>{`(actually ${formatNumber(row.realRate)} per hour)`}</span>
            </div>
          );
        }

        return `${formatNumber(value)} per hour`;
      }
    },
    {
      key: 'description',
      isSortable: false
    }
  ]
};

const BONUSES_TABLE_CONFIG = {
  uniqueKeySelector: row => `${row.bonusSkill}-${row.startExp}`,
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
          <span>{MetricProps[val].name}</span>
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
      transform: (_, row) => {
        if (row.maxBonus) return `${formatNumber(row.maxBonus)} (max)`;
        return formatNumber(Math.min(200000000, Math.floor((row.endExp - row.startExp) * row.ratio)));
      }
    }
  ]
};

function getTypeOptions() {
  return [
    { label: 'Main', value: 'main' },
    { label: 'Ironman', value: 'ironman' },
    { label: 'Ultimate', value: 'ultimate' },
    { label: 'F2P', value: 'f2p' },
    { label: 'Level 3', value: 'lvl3' }
  ];
}

function Rates() {
  const dispatch = useDispatch();
  const router = useHistory();
  const { type } = useParams();

  const selectedType = type || 'main';

  const ehpRates = useSelector(ratesSelectors.getEHPRates);

  const typeOptions = useMemo(() => getTypeOptions(), []);
  const typeIndex = typeOptions.findIndex(o => o.value === selectedType);

  function handleFetchRates() {
    dispatch(ratesActions.fetchRates('ehp', selectedType));
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
              <b className="section__title">{MetricProps[e.skill].name}</b>
            </div>
            <div className="section__table-wrapper">
              <b>Rates</b>
              <Table
                rows={e.methods.slice().sort((a, b) => a.startExp - b.startExp)}
                columns={RATES_TABLE_CONFIG.columns}
                uniqueKeySelector={RATES_TABLE_CONFIG.uniqueKeySelector}
              />
            </div>
            {e.bonuses && e.bonuses.length > 0 && (
              <div className="section__table-wrapper">
                <b>Bonuses</b>
                <Table
                  rows={e.bonuses.slice().sort((a, b) => a.startExp - b.startExp)}
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
