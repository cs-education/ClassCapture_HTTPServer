var request = require('supertest');
var chai    = require('chai');

var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

describe('Test basic CRUD operations for User', function () {
  const MOCK_DEVICE_ID = 'TEST';

  var userBody = null;

  it('Should be able to create a new user', function (done) {
    request(sails.hooks.http.app)
      .post('/user/')
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .send({
        email: 'jsmith@illinois.edu',
        name: 'John Smith'
      })
      .expect(function (res) {
        userBody = res.body;
        res.body.should.have.property('email');
        res.body.email.should.equal('jsmith@illinois.edu');
        res.body.should.have.property('name');
        res.body.name.should.equal('John Smith');
      })
      .expect(201, done);
  });

  it('should make sure emails are unique', function (done) {
    request(sails.hooks.http.app)
      .post('/user/')
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .send({
        email: 'jsmith@illinois.edu',
        name: 'Jane Smith'
      })
      .expect(400, done);
  });

  it('Should be able to read the course', function (done) {
    request(sails.hooks.http.app)
      .get('/user/' + userBody.id)
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .expect(function (res) {
        res.body.should.have.property('email');
        res.body.email.should.equal('jsmith@illinois.edu');
        res.body.should.have.property('name');
        res.body.name.should.equal('John Smith');
      })
      .expect(200, done);
  });

  it('Should be able to update the user', function (done) {
    request(sails.hooks.http.app)
      .put('/user/' + userBody.id)
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .send({
        name: 'Joe Smith'
      })
      .expect(function (res) {
        res.body.should.have.property('email');
        res.body.email.should.equal('jsmith@illinois.edu');
        res.body.should.have.property('name');
        res.body.name.should.equal('Joe Smith');
      })
      .expect(200, done);
  });

  it('Should be able to delete the user', function (done) {
    request(sails.hooks.http.app)
      .del('/user/' + userBody.id)
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .expect(function (res) {
        res.body.should.have.property('id');
        res.body.id.should.equal(userBody.id);
      })
      .expect(200, done);
  });

  it('Should get a 404 when getting the user', function (done) {
    request(sails.hooks.http.app)
      .get('/user/' + userBody.id)
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .expect(404, done);
  });
});
