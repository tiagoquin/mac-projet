const { neo } = require('../neo');
const { makeEmbed } = require('../embed');

module.exports = {
  name: 'msg',
  description: 'Top Messages d\'un utilisateur avec le plus de réactions',
  args: false,
  usage: '',
  execute(message, args) {
    const { tag } = message.author;
    neo.topMessages(tag)
      .then((result) => {
        console.log(result);

        const embed = makeEmbed('Top messages', result);

        message.channel.send(embed);
      }).catch((err) => {
        console.error(err);
        message.channel.send('Sorry human. Something went wrong');
      });
  },
};
