import axios from 'axios';
import config from './config';
import DeltasClient from './clients/DeltasClient';
import GroupsClient from './clients/GroupsClient';
import PlayersClient from './clients/PlayersClient';
import RecordsClient from './clients/RecordsClient';
import EfficiencyClient from './clients/EfficiencyClient';
import NameChangesClient from './clients/NameChangesClient';
import CompetitionsClient from './clients/CompetitionsClient';

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

    const axiosInstance = axios.create({
      baseURL: options?.baseAPIUrl || config.baseAPIUrl,
      headers
    });

    this.deltas = new DeltasClient(axiosInstance);
    this.groups = new GroupsClient(axiosInstance);
    this.players = new PlayersClient(axiosInstance);
    this.records = new RecordsClient(axiosInstance);
    this.efficiency = new EfficiencyClient(axiosInstance);
    this.nameChanges = new NameChangesClient(axiosInstance);
    this.competitions = new CompetitionsClient(axiosInstance);
  }
}
