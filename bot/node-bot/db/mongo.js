const { MongoClient } = require('mongodb');
const assert = require('assert');

const { config } = require('../config');

const URI = config.URI_MONGO;
const USER = config.USER_MONGO;
const PASSWORD = config.PASSWORD_MONGO;

const url = `mongodb://${USER}:${PASSWORD}@${URI}:27017/`;

let db;

// Initialize connection once
MongoClient.connect(url, { useUnifiedTopology: true }, (err, database) => {
  if (err) throw err;

  db = database.db('test');
});

/**
 * adds a person to the mongo db
 *
 * @param {string} tag user#9999
 * @param {string} avatarURL http:cdn....
 * @param {string} id snowflake
 */
const addPerson = async (tag, avatarURL, id) => {

  try {
    const collection = db.collection('Person');

    collection.update(
      {
        tag,
      }, {
        $setOnInsert: {
          avatar: avatarURL,
          tag,
          id,
        },
      },
      { upsert: true },
    );
  } catch (error) {
    console.error(error);
  }
};

const addMessage = async (id, content, createdAt, reaction) => {

  try {
    const collection = db.collection('Message');

    collection.update(
      {
        id,
      }, {
        $setOnInsert: {
          content,
          id,
          createdAt,
        },
        $addToSet: {
          reactions: reaction,
        },
      },
      { upsert: true },
    );
  } catch (error) {
    console.error(error);
  }
};

const mongo = {
  addPerson,
  addMessage,
};

module.exports = mongo;
