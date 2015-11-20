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
var chai    = require("chai");

var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

// Return object with two dates, named chronologically
function getDates() {
	var currDate = new Date();
	var year = currDate.getFullYear();
	var futureDate = new Date();
	futureDate.setYear(year + 1); // 1 Year into the future.

	return {
		"start": currDate,
		"end": futureDate
	};
}

function datesEqual(dateA, dateB) {
	// Turns out == or === doesn't work when comparing two different date instances with the same value.
	// Despite that, the >,<,>=,<= operators work as expected (chronologically compare)
	return dateA.getTime() == dateB.getTime();
}

describe("Test basic CRUD Ops in that order", function () {

	// Make sure that you've added a DeviceID to each request to pass the Blacklisting policy
	const MOCK_DEVICE_ID = "TESTTEST$$TESTTEST";

	var courseBody    = null;
	var sectionBody   = null;
	var recordingBody = null; // Will be populated in create test

	// First create a course & section to link the recordings with
	describe('Create course', function () {
		it('Should create a new course entry', done => {
			request(sails.hooks.http.app)
				.post('/course/')
				.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
				.send({
					"department": "CS",
					"number": 225,
				})
				.expect(function (res) {
					courseBody = res.body;
					courseBody.should.have.property('department');
					courseBody.department.should.equal("CS");
					courseBody.should.have.property('number');
					courseBody.number.should.equal(225);
				})
				.expect(201, done);
		});
	});

	describe('Create section under course', function () {
		it('Should create a new section under the course entry', done => {
			request(sails.hooks.http.app)
				.post('/section/')
				.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
				.send({
					"name": "AL1",
					"course": courseBody.id
				})
				.expect(res => {
					sectionBody = res.body;
					sectionBody.should.have.property('name');
					sectionBody.name.should.equal("AL1");
					sectionBody.should.have.property('course');
					sectionBody.course.should.equal(courseBody.id);
				})
				.expect(201, done);
		});
	});

	describe("create", function () {
		it("Should create a new recording entry", done => {
			var dates = getDates();
			assert.isBelow(dates.start, dates.end, "startTime is not below endTime");

			request(sails.hooks.http.app)
				.post('/recording/')
				.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
				.send({
					"startTime": dates.start,
					"endTime": dates.end,
					"section": sectionBody.id
				})
				.expect(function (res) {
					// Check for valid response
					res.body.should.have.property("startTime");
					res.body.should.have.property("endTime");
					res.body.should.have.property("filename");
					res.body.should.have.property("id");
					recordingBody = res.body; // To be used as reference in future tests
					assert.isTrue(datesEqual(dates.start, new Date(res.body.startTime)), "Received startTime not consistent with given startTime");
					assert.isTrue(datesEqual(dates.end, new Date(res.body.endTime)), "Received endTime not consistent with given endTime");
				})
				.expect(201, done);
		});
	});

	describe("read", function () {
		it("Should grab the record that was just created and check that it hasn't changed", done => {
			request(sails.hooks.http.app)
				.get(`/recording/${recordingBody.id}`)
				.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
				.expect(res => {
					// Loop through each attribute in the body of the created response
					// and make sure it matches with the body of the read response
					Object.keys(recordingBody)
						.filter(attr => attr !== 'section') // omit the section attribute
						.forEach(attr => {
							res.body.should.have.property(attr);
							assert.equal(recordingBody[attr], res.body[attr], "Attribute for " + attr + " didn't match");
						});

					assert.equal(recordingBody.section, res.body.section.id, "Attribute for section didn't match");
				})
				.expect(200, done);
		});
	});

	describe("update", function () {
		it("Should update the record that was just created and check that it changed accordingly", done => {
			// Advance the year of the record's endTime by 1 year
			var newEndTime = new Date(recordingBody.endTime);
			newEndTime.setYear(newEndTime.getFullYear() + 1); // increment year

			request(sails.hooks.http.app)
				.put("/recording/" + recordingBody.id)
				.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
				.send({
					"endTime": newEndTime
				})
				.expect(res => {
					res.body.should.have.property("endTime");
					assert.isTrue(datesEqual(newEndTime, new Date(res.body.endTime)), "Endtime for Recording wasn't updated as expected");
				})
				.expect(200, err => {
					done(err);
				})
		});
	});

	describe("delete", function () {
		it("Should delete the record that was just updated", done => {
			request(sails.hooks.http.app)
				.del("/recording/" + recordingBody.id)
				.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
				.expect(res => {
					// Just check that you deleted the right record
					assert.equal(res.body.id, recordingBody.id, "ID's didn't match up");
				})
				.expect(200, done);
		});

		it('Should get a Not Found response when trying to fetch the recording that was just deleted', done => {
			request(sails.hooks.http.app)
				.get(`/recording/${recordingBody.id}`)
				.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
				.expect(404, done);
		});
	});
});
