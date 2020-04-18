function instance() {
  const config = {};
  let cursor = 0;

  function setup() {
    const hostList = process.env.PROXY_LIST;

    if (!hostList) {
      return;
    }

    const hosts = hostList.split(',');

    if (!hosts || hosts.length === 0) {
      return;
    }

    const port = process.env.PROXY_PORT;
    const username = process.env.PROXY_USER;
    const password = process.env.PROXY_PASSWORD;

    config.port = port;
    config.username = username;
    config.password = password;
    config.hosts = hosts;
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

  return { setup, getNextProxy };
}

module.exports = instance();
