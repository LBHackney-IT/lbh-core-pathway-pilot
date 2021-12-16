require('dotenv-flow').config();

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
  config.baseUrl = process.env.APP_URL
  config.env.HACKNEY_AUTH_COOKIE_NAME = process.env.HACKNEY_AUTH_COOKIE_NAME
  config.env.HACKNEY_AUTH_TOKEN_SECRET = process.env.HACKNEY_AUTH_TOKEN_SECRET

  return config
}
