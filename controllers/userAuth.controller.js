const _ = require("lodash");
const UserAuth = require("../models/userAuth.model");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
// import the jsonWebToken package to use tokens
const jwt = require("jsonwebtoken");

// SIGNUP user with POST
exports.userAuth_signup = (req, res, next) => {
  // checkout if there such email already exists
  UserAuth.find({ email: req.body.email })
    .exec()
    .then(userAuth => {
      if (userAuth.length >= 1) {
        return res.status(409).json({
          message: "Such email already exists"
        });
      } else {
        // need to hash our passwords with bcrypt package
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            const userAuth = new UserAuth({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash
            });
            userAuth
              .save()
              .then(result => {
                console.log(result);
                // const token = userAuth.generateAuthToken();
                const token = jwt.sign(
                  {
                    email: userAuth.email,
                    userId: userAuth._id
                  },
                  process.env.JWT_KEY,
                  {
                    expiresIn: "1h"
                  }
                );
                const bearer = "Bearer " + token;
                res
                  .header("x-auth-token", token)
                  .header("authorization", bearer)
                  .header("access-control-expose-headers", "x-auth-token")
                  .send(_.pick(userAuth, ["_id", "password", "email"]));
                res.status(201).json({
                  message: "UserAuth created"
                });
                // now we need to login the user so invoke the login method
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  error: err
                });
              });
          }
        });
      }
    });
};

// LOGIN user
exports.userAuth_login = (req, res, next) => {
  UserAuth.findOne({ email: req.body.email })
    .exec()
    .then(userAuth => {
      console.log("userAuth from db:", userAuth);
      if (userAuth.length < 1) {
        return res.status(401).json({
          message: "Auth failed"
        });
      }
      bcrypt.compare(req.body.password, userAuth.password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Auth failed"
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              email: userAuth.email,
              userId: userAuth._id,
              isAdmin: userAuth.isAdmin
            },
            process.env.JWT_KEY,
            {
              expiresIn: "1h"
            }
          );
          return res.status(200).json({
            message: "Auth successful",
            token: token
          });
        }
        res.status(401).json({
          message: "Auth failed"
        });
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err,
        message: "Auth failed"
      });
    });
};

// usersAuth delete userAuth
exports.userAuth_delete = (req, res) => {
  UserAuth.remove({ _id: req.params.userId })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "UserAuth deleted"
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

// userAuth details
exports.userAuth_details = function(req, res) {
  UserAuth.findById(req.params.userId, function(err, userAuth) {
    if (err) return next(err);
    res.send(userAuth);
    // res.status(200).json({
    //   message: "user details",
    //   data: userAuth
    // });
  });
};
