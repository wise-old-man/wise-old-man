<div align = "center">

![Wise Old Man](https://user-images.githubusercontent.com/3278148/86636807-a32b9f00-bfcc-11ea-963f-8fb2920447f4.png)

🔗 [www.wiseoldman.net](https://wiseoldman.net/)

The Open Source Old School Runescape progress tracker.

![MIT license](https://img.shields.io/github/license/wise-old-man/wise-old-man) ![Core repo](https://img.shields.io/badge/wise%20old%20man-core-blue)

The Wise Old Man is a web app (and API) that measures your Old School Runescape player progress. Built on top of the OSRS hiscores, it allows you to keep track of your gains, participate in group competitions, collect achievements and much more.

[Website](https://wiseoldman.net/) |
[Discord](https://discord.gg/Ky5vNt2) |
[Patreon](https://www.patreon.com/wiseoldman)

</div>

<br />

## 👪 Related projects

Although this is the core repository, some related repositories have been created to expand the functionality of this project.

- [Discord Bot](https://github.com/wise-old-man/discord-bot)
- [Discord Bot Landing Page](https://github.com/wise-old-man/bot.wiseoldman.net)

<br />

## 🛠️ API

We also offer a REST API for developers and encourage you to create your own apps and integrations with it. You can read the API documentation at: [https://wiseoldman.net/docs](https://docs.wiseoldman.net)

<br />

## 📚 Project structure and stack

The repository is currently divided into 3 components:

- **Server**: (The backend & API)

  - **Runtime:** Node.js
  - **Language:** TypeScript
  - **Database:** PostgresSQL
  - **Caching:** Redis
  - **Message Queue:** BullMQ
  - **API Framework:** Express
  - **ORM:** Prisma
  - **Test Runner:** Jest

- **App**: (The web app)

  - React.js
  - Redux: State management
  - Reselect: Selector memoization

- **Docs**: (The API documentation)

  - **Framework:** Docusaurus

<br />

## 💬 Suggestions and bugs

Have a suggestion or a bug to report? [Click here to create a issue](https://github.com/wise-old-man/wise-old-man/issues)

Have something else you'd like to discuss? [Join us on discord](https://discord.gg/Ky5vNt2)

<br />

## 🤝 Contributing

Each component of the repository has it's own build and development process, check the documentation for each below:

**Help expand and improve the Wise Old Man API:** [Server / API Development Guide](https://github.com/wise-old-man/wise-old-man/blob/master/.github/contributing/server-guide.md)

**Help expand and improve the Wise Old Man Web App:** [App Development Guide](https://github.com/wise-old-man/wise-old-man/blob/master/.github/contributing/app-guide.md)

**Help update or improve the Wise Old Man API Docs:** [Docs Development Guide](https://github.com/wise-old-man/wise-old-man/blob/master/.github/contributing/docs-guide.md)
