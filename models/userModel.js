// ============= EMBEDDING TASKS IN USER =============

const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const { taskSchema } = require("./taskModel");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User must have a name"],
    trim: true,
    minLength: 3,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "User must have an email"],
    lowercase: true,
    validate: [validator.isEmail, "Please provide a correct email"],
  },
  password: {
    type: String,
    required: [true, "User must have a password"],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function (passConfirm) {
        return this.password === passConfirm;
      },
      message: "Passwords do not match",
    },
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin"],
  },
  dateCreated: Date,
  passwordChangedAt: Date,
  tasks: [taskSchema],
});

userSchema.pre("save", function (next) {
  console.log("executed");
  this.name = `${this.name.slice(0, 1).toUpperCase()}${this.name.slice(1)}`;
  this.dateCreated = new Date();
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = null;
  next();
});

userSchema.post("save", async function () {
  this.password = null;
});

userSchema.methods.comparePasswords = async function (
  recievedPassword,
  passwordFromDB
) {
  return await bcrypt.compare(recievedPassword, passwordFromDB);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
