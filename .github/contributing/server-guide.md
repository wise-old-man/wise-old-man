# How to contribute to the Wise Old Man API

You should start by checking the [API documentation](https://docs.wiseoldman.net), this should give you a pretty good idea of the entities and endpoints that are currently available.

<br />

## Forking and Cloning the project

To be able to submit contributions to the project, you will need to create a fork of the project, which is essentially your own copy of the project.

After that, you need to clone your version of the project into your computer, using the command line or any Git client (like Github Desktop).

I suggest reading the [Github's guide on forking projects.](https://guides.github.com/activities/forking/)

<br />

## Visual Studio Code Setup

I also suggest using Visual Studio Code as your IDE, with the following extensions installed:

- ESLint
- Prettier - Code formatter

<br />

## Installing Docker

This project uses Docker to install and manage its dependency services (Postgres, Redis, etc), therefor the rest of the guide will assume you're using it.

Here's the official [Docker Installation Guide](https://docs.docker.com/get-docker/)

> **Note**
> You can run these services yourself on your local machine, but just make sure you update the ports in the .env file to match the ports on your local machine.
> You will also need to modify the run-dev.sh script to skip the docker commands

<br />

## Installing Node.js

The server is built with Node.js, a JavaScript runtime built on Chrome's V8 Engine.

You can download it here: https://nodejs.org/en/download/. The project currently supports version 16.14+

<br />

## Installing dependencies

Open the terminal and navigate to the project's root directory and do the following steps:

- Go into the server's directory

```
cd server
```

- Install dependencies using npm

```
npm i
```

This should add a _node_modules_ directory inside the _server_ directory.

<br />

## Environment Variables

Copy the example files to configure the development server, by running the following command on your terminal:

```
cp .env.example .env
```

By default the example files contain the following example snippets

```
CORE_DATABASE=wise-old-man

DB_HOST=localhost

POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

REDIS_HOST=localhost
REDIS_PORT=6379

PGADMIN_DEFAULT_EMAIL=test@wiseoldman.net
PGADMIN_DEFAULT_PASSWORD=postgres
PGADMIN_PORT=54321

DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${DB_HOST}:${POSTGRES_PORT}/${CORE_DATABASE}?schema=public

ADMIN_PASSWORD=123abc

DISCORD_BOT_API_TOKEN=
DISCORD_BOT_API_URL=
```

<br />

**Finally! You're done with the setup and installation, now you can run the server and start developing!**

<br />

## Running the Server

After you have everything above setup, **make sure you have Docker running on your machine (or your local services)**.

Using the terminal, navigate to the server directory again, and run the development script:

```
npm run dev
```

This command will start your dependencies, reset your development database and start a hot-reload development process using ts-node-dev (restart on code changes).

#### API url

If you're using the regular Docker installation, you should be able to access the API at

http://localhost:5001/

If you're using Docker Toolbox instead, you can find out what the machine's ip is by typing:

```
docker-machine ip
```

and adding :5001 to it.

The default URL should be http://192.168.99.100:5001

#### Troubleshooting

If you're on Windows and get the following error:

```
/usr/bin/env: 'bash\r': No such file or directory
```

type

```
git config core.autocrlf false
```

and run `npm run dev` again.

<br />

## Accessing the database

You can use pgadmin to manage your database, by visting the API url, and replacing the 5001 port with 54321.

Example: http://localhost:54321 or http://192.168.99.100:54321

Next, login with the following credentials:

- **email:** _test@wiseoldman.net_
- **password:** _postgres_

Then follow these instructions:

- Click "Add New Server"
- Enter "wise old man" in the name field
- Click the "connection" tab
- Enter "db" in the host name/address field
- Enter "postgres" in the username field
- Enter "postgres" in the password field

You should now have access to the database, on the left side panel.

<br />

## Running integration tests

I suggest running integration tests before commiting, to make sure your new code doesn't ruin any previous code.

Open the terminal and type the following commands:

```
cd server
```

```
npm run test
```

Read the logs in the terminal, and if all the tests passed, go ahead and commit your changes!

<br />

## Updating documentation

After adding new features or changing existing features, make sure you update the API docs if necessary.

[Docs Development Guide](https://github.com/wise-old-man/wise-old-man/blob/master/.github/contributing/docs-guide.md)
