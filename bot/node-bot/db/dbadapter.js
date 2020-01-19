const neo = require('./neo');

const {
  addReaction,
  topReactions,
  topMessages,
  topFriends,
  suggest,
  pathAtoB,
} = neo;


const db = {
  addReaction,
  topReactions,
  topMessages,
  topFriends,
  suggest,
  pathAtoB,
};

module.exports = db;
