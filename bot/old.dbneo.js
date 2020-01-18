const neo4j = require('neo4j-driver').v1;
const { config } = require('./config');

const uri = config.URI_NEO4J;
const user = config.USER_NEO4J;
const password = config.PASSWORD_NEO4J;

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

/**
 * Execute a query with Neo4j driver
 *
 * @param {string} query the string of the query
 * @param {object} params the params object
 */
const runQuery = async (query, params) => {
  const session = driver.session();

  return session.run(query, params)
    .then((result) => {
      session.close();

      return result;
    }).catch((err) => {
      console.error(err);
    });
};

const addMessageRel = async (authorid, messageid) => {
  const query = `
    MATCH (author:Person{name: $author})
    MATCH (msg:Message{name: $msg})
    MERGE (author)-[rel:POSTED]->(msg)
    RETURN *
  `;

  const params = { author: authorid, msg: messageid }

  await runQuery(query, params);
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

  await runQuery(query, params);
  await addMessageRel(authorid, messageid);
}

/**
 * 
 * @param {*} authorid 
 * @param {*} messageid 
 * @param {*} responderid 
 * @param {*} reaction 
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

  const result = runQuery(query, params);


  const singleRecord = result.records[0];
  const node = singleRecord.get(0);

  console.log(node.properties);
};

const topReactions = async (user) => {
  const query = `
    MATCH (p:Person{name: $user})-[rel:REACTED]->(m:Message)
    WITH rel.emoji AS emoji, size(collect(rel)) AS numberOfRelations
    ORDER BY numberOfRelations DESC
    LIMIT 5
    RETURN emoji, numberOfRelations
  `;

  const params = {
    user
  };

  const result = runQuery(query, params);

  let string = "empty";

  string = result.records.reduce((acc, record) => {
    return acc + `${record.get('emoji')} ${record.get('numberOfRelations').toNumber()}\n`
  }, "");

  return string;
}

const topMessages = async (user) => {
  const query = `
    MATCH (p:Person{name: $user})-[rel:REACTED]->(m:Message)
    WITH rel.emoji AS emoji, size(collect(rel)) AS numberOfRelations
    ORDER BY numberOfRelations DESC
    LIMIT 5
    RETURN emoji, numberOfRelations
  `;

  const params = {
    user
  };

  const result = runQuery(query, params);

  let string = "empty";

  string = result.records.reduce((acc, record) => {
    return acc + `${record.get('emoji')} ${record.get('numberOfRelations').toNumber()}\n`
  }, "");

  return string;
}

const dbneo = {
  addReaction,
  topReactions,
  topMessages,
}

module.exports = { dbneo };
