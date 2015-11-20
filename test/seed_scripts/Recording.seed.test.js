var request = require('supertest');
var chai    = require("chai");
var Chance  = require('chance');
var _       = require('sails/node_modules/lodash');
var Promise = require('bluebird');
var fs      = require('fs');

var chance = new Chance();
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

const NUM_RECORDINGS_PER_SECTION = 3;

const VIDEO_FILES = fs.readdirSync('./test/test_assets/')
	.filter(fileName => _.contains(fileName, '.mp4'))
	.map(fileName => {
		var durStr = fileName.substring(0,fileName.indexOf('.mp4')); // names of video files in test_assets should be length of video in millis
		return {
			duration: parseInt(durStr),
			path: './test/test_assets/' + fileName
		};
	});

function datesEqual(dateA, dateB) {
	// Turns out == or === doesn't work when comparing two different date instances with the same value.
	// Despite that, the >,<,>=,<= operators work as expected (chronologically compare)
	return dateA.getTime() == dateB.getTime();
}

describe(`Should create ${NUM_RECORDINGS_PER_SECTION} Recordings for each Section`, () => {
	// Make sure that you've added a DeviceID to each request to pass the Blacklisting policy
	const MOCK_DEVICE_ID = "TESTTEST$$TESTTEST";
	var sections = [];

	before('Retrieve Sections Data', function (done) {
		request(sails.hooks.http.app)
			.get('/section/')
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.expect(res => {
				sections = res.body;
				sections.length.should.not.equal(0);
			})
			.expect(200, done);
	});

	it('Will iterate through all sections and upload recordings for them', function(done) {
		this.slow(10000);
		async.each(sections, (section,cb) => {
			async.times(NUM_RECORDINGS_PER_SECTION, (n,next) => {
				var videoFile = VIDEO_FILES[Math.floor(Math.random() * VIDEO_FILES.length)];
				var startTime = new Date();
				var endTime = new Date(startTime.getTime() + videoFile.duration);
				var createdRecording = null;

				request(sails.hooks.http.app)
					.post('/recording/')
					.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
					.send({
						"startTime": startTime,
						"endTime": endTime,
						"section": section.id
					})
					.expect(function (res) {
						// Check for valid response
						res.body.should.have.property("startTime");
						res.body.should.have.property("endTime");
						res.body.should.have.property("filename");
						res.body.should.have.property("id");
						createdRecording = res.body; // To be used as reference in future tests
						assert.isTrue(datesEqual(startTime, new Date(res.body.startTime)), "Received startTime not consistent with given startTime");
						assert.isTrue(datesEqual(endTime, new Date(res.body.endTime)), "Received endTime not consistent with given endTime");
					})
					.expect(201, err => {
						if (err) {
							next(err);
						}

						request(sails.hooks.http.app)
							.post(`/video/${createdRecording.filename}`)
							.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
							.attach("video", videoFile.path)
							.expect(200, next);
					});
			}, cb);
		}, done);
	});

});