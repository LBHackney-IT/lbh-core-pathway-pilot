# LBH Core pathway pilot

[![Deployment](https://github.com/LBHackney-IT/lbh-core-pathway-pilot/actions/workflows/on-push-main.yml/badge.svg)](https://github.com/LBHackney-IT/lbh-core-pathway-pilot/actions/workflows/on-push-main.yml)
[![Content](https://github.com/LBHackney-IT/lbh-core-pathway-pilot/actions/workflows/upload-content-files.yml/badge.svg)](https://github.com/LBHackney-IT/lbh-core-pathway-pilot/actions/workflows/upload-content-files.yml)

---

<img src="https://github.com/LBHackney-IT/lbh-core-pathway-pilot/blob/main/public/screens.png?raw=true" alt="" />

<p align="center">
    <em>Example screens from the app</em>
</p>

---

🚨 **This is experimental BETA software being used to run a pilot in Hackney Council as of November 2021. No guarantees of long-stability or support are made.** 🚨

This is the codebase for the beta prototype being used for a pilot of the new core pathway for adult social care.

It expands on the form-building features of the [mainstream tool](https://github.com/LBHackney-IT/lbh-social-care-frontend/wiki/How-to-create-and-modify-forms).

Users can:

- start, resume and complete workflows on a kanban column interface
- approve and authorise workflows on behalf of other users
- review and reassess workflows using a novel side-by-side interface

---

## 🧱 How it's built

It's a [Next.js](https://nextjs.org) app backed by a [PostgreSQL](https://www.postgresql.org) database, that interacts with:

- The [Social Care Case Viewer API](https://github.com/LBHackney-IT/social-care-case-viewer-api/), in order to grab basic biographical information about the resident in question
- [Contentful](https://www.contentful.com/), to provide a user-friendly way to define form flows and questions

It uses [Prisma](https://www.prisma.io/) to speak to the database and [NextAuth](https://next-auth.js.org/) to handle Google login.

<img src="https://github.com/LBHackney-IT/lbh-core-pathway-pilot/blob/main/public/solution-overview.png?raw=true" alt="" />

---

## 📃 Contents

- [LBH Core pathway pilot](#lbh-core-pathway-pilot)
  - [🧱 How it's built](#-how-its-built)
  - [📃 Contents](#-contents)
  - [💻 Getting started](#-getting-started)
    - [Prerequisites](#prerequisites)
    - [1. Set up `.env.*.local` files](#1-set-up-envlocal-files)
    - [2. Install dependencies](#2-install-dependencies)
    - [3. Update `/etc/hosts` file](#3-update-etchosts-file)
    - [4. Prepare database usage](#4-prepare-database-usage)
  - [🧑‍💻 Usage](#-usage)
    - [Running the application](#running-the-application)
    - [Running tests](#running-tests)
      - [Unit tests](#unit-tests)
      - [Browser tests](#browser-tests)
    - [Running other checks](#running-other-checks)
    - [Making a database schema change](#making-a-database-schema-change)
    - [Updating the reporting configuration](#updating-the-reporting-configuration)
  - [🗃 Documentation](#-documentation)
    - [Deployment](#deployment)
  - [Database](#database)
    - [Infrastructure](#infrastructure)
    - [Continuous Integration / Continuous Deployment (CI/CD)](#continuous-integration--continuous-deployment-cicd)
    - [Configuration](#configuration)
      - [Forms](#forms)
      - [Next steps](#next-steps)
    - [Reporting](#reporting)
    - [Related repositories](#related-repositories)
  - [License](#license)

## 💻 Getting started

### Prerequisites

- [Node.js (v14)](https://nodejs.dev)
- [npm (v6)](https://www.npmjs.com)
- [PostgreSQL](https://www.postgresql.org)

### 1. Set up `.env.*.local` files

Environment variables for local development use
`.env.development.local` and for tests e.g. Jest and Cypress `.env.test.local`.

To set up a `.env.development.local` file:

  ```bash
  cp .env.development .env.development.local
  ```

Then fill in the values for each environment variable where it equals
`<REQUIRED_VALUE>` using the
**/social-care-workflows-local/.env.development.local** Parameter Store value
under Systems Manager in the Social-Care-Workflows-Staging AWS account.

> ℹ️ **Information**: If you don't have access to the AWS accounts, ask for access
> in the #aws-sso Slack channel stating your Hackney email address and that you
> need access to Social-Care-Workflows-Staging and
> Social-Care-Workflows-Production.

To set up a `.env.test.local` file:

  ```bash
  cp .env.test .env.test.local
  ```

Then fill in the values for each environment variable where it equals `<REQUIRED_VALUE>`.

> 💡 **Hint**: You can use a different database for tests to avoid losing your
> data whenever running browser tests.

See [Next.js documentation for more information about environment variables](https://nextjs.org/docs/basic-features/environment-variables#test-environment-variables).

### 2. Install dependencies

  ```bash
  npm install
  ```

### 3. Update `/etc/hosts` file

The Hackney authentication service requires the application to run on a
`hackney.gov.uk` subdomain. To be able to access the application, add the
following to your `/etc/hosts` file:

  ```text
  # Hackney Social Care Frontend
  127.0.0.1       dev.hackney.gov.uk
  ```

### 4. Prepare database usage

Assuming you have a local PostgreSQL database running and `DATABASE_URL`
in your `.env.development.local` points to it, run:

  ```bash
  npm run build:prisma
  npm run dev:db:push
  ```

## 🧑‍💻 Usage

### Running the application

To be able to sign into the application, you'll need to have a Hackney Google
account and be part of the one of the [allowed Google Groups](./config/allowedGroups.ts).

  ```bash
  npm run dev
  ```

The app will then be at [dev.hackney.gov.uk:3000](http://dev.hackney.gov.uk:3000).

### Running tests

#### Unit tests

Unit tests use [Jest](https://jestjs.io) and for component or page tests, we
utilise the [React Testing Library](https://testing-library.com), to run all
tests:

  ```bash
  npm run test
  ```

#### Browser tests

Browser tests use [Cypress](https://www.cypress.io). There are three Cypress specs:

- Browse, inspect and reassign workflows from the UI
- Beginning a brand new workflow
- Reviewing and reassessing a workflow

To interactively run them:

  ```bash
  npm run test:db:seed  # this will empty tables and then seed
  npm run test:dev  # this will run the app on port 3001 by default
  npm run test:browser:open
  ```

Alternatively, to run them in headless mode:

  ```bash
  npm run test:browser
  ```

In our CI/CD pipeline, the Cypress tests run against a mock server for calls to
the Social Care Case Viewer API using [the API's OpenAPI specification
file](https://app.swaggerhub.com/apis-docs/Hackney/social-care-case-viewer-api/1.0.0)
and [Prism](https://github.com/stoplightio/prism). To run it locally to use with Cypress:

1. Set `SOCIAL_CARE_API_ENDPOINT` in your `.env.test.local` to `http://localhost:4010`
2. Run the mock server using:

  ```bash
  npm run test:mock:sccv
  ```

Then follow commands to run Cypress as above.

### Running other checks

As the application is written in TypeScript, it's important to run a type check.

  ```bash
  npm run typecheck
  ```

[ESLint](https://eslint.org) is used to lint code.

  ```bash
  npm run lint
  ```

To run linting, type check and unit tests:

  ```bash
  npm run check
  ```

To check for vulnerabilities in all installed dependencies/packages (dev & prod)

  ```bash
  npm audit
  ```

`npm audit` accepts different arguments that provide additional functionality e.g `npm audit fix` will run a scan and then try to install any compatible updates.
See the [docs](https://docs.npmjs.com/cli/v8/commands/npm-audit) for more info and examples of usage.

### Making a database schema change

1. Update `prisma/schema.prisma`
2. Use the Prisma Migrate tool to create a database migration with a name:

    ```bash
    node_modules/.bin/prisma migrate dev --name {name_of_migration}
    ```

    > Note: If any errors appear when trying to run the migration you may have to reset your local database and re-apply the migrations. This can be done by running the reset command on step 4

3. After the migration has been run check within the `prisma/migrations` folder to see if the new migration has succesfully been created

4. Your local database must be reset to apply the newly created migration. To do this run the following command:

    ```bash
    node_modules/.bin/prisma migrate reset
    ```

5. Run all checks and fix any tests

    ```bash
    npm run test
    ```

To find out more about database migrations, see [Prisma's documentation on migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate).

### Updating the reporting configuration

A script is used to generate the JSON configuration for reporting, see
`jobs/update-reporting-config.js`. It will update the configuration for a single
environment.

To update it for an environment, update the script's tests and the script
itself, then run:

  ```bash
  # For staging
  npm run build:reporting:stg

  # Or for production
  npm run build:reporting:prod
  ```

## 🗃 Documentation

### Deployment

We have three environments:

- Staging
- Testing
- Production

The application is hosted as a Lambda.

## Database

The application uses a single PostgreSQL database. To connect to a database in
a deployed environment, see [Connecting to the database](./docs/connecting-to-the-database.md).

### Infrastructure

We utilise AWS infrastucture. For deploying the Lambdas, we use the [Serverless framework](https://www.serverless.com) (see [serverless.yml](./serverless.yml)).

For managing the database and other resource, we use [Terraform](https://www.terraform.io) that is defined within the [Infrastructure repository](https://github.com/LBHackney-IT/infrastructure/tree/master/projects/social-care-workflows).

### Continuous Integration / Continuous Deployment (CI/CD)

For our CI/CD pipeline, we utilise [GitHub
Actions](https://github.com/features/actions). The main pipeline is defined in
`.github/workflows/on-push-main.yml` which runs tests and handles deployment.

![On push main pipeline](docs/on-push-main-pipeline.png)

### Configuration

#### Forms

Forms or assessments are configured in Contentful and saved as a JSON file for the application to use, the update to a form works like so:

1. A change is published in Contentful
2. The change triggers the GitHub Action workflow `.github/workflows/upload-content-files.yml` which makes a commits a change to the `config/forms/forms.json` to the repository
3. For staging, the updated `forms.json` replaces the current one in our AWS S3 bucket

    The application then gets the latest form config from S3 or falls back to the
    local version. Utilising S3 means we can make changes to questions, fields, etc.
    without going through the whole deployment pipeline.

4. To deploy the changes for production, approval is needed.

To manually update the forms config, run:

  ```bash
  npm run import:contentful:forms
  ```

#### Next steps

Next steps are the steps that can happen after an assessment is completed. This
configuration works similarly to forms although at the moment its JSON file
(`config/nextSteps/nextStepOptions.json`) is not automatic and has to be
manually updated by running:

  ```bash
  npm run import:contentful:next-steps
  ```

Then committed and pushed.

### Reporting

We export data to enable Adult Social Care to fulfill their reporting needs. To
achieve this, we have a Lambda that can retrieve data from the database and then
write it to a Google Sheets, see `apps/reporting-exporter.js`. It gets invoked
every day at 2am UTC by a scheduled event i.e. CloudWatch Event.

A [JSON file](./config/reports.json) is used to configure the reports that are
created by the reporting exporter for each environment. This allows us to
easily:

- specify where to export to
- what entity (or databse table) to export from
- filter out any rows
- decide what columns need to be exported

See [Updating the reporting configuration](#updating-the-reporting-configuration) for how to update the reports.

### Related repositories

| Name                                                                                       | Purpose                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [LBH Social Care Frontend](https://github.com/LBHackney-IT/lbh-social-care-frontend)       | Provides the UI/UX of the Social Care System.                                                                                                                                                                                   |
| [Social Care Case Viewer API](https://github.com/LBHackney-IT/social-care-case-viewer-api) | Provides [service API](http://playbook.hackney.gov.uk/API-Playbook/platform_api_vs_service_api#b-platform-apis) capabilities to the Social Care System.                                                                         |
| [Infrastructure](https://github.com/LBHackney-IT/infrastructure)                           | Provides a single place for AWS infrastructure defined using [Terraform](https://www.terraform.io) as [infrastructure as code](https://en.wikipedia.org/wiki/Infrastructure_as_code) as part of Hackney's AWS account strategy. |

## License

[Apache License](LICENSE)
