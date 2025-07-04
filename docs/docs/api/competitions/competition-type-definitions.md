---
title: 'Competition Types & Entities'
sidebar_position: 1
---

# Competition Types & Entities

<br />

### `(Enum)` Competition Type

```bash
'classic', 'team'
```

<br />

### `(Enum)` Competition Status

```bash
'upcoming', 'ongoing', 'finished'
```

<br />

### `(Enum)` Competition CSV Table Type

```bash
'team', 'teams', 'participants'
```

<br />

### `(Object)` Competition Progress

| Field  | Type    | Description                                           |
| :----- | :------ | :---------------------------------------------------- |
| start  | integer | A player's start value for the competition's metric.  |
| end    | integer | A player's end value for the competition's metric.    |
| gained | integer | A player's gained value for the competition's metric. |

<br />

### `(Object)` Competition Levels Progress

| Field  | Type    | Description                                            |
| :----- | :------ | :----------------------------------------------------- |
| start  | integer | A player's start level for the competition's metric.   |
| end    | integer | A player's end level for the competition's metric.     |
| gained | integer | A player's gained levels for the competition's metric. |

<br />

### `(Object)` Competition

| Field            | Type                                                                                    | Description                                     |
| :--------------- | :-------------------------------------------------------------------------------------- | :---------------------------------------------- |
| id               | integer                                                                                 | The competition's unique ID.                    |
| title            | string                                                                                  | The competition's title.                        |
| metric           | [Metric](/api/global-type-definitions#enum-metric)                                      | The competition's metric.                       |
| type             | [CompetitionType](/api/competitions/competition-type-definitions#enum-competition-type) | The competition's type.                         |
| startsAt         | date                                                                                    | The competition's start date.                   |
| endsAt           | date                                                                                    | The competition's end date.                     |
| groupId          | integer?                                                                                | The competition's host group ID.                |
| score            | integer                                                                                 | The competition's global ranking score.         |
| createdAt        | date                                                                                    | The competition's creation date.                |
| updatedAt        | date                                                                                    | The competition's last modification date.       |
| participantCount | number                                                                                  | The competition's total number of participants. |
| group            | [Group](/api/groups/group-type-definitions#object-group)                                | The competition's host group.                   |

<br />

### `(Object)` Participation

| Field         | Type    | Description                                                                   |
| :------------ | :------ | :---------------------------------------------------------------------------- |
| playerId      | integer | The player's ID.                                                              |
| competitionId | integer | The competition's ID.                                                         |
| teamName      | string? | The name of the team the player is in. (Only applicable to team competitions) |
| createdAt     | date    | The date at which the player was added as a participant to the competition.   |
| updatedAt     | date    | The date at which the participation was updated.                              |

<br />

### `(Object)` Competition Participation

Returned in competition-centric endpoints.

> extends [Participation](/api/competitions/competition-type-definitions#object-participation)

| Field  | Type                                                         | Description                 |
| :----- | :----------------------------------------------------------- | :-------------------------- |
| player | [Player](/api/players/player-type-definitions#object-player) | The participation's player. |

<br />

### `(Object)` Player Participation

Returned in player-centric endpoints.

> extends [Participation](/api/competitions/competition-type-definitions#object-participation)

| Field       | Type                                                                             | Description                                 |
| :---------- | :------------------------------------------------------------------------------- | :------------------------------------------ |
| competition | [Competition](/api/competitions/competition-type-definitions#object-competition) | The competition the player is competing in. |

<br />

### `(Object)` Player Competition Standing

> extends [PlayerParticipation](/api/competitions/competition-type-definitions#object-player-participation)

| Field    | Type                                                                                                           | Description                                                                             |
| :------- | :------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| progress | [CompetitionProgress](/api/competitions/competition-type-definitions#object-competition-player-progress)       | The player's progress in the competition.                                               |
| levels   | [CompetitionLevelProgress](/api/competitions/competition-type-definitions#object-competition-levels-progress)? | The player's levels progress in the competition. (Only exists in skilling competitions) |
| rank     | number                                                                                                         | The player's rank in the competition.                                                   |

### `(Object)` Competition Participation Details

> extends [CompetitionParticipation](/api/competitions/competition-type-definitions#object-competition-participation)

| Field    | Type                                                                                                           | Description                                                                             |
| :------- | :------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| progress | [CompetitionProgress](/api/competitions/competition-type-definitions#object-competition-player-progress)       | The player's progress in the competition.                                               |
| levels   | [CompetitionLevelProgress](/api/competitions/competition-type-definitions#object-competition-levels-progress)? | The player's levels progress in the competition. (Only exists in skilling competitions) |

<br />

### `(Object)` Competition Details

> extends [Competition](/api/competitions/competition-type-definitions#object-competition)

| Field          | Type                                                                                                                       | Description                                             |
| :------------- | :------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------ |
| participations | [CompetitionParticipationDetails](/api/competitions/competition-type-definitions#object-competition-participation-details) | The competition's participants, and all their progress. |

<br />

### `(Object)` Competition History Datapoint

| Field | Type   | Description                                                                 |
| :---- | :----- | :-------------------------------------------------------------------------- |
| value | number | The player's value for the competition metric, at a specific point in time. |
| date  | date   | The date at which the datapoint was recorded.                               |

<br />

### `(Object)` Top 5 Progress Result

| Field   | Type                                                                                                               | Description                                           |
| :------ | :----------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------- |
| player  | [Player](/api/players/player-type-definitions#object-player)                                                       | The participant.                                      |
| history | [CompetitionHistoryDataPoint](/api/competitions/competition-type-definitions#object-competition-history-datapoint) | The participant's history throughout the competition. |

<br />

### `(Object)` Team

| Field        | Type     | Description                         |
| :----------- | :------- | :---------------------------------- |
| name         | string   | The team's name.                    |
| participants | string[] | The team's participants' usernames. |

<br />

### `(Object)` Competition With Participations

> extends [Competition](/api/competitions/competition-type-definitions#object-competition)

| Field          | Type                                                                                                          | Description                     |
| :------------- | :------------------------------------------------------------------------------------------------------------ | :------------------------------ |
| participations | [CompetitionParticipation](/api/competitions/competition-type-definitions#object-competition-participation)[] | The competition's participants. |

<br />
