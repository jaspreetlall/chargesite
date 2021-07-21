const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  }
})

// Plugging in passportLocalMongoose for
// adding password field, ensuring usernames to 
// be unique, as well as additional methods like authenticate.
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
