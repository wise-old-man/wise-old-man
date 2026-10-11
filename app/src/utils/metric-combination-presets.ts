import { Metric, MetricType } from "@wise-old-man/utils";

export const METRIC_COMBINATION_PRESETS = [
  {
    name: "Combat Skills",
    type: MetricType.SKILL,
    metrics: [
      Metric.ATTACK,
      Metric.STRENGTH,
      Metric.DEFENCE,
      Metric.RANGED,
      Metric.PRAYER,
      Metric.MAGIC,
      Metric.HITPOINTS,
    ],
  },
  {
    name: "Gathering Skills",
    type: MetricType.SKILL,
    metrics: [Metric.FISHING, Metric.WOODCUTTING, Metric.MINING, Metric.FARMING, Metric.HUNTER],
  },
  {
    name: "God Wars Dungeon",
    type: MetricType.BOSS,
    metrics: [
      Metric.GENERAL_GRAARDOR,
      Metric.KRIL_TSUTSAROTH,
      Metric.KREEARRA,
      Metric.COMMANDER_ZILYANA,
    ],
  },
  {
    name: "God Wars Dungeon (+ Nex)",
    type: MetricType.BOSS,
    metrics: [
      Metric.GENERAL_GRAARDOR,
      Metric.KRIL_TSUTSAROTH,
      Metric.KREEARRA,
      Metric.COMMANDER_ZILYANA,
      Metric.NEX,
    ],
  },
  {
    name: "Dagannoth Kings",
    type: MetricType.BOSS,
    metrics: [Metric.DAGANNOTH_PRIME, Metric.DAGANNOTH_REX, Metric.DAGANNOTH_SUPREME],
  },
  {
    name: "Gauntlet",
    type: MetricType.BOSS,
    metrics: [Metric.THE_GAUNTLET, Metric.THE_CORRUPTED_GAUNTLET],
  },
  {
    name: "Wilderness Bosses",
    type: MetricType.BOSS,
    metrics: [
      Metric.VENENATIS,
      Metric.VETION,
      Metric.CALLISTO,
      Metric.SPINDEL,
      Metric.CALVARION,
      Metric.ARTIO,
    ],
  },
  {
    name: "Raids",
    type: MetricType.BOSS,
    metrics: [
      Metric.CHAMBERS_OF_XERIC,
      Metric.CHAMBERS_OF_XERIC_CM,
      Metric.THEATRE_OF_BLOOD,
      Metric.THEATRE_OF_BLOOD_HARD_MODE,
      Metric.TOMBS_OF_AMASCUT,
      Metric.TOMBS_OF_AMASCUT_EXPERT,
    ],
  },
  {
    name: "Desert Treasure 2 Bosses",
    type: MetricType.BOSS,
    metrics: [Metric.THE_LEVIATHAN, Metric.THE_WHISPERER, Metric.DUKE_SUCELLUS, Metric.VARDORVIS],
  },
];
