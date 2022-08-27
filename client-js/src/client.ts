import DeltasClient from './clients/DeltasClient';
import GroupsClient from './clients/GroupsClient';
import PlayersClient from './clients/PlayersClient';
import RecordsClient from './clients/RecordsClient';
import EfficiencyClient from './clients/EfficiencyClient';
import NameChangesClient from './clients/NameChangesClient';
import CompetitionsClient from './clients/CompetitionsClient';

export default class WOMClient {
  public deltas: DeltasClient;
  public groups: GroupsClient;
  public players: PlayersClient;
  public records: RecordsClient;
  public efficiency: EfficiencyClient;
  public nameChanges: NameChangesClient;
  public competitions: CompetitionsClient;

  constructor() {
    this.deltas = new DeltasClient();
    this.groups = new GroupsClient();
    this.players = new PlayersClient();
    this.records = new RecordsClient();
    this.efficiency = new EfficiencyClient();
    this.nameChanges = new NameChangesClient();
    this.competitions = new CompetitionsClient();
  }
}
