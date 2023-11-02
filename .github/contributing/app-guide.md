# How to contribute to the Wise Old Man API Documentation

This should be a pretty simple setup, as the app doesn't have many external service dependencies.

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

## Installing Node.js

The app depend on Node.js, a JavaScript runtime built on Chrome's V8 Engine.

You can download it here: https://nodejs.org/en/download/. The project currently supports version 18.17+

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

Copy the example file to configure the development app

```
cp .env.example .env
```

By default the example file contains the following snippet

```
# BASE_API_URL="http://localhost:5000"
```

**Notice how the BASE_API_URL variable is commented out using a `#` at the start of it. When this variable is commented out, the app will use the production API URL (`https://api.wiseoldman.net`) by default. If you are running your own local server, you can uncomment that variable and insert your local server URL. This local server URL can differ from localhost, you can find out what yours is by visiting the "Running the Server" section of the [server development guide](https://github.com/wise-old-man/wise-old-man/blob/master/.github/contributing/server-guide.md).**

<br />
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
npm run dev
```

And there it is! You can now access the app at:

http://localhost:3000
