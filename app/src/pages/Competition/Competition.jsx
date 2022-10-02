import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Loading, Tabs, LineChart } from 'components';
import { ALL_METRICS } from 'config';
import { competitionActions, competitionSelectors } from 'redux/competitions';
import { playerActions } from 'redux/players';
import { useUrlContext } from 'hooks';
import { getCompetitionChartData } from 'utils';
import URL from 'utils/url';
import DeleteCompetitionModal from 'modals/DeleteCompetitionModal';
import UpdateAllModal from 'modals/UpdateAllModal';
import SelectMetricModal from 'modals/SelectMetricModal';
import ExportTableModal from 'modals/ExportTableModal';
import { Header, Widgets, ParticipantsTable, TeamsTable } from './containers';
import { CompetitionInfo, PreviewMetricWarning } from './components';
import { CompetitionContext } from './context';
import './Competition.scss';

function getTabs(competitionType) {
  const tabs = ['Participants Table', 'Top 5 progress chart'];

  if (competitionType === 'team') {
    tabs.unshift('Team standings');
  }

  return tabs;
}

function Competition() {
  const dispatch = useDispatch();
  const router = useHistory();

  const { context, updateContext } = useUrlContext(encodeContext, decodeURL);
  const { id, section, metric } = context;

  const [showUpdateAllModal, setShowUpdateAllModal] = useState(false);
  const [showExportTableModal, setShowExportTableModal] = useState(null);
  const [showSelectMetricModal, setShowSelectMetricModal] = useState(false);

  const competition = useSelector(competitionSelectors.getCompetition(id));
  const competitionTopHistory = useSelector(competitionSelectors.getCompetitionTopHistory(id));

  const competitionType = competition ? competition.type : 'classic';

  const tabs = getTabs(competitionType);
  const chartData = getCompetitionChartData(competitionTopHistory, metric);
  const selectedTabIndex = getSelectedTabIndex(competitionType, section);
  const showDeleteModal = section === 'delete' && !!competition;

  const handleUpdateAll = verificationCode => {
    dispatch(competitionActions.updateAll(id, verificationCode)).then(r => {
      if (!r.payload.error) setShowUpdateAllModal(false);
    });
  };

  const handleMetricSelected = newMetric => {
    updateContext({ metric: newMetric === competition.metric ? null : newMetric });
    setShowSelectMetricModal(false);
  };

  const handleUpdatePlayer = username => {
    dispatch(playerActions.trackPlayer(username));
  };

  const handleEditRedirect = () => {
    router.push(`/competitions/${id}/edit`);
  };

  const handleTabSelected = index => {
    if (competitionType === 'classic') {
      updateContext({ section: index === 0 ? 'participants' : 'chart' });
    } else if (index === 0) {
      updateContext({ section: 'teams' });
    } else if (index === 1) {
      updateContext({ section: 'participants' });
    } else {
      updateContext({ section: 'chart' });
    }
  };

  const handleExportClicked = (type, teamName) => {
    setShowExportTableModal({ type, teamName, metric, competitionId: id });
  };

  // Fetch competition details, on mount
  useEffect(() => fetchDetails(id, metric, router, dispatch), [router, metric, dispatch, id]);

  useEffect(() => {
    if (competition && competition.type === 'classic' && section === 'teams') {
      router.replace(encodeContext({ id, section: 'participants' }));
    }
  }, [section, id, router, competition]);

  if (!competition) {
    return <Loading />;
  }

  return (
    <CompetitionContext.Provider value={{ context, updateContext }}>
      <Helmet>
        <title>{competition.title}</title>
      </Helmet>
      <div className="competition__container container">
        <div className="competition__header row">
          <div className="col">
            <Header
              competition={competition}
              handleEditRedirect={handleEditRedirect}
              handleUpdateAll={() => setShowUpdateAllModal(true)}
              handleSelectMetric={() => setShowSelectMetricModal(true)}
            />
          </div>
        </div>
        {metric && <PreviewMetricWarning trueMetric={competition.metric} previewMetric={metric} />}
        <div className="competition__widgets row">
          <Widgets competition={competition} metric={metric || competition.metric} />
        </div>
        <div className="competition__content row">
          <div className="col-md-3">
            <CompetitionInfo competition={competition} />
          </div>
          <div className="col-md-9">
            <Tabs tabs={tabs} selectedIndex={selectedTabIndex} onTabSelected={handleTabSelected} />
            {section === 'teams' && (
              <TeamsTable
                competition={competition}
                metric={metric || competition.metric}
                onUpdateClicked={handleUpdatePlayer}
                onExportTeamsClicked={() => handleExportClicked('teams')}
                onExportTeamClicked={teamName => handleExportClicked('team', teamName)}
              />
            )}
            {section === 'participants' && (
              <ParticipantsTable
                competition={competition}
                metric={metric || competition.metric}
                onUpdateClicked={handleUpdatePlayer}
                onExportParticipantsClicked={() => handleExportClicked('participants')}
              />
            )}
            {section === 'chart' && <LineChart datasets={chartData} yAxisPrefix="+" labelPrefix="+" />}
          </div>
        </div>
        {showDeleteModal && (
          <DeleteCompetitionModal
            competition={competition}
            onCancel={() => updateContext({ section: 'teams' })}
          />
        )}
        {showUpdateAllModal && (
          <UpdateAllModal
            entityName="competition"
            onCancel={() => setShowUpdateAllModal(false)}
            onSubmit={handleUpdateAll}
          />
        )}
        {showSelectMetricModal && (
          <SelectMetricModal
            defaultMetric={metric || competition.metric}
            onCancel={() => setShowSelectMetricModal(false)}
            onSubmit={handleMetricSelected}
          />
        )}
        {showExportTableModal && (
          <ExportTableModal
            exportConfig={showExportTableModal}
            onCancel={() => setShowExportTableModal(null)}
          />
        )}
      </div>
    </CompetitionContext.Provider>
  );
}

const fetchDetails = (id, metric, router, dispatch) => {
  // Attempt to fetch competition of that id, if it fails redirect to 404
  dispatch(competitionActions.fetchDetails(id, metric))
    .then(action => {
      if (!action.payload.data) throw new Error();

      dispatch(competitionActions.fetchCompetitionTop5History(id, metric));
    })
    .catch(() => router.push('/404'));
};

function getSelectedTabIndex(competitionType, section) {
  if (competitionType === 'classic') {
    return section === 'chart' ? 1 : 0;
  }

  switch (section) {
    case 'participants':
      return 1;
    case 'chart':
      return 2;
    default:
      return 0;
  }
}

function encodeContext({ id, section, metric }) {
  const nextURL = new URL(`/competitions/${id}/${section}`);

  if (metric && ALL_METRICS.includes(metric)) {
    nextURL.appendSearchParam('metric', metric);
  }

  return nextURL.getPath();
}

function decodeURL(params, query) {
  const id = parseInt(params.id, 10);
  const context = { id, section: params.section };

  // Since these decode/encode functions don't have access to the competition type
  // by default, try to render the "teams" display, and if it isn't a
  // team competition, a useEffect will correct the section to 'participants'
  if (!params.section) {
    context.section = 'teams';
  }

  if (query.metric && ALL_METRICS.includes(query.metric)) {
    context.metric = query.metric;
  }

  return context;
}

export default Competition;
