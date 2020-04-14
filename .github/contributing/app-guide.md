# How to contribute to the Wise Old Man API Documentation

This should be a pretty simple setup, as the documentation doesn't have many dependencies.

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

## Installing Node.js

The documentation is built with Next.js, which uses Node.js, a JavaScript backend framework.

You can download it here: https://nodejs.org/en/download/

<br />

## Installing dependencies

Open the terminal on the root directory (I use the VSCode terminal) and do the following steps:

Go into the app directory

```
cd app
```

Install dependencies using npm

```
npm i
```

This should add a _package-lock.json_ file and a _node_modules_ directory inside the _app_ directory.

<br />

## Environment Variables

Create a new file inside the app directory:

- .env

This file will give the development app some needed configurations.

Copy the following snippet into the .env file:

```
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

**Note: This url will be your development server api url, which can differ from localhost, you can find out what yours is by visiting the "Running the Server" section of the [server development guide](https://github.com/psikoi/wise-old-man/blob/master/.github/contributing/server-guide.md)**

Alternatively, if you don't want to also develop the api simultaneously and are looking to just make some frontend changes, you can use the following snippet instead, to use the production api url:

```
REACT_APP_API_BASE_URL=https://wiseoldman.net/api
```

<br />

**Finally! You're done with the setup and installation, now you can run the app and start developing!**

## Running the development app

If you have done every step above, you're ready to start developing.

Make sure you're in the app directory, if you're not, run this command:

```
cd app
```

And now you can start the app by running the command:

```
npm start
```

And there it is! You can now access the app at:

http://localhost:3000
