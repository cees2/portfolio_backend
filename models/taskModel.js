const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  taskDescription: {
    type: String,
    required: [true, "Task must have description"],
    trim: true,
  },
  priority: {
    type: String,
    required: [true, "Task must have priority"],
    enum: ["High", "Medium", "Low"],
  },
  dateCreated: Date,
});

taskSchema.pre("save", function (next) {
  this.dateCreated = new Date();
  next();
});

const Task = mongoose.model("Task", taskSchema);

module.exports.taskSchema = taskSchema;
module.exports.Task = Task;
