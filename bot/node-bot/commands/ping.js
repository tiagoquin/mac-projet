module.exports = {
  name: 'ping',
  description: 'Ping!',
  args: false,
  usage: '',
  execute(message, args) {
    message.channel.send('Pong.');
  },
};
