const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

const port = 3000;
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
   .then(todo => res.status(todo ? 200 : 404).send({todo}))
   .catch(err => res.status(400).send());
});

app.listen(port, () => console.log(`Started on port ${port}`));

module.exports = {app};