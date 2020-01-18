const { RichEmbed, User } = require('discord.js');

/**
 * Build a embed rich content
 *
 * @param {string} title title of the embed
 * @param {Array} array array with {title, content}
 * @param {User} author ff
 * @param {boolean} inline if it should display in line
 * @returns {RichEmbed} embed
 */
const makeEmbed = (title, array, author, inline) => {
  const embed = new RichEmbed()
    .setAuthor(author.username, author.avatarURL)
    .setTitle(title)
    .setColor('#7289da');

  array.forEach((el) => {
    embed.addField(el.title, el.content, inline);
  });

  return embed;
};

module.exports = { makeEmbed };
