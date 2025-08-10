import BaseAPIClient from './clients/BaseAPIClient';
import CompetitionsClient from './clients/CompetitionsClient';
import DeltasClient from './clients/DeltasClient';
import EfficiencyClient from './clients/EfficiencyClient';
import GroupsClient from './clients/GroupsClient';
import NameChangesClient from './clients/NameChangesClient';
import PlayersClient from './clients/PlayersClient';
import RecordsClient from './clients/RecordsClient';
import config from './config';

interface WOMClientOptions {
  apiKey?: string;
  userAgent?: string;
  baseAPIUrl?: string;
}

export default class WOMClient extends BaseAPIClient {
  public deltas: DeltasClient;
  public groups: GroupsClient;
  public players: PlayersClient;
  public records: RecordsClient;
  public efficiency: EfficiencyClient;
  public nameChanges: NameChangesClient;
  public competitions: CompetitionsClient;

  constructor(options?: WOMClientOptions) {
    const baseApiUrl = options?.baseAPIUrl || config.baseAPIUrl;
    const headers = {
      'x-user-agent': options?.userAgent || config.defaultUserAgent
    };

    if (options?.apiKey) {
      headers['x-api-key'] = options.apiKey;
    }

    super(headers, baseApiUrl);

    this.deltas = new DeltasClient(headers, baseApiUrl);
    this.groups = new GroupsClient(headers, baseApiUrl);
    this.players = new PlayersClient(headers, baseApiUrl);
    this.records = new RecordsClient(headers, baseApiUrl);
    this.efficiency = new EfficiencyClient(headers, baseApiUrl);
    this.nameChanges = new NameChangesClient(headers, baseApiUrl);
    this.competitions = new CompetitionsClient(headers, baseApiUrl);
  }
}
