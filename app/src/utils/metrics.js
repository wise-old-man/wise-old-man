export function getMetricIcon(metric, smallVersion) {
  const folder = smallVersion ? 'icons_small' : 'icons';
  return `/img/runescape/${folder}/${metric}.png`;
}
