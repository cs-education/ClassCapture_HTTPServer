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
var catalogServiceMocker = require('../test_helpers/catalogServiceMocker');

var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

// Return object with two dates, named chronologically
function getDates() {
	var currDate = new Date();
	var hours = currDate.getHours();
	var futureDate = new Date();
	futureDate.setHours(hours + 1); // 1 Year into the future.

	return {
		"start": currDate,
		"end": futureDate
	};
}

var agent = null; // to be populated in before hook

describe('Basic CRUD Tests for Section Object', () => {

	before(done => {
		ldapServiceMocker.startMocking();
		catalogServiceMocker.startMocking();
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
		catalogServiceMocker.stopMocking();
		done();
	});

	// Make sure that you've added a DeviceID to each request to pass the Blacklisting policy
	const MOCK_DEVICE_ID = "TESTTEST$$TESTTEST";
	
	var courseBody  = null; // to be populated and modified by tests
	var sectionBody = null; // to be populated and modified by tests

	const courseDept = "CS";
	const courseNum  = 241;

	it('Should Create a Course', done => {
		agent
			.post('/course/')
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.send({
				"department": courseDept,
				"number": courseNum,
				"semester": 'spring',
				"year": 2015
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

	it('Should create a section for the newly created Course', done => {
		var sectionName = "AL1";

		agent
			.post('/section/')
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.send({
				"name": sectionName,
				"course": courseBody.id
			})
			.expect(res => {
				sectionBody = res.body;
				// Check that properties of returned section are appropriately defined and valued
				sectionBody.should.have.property("name");
				sectionBody.name.should.equal(sectionName);
				
				sectionBody.should.have.property("course");
				sectionBody.course.should.equal(courseBody.id);
			})
			.expect(201, done);
	});

	it('Should read the previously created course and check that it now contains the section linked with it', done => {
		agent
			.get(`/course/${courseBody.id}`)
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.expect(res => {
				courseBody = res.body;
				// Just need to check that courseBody.sections contains the newly created section
				courseBody.should.have.property('sections');
				courseBody.sections.should.have.length(1);
				courseBody.sections[0].id.should.equal(sectionBody.id);
			})
			.expect(200, done);
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

	it('Should be able to delete the section record', done => {
		agent
			.del(`/section/${sectionBody.id}`)
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.expect(200, done);
	});
});