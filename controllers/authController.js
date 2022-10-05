const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const { runInNewContext } = require("vm");

const createTokenAndSendResponse = (user, response, statusCode, message) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SERCRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  response.status(statusCode).json({
    status: "success",
    token,
    message,
    data: {
      user,
    },
  });
};

exports.login = catchAsync(async (request, response, next) => {
  const { email, password } = request.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePasswords(password, user.password)))
    next(new AppError("Invalid email or password", 401));

  createTokenAndSendResponse(
    user,
    response,
    200,
    "User has been successfuly logged in"
  );
});

exports.signup = catchAsync(async (request, response, next) => {
  const { email, password, passwordConfirm, name } = request.body;

  const createdUser = await User.create({
    email,
    password,
    passwordConfirm,
    name,
  });

  if (!createdUser)
    next(new AppError("Could not create user. Try again later", 500));

  createTokenAndSendResponse(
    createdUser,
    response,
    200,
    "User has been registered."
  );
});

exports.protect = catchAsync(async (request, response, next) => {
  const { authorization } = request.headers;
  let token;
  if (authorization && authorization.startsWith("Bearer"))
    token = authorization.split(" ")[1];

  if (!token) return next(new AppError("You are not logged in.", 401));

  // checking token's validity

  const tokenDecoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SERCRET_KEY
  );

  const user = await User.findById(tokenDecoded.id);

  if (!user)
    next(new AppError("This user no longer exists. Please log in again.", 401));

  request.user = user;
  next();
});

exports.restrictTo =
  (...authorizedUsers) =>
  (request, response, next) => {
    if (!authorizedUsers.includes(request.user.role))
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );

    next();
  };
