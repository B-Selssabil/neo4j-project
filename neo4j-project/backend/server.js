// express server initialization
const express = require("express");
const app = express();

// env vars and body parser
app.use(express.json());
require("dotenv").config();

// third-party packages
const jwt = require("jsonwebtoken");
const colors = require("colors");

// driver session
const { initDriver, getDriver } = require("./neo4j");
const { errorHandler, notFound } = require("./middlewares/errorHandler");
const driver = getDriver();

// API routes
const UserRouter = require("./Apis/users/userRouter");
const PostRouter = require("./Apis/posts/postRouter");

// Create User
app.use("/api/v1/auth", UserRouter);
app.use("/api/v1/posts", PostRouter);

// error handling
app.use(errorHandler);
app.use(notFound);

// server
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await initDriver("bolt://0.0.0.0:11003");
    console.log(colors.underline.bold.cyan("Neo4j connected successfully"));
    app.listen(PORT, () => {
      console.log(
        colors.yellow.underline.bold(
          `Server listening in ${process.env.NEO4J_ENV} mode on port ${PORT}...`
        )
      );
    });

    return driver;
  } catch (error) {
    console.log(colors.underline.bold.red(`Error: ${error}`));
  }
};

start();
