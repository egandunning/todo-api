const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoApp'
mongoose.connect(dbURI, {
   useMongoClient: true
});

module.exports = {mongoose};