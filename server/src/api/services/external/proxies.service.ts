import env from '../../../env';

interface ProxiesConfig {
  port: number;
  username: string;
  password: string;
  hosts: string[];
}

interface Proxy {
  port: number;
  host: string;
  auth: {
    username: string;
    password: string;
  };
}

class ProxiesHandler {
  private cursor: number;
  private config: ProxiesConfig;

  constructor() {
    const hostList = env.PROXY_LIST;
    const cpuCount: any = env.CPU_COUNT || '1';
    const cpuIndex: any = env.pm_id || 0;

    if (!hostList) {
      return;
    }

    const hosts = hostList.split(',');

    if (!hosts || hosts.length === 0) {
      return;
    }

    const hostsPerCpu = Math.floor(hosts.length / cpuCount);
    const allowedHosts = hosts.slice(hostsPerCpu * cpuIndex, hostsPerCpu * (cpuIndex + 1));

    const port = parseInt(env.PROXY_PORT, 10);
    const username = env.PROXY_USER;
    const password = env.PROXY_PASSWORD;

    this.cursor = 0;
    this.config = { port, username, password, hosts: allowedHosts };
  }

  getNextProxy(): Proxy {
    if (!this.config || !this.config.hosts) {
      return null;
    }

    const { port, username, password, hosts } = this.config;

    this.cursor += 1;

    if (this.cursor > 100000) {
      this.cursor = 0;
    }

    const index = this.cursor % hosts.length;
    const host = hosts[index];

    return { host, port, auth: { username, password } };
  }
}

export default new ProxiesHandler();
