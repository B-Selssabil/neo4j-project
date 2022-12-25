const router = require("express").Router();

require("dotenv").config();

// third-party packages
const jwt = require("jsonwebtoken");

// driver session
const { getDriver } = require("../../neo4j");

const { encryptPassword } = require("../../utils/Hash");
const driver = getDriver();
const session = driver.session();

const { protect } = require("../../middlewares/authMiddleware");

router.post("/register", async (req, res) => {
  let { username, email, password } = req.body;

  password = await encryptPassword(password);

  const userNode = await session.executeWrite((tx) => {
    return tx.run(
      `
              MERGE (u: User {email: $email})
              SET u.username = $username
              SET u.password = $password
              RETURN properties(u)
            `,
      {
        username,
        email,
        password,
      }
    );
  });

  if (userNode.records.length > 0) {
    res.status(200).json({
      ...userNode.records[0]._fields[0],
      token: jwt.sign({ userEmail: email }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      }),
    });
  } else {
    res.status(400);
    throw new Error("User was not created");
  }
});

router.get("/login", async (req, res) => {
  let { email, password } = req.body;

  password = await encryptPassword(password);

  const userNode = await session.executeRead((tx) => {
    return tx.run(
      `
            MATCH (u: User)
              WHERE u.email = $email
              RETURN properties(u)
            `,
      {
        email,
      }
    );
  });

  if (userNode.records.length > 0) {
    res.status(200).json({
      ...userNode.records[0]._fields[0],
      token: jwt.sign({ userEmail: email }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      }),
    });

    console.log("Token " + res.email);
  } else {
    res.status(401);
    throw new Error("Wrong user credentials");
  }
});

router.get("/users", protect, (req, res) => {
  console.log("token", req.headers.authorization);
  res.json({
    success: 1,
    messgae: "we did it",
    token: req.headers.authorization,
  });
});

module.exports = router;
