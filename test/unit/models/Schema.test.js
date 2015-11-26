var request = require('supertest');
var expect  = require('chai').expect;

describe('Tests for ignoring extra attributes and automatically managed attributes', function () {
  const MOCK_DEVICE_ID = 'test';
  var course1;
  var course2;
  var badId;
  var badTime = new Date(0);

  // create the courses
  var createCourse = function (body, expect, cb) {
    request(sails.hooks.http.app)
      .post('/course/')
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .send(body)
      .expect(expect)
      .expect(201, cb);
  };

  it('Should ignore extra attributes when creating', function (cb) {
    createCourse({
      department: 'CS',
      number: 225,
      extra1: 'this is an extra attribute',
    }, function (res) {
      course1 = res.body;
      badId = course1.id + 9999;
      expect(res.body.extra1).to.be.undefined;
    }, cb);
  });

  it('Should ignore automatically managed attributes when creating', function (cb) {
    createCourse({
      department: 'CS',
      number: 233,
      id: badId,
      createdAt: badTime,
      updatedAt: badTime,
    }, function (res) {
      course2 = res.body;
      expect(res.body.id).to.not.equal(badId);
      expect(res.body.createdAt).to.not.equal(badTime);
      expect(res.body.updatedAt).to.not.equal(badTime);
    }, cb);
  });

  // update the courses
  var updateCourse = function (id, body, expect, cb) {
    request(sails.hooks.http.app)
      .put('/course/' + id)
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .send(body)
      .expect(expect)
      .expect(200, cb);
  };

  it('Should ignore extra attributes when updating', function (cb) {
    updateCourse(course2.id, {
      extra2: 'this is an extra attribute',
    }, function (res) {
      expect(res.body.extra2).to.be.undefined;
    }, cb);
  });

  it('Should ignore atuomatically managed attributes when updating', function (cb) {
    updateCourse(course2.id, {
      id: badId,
      createdAt: badTime,
      updatedAt: badTime,
    }, function (res) {
      expect(res.body.id).to.not.equal(badId);
      expect(res.body.createdAt).to.not.equal(badTime);
      expect(res.body.updatedAt).to.not.equal(badTime);
    }, cb);
  });

  // delete the courses
  var deleteCourse = function (id, cb) {
    request(sails.hooks.http.app)
      .del('/course/' + id)
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .expect(200, cb);
  }

  it('Should delete course 1', function (cb) {
    deleteCourse(course1.id, cb);
  });

  it('Should delete course 2', function (cb) {
    deleteCourse(course2.id, cb);
  });
});
