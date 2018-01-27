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
      .set('x-auth', users[0].tokens[0].token)
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

   it('should not create todo with invalid body data', done => {
      request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => expect(res.body.todos.length).toBe(1))
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

describe('GET users/me', () => {
   it('should return user if authenticated', done => {
      request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
         expect(res.body._id).toBe(users[0]._id.toHexString());
         expect(res.body.email).toBe(users[0].email);
      })
      .end(done);

   });

   it('should return 401 if not authenticated', done => {
      request(app)
      .get('/users/me')
      .expect(401)
      .expect(res => expect(res.body).toEqual({}))
      .end(done);
   });
});

describe('POST users', () => {
   it('should create a new user', done => {
      let email = 'test@test.test';
      let password = 'password';

      request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect(res => {
         expect(res.headers['x-auth']).toBeDefined();
         expect(res.body._id).toBeDefined();
         expect(res.body.email).toBe(email);
      })
      .end(err => {
         if(err) {
            return done(err);
         }
         User.findOne({email})
         .then(user => {
            expect(user).toBeDefined();
            expect(user.password).not.toBe(password);
            done();
         })
         .catch(err => done(err));
      });
   });

   it('should return validation errors if request invalid', done => {
      let email = 'a.a@';
      let password = 'pas';

      request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done);
   });

   it('should not create user if email is already in use', done => {
      let email = users[0].email;
      let password = 'password';
      
      request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done);
   });
});

describe('POST /users/login', () => {
   it('should login user and return auth token', done => {
      request(app)
      .post('/users/login')
      .send({
         email: users[1].email,
         password: users[1].password
      })
      .expect(200)
      .expect(res => expect(res.headers['x-auth']).toBeDefined())
      .end((err, res) => {
         if(err) {
            return done(err);
         }
         User.findById(users[1]._id)
         .then(user => {
            expect(user.tokens[0].token).toBe(res.headers['x-auth']);
            expect(user.tokens[0].access).toBe('auth');
            done();
         })
         .catch(err => done(err));
      });
   });

   it('should reject invalid login credentials', () => {
      request(app)
      .post('/users/login')
      .send({
         email: users[1].email,
         password: 'pasdflksdjf'
      })
      .expect(400)
      .end((err, res) => {
         if(err) {
            return done(err);
         }
         User.findById(users[1]._id)
         .then(user => {
            expect(user.tokens[0]).not.toBeDefined();
            done();
         })
         .catch(err => done(err));
      });
   })
});

describe('DELETE /users/me/token', () => {
   it('should remove token', done => {
      request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
         if(err) {
            return done(err);
         }

         User.findById(users[0]._id)
         .then(user => {
            expect(user.tokens.length).toBe(0);
            done();
         })
         .catch(err => done(err));
      });
   });
});