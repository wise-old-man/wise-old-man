import * as jagexService from '../../services/external/jagex.service';
import * as leagueService from '../../services/internal/league.service';
import { Job } from '../index';

const CHECK_DELAY = 5000;
const CHECK_RANGE = 100;

async function sleep(millis: number) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

async function isValidPage(pageIndex: number) {
  const tableRanks = await jagexService.getLeagueTableRanks(pageIndex);
  return !tableRanks.includes('1');
}

class CheckLeagueRanks implements Job {
  name: string;

  constructor() {
    this.name = 'CheckLeagueRanks';
  }

  async handle(): Promise<void> {
    // Fetch the previous highest page index from the database
    const previousHighest = await leagueService.getLatestPage();
    let newHighest = -1;

    // Check all the next pages for the new highest
    for (let i = 1; i <= CHECK_RANGE; i++) {
      if (newHighest !== -1) break;

      const pageIndex = previousHighest + i;
      const isValid = await sleep(CHECK_DELAY).then(async () => await isValidPage(pageIndex));

      if (!isValid) {
        newHighest = pageIndex - 1;
      }
    }

    // If found a new highest, update the database
    if (newHighest !== -1 && newHighest !== previousHighest) {
      await leagueService.updateLatestPage(newHighest);
    }
  }
}

export default new CheckLeagueRanks();
