const express = require('express');
const bodyParser = require('body-parser');

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
   .catch(err => res.status(400).send(err));
});

app.get('/todos', (req, res) => {
   Todo.find()
   .then(todos => res.send({todos}))
   .catch(err => res.status(400).send(err));
});

app.listen(port, () => console.log(`Started on port ${port}`));

module.exports = {app};