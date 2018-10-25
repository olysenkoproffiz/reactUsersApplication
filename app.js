// "start": "node ./bin/www"
// paste to package.json file

const createError = require("http-errors");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

// Imports routes for the users
const usersRouter = require("./routes/user");
const userAuthRoutes = require("./routes/userAuth");

// const cors = require("cors");

//app.use(cors());

// run our app with express framework
const app = express();

// setting the port to use with node.js
let port = 3001;
app.listen(port, () => {
  console.log("Server is up and running on port number " + port);
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// Set up mongoose connection
const mongoose = require("mongoose");
// let dev_db_url = "mongodb://olexii1:olexii1@ds219983.mlab.com:19983/users";
// const mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(
  `mongodb://olysenko:oganyan1501@clusterreactusersapi-shard-00-00-havry.mongodb.net:27017,clusterreactusersapi-shard-00-01-havry.mongodb.net:27017,clusterreactusersapi-shard-00-02-havry.mongodb.net:27017/test?ssl=true&replicaSet=ClusterReactUsersAPI-shard-0&authSource=admin&retryWrites=true`,
  { useNewUrlParser: true }
);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
// user createIndex deprecated issue
mongoose.set("useCreateIndex", true);

// connect body-parser to parse the incoming request bodies in a middleware;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// defaults
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// use CORS
// app.use(
//   cors({
//     origin: "https://heroku-react-users-app.herokuapp.com/api",
//     credentials: true
//   })
// );

// using our routes
app.use("/api/users", usersRouter);
app.use("/api/userAuths", userAuthRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
