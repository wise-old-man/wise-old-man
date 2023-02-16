---
title: 'Name Change Types & Entities'
sidebar_position: 1
---

# Name Change Types & Entities

<br />

### `(Enum)` Name Change Status

```bash
'pending', 'approved', 'denied'
```

<br />

### `(Object)` Name Change

| Field      | Type                                                                         | Description                                                 |
| :--------- | :--------------------------------------------------------------------------- | :---------------------------------------------------------- |
| id         | integer                                                                      | The name change's unique ID.                                |
| playerId   | integer                                                                      | The name change's parent player ID.                         |
| oldName    | string                                                                       | The player's "previous" username.                           |
| newName    | string                                                                       | The player's "new" username.                                |
| status     | [NameChangeStatus](/names-api/name-type-definitions#enum-name-change-status) | The name change's status.                                   |
| resolvedAt | date?                                                                        | The date at which the name change has been approved/denied. |
| updatedAt  | date                                                                         | The date at which the name change was last modified.        |
| createdAt  | date                                                                         | The date at which the name change was submitted.            |

<br />

### `(Object)` Name Change Data

| Field            | Type                                                             | Description                                                                                                                                                               |
| :--------------- | :--------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| isNewOnHiscores  | boolean                                                          | Whether the new username is on the OSRS hiscores.                                                                                                                         |
| isOldOnHiscores  | boolean                                                          | Whether the old username is on the OSRS hiscores.                                                                                                                         |
| isNewTracked     | boolean                                                          | Whether the new username is already being tracked on WOM.                                                                                                                 |
| hasNegativeGains | boolean                                                          | Whether there are negative exp/kc/etc gains between the two names.                                                                                                        |
| timeDiff         | integer                                                          | The amount of time (in milliseconds) between the old name's last snapshot, and the new name's first snapshot (or name change submission date, if not tracked.).           |
| hoursDiff        | integer                                                          | The amount of time (in hours) between the old name's last snapshot, and the new name's first snapshot (or name change submission date, if not tracked.).                  |
| ehpDiff          | integer                                                          | The difference in efficient hours played (EHP) between the old name's last snapshot, and the new name's first snapshot (or name change submission date, if not tracked.). |
| ehbDiff          | integer                                                          | The difference in efficient hours bossed (EHB) between the old name's last snapshot, and the new name's first snapshot (or name change submission date, if not tracked.). |
| oldStats         | [Snapshot](/players-api/player-type-definitions#object-snapshot) | The old name's last snapshot.                                                                                                                                             |
| newStats         | [Snapshot](/players-api/player-type-definitions#object-snapshot)? | The new name's first snapshot, current hiscores stats if untracked, or null if untracked and not present on hiscores. |

:::caution
`newStats` may not include `id` or `playerId` if the new username wasn't already tracked on WOM.
:::

<br />

### `(Object)` Name Change Details

| Field      | Type                                                                        | Description                                                                                                                             |
| :--------- | :-------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| nameChange | [NameChange](/names-api/name-type-definitions#object-name-change)           | The name change object.                                                                                                                 |
| data       | [NameChangeData](/names-api/name-type-definitions#object-name-change-data)? | The name change data object. Used to review the validity of the name change. (null if the name change status is 'approved' or 'denied') |
