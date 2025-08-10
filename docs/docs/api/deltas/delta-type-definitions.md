---
title: 'Delta Types & Entities'
sidebar_position: 1
---

# Delta Types & Entities

<br />

### `(Object)` Delta Leaderboard Entry

| Field     | Type                                                         | Description                                |
| :-------- | :----------------------------------------------------------- | :----------------------------------------- |
| gained    | long                                                         | The delta's gained value.                  |
| startDate | date                                                         | The starting date of the delta's timespan. |
| endDate   | date                                                         | The ending date of the delta's timespan.   |
| player    | [Player](/api/players/player-type-definitions#object-player) | The delta's parent player object.          |
