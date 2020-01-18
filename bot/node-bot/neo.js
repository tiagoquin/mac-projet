const v1 = require('neo4j-driver');

const { config } = require('./config');

const neo4j = v1;

const URI = config.URI_NEO4J;
const USER = config.USER_NEO4J;
const PASSWORD = config.PASSWORD_NEO4J;


const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

const queryA = () => {
  const personName = 'Alice';
  const resultPromise = session.run(
    'CREATE (a:Person {name: $name}) RETURN a',
    { name: personName }
  );

  resultPromise.then(result => {
    session.close();

    const singleRecord = result.records[0];
    const node = singleRecord.get(0);

    console.log(node.properties.name);

    // on application exit:
    driver.close();
  });
};

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
}

const addMessage = async (authorid, messageid) => {
  const query = `
    MERGE (author:Person{name: $author})
    MERGE (msg:Message{name: $msg})
    RETURN *
    `;

  const params = {
    author: authorid,
    msg: messageid,
  };

  await doQuery(query, params);
  await addMessageRel(authorid, messageid);
};

/**
 * Adds a reaction to Neo DB
 *
 * @param {*} authorid A way to identify the user (user#1010)
 * @param {*} messageid A way to identify the message
 * @param {*} responderid A way to identify the reacting user
 * @param {*} reaction The emoji used to react
 */
const addReaction = async (authorid, messageid, responderid, reaction) => {
  await addMessage(authorid, messageid);

  const query = `
    MATCH (msg:Message{name: $msg})
    MERGE (responder:Person{name: $responder})
    MERGE (responder)-[rel:REACTED{emoji: $reaction}]->(msg)
    RETURN rel
    `;

  const params = {
    responder: responderid,
    msg: messageid,
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

  const oldquery = `
    MATCH (p:Person{name: $user})-[rel:REACTED]->(m:Message)
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

const topMessages = async (user) => {
  const query = `
    MATCH (p:Person{name: $user})-[:POSTED]->(m:Message)<-[rel:REACTED]-(:Person)
    WITH m.name AS message, size(collect(rel)) AS numberOfRelations
    ORDER BY numberOfRelations DESC
    LIMIT 5
    RETURN message, numberOfRelations
  `;

  const oldquery = `
    MATCH (p:Person{name: $user})-[rel:REACTED]->(m:Message)
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
  topFriends,
  suggest,
  pathAtoB,
};

module.exports = { neo };
