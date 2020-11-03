import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import * as ratesActions from 'redux/rates/actions';
import * as ratesSelectors from 'redux/rates/selectors';
import PageTitle from '../../components/PageTitle';
import Selector from '../../components/Selector';
import Table from '../../components/Table';
import { formatNumber, getMetricIcon, getMetricName } from '../../utils';
import './EhbRates.scss';

const RATES_TABLE_CONFIG = {
  uniqueKeySelector: row => row.startExp,
  columns: [
    {
      key: 'boss',
      transform: value => (
        <>
          <img src={getMetricIcon(value, true)} style={{ marginRight: 7 }} alt="" />
          <span>{getMetricName(value)}</span>
        </>
      )
    },
    {
      key: 'rate',
      isSortable: false,
      transform: value => (value === 0 ? '---' : `${formatNumber(value)} kills per hour`)
    }
  ]
};

function getTypeOptions() {
  return [
    { label: 'Main', value: 'main' },
    { label: 'Ironman', value: 'ironman' }
  ];
}

function Rates() {
  const dispatch = useDispatch();
  const router = useHistory();
  const { type } = useParams();

  const selectedType = type || 'main';

  const ehbRates = useSelector(ratesSelectors.getEHBRates);

  const typeOptions = useMemo(() => getTypeOptions(), []);
  const typeIndex = typeOptions.findIndex(o => o.value === selectedType);

  function handleFetchRates() {
    dispatch(ratesActions.fetchRates('ehb', selectedType));
  }

  const handleTypeSelected = e => {
    const newType = e.value;
    router.push(`/rates/ehb/${newType}`);
  };

  useEffect(handleFetchRates, [selectedType]);

  if (!ehbRates) {
    return null;
  }

  return (
    <div className="ehb-rates__container container">
      <Helmet>
        <title>EHB rates</title>
      </Helmet>
      <div className="ehb-rates__header row">
        <div className="col-lg-8 col-sm-12">
          <PageTitle title="EHB Rates" />
        </div>
        <div className="col-lg-4">
          <Selector options={typeOptions} selectedIndex={typeIndex} onSelect={handleTypeSelected} />
        </div>
      </div>
      <div className="ehb-rates__content">
        <Table
          rows={ehbRates}
          columns={RATES_TABLE_CONFIG.columns}
          uniqueKeySelector={RATES_TABLE_CONFIG.uniqueKeySelector}
        />
      </div>
    </div>
  );
}

export default Rates;
