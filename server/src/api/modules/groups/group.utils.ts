function sanitizeName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/ +(?= )/g, '')
    .trim();
}

function buildDefaultSocialLinks() {
  return {
    website: null,
    discord: null,
    twitter: null,
    youtube: null,
    twitch: null
  };
}

export { sanitizeName, buildDefaultSocialLinks };
