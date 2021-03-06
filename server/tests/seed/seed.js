const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('../../models/todo');
const {User} = require('../../models/user');


const userIds = [new ObjectID(), new ObjectID()];

const todos = [{
   _id: new ObjectID(),
   text: 'First test todo',
   _creator: userIds[0]
}, {
   _id: new ObjectID(),
   text: 'Second test todo',
   completed: true,
   completedAt: 123456,
   _creator: userIds[1]
}];

const users = [{
   _id: userIds[0],
   email: 'user1@test.com',
   password: 'password1',
   tokens: [{
      access: 'auth',
      token: jwt.sign({_id: userIds[0], access: 'auth'}, process.env.JWT_SECRET).toString()
   }]
}, {
   _id: userIds[1],
   email: 'user2@test.com',
   password: 'password2',
   tokens: [{
      access: 'auth',
      token: jwt.sign({_id: userIds[1], access: 'auth'}, process.env.JWT_SECRET).toString()
   }]
}];

const populateTodos = done => {
   Todo.remove({})
   .then(() => {
      Todo.insertMany(todos).then(() => done());
   });
};

const populateUsers = done => {
   User.remove({})
   .then(() => {
      var user1 = new User(users[0]).save();
      var user2 = new User(users[1]).save();

      Promise.all([user1, user2]);
   })
   .then(() => done())
   .catch((err) => console.log(err));

};

module.exports = {
   todos,
   populateTodos,
   users,
   populateUsers
};
