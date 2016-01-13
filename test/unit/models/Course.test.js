/**
 * Tests done with mocha, chai, and supertest
 * Mocha: http://mochajs.org/
 * Chai: http://chaijs.com/
 * Supertest: https://github.com/visionmedia/supertest
 * 	Supertest is based on superagent.
 * "Anything you can do with superagent, you can do with supertest" - Supertest README.md
 * 	Superagent: https://visionmedia.github.io/superagent/
 * More info on Testing in Sails: http://sailsjs.org/#!/documentation/concepts/Testing
 */

var request           = require('supertest');
var chai              = require("chai");
var authHelper        = require('../test_helpers/authHelper');
var ldapServiceMocker = require('../test_helpers/ldapServiceMocker');

var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

var agent = null; // to be populated in before hook

describe('Test Basic CRUD Operations for Courses', () => {

	before(done => {
		ldapServiceMocker.startMocking();
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

	after(done => {
		ldapServiceMocker.stopMocking();
		done();
	});

	// Make sure that you've added a DeviceID to each request to pass the Blacklisting policy
	const MOCK_DEVICE_ID = "TESTTEST$$TESTTEST";

	var courseBody = null;

	const courseDept = "CS";
	const courseNum  = 225;

	const semester = "fall";
	const year = 2015;

	const badId = 2000000000;
  	const badDate = new Date(0);

	it('Should Create a Course', done => {
		agent
			.post('/course/')
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.send({
				"department": courseDept,
				"number": courseNum,
				"semester": semester,
				"year": year,
		        "id": badId,
		        "createdAt": badDate,
		        "updatedAt": badDate
			})
			.expect(res => {
				courseBody = res.body;
				courseBody.should.have.property('department');
				courseBody.department.should.equal(courseDept);
				courseBody.should.have.property('number');
				courseBody.number.should.equal(courseNum);
				courseBody.should.have.property('semester');
				courseBody.semester.should.equal(semester);
				courseBody.should.have.property('year');
				courseBody.year.should.equal(year);
				courseBody.should.have.property('id');

		        // these attributes should not take on the bad values
		        courseBody.id.should.not.equal(badId);
		        courseBody.createdAt.should.not.equal(badDate);
		        courseBody.updatedAt.should.not.equal(badDate);

				// Upon creation, the returned object doesn't have the sections property
				// Manually add it here so it can be referenced in future tests
				courseBody.sections = [];
			})
			.expect(201, done);
	});

	it('Should be able to read the course', done => {
		agent
			.get(`/course/${courseBody.id}`)
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.expect(res => {
				// Upon get, the course will have the sections property initialized to an empty array
				courseBody.should.eql(res.body);
				courseBody = res.body;
			})
			.expect(200, done);
	});

	it('Should not be able to update the course', done => {
		const newCourseNum = 241;
		
		agent
			.put(`/course/${courseBody.id}`)
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.send({
				"number": newCourseNum,
		        "extraAttribute": "extraAttribute",
		        "id": badId,
		        "createdAt": badDate,
		        "updatedAt": badDate
			})
			.expect(500, done);
	});

	it('Should be able to delete the course', done => {
		agent
			.del(`/course/${courseBody.id}`)
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.expect(res => {
				// Upon deletion, the deleted object is sent as a response.
				// Make sure its the same object that we expected to be deleted
				courseBody.should.eql(res.body);
			})
			.expect(200, done);
	});

	it('Should get Not Found response when trying to read the deleted course', done => {
		agent
			.get(`/course/${courseBody.id}`)
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.expect(404, done);
	});

	// Now let's test a fail to create, invalid department first
	const invalidCourseDept = "BCD";
	it(`Should NOT create a Course Entry called "${invalidCourseDept} ${courseNum}, ${semester} ${year}"`, done => {
		request(sails.hooks.http.app)
			.post('/course/')
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.send({
				"department": invalidCourseDept,
				"number": courseNum,
				"year": year,
				"semester": semester
			})
			.expect(res => {
				res.body.error.should.equal('E_UNKNOWN');
				res.body.status.should.equal(500);;
			})
			.expect(500, done)
	});

	// Now test valid course, invalid semester. CS 410 is offered spring only
	const invalidSemesterCourseNum = 410;
	const invalidSemester = "fall";
	it(`Should NOT create a Course Entry called "${courseDept} ${invalidSemesterCourseNum}, ${invalidSemester} ${year}"`, done => {
		request(sails.hooks.http.app)
			.post('/course/')
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.send({
				"department": courseDept,
				"number": invalidSemesterCourseNum,
				"year": year,
				"semester": invalidSemester
			})
			.expect(res => {
				res.body.error.should.equal('E_UNKNOWN');
				res.body.status.should.equal(500);;
			})
			.expect(500, done)
	});
});
