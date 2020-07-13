import env from '../env';

const config: any = {};
let cursor = 0;

function setup() {
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

  config.port = port;
  config.username = username;
  config.password = password;
  config.hosts = allowedHosts;
}

function getNextProxy() {
  if (!config || !config.hosts) {
    return null;
  }

  const { port, username, password, hosts } = config;

  cursor += 1;

  if (cursor > 100000) {
    cursor = 0;
  }

  const index = cursor % hosts.length;
  const host = hosts[index];

  return { host, port, auth: { username, password } };
}
export { setup, getNextProxy };
