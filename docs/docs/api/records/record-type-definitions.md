---
title: 'Record Types & Entities'
sidebar_position: 1
---

# Record Types & Entities

<br />

### `(Object)` Record

| Field     | Type                                               | Description                              |
| :-------- | :------------------------------------------------- | :--------------------------------------- |
| id        | integer                                            | The record's unique ID.                  |
| playerId  | integer                                            | The record's parent player ID.           |
| period    | [Period](/api/global-type-definitions#enum-period) | The record's time period.                |
| metric    | [Metric](/api/global-type-definitions#enum-metric) | The record's metric.                     |
| value     | long (bigint)                                      | The record's value (gained value).       |
| updatedAt | date                                               | The record's creation/modification date. |

### `(Object)` Record Leaderboard Entry

> extends [Record](/api/records/record-type-definitions#object-record)

| Field  | Type                                                         | Description                 |
| :----- | :----------------------------------------------------------- | :-------------------------- |
| player | [Player](/api/players/player-type-definitions#object-player) | The record's parent player. |
