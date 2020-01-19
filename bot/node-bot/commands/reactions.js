const db = require('../db/dbadapter');
const { makeEmbed } = require('../embed');

module.exports = {
  name: 'reactions',
  description: 'Top des réactions que suscite l\'utilisateur',
  args: false,
  usage: '',
  execute(message, args) {
    const { tag } = message.author;

    db.topReactions(tag)
      .then((result) => {
        const embed = makeEmbed('Top reactions', result, message.author, true);

        message.channel.send(embed)
          .catch((err) => {
            console.error(err);
            message.channel.send('Sorry human -> I need the permission to send links to use Rich Embed feature');
          });
      }).catch((err) => {
        console.error(err);
        message.channel.send('Sorry human. Something went wrong');
      });
  },
};
