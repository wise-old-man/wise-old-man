---
title: 'Player Types & Entities'
sidebar_position: 1
---

# Player Types & Entities

<br />

### `(Enum)` Player Type

```bash
'unknown', 'regular', 'ironman', 'hardcore', 'ultimate'
```

<br />

### `(Enum)` Player Build

```bash
'main', 'f2p', 'lvl3', 'zerker', 'def1', 'hp10', 'f2p_lvl3'
```

<br />

### `(Enum)` Player Status

```bash
'active', 'unranked', 'flagged', 'archived', 'banned'
```

<br />

### `(Enum)` Country

```bash
'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM', 'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI', 'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW',
```

<br />

### `(Enum)` Achievement Measure

```bash
'levels', 'experience', 'kills', 'score', 'value'
```

<br />

### `(Object)` Snapshot Data Values

```typescript
{
  skills: {
    attack: {
        metric: "attack",
        ehp: number,
        rank: number,
        level: number,
        experience: number // (can be a long/bigint)
    },
    // ... etc for all skills
  },
  bosses: {
    abyssal_sire: {
        metric: "abyssal_sire",
        ehb: number,
        rank: number,
        kills: number
    },
    // ... etc for all bosses
  },
  activities: {
    bounty_hunter_hunter: {
        metric: "bounty_hunter_hunter",
        rank: number,
        score: number
    },
    // ... etc for all activities
  },
  computed: {
    ehp: {
        metric: "ehp",
        rank: number,
        value: number
    },
    // ... etc for all computed metrics
  }
}
```

<br />

### `(Object)` Snapshot

| Field      | Type                                                                                     | Description                                                                          |
| :--------- | :--------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| id         | integer                                                                                  | The snapshot's unique ID.                                                            |
| playerId   | integer                                                                                  | The snapshot's parent player ID.                                                     |
| createdAt  | date                                                                                     | The snapshot's creaton date.                                                         |
| importedAt | date?                                                                                    | The date at which the snapshot was imported at.                                      |
| data       | [Snapshot Data Values](/players-api/player-type-definitions#object-snapshot-data-values) | The exp / kc / rank / etc values for each skill, boss, activity and computed metric. |

<br />

### `(Object)` Player

:::note
Not to be confused with [Player Details](/players-api/player-type-definitions#object-player-details), which extends `Player`.
:::

| Field          | Type                                                                    | Description                                                                                                 |
| :------------- | :---------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------- |
| id             | integer                                                                 | The player's unique ID.                                                                                     |
| username       | string                                                                  | The player's usernam. (lowercase 1-12 characters)                                                           |
| displayName    | string                                                                  | The player's display name, very similar to `username`, except it supports capitalization. (1-12 characters) |
| type           | [PlayerType](/players-api/player-type-definitions#enum-player-type)     | The player's account type. (Default: `unknown`)                                                             |
| build          | [PlayerBuild](/players-api/player-type-definitions#enum-player-build)   | The player's account build. (Default: `main`)                                                               |
| country        | [Country](/players-api/player-type-definitions#enum-country)?           | The player's country of origin.                                                                             |
| status         | [PlayerStatus](/players-api/player-type-definitions#enum-player-status) | The player's account status. (Default: `active`)                                                            |
| patron         | boolean                                                                 | The player's patronage status (subscribed to our Patreon)                                                   |
| exp            | long (bigint)                                                           | The player's overall experience.                                                                            |
| ehp            | float                                                                   | The player's (skilling) Efficient Hours Played.                                                             |
| ehb            | float                                                                   | The player's Efficient Hours Bossed.                                                                        |
| ttm            | float                                                                   | The player's Time to Max (all 99s), in hours.                                                               |
| ttm200m        | float                                                                   | The player's Time to 200m All, in hours.                                                                    |
| registeredAt   | date                                                                    | The player's registration date.                                                                             |
| updatedAt      | date?                                                                   | The player's last successful update date.                                                                   |
| lastChangedAt  | date?                                                                   | The player's last change (gained exp, kc, etc) date.                                                        |
| lastImportedAt | date?                                                                   | The date of the last CML history import.                                                                    |

<br />

### `(Object)` Player Details

> extends [Player](/players-api/player-type-definitions#object-player)

| Field          | Type                                                               | Description                   |
| :------------- | :----------------------------------------------------------------- | :---------------------------- |
| combatLevel    | integer                                                            | The player's combat level.    |
| latestSnapshot | [Snapshot](/players-api/player-type-definitions#object-snapshot) ? | The player's latest snapshot. |

<br />

### `(Object)` Achievement

| Field     | Type                                                                                | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| :-------- | :---------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| playerId  | integer                                                                             | The parent player's ID.                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| name      | string                                                                              | The achievement's description/name.                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| metric    | [Metric](/global-type-definitions#enum-metric)                                      | The achievement's metric (Ex: `agility`).                                                                                                                                                                                                                                                                                                                                                                                                                              |
| measure   | [AchievementMeasure](/players-api/player-type-definitions#enum-achievement-measure) | The achievement's measure (Ex: `experience`).                                                                                                                                                                                                                                                                                                                                                                                                                          |
| threshold | long (bigint)                                                                       | The achievement's threshold. (Ex: `13034431`)                                                                                                                                                                                                                                                                                                                                                                                                                          |
| createdAt | date                                                                                | The achievement's creation date.                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| accuracy  | long? (bigint?)                                                                     | The achievement's creation date's accuracy (aka the margin of error, in milliseconds). <br/><br/> This value is the number of milliseconds between the "before" and the "after" snapshots, the lower this number is, the more certain we are that the `createdAt` date is accurate. <br /><br /> Note: This number can be `null` if the achievement hasn't been recalculated since the addition of this field. It can also be `-1` on achievements with unknown dates. |

<br />

### `(Object)` Achievement With Player

Used in endpoints where the resource context is not the player (ex: group achievements).

> extends [Achievement](/players-api/player-type-definitions#object-achievement)

| Field  | Type                                                         | Description              |
| :----- | :----------------------------------------------------------- | :----------------------- |
| player | [Player](/players-api/player-type-definitions#object-player) | The membership's player. |

<br />

### `(Object)` Player Achievement Progress

> extends [Achievement](/players-api/player-type-definitions#object-achievement)

:::caution
Although this type mostly extends from [Achievement](/players-api/player-type-definitions#object-achievement), please note that `createdAt` now becomes nullable, as null `createdAt` dates signify that the achievement has not been yet been achieved.
:::

| Field            | Type    | Description                                                                                                                                                                                                                                                                                                                                                                                        |
| :--------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| currentValue     | integer | The player's current value for that achievement's metric (& measure)                                                                                                                                                                                                                                                                                                                               |
| absoluteProgress | float   | The player's current progress (0-1, with 1 being 100%) towards an achievement.                                                                                                                                                                                                                                                                                                                     |
| relativeProgress | float   | The player's current progress (0-1, with 1 being 100%) towards an achievement, starting from the previous achievement for that metric and measure. <br /> <br /> Example: At 30M agility exp, you'd be (**absolutely**) 60% of the way to the 50M agility achievement, but since the previous achievement is 13M (99) agility, you're (**relatively**) at 46% between 99 agility and 50M agility.) |

<br />

### `(Object)` Timeline Datapoint

| Field | Type   | Description                                                            |
| :---- | :----- | :--------------------------------------------------------------------- |
| value | number | The player's value for a specific metric, at a specific point in time. |
| rank  | number | The player's rank for a specific metric, at a specific point in time.  |
| date  | date   | The date at which the datapoint was recorded.                          |

<br />

### `(Object)` Player Archive

| Field            | Type                                                         | Description                                            |
| :--------------- | :----------------------------------------------------------- | :----------------------------------------------------- |
| playerId         | integer                                                      | The parent player's ID.                                |
| previousUsername | string                                                       | The player's previous username (before the archival)   |
| archiveUsername  | string                                                       | The player's placeholder username (after the archival) |
| restoredUsername | string?                                                      | The player's new username (after restoration)          |
| createdAt        | date                                                         | The archive's creation date.                           |
| restoredAt       | date?                                                        | The archive's restoration date.                        |
| player           | [Player](/players-api/player-type-definitions#object-player) | The membership's player.                               |

<br />
