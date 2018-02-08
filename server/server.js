const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

require('./config/config');
const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');


const port = process.env.PORT || 3000;
let app = express();

//json() returns a function
app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
   let todo = new Todo({
      text: req.body.text,
      _creator: req.user._id
   });
   todo.save()
   .then(doc => res.send(doc))
   .catch(err => res.status(400).send());
});

app.get('/todos', authenticate, (req, res) => {
   Todo.find({_creator: req.user._id})
   .then(todos => res.send({todos}))
   .catch(err => res.status(400).send());
});

app.get('/todos/:id', authenticate, (req, res) => {

   if(!ObjectID.isValid(req.params.id)) {
      return res.status(404).send();
   }

   Todo.findOne({
      _id: req.params.id,
      _creator: req.user._id
   })
   .then(todo => {
      if(todo) {
         return res.send({todo});
      }
      return res.status(404).send();
   })
   .catch(err => res.status(400).send());
});

app.delete('/todos/:id', authenticate, async (req, res) => {
   if(!ObjectID.isValid(req.params.id)) {
      return res.status(404).send();
   }

   try {
      const deleted = await Todo.findOneAndRemove({
         _id: req.params.id,
         _creator: req.user._id
      });

      if(deleted) {
         return res.send({deleted});
      }
      throw new Error();
   } catch(e) {
      return res.status(404).send();
   }
});

app.patch('/todos/:id', authenticate, (req, res) => {
   if(!ObjectID.isValid(req.params.id)) {
      return res.status(404).send();
   }

   let body = _.pick(req.body, ['completed', 'text']);

   if(_.isBoolean(body.completed) && body.completed) {
      body.completedAt = new Date().getTime();
   } else {
      body.completed = false;
      body.completedAt = null;
   }

   Todo.findOneAndUpdate({
      _id: req.params.id,
      _creator: req.user._id
   }, {$set:body}, {new: true})
   .then(todo => {
      if(!todo) {
         return res.status(404).send();
      }

      res.send({todo});
   })
   .catch(err => {
      res.status(400)
   })
});

app.post('/users', async (req, res) => {
   try {
      let userData = _.pick(req.body, ['email', 'password']);
      let user = new User(userData);
      await user.save();
      let token = await user.generateAuthToken();
      res.header('x-auth', token).send(user) // 'x-' means custom header
   } catch(e) {
      res.status(400).send();
   }
});

app.post('/users/login', async (req, res) => {
   try {
      let userData = _.pick(req.body, ['email', 'password']);
      const user = await User.validateUser(userData.email, userData.password);
      const token = await user.generateAuthToken();
      
      res.header('x-auth', token).send(user);
   } catch(e) {
      res.status(400).send();
   }
});

app.delete('/users/me/token', authenticate, async (req, res) => {
   try {
      await req.user.removeToken(req.token);
      return res.send();
   } catch(e) {
      res.status(400).send();
   }
});

app.get('/users/me', authenticate, (req, res) => {
   res.send(req.user);
});

app.listen(port, () => console.log(`Started on port ${port}`));

module.exports = {app};
