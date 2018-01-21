const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
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

//use reg functions to access this
UserSchema.methods.toJSON = function() {
   let userObject = this.toObject();

   return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function() {
   let access = 'auth';
   let token = jwt.sign({_id: this._id.toHexString(), access}, 'secret')
   .toString();

   this.tokens.push({access, token});
   return this.save()
   .then(() => token)
   .catch(() => null);
};

UserSchema.statics.findByToken = function(token) {
   let decoded;

   try {
      decoded = jwt.verify(token, 'secret');
   } catch(err) {
      // return new Promise((resolve, reject) => {
      //    reject();
      // });
      // equivalent
      return Promise.reject();
   }

   //return a promise
   return User.findOne({
      '_id': decoded._id,
      'tokens.token': token,
      'tokens.access': 'auth'
   });
};

//runs whenever a document is saved
UserSchema.pre('save', function(next) {
   //if password was modified, hash password
   if(this.isModified('password')) {
      bcrypt.genSalt(10, (err, salt) => {
         if(err) {
            console.log(err);
         }
         bcrypt.hash(this.password, salt, (err, hash) => {
            this.password = hash;
            next();
         });
      });
   } else {
      next();
   }
});

const User = mongoose.model('User', UserSchema);

module.exports = {User};