# How to contribute to the Wise Old Man API Documentation

This should be a pretty simple setup, as the documentation doesn't have many external service dependencies.

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

The docs depend on Node.js, a JavaScript runtime built on Chrome's V8 Engine.

You can download it here: https://nodejs.org/en/download/. The project currently supports version 16.14+

<br />

## Installing dependencies

Open the terminal on the root directory (I use the VSCode terminal) and do the following steps:

Go into the docs directory

```
cd docs
```

Install dependencies using npm

```
npm i
```

This should add a _node_modules_ directory inside the _docs_ directory.

<br />

## Running the docs development process

If you have done every step above, you're ready to start developing.

Make sure you're in the docs directory, if you're not, run this command:

```
cd docs
```

And now you can start the server by running the command:

```
npm run dev
```

And there it is! You can now access the docs at:

http://localhost:3000
