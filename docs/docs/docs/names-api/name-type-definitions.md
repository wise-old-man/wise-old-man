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

### Name Change Review Context

This JSON object can have many shapes, depending on the context that lead to the name change being denied or skipped.
These are examples of all possible shapes:

<br />

#### Denied Context

```bash
{
    reason: 'manual_review';
}
```

```bash
{
    reason: 'old_stats_cannot_be_found';
}
```

```bash
{
    reason: 'new_name_not_on_the_hiscores';
}
```

```bash
{
    reason: 'negative_gains';
    negativeGains: {
        attack: -5867834,
        hunter: -12355,
        zulrah: -53
    }
}
```

<br />

#### Skipped Context

```bash
{
    reason: 'transition_period_too_long';
    maxHoursDiff: 504;
    hoursDiff: 596;
}
```

```bash
{
    reason: 'excessive_gains';
    ehpDiff: 407;
    ehbDiff: 204;
    hoursDiff: 596;
}
```

```bash
{
    reason: 'total_level_too_low';
    minTotalLevel: 700;
    totalLevel: 384;
}
```

<br />

### `(Object)` Name Change

| Field         | Type                                                                          | Description                                                                 |
| :------------ | :---------------------------------------------------------------------------- | :-------------------------------------------------------------------------- |
| id            | integer                                                                       | The name change's unique ID.                                                |
| playerId      | integer                                                                       | The name change's parent player ID.                                         |
| oldName       | string                                                                        | The player's "previous" username.                                           |
| newName       | string                                                                        | The player's "new" username.                                                |
| status        | [NameChangeStatus](/names-api/name-type-definitions#enum-name-change-status)  | The name change's status.                                                   |
| reviewContext | [ReviewContext](/names-api/name-type-definitions#name-change-review-context)? | The name change's reason to have been denied or skipped during auto-review. |
| resolvedAt    | date?                                                                         | The date at which the name change has been approved/denied.                 |
| updatedAt     | date                                                                          | The date at which the name change was last modified.                        |
| createdAt     | date                                                                          | The date at which the name change was submitted.                            |

<br />
