---
slug: /league
---

# 🎉 Trailblazer Reloaded League

If you're looking to use our League API instead, you need to modify the code examples to the League API URLs.

**Example (cURL):**

```curl
// highlight-next-line
curl -X GET https://api.wiseoldman.net/league/players/zezima \
  -H "Content-Type: application/json"
```

<br />

**Example (JavaScript/TypeScript):**

```javascript
const { WOMClient } = require('@wise-old-man/utils');

const client = new WOMClient({
  // highlight-next-line
  baseAPIUrl: 'https://api.wiseoldman.net/league'
});

const playerDetails = await client.players.getPlayerDetails('zezima');
```
