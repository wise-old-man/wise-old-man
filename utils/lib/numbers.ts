function round(num: number, cases: number) {
  return Math.round(num * Math.pow(10, cases)) / Math.pow(10, cases);
}

export { round };
