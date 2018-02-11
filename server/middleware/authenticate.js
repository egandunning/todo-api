const {User} = require('../models/user');

let authenticate = async (req, res, next) => {
   let token = req.header('x-auth');

   try {
      const user = await User.findByToken(token)
   
      if(!user) {
         return Promise.reject();
      }

      req.user = user;
      req.token = token;
      next();
   } catch(err) {
      res.status(401).send()
   }
};

module.exports = {authenticate};