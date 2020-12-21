import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Loading, Tabs } from 'components';
import { competitionActions, competitionSelectors } from 'redux/competitions';
import { playerActions } from 'redux/players';
import { useUrlContext } from 'hooks';
import URL from 'utils/url';
import DeleteCompetitionModal from 'modals/DeleteCompetitionModal';
import { Header, Widgets, ParticipantsTable, ParticipantsChart } from './containers';
import { CompetitionInfo } from './components';
import { CompetitionContext } from './context';
import './Competition.scss';

const TABS = ['Progress Table', 'Top 5 progress chart'];

function Competition() {
  const dispatch = useDispatch();
  const router = useHistory();

  const { context, updateContext } = useUrlContext(encodeContext, decodeURL);
  const { id, section } = context;

  const competition = useSelector(state => competitionSelectors.getCompetition(state, id));
  const selectedTabIndex = section === 'chart' ? 1 : 0;
  const showDeleteModal = section === 'delete' && !!competition;

  const handleUpdateAll = () => {
    dispatch(competitionActions.updateAll(id));
  };

  const handleUpdatePlayer = username => {
    dispatch(playerActions.trackPlayer(username));
  };

  const handleEditRedirect = () => {
    router.push(`/competitions/${id}/edit`);
  };

  const handleTabSelected = index => {
    if (index === 1) {
      updateContext({ section: 'chart' });
    } else {
      updateContext({ section: 'participants' });
    }
  };

  // Fetch competition details, on mount
  useEffect(() => fetchDetails(id, router, dispatch), [router, dispatch, id]);

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
              handleUpdateAll={handleUpdateAll}
              handleEditRedirect={handleEditRedirect}
            />
          </div>
        </div>
        <div className="competition__widgets row">
          <Widgets competition={competition} />
        </div>
        <div className="competition__content row">
          <div className="col-md-4">
            <CompetitionInfo competition={competition} />
          </div>
          <div className="col-md-8">
            <Tabs tabs={TABS} selectedIndex={selectedTabIndex} onTabSelected={handleTabSelected} />
            {section === 'chart' ? (
              <ParticipantsChart />
            ) : (
              <ParticipantsTable competition={competition} onUpdateClicked={handleUpdatePlayer} />
            )}
          </div>
        </div>
        {showDeleteModal && (
          <DeleteCompetitionModal
            competition={competition}
            onCancel={() => updateContext({ section: 'participants' })}
          />
        )}
      </div>
    </CompetitionContext.Provider>
  );
}

const fetchDetails = (id, router, dispatch) => {
  // Attempt to fetch competition of that id, if it fails redirect to 404
  dispatch(competitionActions.fetchDetails(id))
    .then(action => {
      if (!action.payload.data) throw new Error();
    })
    .catch(() => router.push('/404'));
};

function encodeContext({ id, section }) {
  const nextURL = new URL(`/competitions/${id}`);

  if (section === 'chart' || section === 'delete') {
    nextURL.appendToPath(`/${section}`);
  }

  return nextURL.getPath();
}

function decodeURL(params) {
  if (params.section && (params.section === 'chart' || params.section === 'delete')) {
    return { id: parseInt(params.id, 10), section: params.section };
  }

  return { id: parseInt(params.id, 10), section: 'participants' };
}

export default Competition;
