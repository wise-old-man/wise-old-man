---
title: 'Start Tracking'
slug: /guides/how-to-start-tracking
sidebar_position: 1
---

### Overview
Players are not tracked by default on Wise Old Man. Tracking begins when you, or someone else, requests an update for your profile. This guide explains how to opt-in by triggering your first update, what a snapshot is, and how snapshots power leaderboards, competitions, and group stats.

### Tracking Options
You can start tracking your account using any of the following:
- Website: Request an update from your player page
- RuneLite Plugin: Auto-updates on logout once installed
- Discord Bot: Use the update command in a server where the bot is installed

#### Website
1. Open your player page
   1. Go to `https://wiseoldman.net/players/<your_username>`.
      1. Example: https://wiseoldman.net/players/psikoi
   2. If the player doesn’t exist yet, selecting the `Track` button will create it.

2. Click Update
   1. Press `Update` on the page to request a fresh hiscores check and create a snapshot.
   2. You may see a short cooldown between updates to avoid spam.

3. Come back later for gains
   1. After your first snapshot, subsequent updates will calculate gains and achievements.
   2. Installing the RuneLite plugin helps keep your profile updated automatically.

#### RuneLite plugin
1. Install the Wise Old Man plugin in RuneLite.

2. Log in and play normally.

3. Log out and your profile will be updated automatically.

#### Discord bot
1. Join a Discord server that has the Wise Old Man bot.

2. (Optional) Use the `/setrsn` command to link your discord profile with a username to make future commands easier.

3. Use the `/update` command for your username (server-specific prefix/commands apply).
   1. If you did not use the `/setrsn` command, you will need to provide a username in the command options.

### What is a snapshot?
- A snapshot is a point-in-time record of your hiscores stats stored by Wise Old Man.
- On update, the system fetches your current hiscores, computes totals like EHP/EHB, and saves a new snapshot.
- With at least two snapshots, Wise Old Man can calculate your progress (deltas) over time windows (day, week, month, etc.).

### How snapshots are used?
- Gains (deltas): Differences between two snapshots over a period; used for leaderboards like “Top week gains”.
- Competitions: The start and end snapshots determine everyone’s gains for the competition metric.
- Group statistics: Aggregations of member snapshots and deltas drive group hiscores, records, and activity insights.

### Opt-in and Privacy
- Tracking is opt-in through an update request (website, plugin, or bot).
- If a player has opted out, updates will be blocked until opt-out is removed.

### Troubleshooting
- Can't be found / empty profile with no stats: Ensure you show up on the official OSRS hiscores website.
- Can’t update yet: Wait a short while and try again (cooldown applies).
- No gains after update: You need at least two snapshots at different times before gains appear.

### Reference
- Wise Old Man website: [`https://wiseoldman.net/`](https://wiseoldman.net/)
