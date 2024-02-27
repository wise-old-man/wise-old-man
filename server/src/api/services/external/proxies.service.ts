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
  private config: ProxiesConfig | null;

  constructor() {
    this.cursor = 0;
    this.config = loadConfig();
  }

  getNextProxy(): Proxy | null {
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

function loadConfig() {
  const hostList = process.env.PROXY_LIST;
  const cpuCount = process.env.CPU_COUNT ? process.env.CPU_COUNT : 1;
  const cpuIndex = process.env.pm_id ? parseInt(process.env.pm_id) : 0;

  if (!hostList) {
    return null;
  }

  const hosts = hostList.split(',');

  if (!hosts || hosts.length === 0) {
    return null;
  }

  const hostsPerCpu = Math.floor(hosts.length / cpuCount);
  const allowedHosts = hosts.slice(hostsPerCpu * cpuIndex, hostsPerCpu * (cpuIndex + 1));

  const port = process.env.PROXY_PORT;
  const username = process.env.PROXY_USER;
  const password = process.env.PROXY_PASSWORD;

  if (!port || !username || !password) {
    return null;
  }

  return { port, username, password, hosts: allowedHosts };
}

export default new ProxiesHandler();
