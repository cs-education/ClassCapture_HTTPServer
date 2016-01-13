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
var Chance            = require('chance');
var ldapServiceMocker = require('../test_helpers/ldapServiceMocker');

var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();
var chance = new Chance();

const MOCK_DEVICE_ID = chance.word({length: 10});

describe('Simple Tests to make sure Authentication Works as Expected', () => {
	var agent = null; // will be populated in before all hook
	
	var userInfo = {}; // will be populated in before all hook

	var user = null; // to be populated in the registration test

	before(done => {
		ldapServiceMocker.startMocking(); // will bypass LDAP checking of NetID validity
		agent = request.agent(sails.hooks.http.app); // used to persist cookies

		var name = chance.name().split(' ');

		userInfo = {
			email: chance.email({
				domain: chance.pick(UserService.VALID_EMAIL_DOMAINS) // pick rand valid email domain
			}),
			firstName: name[0],
			lastName: name[1],
			password: chance.word({length: 6})
		};

		sails.once('hook:orm:reloaded', done);
		sails.emit('hook:orm:reload');
	});

	after(done => {
		ldapServiceMocker.stopMocking(); // restore the service's original functionality
		done();
	});

	it('Should register the user', done => {
		agent
			.post('/user/register')
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.send(userInfo)
			.expect(res => {
				var user = res.body;
				user.should.have.property('email');
				user.email.should.equal(userInfo.email);
				user.should.have.property('firstName');
				user.firstName.should.equal(userInfo.firstName);
				user.should.have.property('lastName');
				user.lastName.should.equal(userInfo.lastName);
				
				user.should.not.have.property('password');

				user.should.have.property('sections');
				user.sections.length.should.equal(0);
				user.should.have.property('comments');
				user.comments.length.should.equal(0);
			})
			.expect(201, done);
	});

	it('Should fail to register the same user again', done => {
		agent
			.post('/user/register')
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.send(userInfo)
			.expect(400, done);
	});

	it('Should be able to get user info from /me endpoint', done => {
		agent
			.get('/user/me')
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.expect(res => {
				var me = res.body;
				me.should.have.property('email');
				me.email.should.equal(userInfo.email);
				me.should.have.property('firstName');
				me.firstName.should.equal(userInfo.firstName);
				me.should.have.property('lastName');
				me.lastName.should.equal(userInfo.lastName);
				
				me.should.not.have.property('password');

				me.should.have.property('sections');
				me.sections.length.should.equal(0);
				me.should.have.property('comments');
				me.comments.length.should.equal(0);
			})
			.expect(200, done);
	});

	it('Should be able to access an endpoint within the restricted API', done => {
		agent
			.get('/recording')
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.expect(200, done);
	});

	it('Should be able to logout successfully', done => {
		agent
			.post('/user/logout')
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.expect(200, done);
	});

	it('Should NOT be able to access an endpoint within the restricted API after logout', done => {
		agent
			.get('/recording')
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.expect(403, done);
	});

	it('Should be able to log back in as registered user', done => {
		agent
			.post('/user/login')
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.send({
				email: userInfo.email,
				password: userInfo.password
			})
			.expect(res => {
				var user = res.body;
				user.should.have.property('email');
				user.email.should.equal(userInfo.email);
				user.should.have.property('firstName');
				user.firstName.should.equal(userInfo.firstName);
				user.should.have.property('lastName');
				user.lastName.should.equal(userInfo.lastName);
				
				user.should.not.have.property('password');

				user.should.have.property('sections');
				user.sections.length.should.equal(0);
				user.should.have.property('comments');
				user.comments.length.should.equal(0);
			})
			.expect(200, done);
	});

	it('Should be able to access an endpoint within the restricted API after logging back in', done => {
		agent
			.get('/recording')
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.expect(200, done);
	});

});