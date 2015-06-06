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

// Return array of two dates, sequenced chronologically
function getDates() {
	var currDate = new Date();
	var year = currDate.getFullYear();
	var futureDate = new Date();
	futureDate.setYear(year + 1); // 1 Year into the future.

	return [currDate, futureDate];
}

function datesEqual(dateA, dateB) {
	// Turns out == or === doesn't work when comparing two different date instances with the same value.
	// Despite that, the >,<,>=,<= operators work as expected (chronologically compare)
	// This should do the trick to see if two dates are equal.
	return (dateA >= dateB) && (dateA <= dateB);
}

describe("Test basic CRUD Ops in that order", function () {
	var recordingBody = null; // Will be populated in create test

	describe("create", function () {
		it("Should create a new recording entry", function (done) {
			var dates = getDates();
			assert.isBelow(dates[0], dates[1], "startTime is not below endTime");

			request(sails.hooks.http.app)
				.post('/recording/create')
				.send({
					"startTime": dates[0],
					"endTime": dates[1]
				})
				.expect(function (res) {
					// Check for valid response
					res.body.should.have.property("startTime");
					res.body.should.have.property("endTime");
					res.body.should.have.property("filename");
					res.body.should.have.property("id");
					recordingBody = res.body; // To be used as reference in future tests
					assert.isTrue(datesEqual(dates[0], new Date(res.body.startTime)), "Received startTime not consistent with given startTime");
					assert.isTrue(datesEqual(dates[1], new Date(res.body.endTime)), "Received endTime not consistent with given endTime");
				})
				.expect(201, done);
		});
	});

	describe("read", function () {
		it("Should grab the record that was just created and check that it hasn't changed", function (done) {
			request(sails.hooks.http.app)
				.get("/recording/" + recordingBody.id)
				.expect(function (res) {
					// Loop through each attribute in the body of the create response
					// and make sure it matches with the body of the read respobse
					Object.keys(recordingBody).forEach(function (attr) {
						res.body.should.have.property(attr);
						assert.equal(recordingBody[attr], res.body[attr], "Attribute for " + attr + " didn't match");
					});
				})
				.expect(200, done);
		});
	});

	describe("update", function () {
		it("Should update the record that was just created and check that it changed accordingly", function (done) {
			// Advance the year of the record's endTime by 1 year
			var newEndTime = new Date(recordingBody.endTime);
			newEndTime.setYear(newEndTime.getFullYear() + 1); // increment year

			request(sails.hooks.http.app)
				.post("/recording/" + recordingBody.id)
				.send({
					"endTime": newEndTime
				})
				.expect(function (res) {
					res.body.should.have.property("endTime");
					assert.isTrue(datesEqual(newEndTime, new Date(res.body.endTime)), "Endtime for Recording wasn't updated as expected");
				})
				.expect(200, done);
		});
	});

	describe("delete", function () {
		it("Should delete the record that was just updated", function (done) {
			request(sails.hooks.http.app)
				.del("/recording/" + recordingBody.id)
				.expect(function (res) {
					// Just check that you deleted the right record
					res.body.should.have.property("id");
					assert.equal(res.body.id, recordingBody.id, "ID's didn't match up");
				})
				.expect(200, done);
		});
	});
});
