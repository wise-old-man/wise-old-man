import PlayersClient from './clients/PlayersClient';
import RecordsClient from './clients/RecordsClient';
import DeltasClient from './clients/DeltasClient';
import EfficiencyClient from './clients/EfficiencyClient';
import NameChangesClient from './clients/NameChangesClient';
import CompetitionsClient from './clients/CompetitionsClient';

export default class WOMClient {
  public players: PlayersClient;
  public records: RecordsClient;
  public deltas: DeltasClient;
  public efficiency: EfficiencyClient;
  public nameChanges: NameChangesClient;
  public competitions: CompetitionsClient;

  constructor() {
    this.players = new PlayersClient();
    this.records = new RecordsClient();
    this.deltas = new DeltasClient();
    this.efficiency = new EfficiencyClient();
    this.nameChanges = new NameChangesClient();
    this.competitions = new CompetitionsClient();
  }
}
