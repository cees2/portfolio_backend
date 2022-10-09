const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const validator = require("validator");

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

exports.changeMyName = catchAsync(async (request, response, next) => {
  let { newName } = request.body;
  const { id, name } = request.user;

  if (newName.toUpperCase() === name.toUpperCase())
    next(new AppError("New name can not be the same as old one.", 400));

  newName = newName.slice(0, 1).toUpperCase() + newName.slice(1).toLowerCase();

  const user = await User.findByIdAndUpdate(
    id,
    { name: newName },
    { returnDocument: "after", runValidators: true }
  );

  response.status(200).json({
    status: "success",
    message: "Name has been successfuly changed",
    data: {
      user,
    },
  });
});

exports.changeMyEmail = catchAsync(async (request, response, next) => {
  const { newEmail, emailConfirm, password } = request.body;
  const { email: curEmail, id } = request.user;

  if (curEmail === newEmail)
    return next(
      new AppError("New email can not be the same as the old one.", 400)
    );

  const userWithThatEmail = await User.findOne({ email: newEmail });

  if (userWithThatEmail)
    return next(new AppError("User with this email already exists.", 400));

  if (newEmail !== emailConfirm)
    return next(new AppError("Confirmed email does not match new one.", 400));

  const user = await User.findById(id).select("+password");

  if (!(await request.user.comparePasswords(password, user.password)))
    return next(new AppError("Incorrect password", 401));

  if (!validator.isEmail(newEmail))
    return next(new AppError("Provide a correct email.", 400));

  const updatedUser = await User.findByIdAndUpdate(
    user.id,
    {
      email: newEmail,
    },
    { runValidators: true, returnDocument: "after" }
  );

  response.status(200).json({
    status: "success",
    message: "Email has been successfuly changed",
    data: {
      updatedUser,
    },
  });
});

exports.changeMyPassword = catchAsync(async (request, response, next) => {
  const { password, newPassword, passwordConfirm } = request.body;
  const { id: userId } = request.user;

  console.log(password, newPassword, passwordConfirm);

  if (password === newPassword)
    return next(new AppError("Provided passwords are the same", 400));

  if (newPassword !== passwordConfirm)
    return next(
      new AppError("Confirmed password does not match new one.", 400)
    );

  const user = await User.findById(userId).select("+password");

  console.log(password, user.password);

  if (!(await request.user.comparePasswords(password, user.password)))
    return next(new AppError("Incorrect password", 401));

  user.password = newPassword;
  user.passwordConfirm = passwordConfirm;

  const updatedUser = await user.save();

  response.json({
    staus: "success",
    message: "Password has been successfuly changed",
    data: {
      updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (request, response, next) => {
  const { password } = request.body;

  const user = await User.findById(request.user.id).select("+password");

  if (!(await request.user.comparePasswords(password, user.password)))
    return next(new AppError("Incorrect password", 401));

  await User.findByIdAndDelete(request.user.id);

  response.status(204).json({
    status: "success",
  });
});
