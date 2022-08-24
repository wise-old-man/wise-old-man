import { Country, GetRecordLeaderboardResponse, Metric, Period, RecordLeaderboardFilter, WOMClient } from '.';

async function run() {
  try {
    const womClient = new WOMClient();

    console.log(await womClient.players.searchPlayers('psik'));
    // console.log(await womClient.players.updatePlayer('psikoi'));
    // console.log(await womClient.records.getRecordLeaderboard({ metric: 'zulrah', period: 'week' }));

    // console.log(await womClient.deltas.getDeltaLeaderboard({ metric: 'zulrah', period: 'week' }));

    console.log(
      await womClient.efficiency.getEfficiencyLeaderboards({
        metric: 'ehb',
        playerType: 'ultimate'
      })
    );

    console.log(await womClient.efficiency.getEHBRates('lvl3'));
  } catch (error) {
    console.log(error);
  }
}

run();
