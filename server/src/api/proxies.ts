import env from '../env';

class ProxiesHandler {
  private cursor;
  private config;

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

    const port = env.PROXY_PORT;
    const username = env.PROXY_USER;
    const password = env.PROXY_PASSWORD;

    this.cursor = 0;
    this.config = { port, username, password, hosts: allowedHosts };
  }

  getNextProxy() {
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
