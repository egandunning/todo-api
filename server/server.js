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

app.post('/todos', (req, res) => {
   let todo = new Todo({
      text: req.body.text
   });
   todo.save()
   .then(doc => res.send(doc))
   .catch(err => res.status(400).send());
});

app.get('/todos', (req, res) => {
   Todo.find()
   .then(todos => res.send({todos}))
   .catch(err => res.status(400).send());
});

app.get('/todos/:id', (req, res) => {

   if(!ObjectID.isValid(req.params.id)) {
      return res.status(404).send();
   }

   Todo.findById(req.params.id)
   .then(todo => {
      if(todo) {
         return res.send({todo});
      }
      return res.status(404).send();
   })
   .catch(err => res.status(400).send());
});

app.delete('/todos/:id', (req, res) => {
   if(!ObjectID.isValid(req.params.id)) {
      return res.status(404).send();
   }

   Todo.findByIdAndRemove(req.params.id)
   .then(deleted => {
      if(deleted) {
         return res.send({deleted});
      }
      return res.status(404).send();
   })
   .catch(err => res.status(400).send(err));
});

app.patch('/todos/:id', (req, res) => {
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

   Todo.findByIdAndUpdate(req.params.id, {$set:body}, {new: true})
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

app.post('/users', (req, res) => {
   let userData = _.pick(req.body, ['email', 'password']);
   let user = new User(userData);
   user.save()
   .then(() => {
      return user.generateAuthToken();
   })
   .then(token => res.header('x-auth', token).send(user)) // 'x-' means custom header
   .catch(err => {
      res.status(400).send();
   });
});

app.post('/users/login', (req, res) => {
   let userData = _.pick(req.body, ['email', 'password']);
   User.validateUser(userData.email, userData.password)
   .then(user => {
      user.generateAuthToken()
      .then(token => {
         res.header('x-auth', token).send(user);
      });
   })
   .catch(err => {
      res.status(400).send();
   });
});

app.delete('/users/me/token', authenticate, (req, res) => {
   req.user.removeToken(req.token)
   .then(() => res.send())
   .catch(() => res.status(400).send());
});

app.get('/users/me', authenticate, (req, res) => {
   res.send(req.user);
});

app.listen(port, () => console.log(`Started on port ${port}`));

module.exports = {app};