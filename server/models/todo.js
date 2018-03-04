const mongoose = require('mongoose'); 

//Model to represent a single todo in the database
const Todo = mongoose.model('Todo', {
   //text description of the thing to do
   text: {
      type: String,
      required: true,
      minlength: 5,
      trim: true
   },
   //true if todo was completed
   completed: {
      type: Boolean,
      default: false
   },
   //timestamp of when the todo was completed, null if not completed
   completedAt: {
      type: Number,
      default: null,
      min: 0
   },
   //object id of user who created todo. used for access control
   _creator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
   }
});

module.exports = {Todo};
