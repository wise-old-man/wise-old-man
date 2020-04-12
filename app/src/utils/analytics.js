export function uniformUrl(url) {
  if (url.startsWith('/players/search')) {
    return '/players/search/:username';
  }

  if (/^\/players\/(\d+)/.test(url)) {
    return '/players/:id';
  }

  if (/^\/competitions\/(\d+)/.test(url)) {
    return '/competition/:id';
  }

  if (/^\/competitions\/(\d+)\/edit/.test(url)) {
    return '/competition/:id/edit';
  }

  return url;
}
