module.exports = {
  name: 'ping',
  description: 'Ping!',
  args: false,
  usage: '<ping>',
  execute(message, args) {
    message.channel.send('Pong.');
  },
};
