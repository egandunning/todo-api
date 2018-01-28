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
   let token = jwt.sign({_id: this._id.toHexString(), access}, process.env.JWT_SECRET)
   .toString();

   this.tokens.push({access, token});
   return this.save()
   .then(() => token)
   .catch(() => null);
};

UserSchema.methods.removeToken = function(token) {
   return this.update({
      $pull: { //removes objects in tokens array that match token
         tokens: {token}
      }
   });
};

UserSchema.statics.findByToken = function(token) {
   let decoded;

   try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
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

UserSchema.statics.validateUser = function(email, password) {
   return User.findOne({email})
   .then(user => {
      if(!user) {
         return Promise.reject();
      }

      return new Promise((resolve, reject) => {
         bcrypt.compare(password, user.password, (err, res) => {
            if(res) {
               resolve(user);
            }
            reject();
         });
      });
      
   })
   .catch((err) => {
      return Promise.reject(err);
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
