// This code comes from Jonas Schmedtmann's NodeJS tutorial on udemy

const AppError = require("../utils/appError");

const handleJWTError = () =>
  new AppError("Invalid token, please log in again", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired. Please log in again", 401);

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  //te wlasciwosci mozna podejrzec w obiekcie error w postmanie
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value: '${err.keyValue.email}'. Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors)
    .map((error) => error.message)
    .join(". ");
  const message = `Invalid input data. ${errors}`;
  return new AppError(message, 400);
};

const sendErrorProduction = (err, response) => {
  if (err.isOperational) {
    response.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    //Programming, or other unknown error
  } else {
    response.status(500).json({
      status: "Error",
      message: "Something went wery wrong.",
    });
  }
};

const sendErrorForDev = (err, response) => {
  response.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

module.exports = (err, request, response, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") sendErrorForDev(err, response);
  else if (process.env.NODE_ENV === "production") {
    let error = Object.assign(err);
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProduction(error, response);
  }
  next();
};
