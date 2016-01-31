var request           = require('supertest');
var chai              = require('chai');
var authHelper        = require('../test_helpers/authHelper');
var ldapServiceMocker = require('../test_helpers/ldapServiceMocker');
var Chance            = require('chance');

var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();
var chance = new Chance();

before(done => {
  // Drops database between each test.  This works because we use
  // the memory database
  sails.once('hook:orm:reloaded', done);
  sails.emit('hook:orm:reload');
});

var agent = null; // to be populated in describe block

describe('Test basic CRUD operations for User', function () {
  const MOCK_DEVICE_ID = 'TEST';

  var userBody = null;

  before(done => {
    ldapServiceMocker.startMocking();
    done();
  });

  after(done => {
    ldapServiceMocker.stopMocking();
    done();
  });

  it('Should be able to register a new user', function (done) {
    agent = request.agent(sails.hooks.http.app); // this will keep track of the auth cookies
    
    agent
      .post('/user/register')
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
        userBody.password = 'somepswrd'; // reattatch it since it will be needed later
      })
      .expect(201, done);
  });

  it('should make sure emails are unique', function (done) {
    agent
      .post('/user/register')
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .send({
        email: 'jsmith@illinois.edu',
        firstName: 'Jane',
        lastName: 'Smith'
      })
      .expect(400, done);
  });

  it('Should be able to read the user', function (done) {
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
        lastName: 'Smith',
        password: userBody.password
      })
      .expect(function (res) {
        res.body.should.have.property('email');
        res.body.email.should.equal('jsmith@illinois.edu');
        res.body.should.have.property('firstName');
        res.body.firstName.should.equal('Joe');
        res.body.should.have.property('lastName');
        res.body.lastName.should.equal('Smith');
        res.body.should.have.property('sections');
        res.body.sections.length.should.equal(0);
        res.body.should.have.property('comments');
        res.body.comments.length.should.equal(0);
      })
      .expect(200, done);
  });

  it('Should make sure that other users cant update each other', done => {
    authHelper.getLoggedInAgent(sails.hooks.http.app, (err, otherUserAgent) => {
      if (err) {
        return done(err);
      }

      var newName = chance.name().split(' ');

      otherUserAgent
        .put(`/user/${userBody.id}`)
        .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
        .send({
          firstName: newName[0],
          lastName: newName[1]
        })
        .expect(403, done);
    });
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

  it('Should get a 404 when getting the deleted user', function (done) {
    agent
      .get('/user/' + userBody.id)
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .expect(404, done);
  });

});

describe('Should check that you cant make a user with a invalid netid email', () => {
  const MOCK_DEVICE_ID = 'TEST';

  var user;

  before(done => {
    const invalidNetID = chance.word({length: 23}); // no netid is 23 chars long
    const emailDomain = chance.pick(UserService.VALID_EMAIL_DOMAINS);
    const email = `${invalidNetID}@${emailDomain}`;

    const name = chance.name().split(' ');

    user = {
      email: email,
      firstName: name[0],
      lastName: name[1],
      password: chance.word({length: UserService.MIN_PASSWORD_LENGTH})
    };
    
    done();
  });

  it('Should fail to make an account with an invalid NetID', done => {
    agent = request.agent(sails.hooks.http.app); // this will keep track of the auth cookies

    agent
      .post('/user/register')
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .send(user)
      .expect(400, done);
  });
});