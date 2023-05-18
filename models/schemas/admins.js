const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
    uname: String,
    password: String,
    perms: []
})


module.exports = mongoose.model('Admins', adminSchema)
///creating schema of admin with uname and password