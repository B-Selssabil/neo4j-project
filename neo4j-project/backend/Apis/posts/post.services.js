const { getDriver } = require("../../neo4j");
const driver = getDriver();
let session = driver.session();

// Create a session to run Cypher statements in.

// Run a Cypher statement, reading the result in a streaming manner as records arrive:

exports.getAllPosts = async function () {
  const postNode = await session.executeRead((tx) => {
    return tx.run(
      `
      match (n:POST) return properties(n)
          `,
      {}
    );
  });

  return postNode;
};

exports.createPost = async function (email, subject, text) {
  let likes = [];
  const postNode = await session.executeWrite((tx) => {
    return tx.run(
      `
      MATCH (u:User {email :'${email}' })
create (u) -[:HAS_POST] ->(p:POST {subject:'${subject}', text:"${text}", emailUser:"${email}", likes: ${likes} }) -[:HAS_LIKES] ->(l:LIKES)
            `,
      {
        email,
        subject,
        text,
      }
    );
  });
  return postNode;
};

exports.deletePost = async function (id) {
  let query = `match (n:POST) where id(n) = ${id} detach delete n`;

  let string = await session.run(query, {}).catch((err) => {
    console.log(err);
  });

  console.log("String ", string);
  return string;
};

exports.getPost = async function (id) {
  let query = `match (n:POST) where id(n) = ${id} return properties(n)`;
  const postNode = await session.executeRead((tx) => {
    return tx.run(query, { id });
  });

  return postNode;
};

exports.updatePost = async function (id, subject, post) {
  let query = `match (n:POST)
  where id(n) = ${id}
  set n.subject = "${subject}" , n.text = "${post}"
  `;
  const postNode = await session.executeWrite((tx) => {
    return tx.run(query, {});
  });

  return postNode;
};

exports.likePost = async function (id, numbL, L) {
  let query = `match (n:POST) - [con:HAS_LIKES] -> (l:LIKES) where id(n) = ${id} set n.likes = ${numbL} set l.users = '${L}' return properties(l)`;

  const postNode = await session.executeWrite((tx) => {
    return tx.run(query, {});
  });

  return postNode;
};

exports.getLikesOfPost = async function (id) {
  let query = `
  MATCH (p:POST) - [con:HAS_LIKES] -> (l:LIKES)
  where id(p) = ${id}
  return properties(l) `;

  const likesNode = await session.executeWrite((tx) => {
    return tx.run(query, {});
  });

  return likesNode;
};
