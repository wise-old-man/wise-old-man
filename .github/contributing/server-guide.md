# How to contribute to the Wise Old Man API

First off, you should start by checking the [API documentation](https://wiseoldman.net/), this should give you a pretty good idea of the entities and endpoints that are currently available.

<br />

## Forking and Cloning the project

To be able to submit contributions to the project, you will need to create a fork of the project, which is essentially your own copy of the project.

After that, you need to clone your version of the project into your computer, using the command line or any Git client (like Github Desktop).

I suggest reading the [Github's guide on forking projects.](https://guides.github.com/activities/forking/)

<br />

## Visual Studio Code Setup

I also suggest using Visual Studio Code as your IDE, with the following extensions installed:

- Docker
- ES7 React/Redux/GraphQL/React-Native snippets
- ESLint
- Prettier - Code formatter

<br />

## Installing Docker

This project also uses Docker for production and development, so you will need to download and install it. **Don't worry if it's your first time using Docker, you won't have to deal with it too much.**

[Docker Installation Guide](https://docs.docker.com/get-docker/)

<br />

## Installing Node.js

The server is built with Node.js, a JavaScript backend framework.

You can download it here: https://nodejs.org/en/download/

<br />

## Installing dependencies

Open the terminal on the root directory (I use the VSCode terminal) and do the following steps:

Go into the server directory

```
cd server
```

Install dependencies using npm

```
npm i
```

This should add a _package-lock.json_ file and a _node_modules_ directory inside the _server_ directory.

<br />

## Environment Variables

Copy the example files to configure the development server, by running the following command on your terminal:

```
cp .env.example .env && cp .env.test.example .env.test
```

By default the example files contain the following snippets

```
#.env
DB_DIALECT=postgres

POSTGRES_PASSWORD=postgres
POSTGRES_USER=postgres
POSTGRES_DB=wise-old-man

REDIS_HOST=localhost
REDIS_PORT=6379

PGADMIN_DEFAULT_EMAIL=test@wiseoldman.net
PGADMIN_DEFAULT_PASSWORD=postgres
```

```
#.env.test
DB_DIALECT=sqlite
DB_STORAGE=./__tests__/database.sqlite
```

<br />

**Finally! You're done with the setup and installation, now you can run the server and start developing!**

<br />

## Running the Server

After you have everything above setup, **make sure you have Docker running**.

Using the terminal (I use the VSCode terminal), start the development Docker containers.

```
docker-compose up --build
```

The server uses nodemon and should detect code changes and automatically restart.

#### API url

If you're using the regular Docker installation, you should be able to access the api at

http://localhost:5000/

If you're using Docker Toolbox instead, you can find out what the machine's ip is by typing:

```
docker-machine ip
```

and adding :5000 to it.

The default URL should be http://192.168.99.100:5000

#### Troubleshooting

If you're on Windows and get error

```
/usr/bin/env: 'bash\r': No such file or directory
```

type

```
git config core.autocrlf false
```

and run docker-compose again.

<br />

## Accessing the database

You can use pgadmin to manage your database, by visting the api url, and replacing the 5000 port with 54321.

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
