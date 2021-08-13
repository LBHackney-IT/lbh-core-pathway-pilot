# LBH Core pathway pilot

This is the codebase for the beta prototype being used for a pilot of the new core pathway for adult social care.

It's a Next.js app backed by a PostgreSQL database.

Users can:

- start, resume and complete workflows
- approve workflows on behalf of other users
- review and reassess workflows using a novel side-by-side interface

## 💻 Getting started

### 1. Prerequisites

You need node, npm and a local PostgreSQL database running.

You also need a [complete `.env` file](#-configuration).

### 2. Prepare the database

You can apply the schema to a fresh database with:

```
npm run db:schema:load
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

## 🧬 Configuration

It needs a few configuration variables to work.

You can supply these with a `.env` file locally. Run `cp .env.sample .env` to make a fresh one.

## 🌍 Running it on the web

It's suitable for anywhere you'd deploy a Next.js app, including Heroku, Vercel, Netlify and AWS.

[More in the Next.js docs](https://nextjs.org/docs/deployment).
