const mongoose = require('mongoose');
const validator = require('validator');

const User = mongoose.model('User', {
   email: {
      type: String,
      required: true,
      minlength: 1,
      trim: true,
      unique: true,
      validate: {
         validator: val => validator.isEmail(val),
         message: `{VALUE} is not a valid email address`
      }
   },
   password: {
      type: String,
      required: true,
      minlength: 6
   },
   tokens: [{
      access: {
         type: String,
         required: true
      },
      token: {
         type: String,
         required: true
      }
   }]
});

module.exports = {User};