const mongoose = require('mongoose')

const storySchema = new mongoose.Schema({
    perm: String,
    title : String,
    date: Date,
    published: {type :Boolean, default : false},
})


module.exports = mongoose.model('Stories', storySchema)
///creating schema of admin with uname and password