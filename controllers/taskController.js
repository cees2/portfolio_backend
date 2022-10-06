const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const { Task } = require("../models/taskModel");
const User = require("./../models/userModel");

exports.getUserTasks = catchAsync(async (request, response, next) => {
  const { userId } = request.params;

  const user = await User.findById(userId);

  const tasks = user.tasks;

  response.status(200).json({
    status: "success",
    tasksFound: tasks.length,
    data: {
      tasks,
    },
  });
});

exports.getTask = catchAsync(async (request, response, next) => {
  const { taskId } = request.params;

  const task = await Task.findById(taskId);

  response.status(200).json({
    status: "success",
    data: {
      task,
    },
  });
});

exports.createTask = catchAsync(async (request, response, next) => {
  const { taskDescription, priority } = request.body;
  const { id } = request.user;

  const createdTask = await Task.create({
    taskDescription,
    priority,
  });

  const userTasks = [...request.user.tasks, createdTask];

  await User.findByIdAndUpdate(id, { tasks: userTasks });

  response.status(200).json({
    status: "success",
    data: {
      createdTask,
    },
  });
});

exports.deleteTask = catchAsync(async (request, response, next) => {
  const { taskId } = request.params;
  const { user } = request;

  user.tasks = user.tasks.filter((task) => task.id !== taskId);

  await Task.findByIdAndDelete(taskId);
  await User.findByIdAndUpdate(user.id, { tasks: user.tasks });

  response.status(204).json({
    status: "success",
    message: "Task has been successfuly deleted.",
  });
});
