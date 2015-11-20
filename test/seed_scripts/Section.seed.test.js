var request = require('supertest');
var chai    = require("chai");
var Chance  = require('chance');
var _       = require('sails/node_modules/lodash');
var Promise = require('bluebird');

var chance = new Chance();
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

const NUM_SECTIONS_PER_COURSES = 1;

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

describe(`Should create ${NUM_SECTIONS_PER_COURSES} Sections for each Course in the DB`, function() {
	this.slow(30000);
	// Make sure that you've added a DeviceID to each request to pass the Blacklisting policy
	const MOCK_DEVICE_ID = "TESTTEST$$TESTTEST";
	var courses = [];
	
	before('Retrieve Course Data', function (done) {
		request(sails.hooks.http.app)
			.get(`/course/`)
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.expect(res => {
				courses = res.body;
				courses.length.should.not.equal(0);
			})
			.expect(200, done);
	});

	it('Should iterate through all courses to create sections for them', function (done) {
		this.slow(20000);
		async.each(courses, (course, cb) => {	
			async.times(NUM_SECTIONS_PER_COURSES, (n, next) => {
				var dates = getDates();

				var startTime   = dates.start;
				var endTime     = dates.end;
				var sectionName = chance.string({length: 3, pool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'});

				request(sails.hooks.http.app)
					.post('/section/')
					.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
					.send({
						startTime,
						endTime,
						"name": sectionName,
						"course": course.id
					})
					.expect(res => {
						var sectionBody = res.body;
						// Check that properties of returned section are appropriately defined and valued
						// startTime and endTime are returned as string formatted Dates, so need to convert them back to Date type
						sectionBody.should.have.property("startTime");
						var resStartTime = new Date(sectionBody.startTime);
						resStartTime.getHours().should.equal(startTime.getHours());
						resStartTime.getMinutes().should.equal(startTime.getMinutes());
						
						sectionBody.should.have.property("endTime");
						var resEndTime = new Date(sectionBody.endTime);
						resEndTime.getHours().should.equal(endTime.getHours());
						resEndTime.getMinutes().should.equal(endTime.getMinutes());
						
						sectionBody.should.have.property("name");
						sectionBody.name.should.equal(sectionName);
						
						sectionBody.should.have.property("course");
						sectionBody.course.should.equal(course.id);
					})
					.expect(201, next);
			}, cb);
		}, done);
	});

});