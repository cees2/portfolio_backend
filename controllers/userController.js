const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getUser = catchAsync(async (request, response, next) => {
  const { userId: id } = request.params;

  const user = await User.findById(id);

  if (!user) next(new AppError("Could not find that user", 404));

  response.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.getAllUsers = catchAsync(async (request, response, next) => {
  const users = await User.find();

  response.status(200).json({
    status: "success",
    data: {
      users,
    },
  });
});

exports.updateUser = catchAsync(async (request, response, next) => {
  const { userId } = request.params;

  const updatedUser = await User.findByIdAndUpdate(userId, request.body, {
    new: true,
    runValidators: true,
  });

  response.status(200).json({
    status: "success",
    data: {
      updatedUser,
    },
  });
});

exports.deleteUser = catchAsync(async (request, response, next) => {
  const { userId } = request.params;
  await User.findByIdAndDelete(userId);

  response.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getMyTasks = catchAsync(async (request, response, next) => {
  const { tasks } = request.user;
  response.status(200).json({
    status: "success",
    data: {
      tasks,
    },
  });
});

exports.changeMyPassword = catchAsync(async (request, response, next) => {
  const { oldPassword, newPassword, passwordConfirm } = request.body;
  const { id: userId } = request.user;

  const user = await User.findById(userId).select("+password");

  if (oldPassword === newPassword)
    return next(new AppError("Provided passwords are the same", 400));

  if (!(await request.user.comparePasswords(oldPassword, user.password)))
    return next(new AppError("Incorrect password", 401));

  user.password = newPassword;
  user.passwordConfirm = passwordConfirm;

  const updatedUser = await user.save();

  console.log("updatedUser:", updatedUser);

  response.json({
    staus: "success",
    message: "Password has been successfuly changed",
    data: {
      updatedUser,
    },
  });
});

exports.changeMyEmail = catchAsync(async (request, response, next) => {});

exports.deleteMe = catchAsync(async (request, response, next) => {
  await User.findByIdAndDelete(request.user.id);

  response.status(204).json({
    status: "success",
    data: null,
  });
});
