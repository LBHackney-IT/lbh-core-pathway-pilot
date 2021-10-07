require('dotenv').config()

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
  config.env.HACKNEY_JWT_SECRET = process.env.HACKNEY_JWT_SECRET
  config.env.GSSO_TOKEN_NAME = process.env.GSSO_TOKEN_NAME

  return config
}
