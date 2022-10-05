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

exports.deleteMe = catchAsync(async (request, response, next) => {
  await User.findByIdAndDelete(request.user.id);

  response.status(204).json({
    status: "success",
    data: null,
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
  console.log("exec", request.user);
  console.log("DSDSDSDSDS");
  const { tasks } = request.user;
  response.status(200).json({
    status: "success",
    data: {
      tasks,
    },
  });
});
