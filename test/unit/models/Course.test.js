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

var request = require('supertest');
var chai      = require("chai");

var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

describe('Test Basic CRUD Operations for Courses', () => {

	// Make sure that you've added a DeviceID to each request to pass the Blacklisting policy
	const MOCK_DEVICE_ID = "TESTTEST$$TESTTEST";

	var courseBody = null;

	const courseDept = "CS";
	const courseNum  = 225;

	it('Should Create a Course', done => {
		request(sails.hooks.http.app)
			.post('/course/')
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.send({
				"department": courseDept,
				"number": courseNum
			})
			.expect(res => {
				courseBody = res.body;
				courseBody.should.have.property('department');
				courseBody.department.should.equal(courseDept);
				courseBody.should.have.property('number');
				courseBody.number.should.equal(courseNum);
				courseBody.should.have.property('id');

				// Upon creation, the returned object doesn't have the sections property
				// Manually add it here so it can be referenced in future tests
				courseBody.sections = [];
			})
			.expect(201, done);
	});

	it('Should be able to read the course', done => {
		request(sails.hooks.http.app)
			.get(`/course/${courseBody.id}`)
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.expect(res => {
				// Upon get, the course will have the sections property initialized to an empty array
				courseBody.should.eql(res.body);
				courseBody = res.body;
			})
			.expect(200, done);
	});

	it('Should be able to update the course', done => {
		const newCourseNum = 241;
		
		request(sails.hooks.http.app)
			.put(`/course/${courseBody.id}`)
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.send({
				"number": newCourseNum
			})
			.expect(res => {
				// Check that parts of course that weren't supposed to change weren't changed
				// The fields number and updatedAt are the only ones that should've changed
				var newCourseStaticParts = _.omit(res.body, ['number', 'updatedAt']);
				var oldCourseStaticParts = _.omit(courseBody, ['number', 'updatedAt']);
				newCourseStaticParts.should.eql(oldCourseStaticParts);

				// Update courseBody to have the latest changes
				courseBody = res.body;
				// Check that changes were made appropriately
				courseBody.number.should.equal(newCourseNum);
			})
			.expect(200, done);
	});

	it('Should be able to delete the course', done => {
		request(sails.hooks.http.app)
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
		request(sails.hooks.http.app)
			.get(`/course/${courseBody.id}`)
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.expect(404, done);
	});
});