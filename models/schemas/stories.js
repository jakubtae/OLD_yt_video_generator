const mongoose = require('mongoose')

const storySchema = new mongoose.Schema({
    perm: String,
    title : String,
    date: Date,
    published: {type :Boolean, default : false},
    gpt: {type : String, default : null},
    prompt: {type : String, default : null},
    paraphrased: {type : String, default : null},
    final: {type : String, default : null},
    
    
})


module.exports = mongoose.model('Stories', storySchema)
///creating schema of admin with uname and password