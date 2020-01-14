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

const addMessageRel = (authorid, messageid) => {
  const session = driver.session();

  const query = `
    MATCH (author:Person{name: $author})
    MATCH (msg:Message{name: $msg})
    MERGE (author)-[rel:POSTED]->(msg)
    RETURN *
  `;

  const params = { author: authorid, msg: messageid }

  session.run(query, params)
    .then((result) => {
      result.records.forEach(function (record) {
      });
      session.close();
    })
    .catch(err => console.error(err));
}

const addMessage = async (authorid, messageid) => {
  const session = driver.session();

  const query = `
    MERGE (author:Person{name: $author})
    MERGE (msg:Message{name: $msg})
    RETURN *
    `;

  const params = {
    author: authorid,
    msg: messageid,
  };

  session.run(query, params)
    .then((result) => {
      session.close();

      addMessageRel(authorid, messageid);
    })
    .catch((err) => {
      console.error(err);
    });
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

  const session = driver.session();

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

  session.run(query, params)
    .then(function (result) {
      session.close();

      const singleRecord = result.records[0];
      const node = singleRecord.get(0);

      console.log(node.properties);
    })
    .catch((err) => {
      console.error(err);
    });

};

const topReactions = async (user) => {
  const session = driver.session();

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

  let string = "empty";

  await session.run(query, params)
    .then((result) => {
      session.close();

      string = result.records.reduce((acc, record) => {
        return acc + `${record.get('emoji')} ${record.get('numberOfRelations').toNumber()}\n`
      }, "");

    }).catch((err) => {
      console.error(err);
    });

  return string;
}

const neo = {
  addReaction,
  topReactions,
}

module.exports = { neo };
