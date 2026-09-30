import { CompetitionDetailsResponse, Metric } from "@wise-old-man/utils";

type Participation = CompetitionDetailsResponse["participations"][number];

/**
 * Sorts participations by their gains in a given metric, highest first.
 *
 * This mirrors the tie-breaking the API sorts its own standings with, so that every
 * ranking shown on the competition page agrees on who sits where.
 */
export function sortParticipations(participations: Participation[], metric: Metric | "total") {
  const getValues = (p: Participation) => {
    return p.deltas.find((d) => d.metric === metric)?.values;
  };

  return [...participations].sort(
    (a, b) =>
      (getValues(b)?.gained ?? 0) - (getValues(a)?.gained ?? 0) ||
      (getValues(b)?.start ?? 0) - (getValues(a)?.start ?? 0) ||
      a.player.id - b.player.id,
  );
}
