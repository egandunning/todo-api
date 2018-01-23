require('../config/config');

const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server.js');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');


//runs before every test (calls to it())
beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
   it('should create a new todo', done => {
      let text = 'Test todo text attribute';

      request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect(res => expect(res.body.text).toBe(text))
      .end((err, res) => {
         if(err) {
            return done(err);
         }
         Todo.find({text})
         .then(todos => {
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
         })
         .catch(err => done(err));
      });
   });

   it('should not create todo with invalid argument', done => {
      request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
         if(err) {
            return done(err);
         }
         Todo.find()
         .then(todos => {
            expect(todos.length).toBe(2);
            done();
         })
         .catch(err => done(err));
      })
   });
});

describe('PATCH /todos/:id', () => {
   it('should update the todo', done => {
      request(app)
      .patch(`/todos/${todos[0]._id}`)
      .send({
         text: 'changed',
         completed: true
      })
      .expect(200)
      .expect(res => {
         expect(res.body.todo.text).toBe('changed');
         expect(res.body.todo.completed).toBe(true);
         expect(typeof res.body.todo.completedAt).toBe('number');
      })
      .end(done);
   });

   it('should clear the completedAt property', done => {
      request(app)
      .patch(`/todos/${todos[0]._id}`, {
         text: 'changed',
         completed: false
      })
      .expect(200)
      .expect(res => expect(res.body.completed).toBe(undefined))
      .end(done);
   })
});

describe('GET /todos', () => {
   it('should get all todos', done => {
      request(app)
      .get('/todos')
      .expect(200)
      .expect(res => expect(res.body.todos.length).toBe(2))
      .end(done);
   });
});

describe('GET /todos/:id', () => {
   it('should get a todo', done => {
      request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => expect(res.body.todo.text).toBe(todos[0].text))
      .end(done);
   });

   it('should return a 404 if todo not found', done => {
      request(app)
      .get(`/todos/${new ObjectID().toHexString}`)
      .expect(404)
      .end(done);
   });

   it('should return a 404 for nonvalid ids', done => {
      request(app)
      .get(`/todos/${1}`)
      .expect(404)
      .end(done);
   });
});

describe('DELETE /todos/:id', () => {
   it('should delete a todo', done => {
      request(app)
      .delete(`/todos/${todos[0]._id}`)
      .expect(200)
      .expect(res => expect(res.body.deleted.text).toBe(todos[0].text))
      .end((err, res) => {
         if(err) {
            return done(err);
         }
         
         Todo.findById(todos[0]._id)
         .then(res => {
            expect(res).toBe(null);
            return done();
         })
         .catch(err => {
            return done(err);
         });
      });
   });

   it('should return 404 if not found', done => {
      request(app)
      .get(`/todos/6a5534e820e17e77441e1f8b`)
      .expect(404)
      .end(done);
   });

   it('should return 404 if id is invalid', done => {
      request(app)
      .get(`/todos/0`)
      .expect(404)
      .end(done);
   });
});