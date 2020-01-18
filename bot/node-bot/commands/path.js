const { neo } = require('../neo');
const { makeEmbed } = require('../embed');

module.exports = {
  name: 'path',
  description: 'Give you the path to friendship with someone',
  args: false,
  usage: '<someones#9999>',
  execute(message, args) {
    const { tag } = message.author;
    const target = args[0] || ' ';

    neo.pathAtoB(tag, target)
      .then((result) => {
        const embed = makeEmbed('Path', result, message.author, false);

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
