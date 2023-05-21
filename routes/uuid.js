const express = require("express");
const router = express.Router();
const db = require("../models/db.js");
const jwt = require("jsonwebtoken");
const Stories = require("../models/schemas/stories.js");



// ! GPT 
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    try {
      const story = await Stories.findOne({ _id: req.params.storyid });
      ///! WORKS TILL HERE. API JUST DONT DO WHAT IT WAS SUPPOSED EVEN THOUGHT THE PROMPT IS GOOD
      //! MAYBE BAD MODEL
      const prompt = "Write an around 1000 words motivational story about "+story.title+". Follow this story structure :  In Act 1, the main characters and central conflict are introduced, setting the tone and direction of the story. Pinch 1, also known as the inciting incident, occurs, which initiates the conflict. Act 2 involves the characters confronting difficult and seemingly insurmountable challenges. Pinch 2 represents the culmination of conflicts from Act 2, often leading to a moment of despair for the protagonist. Act 3 is the final act where all the conflicts, main plot points, subplots, and challenges converge. The climax of the story occurs, followed by the resolution that brings everything to a conclusion. "
      const openai = new OpenAIApi(configuration);
      try {
        const completion = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: prompt,
          temperature: 1,
          max_tokens: 2080,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        });
        //! SAVE THIS TO DB
        story.gpt = completion.data.choices[0].text
        story.prompt = prompt;
        const saved = await story.save();
        res.send({update: true});
      } catch (error) {
        if (error.response) {
          res.send(error.response.status + "\n" + error.response.data);
        } else {
          res.send(error.message);
        }
      }
    } catch (e) {
      res.send("Some Error here it is : " + e);
    }
  }
);

router.post("/:uuid/:perm/:storyid/paraphrased", authenticateToken, async (req, res) => {
  try{
    const story = await Stories.findOne({ _id: req.params.storyid });
    story.paraphrased = req.body.paraphrased;
    await story.save().then(() => {return res.send({status: true})}).catch((err) => {res.send({status: false})})
  }catch(e){
    res.send("Error: " + e.message);
  }
})

router.post("/:uuid/:perm/:storyid/final", authenticateToken, async (req, res) => {
  try{
    const story = await Stories.findOne({ _id: req.params.storyid });
    story.final = req.body.final;
    await story.save().then(() => {return res.send({status: true})}).catch((err) => {res.send({status: false})})
  }catch(e){
    res.send("Error: " + e.message);
  }
})

router.get("/:uuid/:perm/:storyid/generate", authenticateToken, async (req, res) => {
  res.render('main/generate.ejs', { url : req.originalUrl})
})


router.post("/:uuid/:perm/:storyid/generate", authenticateToken, async (req, res) => {
  // ! TAKE POSTED FILES AND SAVE THEM IN videos/:storyid/
  // ! AS mainAudio.aws , secAudio.mp3 , bg.mp4 / bg.png
  // ! CREATE A REMOTION TEMPLATE
  // ! SWAP VARIABLES WITHIN REMOTION TEMPLATE FOR THOSE OF POSTED 
  // ! GENERATE VIDEO AND SAVE IT IN videos/:storyid/ as final.mp4
  // ! SEND SUCCES MESSAGE ALONG WITH FORM FOR SUBMITION FOR TRANSCRIPTION
})



function authenticateToken(req, res, next) {
  const token = req.body.jwt || req.cookies.jwt;
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
