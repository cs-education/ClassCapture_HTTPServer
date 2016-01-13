var request           = require('supertest');
var chai              = require('chai');
var Chance            = require('chance');
var ldapServiceMocker = require('../test_helpers/ldapServiceMocker');

var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();
var chance = new Chance();

const NUM_INVALID_NETIDS = 20;
const VALID_NETIDS = ['svdesai2', 'jsmith', 'batman']; // feel free to add your own to this list

describe('Test LDAPService isValidNetID function', () => {
	before(done => {
		console.log('HEY! MAKE SURE YOU ARE ON UIUC VPN!');
		console.log('LDAPService MAKES CALLS TO THE ACTUAL UIUC LDAP SERVER WHICH IS ONLY ACCESSIBLE IF YOU\'RE ON VPN');
		console.log('OTHERWISE LDAPService.isValidNetID WILL ALWAYS RETURN FALSE EVEN WHEN IT SHOULD\'NT');
		ldapServiceMocker.stopMocking(); // just in case some other test started it and never stopped it
		done();
	});

	it(`Should check that ${NUM_INVALID_NETIDS} randomly generated netids are invalid`, done => {
		var NetIDs = _.range(NUM_INVALID_NETIDS).map(() => chance.word({length: 23})); // not netid is 23 chars long
		async.every(NetIDs, (netID, cb) => {
			LDAPService.isValidNetID(netID, isValid => {
				var isInvalid = !isValid;
				cb(isInvalid);
			});
		}, allNetIDsInvalid => {
			allNetIDsInvalid.should.equal(true);
			done();
		});
	});

	it('Should check that a few known valid netids are shown to be valid', done => {
		async.every(VALID_NETIDS, LDAPService.isValidNetID, allNetIDsValid => {
			allNetIDsValid.should.equal(true);
			done();
		});
	});


});