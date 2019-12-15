
require('dotenv').config();

const { env } = process;
const Discord = require('discord.js');

const client = new Discord.Client(); // create a new Discord client

const config = {
  BOT_TOKEN: env.BOT_TOKEN,
};

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', () => {
  console.log('Ready!');
});

console.log(config.BOT_TOKEN);

// login to Discord with your app's token
client.login(config.BOT_TOKEN);
