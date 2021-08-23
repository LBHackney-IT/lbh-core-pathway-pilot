# LBH Core pathway pilot

[![Heroku](https://heroku-badge.herokuapp.com/?app=lbh-core-pathway-pilot)](https://lbh-core-pathway-pilot.herokuapp.com/)

[![CI](https://github.com/LBHackney-IT/lbh-core-pathway-pilot/actions/workflows/tests.yml/badge.svg)](https://github.com/LBHackney-IT/lbh-core-pathway-pilot/actions/workflows/tests.yml)

🚨 **This is experimental BETA software. No guarantees of stability are made.** 🚨

This is the codebase for the beta prototype being used for a pilot of the new core pathway for adult social care.

It's a Next.js app backed by a PostgreSQL database.

It expands on the form-building features of the [mainstream tool](https://github.com/LBHackney-IT/lbh-social-care-frontend/wiki/How-to-create-and-modify-forms).

Users can:

- start, resume and complete workflows
- approve workflows on behalf of other users
- review and reassess workflows using a novel side-by-side interface

## 💻 Getting started

### 1. Prerequisites

You need node, npm and at least one running PostgreSQL database.

You also need a [complete `.env.local` file](#-configuration), and potentially a `.env.test` file to run integration tests against.

### 2. Prepare databases

You can apply the schema to a fresh dev and test database respectively with:

```
npm run db:push:dev
# optional, for integration tests
npm run db:push:test
```

### 3. Running it

```
npm install
npm run dev
```

The app should then be on [localhost:3000](http://localhost:3000).

You should (for now) be able to log in with any Google account ending in `hackney.gov.uk`.

## 🧪 Testing

You can run the Jest unit tests with `npm test`.

Check types with `npm run typecheck`.

Run eslint with `npm run lint`.

Run all the checks with:

```
npm run check
```

### Integration tests

To seed the test database with predictable test data, spin up the app and open the Cypress UI:

```
npm run cypress
```

## 🧬 Configuration

It needs a few configuration variables to work.

You can supply these with a `.env` file locally. Run `cp .env.local.sample .env.local` to make a fresh one.

You will probably want to run integration tests against a seperate database to make sure that results are predictable. For that, run `cp .env.test.sample .env.test`.

## 🌍 Running it on the web

It's suitable for anywhere you'd deploy a Next.js app, including Heroku, Vercel, Netlify and AWS.

[More in the Next.js docs](https://nextjs.org/docs/deployment).
