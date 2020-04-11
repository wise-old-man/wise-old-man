# Wise Old Man

[www.wiseoldman.net](http://wiseoldman.net/)

The open source Oldschool Runescape progress tracker.

![API Integration Testing](https://github.com/psikoi/wise-old-man/workflows/API%20Integration%20Testing/badge.svg)

The Wise Old Man is an Open source project, meaning anyone in the community can contribute code or ideas to add new functionality.

This application measures Oldschool Runescape player progress. Built on top of the OSRS hiscores, it adds extra functionality like group competitions, player achievements, experience records, etc.

[Website](http://wiseoldman.net/) |
[Twitter](https://twitter.com/wise_old_man_rs) |
[Discord](https://discord.gg/NzYmDe)

<br />

## API

We also offer a REST API for developers and encourage you to create your own apps and integrations with it.

You can read the documentation at:

[API Docs](http://wiseoldman.net/docs)

<br />

## Project structure and stack

The project is currently divided into 3 components:

- **Server**: (The backend & API)
  - Node.js
  - PostgreSQL: Main Database
  - Sqlite: Tests Database
  - Redis & Bull: Job processor
  - Express: API framework
  - Sequelize: ORM
- **App**: (The web app)
  - React.js
  - Redux: State management
  - Reselect: Selector memoization
- **Docs**: (The API documentation)
  - Next.js (A react framework)

<br />

## Suggestions and bugs

Have a suggestion or a bug to report? [Click here to create a issue](https://github.com/psikoi/wise-old-man/issues)

Have something else you'd like to discuss? [Join us on discord](https://discord.gg/NzYmDe)

<br />

## Contributing

Each component of the project has it's own build and development process, check the documentation for each one below:

**Help expand and improve the Wise Old Man API:** [Server / API Development Guide](https://github.com/psikoi/wise-old-man/blob/master/.github/contributing/server-guide.yml)

**Help expand and improve the Wise Old Man Web App:** [App Development Guide](https://github.com/psikoi/wise-old-man/blob/master/.github/contributing/app-guide.yml)

**Help update or improve the Wise Old Man API Docs:** [Docs Development Guide](https://github.com/psikoi/wise-old-man/blob/master/.github/contributing/docs-guide.yml)
