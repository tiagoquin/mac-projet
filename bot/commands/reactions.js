const { neo } = require('../neo4j');

module.exports = {
  name: 'reactions',
  description: `Top des réactions que sucite l'utilisateur`,
  args: false,
  usage: '<reactions>',
  execute(message, args) {
    const tag = message.author.tag;
    neo.topReactions(tag)
      .then(result => {
        console.log(result);

        message.channel.send('Top reactions from your messages:\n' + result);

      }).catch((err) => {
        console.error(err);
        message.channel.send('Sorry human. Something went wrong');
      });


  },
};
