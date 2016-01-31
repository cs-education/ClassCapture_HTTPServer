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
var fs                = require('fs');
var authHelper        = require('../test_helpers/authHelper');
var ldapServiceMocker = require('../test_helpers/ldapServiceMocker');

var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

var VIDEO_FILE = "./test/test_assets/106000.mp4"; // Test file that tests will be uploading

describe("Test Uploading, Downloading, & Deletion of Video", () => {

	// Make sure that you've added a DeviceID to each request to pass the Blacklisting policy
	const MOCK_DEVICE_ID = "TESTTEST$$TESTTEST";
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

	after(done => {
		ldapServiceMocker.stopMocking();
		done();
	});

	describe("Test Uploading of Video", () => {
		it("Should successfully upload the video to the server", done => {
			agent
				.post("/video/106000-cpy.mp4")
				.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
				.attach("video", VIDEO_FILE)
				.expect(200, done);
		});
	});

	describe("Test Dowloading of Video", () => {
		it("Should successfully download the video from the server", done => {
			agent
				.get("/video/106000-cpy.mp4")
				.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
				.expect(function (res) {
					var stats    = fs.statSync(VIDEO_FILE);
					var fileSize = stats.size;
					assert.equal(res.header['content-length'], fileSize, "Uploaded file and downloaded file have different lengths");
				})
				.expect(200, done);
		});
	});

	describe("Test Deletion of Video", () => {
		it("Should successfully delete the video from the server", done => {
			agent
				.del('/video/106000-cpy.mp4')
				.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
				.expect(200, done);
		});
	});

});