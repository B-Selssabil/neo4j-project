const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { getDriver } = require("../neo4j");
const driver = getDriver();
const session = driver.session();

let token;

exports.protect = asyncHandler(async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized to access this route");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userNode = await session.executeRead((tx) => {
      return tx.run(
        `
            MATCH (u: User)
                WHERE u.email = $email
                RETURN properties(u)
            `,
        {
          email: decoded.userEmail,
        }
      );
    });

    res.user = userNode.records[0]._fields[0];


    next();
  } catch (error) {
    console.log(error);
    throw new Error("Aunauthorized to access this route, token failed");
  }
});
