var request = require('supertest');
var should  = require('chai').should();

describe('Test basic CRUD operations for Comment', function () {
  const MOCK_DEVICE_ID = 'test';

  var courseBody;
  var sectionBody;
  var recordingBody;
  var userBody;
  var commentBody;

  it('Should create a course', function (done) {
    request(sails.hooks.http.app)
      .post('/course/')
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .send({
        department: 'CS',
        number: 225
      })
      .expect(function (res) {
        courseBody = res.body;
      })
      .expect(201, done);
  });

  it('Should create a section', function (done) {
    request(sails.hooks.http.app)
      .post('/section/')
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .send({
        name: 'AL1',
        course: courseBody.id
      })
      .expect(function (res) {
        sectionBody = res.body;
      })
      .expect(201, done);
  });

  it('Should create a recording', function (done) {
    var start = new Date();
    var end = new Date(start);
    end.setHours(end.getHours() + 1);

    request(sails.hooks.http.app)
      .post('/recording/')
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .send({
        startTime: start,
        endTime: end,
        section: sectionBody.id
      })
      .expect(function (res) {
        recordingBody = res.body;
      })
      .expect(201, done);
  });

  it('Should create a user', function (done) {
    request(sails.hooks.http.app)
      .post('/user/')
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .send({
        name: 'name',
        email: 'email'
      })
      .expect(function (res) {
        userBody = res.body;
      })
      .expect(201, done);
  });

  var date = new Date();
  it('Should be able to create a comment', function (done) {
    request(sails.hooks.http.app)
      .post('/comment/')
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .send({
        content: 'content',
        time: date,
        poster: userBody.id,
        recording: recordingBody.id
      })
      .expect(function (res) {
        commentBody = res.body;
        commentBody.should.have.property('content');
        commentBody.should.have.property('time');
        commentBody.should.have.property('poster');
        commentBody.should.have.property('recording');
        commentBody.content.should.equal('content');
        new Date(commentBody.time).getTime().should.equal(date.getTime());
        commentBody.poster.should.equal(userBody.id);
        commentBody.recording.should.equal(recordingBody.id);
      })
      .expect(201, done);
  });

  it('Should be able to get the comment', function (done) {
    request(sails.hooks.http.app)
      .get('/comment/' + commentBody.id)
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .expect(function (res) {
        res.body.content.should.equal('content');
        new Date(res.body.time).getTime().should.equal(date.getTime());
        res.body.poster.id.should.equal(userBody.id);
        res.body.recording.id.should.equal(recordingBody.id);
        res.body.id.should.equal(commentBody.id);
      })
      .expect(200, done);
  });

  it('Should be linked to the poster', function (done) {
    request(sails.hooks.http.app)
      .get('/user/' + userBody.id)
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .expect(function (res) {
        res.body.comments[0].id.should.equal(commentBody.id);
      })
      .expect(200, done);
  });

  it('Should be linked to the recording', function (done) {
    request(sails.hooks.http.app)
      .get('/recording/' + recordingBody.id)
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .expect(function (res) {
        res.body.comments[0].id.should.equal(commentBody.id);
      })
      .expect(200, done);
  });

  it('Should be able to update the comment', function (done) {
    request(sails.hooks.http.app)
      .put('/comment/' + commentBody.id)
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .send({
        content: 'updated'
      })
      .expect(function (res) {
        res.body.content.should.equal('updated');
        res.body.id.should.equal(commentBody.id);
      })
      .expect(200, done);
  });

  it('Should be able to delete the comment', function (done) {
    request(sails.hooks.http.app)
      .del('/comment/' + commentBody.id)
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .expect(function (res) {
        commentBody.id.should.equal(res.body.id);
      })
      .expect(200, done);
  });

  it('Should get a 404 when getting the comment', function (done) {
    request(sails.hooks.http.app)
      .get('/comment/' + commentBody.id)
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .expect(404, done);
  });

  it('Should delete the user', function (done) {
    request(sails.hooks.http.app)
      .del('/user/' + userBody.id)
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .expect(200, done);
  });

  it('Should delete the recording', function (done) {
    request(sails.hooks.http.app)
      .del('/recording/' + recordingBody.id)
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .expect(200, done);
  });

  it('Should delete the section', function (done) {
    request(sails.hooks.http.app)
      .del('/section/' + sectionBody.id)
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .expect(200, done);
  });

  it('Should delete the course', function (done) {
    request(sails.hooks.http.app)
      .del('/course/' + courseBody.id)
      .set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
      .expect(200, done);
  });
});
