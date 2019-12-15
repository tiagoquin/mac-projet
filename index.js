
require('dotenv').config();
const fs = require('fs');

const { env } = process;
const Discord = require('discord.js');

const client = new Discord.Client(); // create a new Discord client

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));

// eslint-disable-next-line no-restricted-syntax
for (const file of commandFiles) {
  // eslint-disable-next-line import/no-dynamic-require
  const command = require(`./commands/${file}`);

  // set a new item in the Collection
  // with the key as the command name and the value as the exported module
  client.commands.set(command.name, command);
}

const config = {
  BOT_TOKEN: env.BOT_TOKEN,
  PREFIX: env.PREFIX,
};

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', () => {
  console.log('Ready!');
});

client.on('message', (message) => {
  // Check if this is a command
  if (!message.content.startsWith(config.PREFIX) || message.author.bot) {
    // Filter
    const filter = (reaction, user) => ['❤️', '🧂'].includes(reaction.emoji.name) && user.id === message.author.id;

    const collector = message.createReactionCollector(filter, { time: 60000 });


    collector.on('collect', (reaction, reactionCollector) => {
      console.log(`Collected ${reaction.emoji.name}`);
    });

    collector.on('end', (collected) => {
      console.log(`Collected ${collected.size} items`);
    });

    /*
    // await Reactions
    message.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
      .then((collected) => {
        const reaction = collected.first();

        if (reaction.emoji.name === '❤️') {
          message.reply('you reacted with a ❤️');
        } else {
          message.reply('you reacted with a 🧂');
        }
      })
      .catch(() => {
        // message.reply('you reacted with neither a thumbs up, nor a thumbs down.');
      });

      */

    return;
  }

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

client.login(config.BOT_TOKEN);

// https://getemoji.com/
// https://discordjs.guide/popular-topics/collectors.html#basic-message-collector
// https://discordjs.guide/command-handling/adding-features.html#required-arguments
// To improve a bit more the discord bot
