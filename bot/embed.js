const { RichEmbed } = require('discord.js');

/**
 * Build a embed rich content
 *
 * @param {string} title title of the embed
 * @param {Array} array array with {title, content}
 * @param {boolean} inline if it should display in line
 * @returns {RichEmbed} embed
 */
const makeEmbed = (title, array, inline) => {
  const embed = new RichEmbed()
    .setTitle(title)
    .setColor('#7289da');

  array.forEach((el) => {
    embed.addField(el.title, el.content, inline);
  });

  return embed;
};

module.exports = { makeEmbed };
