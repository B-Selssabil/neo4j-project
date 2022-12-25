const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode === 200 ? 500 : err.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NRO4J_ENV === "production" ? null : err.stack,
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found: ${req.originalUrl}`);
  res.status(404);

  next(error);
};

module.exports = {
  errorHandler,
  notFound,
};
