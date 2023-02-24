---
title: 'Group Types & Entities'
sidebar_position: 1
---

# Group Types & Entities

<br />

### `(Enum)` Group Role

```bash
'achiever', 'adamant', 'adept', 'administrator', 'admiral', 'adventurer', 'air', 'anchor', 'apothecary', 'archer', 'armadylean', 'artillery', 'artisan', 'asgarnian', 'assassin', 'assistant', 'astral', 'athlete', 'attacker', 'bandit', 'bandosian', 'barbarian', 'battlemage', 'beast', 'berserker', 'blisterwood', 'blood', 'blue', 'bob', 'body', 'brassican', 'brawler', 'brigadier', 'brigand', 'bronze', 'bruiser', 'bulwark', 'burglar', 'burnt', 'cadet', 'captain', 'carry', 'champion', 'chaos', 'cleric', 'collector', 'colonel', 'commander', 'competitor', 'completionist', 'constructor', 'cook', 'coordinator', 'corporal', 'cosmic', 'councillor', 'crafter', 'crew', 'crusader', 'cutpurse', 'death', 'defender', 'defiler', 'deputy_owner', 'destroyer', 'diamond', 'diseased', 'doctor', 'dogsbody', 'dragon', 'dragonstone', 'druid', 'duellist', 'earth', 'elite', 'emerald', 'enforcer', 'epic', 'executive', 'expert', 'explorer', 'farmer', 'feeder', 'fighter', 'fire', 'firemaker', 'firestarter', 'fisher', 'fletcher', 'forager', 'fremennik', 'gamer', 'gatherer', 'general', 'gnome_child', 'gnome_elder', 'goblin', 'gold', 'goon', 'green', 'grey', 'guardian', 'guthixian', 'harpoon', 'healer', 'hellcat', 'helper', 'herbologist', 'hero', 'holy', 'hoarder', 'hunter', 'ignitor', 'illusionist', 'imp', 'infantry', 'inquisitor', 'iron', 'jade', 'justiciar', 'kandarin', 'karamjan', 'kharidian', 'kitten', 'knight', 'labourer', 'law', 'leader', 'learner', 'legacy', 'legend', 'legionnaire', 'lieutenant', 'looter', 'lumberjack', 'magic', 'magician', 'major', 'maple', 'marshal', 'master', 'maxed', 'mediator', 'medic', 'mentor', 'member', 'merchant', 'mind', 'miner', 'minion', 'misthalinian', 'mithril', 'moderator', 'monarch', 'morytanian', 'mystic', 'myth', 'natural', 'nature', 'necromancer', 'ninja', 'noble', 'novice', 'nurse', 'oak', 'officer', 'onyx', 'opal', 'oracle', 'orange', 'owner', 'page', 'paladin', 'pawn', 'pilgrim', 'pine', 'pink', 'prefect', 'priest', 'private', 'prodigy', 'proselyte', 'prospector', 'protector', 'pure', 'purple', 'pyromancer', 'quester', 'racer', 'raider', 'ranger', 'record_chaser', 'recruit', 'recruiter', 'red_topaz', 'red', 'rogue', 'ruby', 'rune', 'runecrafter', 'sage', 'sapphire', 'saradominist', 'saviour', 'scavenger', 'scholar', 'scourge', 'scout', 'scribe', 'seer', 'senator', 'sentry', 'serenist', 'sergeant', 'shaman', 'sheriff', 'short_green_guy', 'skiller', 'skulled', 'slayer', 'smiter', 'smith', 'smuggler', 'sniper', 'soul', 'specialist', 'speed_runner', 'spellcaster', 'squire', 'staff', 'steel', 'strider', 'striker', 'summoner', 'superior', 'supervisor', 'teacher', 'templar', 'therapist', 'thief', 'tirannian', 'trialist', 'trickster', 'tzkal', 'tztok', 'unholy', 'vagrant', 'vanguard', 'walker', 'wanderer', 'warden', 'warlock', 'warrior', 'water', 'wild', 'willow', 'wily', 'wintumber', 'witch', 'wizard', 'worker', 'wrath', 'xerician', 'yellow', 'yew', 'zamorakian', 'zarosian', 'zealot', 'zenyte'
```

<br />

### `(Object)` Group

| Field       | Type    | Description                              |
| :---------- | :------ | :--------------------------------------- |
| id          | integer | The group's ID.                          |
| name        | string  | The group's name.                        |
| clanChat    | string  | The group's clan chat (1-12 characters). |
| description | string? | The group's description.                 |
| homeworld   | number? | The group's homeworld.                   |
| verified    | boolean | The group's verified status.             |
| score       | integer | The group's global ranking score.        |
| createdAt   | date    | The group's creation date.               |
| updatedAt   | date    | The group's last modification date.      |
| memberCount | integer | The group's total number of members.     |

<br />

### `(Object)` Group Details

> extends [Group](/groups-api/group-type-definitions#object-group)

| Field       | Type                                                                            | Description              |
| :---------- | :------------------------------------------------------------------------------ | :----------------------- |
| memberships | [GroupMembership](/groups-api/group-type-definitions#object-group-membership)[] | The group's memberships. |

<br />

### `(Object)` Membership

| Field     | Type                                                             | Description                                                      |
| :-------- | :--------------------------------------------------------------- | :--------------------------------------------------------------- |
| playerId  | integer                                                          | The player's ID.                                                 |
| groupId   | integer                                                          | The group's ID.                                                  |
| role      | [GroupRole](/groups-api/group-type-definitions#enum-group-role)? | The player's role (rank) in the group.                           |
| createdAt | date                                                             | The date at which the player was added as a member to the group. |
| updatedAt | date                                                             | The date at which the membership was updated.                    |

<br />

### `(Object)` Group Membership

Returned in group-centric endpoints.

> extends [Membership](/groups-api/group-type-definitions#object-membership)

| Field  | Type                                                         | Description              |
| :----- | :----------------------------------------------------------- | :----------------------- |
| player | [Player](/players-api/player-type-definitions#object-player) | The membership's player. |

<br />

### `(Object)` Player Membership

Returned in player-centric endpoints.

> extends [Membership](/groups-api/group-type-definitions#object-membership)

| Field | Type                                                     | Description                          |
| :---- | :------------------------------------------------------- | :----------------------------------- |
| group | [Group](/groups-api/group-type-definitions#object-group) | The group the player is a member in. |

<br />

### `(Object)` Group Member Fragment

Used as an input for group modification endpoints (create, edit, add members, etc)

| Field    | Type                                                             | Description                            |
| :------- | :--------------------------------------------------------------- | :------------------------------------- |
| username | string                                                           | The player's username.                 |
| role     | [GroupRole](/groups-api/group-type-definitions#enum-group-role)? | The player's role (rank) in the group. |

<br />

### `(Object)` Group Hiscores Entry

| Field  | Type                                                                                                                                                                                                                                                                                                                                                                                                                    | Description                                         |
| :----- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------- |
| player | [Player](/players-api/player-type-definitions#object-player)                                                                                                                                                                                                                                                                                                                                                            | The hiscores entry's parent player.                 |
| data   | [GroupHiscoresSkillItem](/groups-api/group-type-definitions#object-group-hiscores-skill-item) \| [GroupHiscoresBossItem](/groups-api/group-type-definitions#object-group-hiscores-boss-item) \| [GroupHiscoresActivityItem](/groups-api/group-type-definitions#object-group-hiscores-activity-item) \| [GroupHiscoresComputedMetricItem](/groups-api/group-type-definitions#object-group-hiscores-computed-metric-item) | The player's hiscores values for a specific metric. |

<br />

### `(Object)` Group Hiscores Skill Item

| Field      | Type    | Description                                  |
| :--------- | :------ | :------------------------------------------- |
| rank       | integer | The player's rank in a specific skill.       |
| level      | integer | The player's level in a specific skill.      |
| experience | long    | The player's experience in a specific skill. |

<br />

### `(Object)` Group Hiscores Boss Item

| Field | Type    | Description                             |
| :---- | :------ | :-------------------------------------- |
| rank  | integer | The player's rank in a specific boss.   |
| kills | integer | The player's kills for a specific boss. |

<br />

### `(Object)` Group Hiscores Activity Item

| Field | Type    | Description                                |
| :---- | :------ | :----------------------------------------- |
| rank  | integer | The player's rank in a specific activity.  |
| score | integer | The player's score in a specific activity. |

<br />

### `(Object)` Group Hiscores Computed Metric Item

| Field | Type    | Description                                       |
| :---- | :------ | :------------------------------------------------ |
| rank  | integer | The player's rank in a specific computed metric.  |
| value | integer | The player's value in a specific computed metric. |

<br />

### `(Object)` Group Statistics

| Field            | Type                                                                                   | Description                                                     |
| :--------------- | :------------------------------------------------------------------------------------- | :-------------------------------------------------------------- |
| maxedCombatCount | integer                                                                                | The total amount of members with 126 combat level (max combat). |
| maxedTotalCount  | integer                                                                                | The total amount of members with 2277 total level (maxed).      |
| maxed200msCount  | integer                                                                                | The total amount of 200m exp skills between all members.        |
| averageStats     | [Snapshot](/players-api/player-type-definitions#object-snapshot)                       | The average stats of all group members.                         |
| best             | [Best Group Snapshot](/players-api/player-type-definitions#object-best-group-snapshot) | The best player in each metric out of all group members.        |

<br />

### `(Object)` Best Group Snapshot

```typescript
{
  skills: {
    attack: {
      metric: "attack",
      ehp: number,
      rank: number,
      level: number,
      experience: number // (can be a long/bigint)
      player: {
        id: number,
        username: string,
        displayName: string,
        type: PlayerType,
        build: PlayerBuild,
        country: Country?,
        flagged: boolean,
        exp: number // (can be a long/bigint),
        ehp: float,
        ehb: float,
        ttm: float,
        tt200m: float,
        registeredAt: date,
        updatedAt: date,
        lastChangedAt: date?,
        lastImportedAt: date?
      }
    },
    // ... etc for all skills
  },
  bosses: {
    abyssal_sire: {
      metric: "abyssal_sire",
      ehb: number,
      rank: number,
      kills: number,
      player: {
        id: number,
        username: string,
        displayName: string,
        type: PlayerType,
        build: PlayerBuild,
        country: Country?,
        flagged: boolean,
        exp: number // (can be a long/bigint),
        ehp: float,
        ehb: float,
        ttm: float,
        tt200m: float,
        registeredAt: date,
        updatedAt: date,
        lastChangedAt: date?,
        lastImportedAt: date?
      }
    },
    // ... etc for all bosses
  },
  activities: {
    bounty_hunter_hunter: {
      metric: "bounty_hunter_hunter",
      rank: number,
      score: number,
      player: {
        id: number,
        username: string,
        displayName: string,
        type: PlayerType,
        build: PlayerBuild,
        country: Country?,
        flagged: boolean,
        exp: number // (can be a long/bigint),
        ehp: float,
        ehb: float,
        ttm: float,
        tt200m: float,
        registeredAt: date,
        updatedAt: date,
        lastChangedAt: date?,
        lastImportedAt: date?
      }
    },
    // ... etc for all activities
  },
  computed: {
    ehp: {
      metric: "ehp",
      rank: number,
      value: number,
      player: {
        id: number,
        username: string,
        displayName: string,
        type: PlayerType,
        build: PlayerBuild,
        country: Country?,
        flagged: boolean,
        exp: number // (can be a long/bigint),
        ehp: float,
        ehb: float,
        ttm: float,
        tt200m: float,
        registeredAt: date,
        updatedAt: date,
        lastChangedAt: date?,
        lastImportedAt: date?
      }
    },
    // ... etc for all computed metrics
  }
}
```

<br />
