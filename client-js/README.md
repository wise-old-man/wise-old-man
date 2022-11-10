# Wise Old Man - Web Client

A JavaScript/TypeScript client that interfaces and consumes the [Wise Old Man API](https://wiseoldman.net), an API that tracks and measures players' progress in Old School Runescape.

API Documentation: https://docs.wiseoldman.net

### Installation

`npm i @wise-old-man/utils`

### Usage

```javascript
const { WOMClient, CompetitionStatus, MetricProps } = require('@wise-old-man/utils');

const client = new WOMClient();

// Example API request
const competitions = await client.competitions.searchCompetitions(
  { title: 'the', status: CompetitionStatus.ONGOING },
  { limit: 5 }
);

// Example utils
competitions.forEach(c => {
  // Example: "Skill Of The Week", "Mining", false
  console.log(c.name, MetricProps[c.metric].name, MetricProps[c.metric].isMembers);
});
```
