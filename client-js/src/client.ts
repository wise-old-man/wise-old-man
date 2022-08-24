import PlayersClient from './clients/PlayersClient';
import RecordsClient from './clients/RecordsClient';
import DeltasClient from './clients/DeltasClient';
import EfficiencyClient from './clients/EfficiencyClient';

export default class WOMClient {
  public players: PlayersClient;
  public records: RecordsClient;
  public deltas: DeltasClient;
  public efficiency: EfficiencyClient;

  constructor() {
    this.players = new PlayersClient();
    this.records = new RecordsClient();
    this.deltas = new DeltasClient();
    this.efficiency = new EfficiencyClient();
  }
}
