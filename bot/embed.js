const { RichEmbed } = require('discord.js');

const makeEmbed = (title, array) => {
  const embed = new RichEmbed()
    .setTitle(title)
    .setColor('#7289da');

  array.forEach((el) => {
    embed.addField(el.title, el.content, false);
  });

  return embed;
};

module.exports = { makeEmbed };
