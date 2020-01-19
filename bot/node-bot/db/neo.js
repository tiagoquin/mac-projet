const v1 = require('neo4j-driver');
const Discord = require('discord.js');

const { config } = require('../config');

const neo4j = v1;

const URI = config.URI_NEO4J;
const USER = config.USER_NEO4J;
const PASSWORD = config.PASSWORD_NEO4J;


const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

/**
 * Execute a query with Neo4j driver
 *
 * @param {string} query the string of the query
 * @param {object} params the params object
 */
const doQuery = async (query, params) => {
  const session = driver.session();

  const obj = await session.run(query, params)
    .then((result) => {
      session.close();

      return result;
    }).catch((err) => {
      console.error(err);
    });

  return obj;
};

const addMessageRel = async (authorid, messageid) => {
  const query = `
    MATCH (author:Person{name: $author})
    MATCH (msg:Message{name: $msg})
    MERGE (author)-[rel:POSTED]->(msg)
    RETURN *
  `;

  const params = { author: authorid, msg: messageid };

  await doQuery(query, params);
};

/**
 * Add message node
 *
 * @param {string} authorid user#9999
 * @param {string} messageid id
 * @param {string} content content
 */
const addMessage = async (authorid, messageid, content) => {
  const query = `
    MERGE (author:Person{name: $author})
    MERGE (msg:Message{name: $content, id: $messageid})
    RETURN *
    `;

  const params = {
    author: authorid,
    messageid,
    content,
  };

  await doQuery(query, params);
  await addMessageRel(authorid, content);
};

/**
 * Adds a reaction to Neo DB
 *
 * @param {Discord.User} authorid A way to identify the user (user#1010)
 * @param {Discord.Message} message A way to identify the message
 * @param {Discord.User} responderid A way to identify the reacting user
 * @param {Discord.Rea} reaction The emoji used to react
 */
const addReaction = async (authorid, message, responderid, reaction) => {
  await addMessage(authorid, message.id, message.content);

  const query = `
    MATCH (msg:Message{name: $msg})
    MERGE (responder:Person{name: $responder})
    MERGE (responder)-[rel:REACTED{emoji: $reaction}]->(msg)
    RETURN rel
    `;

  const params = {
    responder: responderid,
    msg: message.content,
    reaction,
  };

  const result = await doQuery(query, params);

  const singleRecord = result.records[0];
  const node = singleRecord.get(0);

  console.log(node.properties);
};

const topReactions = async (user) => {
  const query = `
    MATCH (p:Person{name: $user})-[:POSTED]->(m:Message)<-[rel:REACTED]-(p2:Person)
    WHERE p <> p2
    WITH rel.emoji AS emoji, size(collect(rel)) AS numberOfRelations
    ORDER BY numberOfRelations DESC
    LIMIT 5
    RETURN emoji, numberOfRelations  
  `;

  const params = {
    user,
  };

  const result = await doQuery(query, params);

  const array = result.records.map(
    (record) => ({
      title: record.get('numberOfRelations').toNumber(),
      content: record.get('emoji'),
    }),
  );

  return array;
};

/**
 * Calculates the top message by reactions
 *
 * @param {string} user user#9999
 */
const topMessages = async (user) => {
  const query = `
    MATCH (p:Person{name: $user})-[:POSTED]->(m:Message)<-[rel:REACTED]-(:Person)
    WITH m.name AS message, size(collect(rel)) AS numberOfRelations
    ORDER BY numberOfRelations DESC
    LIMIT 5
    RETURN message, numberOfRelations
  `;

  const params = {
    user,
  };

  const result = await doQuery(query, params);

  const array = result.records.map(
    (record) => ({
      title: record.get('numberOfRelations').toNumber(),
      content: record.get('message'),
    }),
  );

  return array;
};

/**
 * Calculates the top message by reactions
 *
 * @param {string} user user#9999
 * @param {string} emoji emoji symbol
 */
const topMessagesByEmoji = async (user, emoji) => {
  const query = `
  MATCH (p:Person{name: $user})-[]-(m:Message)-[rel]-(:Person)
  WHERE rel.emoji CONTAINS $emoji
  WITH m.name AS message, size(collect(rel)) AS numberOfRelations
  ORDER BY numberOfRelations DESC
  LIMIT 5
  RETURN message, numberOfRelations
  `;

  const params = {
    user,
    emoji,
  };

  const result = await doQuery(query, params);

  const array = result.records.map(
    (record) => ({
      title: record.get('numberOfRelations').toNumber(),
      content: record.get('message'),
    }),
  );

  return array;
};

/**
 * Calculates top friends (who interract / react more
 *
 * @param {string} user user tag
 * @returns {Array} array of {title, content}
 */
const topFriends = async (user) => {
  const query = `
    MATCH (p:Person)-[rel:REACTED]->(m:Message)<-[:POSTED]-(me:Person{name: $user})
    WHERE p.name <> me.name
    WITH p.name AS friend, count(rel) AS numberOfRelations
    ORDER BY numberOfRelations DESC
    LIMIT 5
    RETURN friend, numberOfRelations
  `;

  const params = {
    user,
  };

  const result = await doQuery(query, params);

  const array = result.records.map(
    (record) => ({
      title: record.get('numberOfRelations').toNumber(),
      content: record.get('friend'),
    }),
  );

  return array;
};

/**
 * Calculates top friends (who interract / react more
 *
 * @param {string} user user tag
 * @param {string} emoji emoji
 * @returns {Array} array of {title, content}
 */
const topFriendsByEmoji = async (user, emoji) => {
  const query = `
    MATCH (p:Person)-[rel:REACTED]->(m:Message)<-[:POSTED]-(me:Person{name: $user})
    WHERE p.name <> me.name AND rel.emoji CONTAINS $emoji
    WITH p.name AS friend, count(rel) AS numberOfRelations
    ORDER BY numberOfRelations DESC
    LIMIT 5
    RETURN friend, numberOfRelations
  `;

  const params = {
    user,
    emoji,
  };

  const result = await doQuery(query, params);

  const array = result.records.map(
    (record) => ({
      title: record.get('numberOfRelations').toNumber(),
      content: record.get('friend'),
    }),
  );

  return array;
};

/**
 * Calculates suggestions of friends at 2nd degree
 *
 * @param {string} user user tag
 * @returns {Array} array of {title, content}
 */
const suggest = async (user) => {
  const query = `
    MATCH (p1:Person{name: $user})-[r*4]-(p2:Person)
    WHERE NOT (p1)-[*2]-(p2)
    WITH size(collect(r)) AS numberOfRelations, p2.name AS suggestion
    ORDER BY numberOfRelations DESC
    LIMIT 5
    RETURN suggestion, numberOfRelations
  `;

  const params = {
    user,
  };

  const result = await doQuery(query, params);

  const array = result.records.map(
    (record) => ({
      title: record.get('numberOfRelations').toNumber(),
      content: record.get('suggestion'),
    }),
  );

  return array;
};

/**
 * Shortest path from source to target
 *
 * @param {string} source from
 * @param {string} target to
 * @returns {Array} array of {title, content}
 */
const pathAtoB = async (source, target) => {
  const query = `
    MATCH (start:Person { name: $source }),(end:Person { name: $target }), p = shortestPath((start)-[*]-(end))
    UNWIND nodes(p) AS n
    WITH n
    WHERE 'Person' IN LABELS(n)
    RETURN n.name AS Names
  `;

  const params = {
    source,
    target,
  };

  const result = await doQuery(query, params);

  const array = result.records.map(
    (record) => ({
      title: '-->',
      content: record.get('Names'),
    }),
  );

  return array;
};

const neo = {
  addReaction,
  topReactions,
  topMessages,
  topMessagesByEmoji,
  topFriends,
  topFriendsByEmoji,
  suggest,
  pathAtoB,
};

module.exports = neo;
