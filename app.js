const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");
const cors = require("cors");

const userRouter = require("./routes/userRoutes");
const taskRouter = require("./routes/taskRoutes");

const app = express();

dotenv.config({
  path: "./config.env",
});

app.use(express.json());
app.use(cors());

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.get("/", (request, response) => {
  response.status(200).json("Hello from the middleware");
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/tasks", taskRouter);

app.all("*", (request, response, next) => {
  next(new AppError(`Could not find ${request.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
