const { neo } = require('../neo');
const { makeEmbed } = require('../embed');

module.exports = {
  name: 'friends',
  description: 'Top des utilisateurs qui ont réagit à tes messages',
  args: false,
  usage: '',
  execute(message, args) {
    const { tag } = message.author;
    neo.topFriends(tag)
      .then((result) => {
        console.log(result);

        const embed = makeEmbed('Top friends', result);

        message.channel.send(embed);

      }).catch((err) => {
        console.error(err);
        message.channel.send('Sorry human. Something went wrong');
      });
  },
};
