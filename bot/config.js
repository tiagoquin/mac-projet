const { env } = process;

/**
 * Get configuration
 */
const config = {
  BOT_TOKEN: env.BOT_TOKEN,
  PREFIX: env.PREFIX,
  URI_NEO4J: env.URI_NEO4J,
  USER_NEO4J: env.USER_NEO4J,
  PASSWORD_NEO4J: env.PASSWORD_NEO4J,
};

module.exports = { config };