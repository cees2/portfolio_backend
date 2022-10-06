const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const userRouter = require("./routes/userRoutes");
const taskRouter = require("./routes/taskRoutes");

const app = express();

app.use(mongoSanitize());
app.use(xss());

app.use(helmet());

const limiter = rateLimit({
  max: 100,
  windowMs: 30 * 60 * 1000,
  message: "Too many requests.",
});
app.use("/api", limiter);

dotenv.config({
  path: "./config.env",
});

app.use(
  express.json({
    limit: "10kb",
  })
);
app.use(cors());
app.use((request, response, next) => {
  response.append("Access-Control-Allow-Methods", "GET,PATCH,POST,DELETE");
  response.append("Access-Control-Allow-Headers", "Content-Type");
  response.append("Access-Control-Allow-Credentials", true);
  next();
});

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/tasks", taskRouter);

app.all("*", (request, response, next) => {
  next(new AppError(`Could not find ${request.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
