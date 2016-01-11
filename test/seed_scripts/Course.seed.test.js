var request           = require('supertest');
var chai              = require("chai");
var Chance            = require('chance');
var _                 = require('sails/node_modules/lodash');
var authHelper        = require('../unit/test_helpers/authHelper');
var ldapServiceMocker = require('../unit/test_helpers/ldapServiceMocker');

var chance = new Chance();
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

const NUM_COURSES = 1;

var agent = null; // to be populated in before hook

before(done => {
	ldapServiceMocker.startMocking();
	authHelper.getLoggedInAgent(sails.hooks.http.app, (err, loggedInAgent) => {
		if (err) {
			return done(err);
		}

		agent = loggedInAgent;
		done();
	});
});

describe(`Create ${NUM_COURSES} Course Entries`, () => {
	// Make sure that you've added a DeviceID to each request to pass the Blacklisting policy
	const MOCK_DEVICE_ID = "TESTTEST$$TESTTEST";

	_.times(NUM_COURSES, () => {
		const courseDept = chance.string({length: 3, pool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'});
		const courseNum = chance.natural({min: 100, max: 600});

		it(`Should create a Course Entry called "${courseDept} ${courseNum}"`, done => {
			agent
				.post('/course/')
				.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
				.send({
					"department": courseDept,
					"number": courseNum
				})
				.expect(res => {
					var courseBody = res.body;
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
	});
});