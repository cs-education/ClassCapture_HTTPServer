var request    = require('supertest');
var chai       = require("chai");
var Chance     = require('chance');
var _          = require('sails/node_modules/lodash');
var Promise    = require('bluebird');
var authHelper = require('../unit/test_helpers/authHelper');

var chance = new Chance();
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

const NUM_SECTIONS_PER_COURSES = 2;

var agent = null; // to be populated in before hook

before(done => {
	authHelper.getLoggedInAgent(sails.hooks.http.app, (err, loggedInAgent) => {
		if (err) {
			return done(err);
		}

		agent = loggedInAgent;
		done();
	});
});

describe(`Should create ${NUM_SECTIONS_PER_COURSES} Sections for each Course in the DB`, function() {
	this.slow(30000);
	// Make sure that you've added a DeviceID to each request to pass the Blacklisting policy
	const MOCK_DEVICE_ID = "TESTTEST$$TESTTEST";
	var courses = [];
	
	before('Retrieve Course Data', function (done) {
		agent
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
				var sectionName = chance.string({length: 3, pool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'});

				agent
					.post('/section/')
					.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
					.send({
						"name": sectionName,
						"course": course.id
					})
					.expect(res => {
						var sectionBody = res.body;
						// Check that properties of returned section are appropriately defined and valued

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