require('dotenv').config()

const {
  SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET,
  HOST,
  SCOPES,
  PORT,
  SERVER_PORT,
  BACKEND_PORT,
  WEBHOOKS,
  API_VERSION,
  SHOP,

  POSTGRES_USER,
  POSTGRES_PWD,
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_DB,
} = process.env

module.exports = {
  apps: [
    {
      script: 'npm',
      args: 'run serve',
      env_production: {
        NODE_ENV: 'production',
        SHOPIFY_API_KEY,
        SHOPIFY_API_SECRET,
        HOST,
        SCOPES,
        PORT,
        SERVER_PORT,
        BACKEND_PORT,
        WEBHOOKS,
        API_VERSION,
        SHOP,

        POSTGRES_USER,
        POSTGRES_PWD,
        POSTGRES_HOST,
        POSTGRES_PORT,
        POSTGRES_DB,
      },
      env_development: {
        NODE_ENV: 'development',
      },
    },
  ],
}
