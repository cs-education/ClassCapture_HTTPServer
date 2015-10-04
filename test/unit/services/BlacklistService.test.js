var chai      = require("chai");
var fs        = require('fs');

var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

describe("basic test for Blacklisting", () => {
	var preBlacklistedIDs = null;

	// Before each test, create a bunch of random IDs
	// After each test, clear all of the IDs
	beforeEach(done => {
		preBlacklistedIDs = _.range(0, 1000, 5).map(String);
		// add each blacklisted ID to the blacklist service, then call done
		async.eachSeries(preBlacklistedIDs, BlacklistService.addToBlacklist, done);
	});

	afterEach(done => {
		BlacklistService.clearBlacklist(err => {
			BlacklistService.blacklistSize().should.equal(0);
			preBlacklistedIDs = null;
			done(err);
		});
	});

	it("Should check that the number of preBlacklistedIDs is how many are in the blacklist", done => {
		BlacklistService.blacklistSize().should.equal(preBlacklistedIDs.length);
		done();
	});

	it("Should check that all the preBlacklistedIDs are in the blacklist", done => {
		preBlacklistedIDs.every(BlacklistService.isInBlacklist).should.be.true;
		done();
	});

	it("Should check that a new ID can be added and confirm its existence in the blacklist", done => {
		const newID = "Hi123456";
		BlacklistService.addToBlacklist(newID, err => {
			should.not.exist(err);
			BlacklistService.isInBlacklist(newID).should.be.true;
			done();
		});
	});

	it("Should check that a new ID can be added and then deleted from blacklist", done => {
		const newID = "Hi123456";
		BlacklistService.addToBlacklist(newID, err => {
			should.not.exist(err);
			BlacklistService.isInBlacklist(newID).should.be.true;
			BlacklistService.removeFromBlacklist(newID, (err, existed) => {
				should.not.exist(err);
								sails.log(existed);
				existed.should.be.true;
				done();
			});
		});
	});
});