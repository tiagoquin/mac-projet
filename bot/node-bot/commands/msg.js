const { neo } = require('../neo');
const { makeEmbed } = require('../embed');

module.exports = {
  name: 'msg',
  description: 'Top messages with the most reactions',
  args: false,
  usage: '',
  execute(message, args) {
    const { tag } = message.author;
    neo.topMessages(tag)
      .then((result) => {
        const embed = makeEmbed('Top messages', result, message.author, false);

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
