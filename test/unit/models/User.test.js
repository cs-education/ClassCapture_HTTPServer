var request    = require('supertest');
var chai       = require('chai');
var authHelper = require('../test_helpers/authHelper');

var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

var agent = null; // to be populated in before hook

before(done => {
  // Drops database between each test.  This works because we use
  // the memory database
  sails.once('hook:orm:reloaded', err => {
    if (err) {
      return done(err);
    }
    authHelper.getLoggedInAgent(sails.hooks.http.app, (err, loggedInAgent) => {
      if (err) {
        return done(err);
      }

      agent = loggedInAgent;
      done();
    });
  });
  
  sails.emit('hook:orm:reload');
});

describe('Test basic CRUD operations for User', function () {
  const MOCK_DEVICE_ID = 'TEST';

  var userBody = null;

  it('Should be able to create a new user', function (done) {
    agent
      .post('/user/')
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .send({
        email: 'jsmith@illinois.edu',
        firstName: 'John',
        lastName: 'Smith',
        password: 'somepswrd'
      })
      .expect(function (res) {
        userBody = res.body;
        res.body.should.have.property('email');
        res.body.email.should.equal('jsmith@illinois.edu');
        res.body.should.have.property('firstName');
        res.body.firstName.should.equal('John');
        res.body.should.have.property('lastName');
        res.body.lastName.should.equal('Smith');
        res.body.should.not.have.property('password');
      })
      .expect(201, done);
  });

  it('should make sure emails are unique', function (done) {
    agent
      .post('/user/')
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .send({
        email: 'jsmith@illinois.edu',
        firstName: 'Jane',
        lastName: 'Smith'
      })
      .expect(400, done);
  });

  it('Should be able to read the course', function (done) {
    agent
      .get('/user/' + userBody.id)
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .expect(function (res) {
        res.body.should.have.property('email');
        res.body.email.should.equal('jsmith@illinois.edu');
        res.body.should.have.property('firstName');
        res.body.firstName.should.equal('John');
        res.body.should.have.property('lastName');
        res.body.lastName.should.equal('Smith');
      })
      .expect(200, done);
  });

  it('Should be able to update the user', function (done) {
    agent
      .put('/user/' + userBody.id)
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .send({
        firstName: 'Joe',
        lastName: 'Smith'
      })
      .expect(function (res) {
        res.body.should.have.property('email');
        res.body.email.should.equal('jsmith@illinois.edu');
        res.body.should.have.property('firstName');
        res.body.firstName.should.equal('Joe');
        res.body.should.have.property('lastName');
        res.body.lastName.should.equal('Smith');
      })
      .expect(200, done);
  });

  it('Should be able to delete the user', function (done) {
    agent
      .del('/user/' + userBody.id)
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .expect(function (res) {
        res.body.should.have.property('id');
        res.body.id.should.equal(userBody.id);
      })
      .expect(200, done);
  });

  it('Should get a 404 when getting the user', function (done) {
    agent
      .get('/user/' + userBody.id)
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .expect(404, done);
  });

});
