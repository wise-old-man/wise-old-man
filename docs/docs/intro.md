---
slug: /
sidebar_position: 1
---

# Introduction

Welcome to the documentation page of the Wise Old Man REST API (v2). This API is Open Source and is in continuous development.

## Useful Links

You can contribute to this API on GitHub: <br />
https://github.com/wise-old-man/wise-old-man

Or reach out to us on our Discord: <br />
https://wiseoldman.net/discord

**Do you have a suggestion or a bug to report?** Please use GitHub issues for that, through the link below <br />
https://github.com/wise-old-man/wise-old-man/issues

<br />

:::info
If you are interested in using our API for your apps, consider saying hi on our discord so we can assign you a `API Consumer` role which
we use to ping users when something in the API has changed.

Also consider requesting an **API Key** for your app, more on that [later on this page](/#rate-limits--api-keys).
:::

<br />

## About the API

Our REST API uses standard HTTP response codes and verbs, and mostly supports JSON-encoded responses, with a few exceptions for endpoints that return CSV, that are meant to be consumed by applications like Google Sheets and Microsoft Excel.

This documentation website will provide examples for each request using **cURL** and our own **JavaScript/TypeScript** client library (highly recommended if you are using any of those languages). There could be more client libraries built for other languages in the future, but it is not our main priority right now. Please do contact us if you are interested in developing one for any other languages.

### 3rd party libraries

| Library  | Language | Maintainer   | Links                                                                                            |
| -------- | -------- | ------------ | ------------------------------------------------------------------------------------------------ |
| `wom.py` | Python3  | `@jonxslays` | [Docs](https://jonxslays.github.io/wom.py/stable) \| [Repo](https://github.com/jonxslays/wom.py) |

:::caution
Support for 3rd party libraries **may be limited** depending on the availability of the maintainer.

For the most part you can receive help in the Wise Old Man discord server. Alternatively, feel free to
create an issue on the associated github repository or inquire with the maintainer of the library directly.
:::

## Getting started

### Base URL

```
https://api.wiseoldman.net/v2
```

All routes described in this documentation website are meant to be used with this base URL as a prefix.

Example: <br />
`/competitions` should be accessed as `https://api.wiseoldman.net/v2/competitions`

### Rate Limits & API Keys

There is a maximum of 20 requests per 60 seconds, however, this can be increased (to 100) if you register for an **API key**.

<br />

:::info
Regardless of rate limits, we ask you to add delays between your requests to help evenly distribute the server load. Keep in mind this is a free project with very real hosting costs.
:::

:::caution
If you're planning on using the API to auto-update players on any given **short** interval, please think twice before doing so.

Often, the best approach is to use a **longer** interval, such as 1-6 hours, to avoid overloading our servers with mostly redundant requests. Short intervals are often overkill for most players, and can be detrimental to the API's performance.

If you are found to be updating players too often, this can result in an IP ban.

Feel free to reach out to us on Discord if you are unsure about the best approach/timing for your use case.
:::

<br />

**API Keys** help us keep track of who is actually using our API, and what resources they need the most, and can be really helpful for us to know how to contact our API consumers.

**If you want an API key, or just want to be notified of API changes, just send us a message on [our discord](https://wiseoldman.net/discord) and we'll help you.**

Alternatively, you can add a user agent header to your requests, which would help us identify who you are, however, this does not increase API rate limits.

:::info
If you do not provide us with a user agent that we can use to potentially contact you if you are found to be abusing our API, we have no other choice but to IP ban you.
:::

Examples:

**Adding API Key and User Agent to cURL request**

```
curl -X GET "https://api.wiseoldman.net/v2/groups" \
  -H "x-api-key: *your_key_here*" \
  -A "*your_discord_name_here*"
```

**Adding API Key and User Agent using our JS/TS Library**

```javascript
const { WOMClient } = require('@wise-old-man/utils');

const client = new WOMClient({
  apiKey: '*your_key_here',
  userAgent: '*your_discord_name_here*'
});

// Use this client to send requests
const groups = await client.groups.searchGroups();
```

## Dates (ISO8601)

Our API utilizes the [ISO8601](https://en.wikipedia.org/wiki/ISO_8601) format for most Date/Times returned in our models.

## Status Codes

Our API uses conventional HTTP response codes to indicate the success or failure status of an API request.

Success Statuses:

- `200` - Success.
- `201` - Success. New resource created

Error Statuses:

- `400` - Bad Request.
- `403` - Forbidden.
- `404` - Not Found.
- `429` - Too Many Requests. (Usually triggered by API rate limits or too-frequent player updates)
- `500` - Server Error.

## Pagination

Some API endpoints support pagination in the form of `limit` and `offset` query parameters. This will be indicated in the endpoint description.

| Field  | Default | Max  |
| ------ | ------- | ---- |
| limit  | 20      | 50\* |
| offset | 0       | ---  |

:::note

\*There are exceptions for some endpoints such as `/groups/:id/hiscores` and `/groups/:id/gained`. These do not have a maximum limit, they will return every result available.

:::

Examples

**Using pagination in cURL request**

```
// Returns the top 20-40 groups
curl -X GET "https://api.wiseoldman.net/v2/groups?offset=20&limit=20"
```

**Using pagination through our JS/TS Library**

```javascript
const { WOMClient } = require('@wise-old-man/utils');

const client = new WOMClient();

// Returns the top 20-40 groups
const groups = await client.groups.searchGroups('', { limit: 20, offset: 20 });
```
