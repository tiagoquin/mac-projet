const db = require('../db/dbadapter');
const { makeEmbed } = require('../embed');

module.exports = {
  name: 'friends',
  description: 'Top des utilisateurs qui ont réagit à tes messages',
  args: false,
  usage: '',
  execute(message, args) {
    const { tag } = message.author;

    db.topFriends(tag)
      .then((result) => {
        const embed = makeEmbed('Top friends', result, message.author, false);

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
