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
var fs        = require('fs');

var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

var VIDEO_FILE = "./test/test_assets/jmarr.mp4"; // Test file that tests will be uploading

describe('Simple operations with blacklist functionality', () => {
	// Make sure that you've added a DeviceID to each request to pass the Blacklisting policy
	const MOCK_DEVICE_ID = "TESTTEST$$TESTTEST";

	before(done => {
		// Make sure there's nothing in the blacklist to begin with
		BlacklistService.clearBlacklist(done);
	});

	after(done => {
		// Make sure there's nothing in the blacklist at the end
		BlacklistService.clearBlacklist(done);
	});

	describe('Test that no blacklisting occurs when blacklist is empty', () => {
		it('Should read an empty blacklist', done => {
			request(sails.hooks.http.app)
				.get('/blacklist')
				.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
				.expect(res => {
					res.body.length.should.equal(0);
				})
				.expect(200, done);
		});

		it('Should be able to interact with Recording API without being blacklisted', done => {
			request(sails.hooks.http.app)
				.get('/recording')
				.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
				.expect(200, done);
		});
	});

	describe('Test that blacklisting occurrs when device ID is in blacklist', done => {
		const deviceID = '$$A$$_$$BAD$$_$$DEVICE$$';

		it('Should add the current deviceID to the blacklist', done => {
			request(sails.hooks.http.app)
				.put(`/blacklist/${deviceID}`)
				.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
				.expect(200, done);
		});

		it('Should not be able to interact with Recording API using blacklisted device ID', done => {
			request(sails.hooks.http.app)
				.get('/recording')
				.set(BlacklistService.DEVICE_ID_HEADER_NAME, deviceID)
				.expect(403, done);
		});

		it('Should be able to delete the previous deviceID from blacklist', done => {
			request(sails.hooks.http.app)
				.del(`/blacklist/${deviceID}`)
				.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
				.expect(200, done);
		});

		it('Should read an empty blacklist', done => {
			request(sails.hooks.http.app)
				.get('/blacklist')
				.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
				.expect(res => {
					res.body.length.should.equal(0);
				})
				.expect(200, done);
		});

		it('Should be able to interact with Recording API using device ID that was just removed from blacklist', done => {
			request(sails.hooks.http.app)
				.get('/recording')
				.set(BlacklistService.DEVICE_ID_HEADER_NAME, deviceID)
				.expect(200, done);
		});
	});

});