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
var fs      = require('fs');

var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

var VIDEO_FILE = "./test/test_assets/jmarr.mp4"; // Test file that tests will be uploading

describe("Test Uploading and Downloading of Video", function () {

	describe("Test Uploading of Video", function () {
		it("Should successfully upload the video to the server", function (done) {
			request(sails.hooks.http.app)
				.post("/video/jmarr-cpy.mp4")
				.attach("video", VIDEO_FILE)
				.expect(200, done);
		});
	});

	describe("Test Uploading of Video", function () {
		it("Should successfully download the video from the server", function (done) {
			request(sails.hooks.http.app)
				.get("/video/jmarr-cpy.mp4")
				.expect(function (res) {
					var stats    = fs.statSync(VIDEO_FILE);
					var fileSize = stats.size;
					assert.equal(res.header['content-length'], fileSize, "Uploaded file and downloaded file have different lengths");
				})
				.expect(200, done);
		});
	});

});