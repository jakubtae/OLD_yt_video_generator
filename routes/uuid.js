const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../models/db.js");
const jwt = require("jsonwebtoken");
const Stories = require("../models/schemas/stories.js");

// * MAIN ROUTE THAT RETURNS LIST OF PERMISSIONS
router.get("/:uuid", authenticateToken, (req, res) => {
  if (req.admin.perms.length == 1)
    return res.redirect(req.params.uuid + "/" + req.admin.perms[0]);
  res.send(req.admin.perms);
});
// * MAIN ROUTE FOR EACH CHANNEL THAT RETURNS STORIES
router.get("/:uuid/:perm", authenticateToken, async (req, res) => {
  const listOfStories = await Stories.find({ perm: req.params.perm });
  res.send(listOfStories);
});

// * STORY IDEA CREATION ROUTE FOR EACH CHANNEL
router.post("/:uuid/:perm/new", authenticateToken, async (req, res) => {
  var now = new Date();
  const date = now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate();
  const stories = await Stories.create({
    perm: req.params.perm,
    title: req.body.title,
    date: date,
  });
  res.send("story created successfully");
});

router.get("/:uuid/:perm/:storyid", authenticateToken, async (req, res) => {
  const story = await Stories.findOne({ _id: req.params.storyid });
  if (story.published === true) return res.send("Story was published");
  res.send(story);
});

router.post("/:uuid/:perm/:storyid/gpt", authenticateToken, async (req, res) => {
  try{
  const { Configuration, OpenAIApi } = require("openai");
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: "Hello world",
    });
    console.log(completion.data.choices[0].text);
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}catch (e) {
  res.send("Some Error here it is : " + e)
}
});

function authenticateToken(req, res, next) {
  const token = req.body.jwt;
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, admin) => {
    if (err) return res.sendStatus(403);
    req.admin = admin;
    if (req.params.uuid !== admin._id)
      return res.send("How the hell are you here?");
    next();
  });
}

module.exports = router;
