import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { LineChart } from 'components';
import { competitionSelectors } from 'redux/competitions';
import { CompetitionContext } from '../context';

function ParticipantsChart() {
  const { context } = useContext(CompetitionContext);
  const { id } = context;

  const chartData = useSelector(state => competitionSelectors.getChartData(state, id));

  return <LineChart datasets={chartData} />;
}

export default ParticipantsChart;
