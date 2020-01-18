const { neo } = require('../neo');
const { makeEmbed } = require('../embed');

module.exports = {
  name: 'suggest',
  description: 'Suggestion of 2nd degree friends',
  args: false,
  usage: '',
  execute(message, args) {
    const { tag } = message.author;
    neo.suggest(tag)
      .then((result) => {
        const embed = makeEmbed('Suggestion of 2nd degree friends', result, message.author, false);

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
