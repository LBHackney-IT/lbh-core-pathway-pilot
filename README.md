# LBH Core pathway pilot

[![CI](https://github.com/LBHackney-IT/lbh-core-pathway-pilot/actions/workflows/tests.yml/badge.svg)](https://github.com/LBHackney-IT/lbh-core-pathway-pilot/actions/workflows/tests.yml)
[![CodeQL](https://github.com/LBHackney-IT/lbh-core-pathway-pilot/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/LBHackney-IT/lbh-core-pathway-pilot/actions/workflows/codeql-analysis.yml)
[![Update form config from Contentful](https://github.com/LBHackney-IT/lbh-core-pathway-pilot/actions/workflows/update-forms.yml/badge.svg)](https://github.com/LBHackney-IT/lbh-core-pathway-pilot/actions/workflows/update-forms.yml)

---

<img src="https://github.com/LBHackney-IT/lbh-core-pathway-pilot/blob/main/public/screens.png?raw=true" alt="" />

<p align="center">
    <em>Example screens from the app</em>         
</p>

---

🚨 **This is experimental BETA software. No guarantees of stability are made.** 🚨

This is the codebase for the beta prototype being used for a pilot of the new core pathway for adult social care.

It expands on the form-building features of the [mainstream tool](https://github.com/LBHackney-IT/lbh-social-care-frontend/wiki/How-to-create-and-modify-forms).

Users can:

- start, resume and complete workflows
- approve workflows on behalf of other users
- review and reassess workflows using a novel side-by-side interface

## 🧱 How it's built

It's a Next.js app backed by a PostgreSQL database, that interacts with:

- The [social care case viewer API](https://github.com/LBHackney-IT/social-care-case-viewer-api/), in order to grab basic biographical information about the resident in question
- [Contentful](https://www.contentful.com/), to provide a user-friendly way to define form flows and questions

It uses [Prisma](https://www.prisma.io/) to speak to the database and [NextAuth](https://next-auth.js.org/) to handle Google login.

<img src="https://github.com/LBHackney-IT/lbh-core-pathway-pilot/blob/main/public/overview.png?raw=true" alt="" />

## 💻 Getting started

### 1. Prerequisites

You need node, npm and at least one running PostgreSQL database.

You also need a [complete `.env` file](#-configuration).

### 2. Prepare databases

You can apply the schema to a fresh dev or test database with:

```
npm run db:push
```

### 3. Running it

```
npm install
npm run dev
```

The app should then be on [localhost:3000](http://localhost:3000).

You should (for now) be able to log in with any Google account ending in `hackney.gov.uk`.

### 4. Import forms from Contentful (optional)

It expects form config to be defined in a data file `/config/forms/forms.json`.

You can edit this manually, but you can also import data from a correctly configured Contentful space using:

```
npm run import:contentful:forms
```

## 🧪 Testing

You can run the Jest unit tests with `npm test`.

Check types with `npm run typecheck`.

Run eslint with `npm run lint`.

Run all the checks with:

```
npm run check
```

### Integration tests

To seed the database with the predictable test data (including login sessions) that Cypress needs, first run:

```
npm run seed
```

Then, spin up the app and open the Cypress UI:

```
npm run cypress
```

There are three Cypress specs:

- Browse, inspect and reassign workflows from the UI
- Beginning a brand new workflow (to do)
- Reviewing and reassessing a workflow (to do)

## 🧬 Configuration

It needs a few configuration variables to work.

You can supply these with a `.env` file. Run `cp .env.sample .env` to make a fresh one.

## 🌍 Deploying the application

It's suitable for anywhere you'd deploy a Next.js app, including Heroku, Vercel, Netlify and AWS.

[More in the Next.js docs](https://nextjs.org/docs/deployment).

### Deployment at Hackney

The application at hackney is supported by Hackney's [infrastructure repository](https://github.com/LBHackney-IT/infrastructure/tree/master/projects/social-care-workflows)
