/**
 * @file Adapter between real databases and the rest of the world.
 * @description this serves as a lvl of abstraction
 */

const neo = require('./neo');
const mongo = require('./mongo');

const {
  topReactions,
  topMessages,
  topMessagesByEmoji,
  topFriends,
  topFriendsByEmoji,
  suggest,
  pathAtoB,
} = neo;

const addReaction = (author, message, user, reaction) => {
  const params = {
    author: author.tag,
    message: message.content,
    responder: user.tag,
    emoji: reaction.emoji.name,
  };

  neo.addReaction(params.author, message, params.responder, params.emoji);

  mongo.addPerson(author.tag, author.avatarURL, author.id);

  mongo.addMessage(message.id, message.content, message.createdAt, params.emoji);
};


const db = {
  addReaction,
  topReactions,
  topMessages,
  topMessagesByEmoji,
  topFriends,
  topFriendsByEmoji,
  suggest,
  pathAtoB,
};

module.exports = db;
