import config from './config';
import DeltasClient from './clients/DeltasClient';
import GroupsClient from './clients/GroupsClient';
import PlayersClient from './clients/PlayersClient';
import RecordsClient from './clients/RecordsClient';
import EfficiencyClient from './clients/EfficiencyClient';
import NameChangesClient from './clients/NameChangesClient';
import CompetitionsClient from './clients/CompetitionsClient';
import HttpClient from './clients/HttpClient';

interface WOMClientOptions {
  apiKey?: string;
  userAgent?: string;
  baseAPIUrl?: string;
}

export default class WOMClient {
  public deltas: DeltasClient;
  public groups: GroupsClient;
  public players: PlayersClient;
  public records: RecordsClient;
  public efficiency: EfficiencyClient;
  public nameChanges: NameChangesClient;
  public competitions: CompetitionsClient;

  constructor(options?: WOMClientOptions) {
    const headers = {
      'x-user-agent': options?.userAgent || config.defaultUserAgent
    };

    if (options?.apiKey) {
      headers['x-api-key'] = options.apiKey;
    }

    const http = new HttpClient(headers, options?.baseAPIUrl || config.baseAPIUrl);

    this.deltas = new DeltasClient(http);
    this.groups = new GroupsClient(http);
    this.players = new PlayersClient(http);
    this.records = new RecordsClient(http);
    this.efficiency = new EfficiencyClient(http);
    this.nameChanges = new NameChangesClient(http);
    this.competitions = new CompetitionsClient(http);
  }
}
