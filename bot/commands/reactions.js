const { neo } = require('../neo');
const { makeEmbed } = require('../embed');

module.exports = {
  name: 'reactions',
  description: 'Top des réactions que suscite l\'utilisateur',
  args: false,
  usage: '',
  execute(message, args) {
    const { tag } = message.author;
    neo.topReactions(tag)
      .then((result) => {
        console.log(result);

        const embed = makeEmbed('Top reactions', result);

        message.channel.send(embed);

      }).catch((err) => {
        console.error(err);
        message.channel.send('Sorry human. Something went wrong');
      });
  },
};
