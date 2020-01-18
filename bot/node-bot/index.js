require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js');
const { config } = require('./config');
const { neo } = require('./neo');


const client = new Discord.Client(); // create a new Discord client

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));

// eslint-disable-next-line no-restricted-syntax
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  // set a new item in the Collection
  // with the key as the command name and the value as the exported module
  client.commands.set(command.name, command);
}


// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', () => {
  console.log('Ready!');
});

client.on('message', (message) => {
  // From here, the code concerns a command

  const args = message.content.slice(config.PREFIX.length).split(' ');
  const commandName = args.shift().toLowerCase();

  if (!client.commands.has(commandName)) return;

  const command = client.commands.get(commandName);

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${config.PREFIX}${command.name} ${command.usage}\``;
    }

    message.channel.send(reply);
    return;
  }

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('there was an error trying to execute that command!');
  }
});

/**
 * Listens to incoming reactions
 */
client.on('messageReactionAdd', (reaction, user) => {
  const { author } = reaction.message;

  const params = {
    author: author.tag,
    message: reaction.message.content,
    responder: user.tag,
    emoji: reaction.emoji.name,
  };

  // We don't want to track bots x) only hoomans ∑:3
  if (!author.bot) {
    console.log(params.author, params.message, params.responder, params.emoji);
    neo.addReaction(params.author, params.message, params.responder, params.emoji);
  }
});

client.login(config.BOT_TOKEN);

// https://getemoji.com/
// https://discordjs.guide/popular-topics/collectors.html#basic-message-collector
// https://discordjs.guide/command-handling/adding-features.html#required-arguments
// To improve a bit more the discord bot
