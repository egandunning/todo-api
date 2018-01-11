const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

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

app.listen(port, () => console.log(`Started on port ${port}`));

module.exports = {app};