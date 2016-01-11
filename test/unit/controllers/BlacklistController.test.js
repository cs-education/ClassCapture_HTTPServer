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

var request    = require('supertest');
var chai       = require("chai");
var fs         = require('fs');
var authHelper = require('../test_helpers/authHelper');

var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

describe('Simple operations with blacklist functionality', () => {
	// Make sure that you've added a DeviceID to each request to pass the Blacklisting policy
	const MOCK_DEVICE_ID = "TESTTEST$$TESTTEST";
	var agent = null; // to be populated in before hook

	before(done => {
		// Make sure there's nothing in the blacklist to begin with
		BlacklistService.clearBlacklist(err => {
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
	});

	after(done => {
		// Make sure there's nothing in the blacklist at the end
		
		BlacklistService.clearBlacklist(done);
	});

	describe('Test that no blacklisting occurs when blacklist is empty', () => {
		it('Should read an empty blacklist', done => {
			agent
				.get('/blacklist')
				.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
				.expect(res => {
					res.body.length.should.equal(0);
				})
				.expect(200, done);
		});

		it('Should be able to interact with Recording API without being blacklisted', done => {
			agent
				.get('/recording')
				.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
				.expect(200, done);
		});
	});

	describe('Test that blacklisting occurrs when device ID is in blacklist', done => {
		const deviceID = '$$A$$_$$BAD$$_$$DEVICE$$';

		it('Should add the current deviceID to the blacklist', done => {
			agent
				.put(`/blacklist/${deviceID}`)
				.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
				.expect(200, done);
		});

		it('Should not be able to interact with Recording API using blacklisted device ID', done => {
			agent
				.get('/recording')
				.set(BlacklistService.DEVICE_ID_HEADER_NAME, deviceID)
				.expect(403, done);
		});

		it('Should be able to delete the previous deviceID from blacklist', done => {
			agent
				.del(`/blacklist/${deviceID}`)
				.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
				.expect(200, done);
		});

		it('Should read an empty blacklist', done => {
			agent
				.get('/blacklist')
				.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
				.expect(res => {
					res.body.length.should.equal(0);
				})
				.expect(200, done);
		});

		it('Should be able to interact with Recording API using device ID that was just removed from blacklist', done => {
			agent
				.get('/recording')
				.set(BlacklistService.DEVICE_ID_HEADER_NAME, deviceID)
				.expect(200, done);
		});
	});

});