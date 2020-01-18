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
        const embed = makeEmbed('Top reactions', result, true);

        message.channel.send(embed)
          .catch(() => {
            message.channel.send('Sorry human -> I need the permission to send links to use Rich Embed feature');
          });
      }).catch((err) => {
        console.error(err);
        message.channel.send('Sorry human. Something went wrong');
      });
  },
};
