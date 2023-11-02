export function isAppleDevice() {
  if (navigator === undefined) return false;
  return /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent);
}
