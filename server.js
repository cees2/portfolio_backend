const app = require("./app");
const mongoose = require("mongoose");

process.on("uncaughtException", (err) => {
  console.log("Uncaught exception");
  console.log(err.name, err.message);
  process.exit(1);
});

const port = process.env.PORT;

const server = app.listen(port, () =>
  console.log(`App is running at port ${port}`)
);

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then((connection) => console.log("Successful connection."));

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
