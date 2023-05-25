const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require("../models/db.js");
const jwt = require("jsonwebtoken");

const Admins = require('../models/schemas/admins.js');

router.get('/', async (req, res) => {
    res.render("main/login.ejs")
})

router.post('/', async (req, res) => {
    try {
        login();
        async function login() {
          //! searching through mongodb if such email exists
          const admin = await Admins.findOne({ uname: req.body.uname }); //check is already getting all the user data so we can operate on it
          if (admin != null) {
            //! compares the password with the one in the database using bcrypt
            bcrypt.compare(req.body.password, admin.password, (err, result) => {
              if (result == true) {
                //*if password is correct
                //! generate JWT token
                const accessToken = generateAccessToken(admin);
                res.cookie("jwt", accessToken, {
                  httpOnly: true,
                  sameSite: "None",
                  secure: true,
                  maxAge: 300 * 1000,
                });
                //! DO A BACKUP OF COLLECTIONS AND SEND IT TO MY EMAIL
                res.redirect('/'+ admin._id)
              } else {
                //* if password is incorrect sends error
                res.send("Check if you typed your name and password correctly");
              }
            });
          } else {
            //* if user does not exist sends error
            res.send("Check if you typed your name and password correctly");
          }
        }
      } catch {
        res.status(500).send("Something went wrong");
      }
})

function generateAccessToken(admin) {
    return jwt.sign(admin.toJSON(), process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "9000s",
    });
  }
  

module.exports = router;