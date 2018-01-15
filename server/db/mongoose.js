const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
//process.env.NODE_ENV - production, development, test
const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI, {
   useMongoClient: true
});

module.exports = {mongoose};