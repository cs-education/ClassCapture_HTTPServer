var request           = require('supertest');
var chai              = require("chai");
var Chance            = require('chance');
var _                 = require('sails/node_modules/lodash');
var Promise           = require('bluebird');
var authHelper        = require('../unit/test_helpers/authHelper');
var ldapServiceMocker = require('../unit/test_helpers/ldapServiceMocker');

var chance = new Chance();
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

const NUM_USERS = 2;

const MOCK_DEVICE_ID = "TESTTEST$$TESTTEST";

var sections = [];
var users = [];

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

describe(`Should create ${NUM_USERS} users in the DB`, () => {
	before('Retrieve Section Data', done => {
		agent
			.get('/section/')
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.expect(res => {
				sections = res.body;
				sections.length.should.be.above(0);
			})
			.expect(200, done);
	});

	it(`Should create all ${NUM_USERS} users`, done => {
		async.map(_.range(NUM_USERS), (idx, cb) => {
			var name = chance.name().split(' ');
			var user = {
				email: chance.email({
					domain: chance.pick(UserService.VALID_EMAIL_DOMAINS) // pick rand valid email domain
				}),
				password: chance.word({length: 6}),
				firstName: name[0], // get first name only
				lastName: name[1]
			};

			var resUser = null;

			agent
				.post('/user/register')
				.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
				.send(user)
				.expect(res => {
					resUser = res.body;
					resUser.should.have.property('email');
					resUser.email.should.equal(user.email);
					resUser.should.not.have.property('password');
					resUser.should.have.property('firstName');
					resUser.firstName.should.equal(user.firstName);
					resUser.should.have.property('lastName');
					resUser.lastName.should.equal(user.lastName);

					// attatch the password here
					resUser.password = user.password;
				})
				.expect(201, err => {
					if (err) {
						cb(err);
					} else {
						cb(null, resUser);
					}
				});
		}, (err, createdUsers) => {
			if (err) {
				done(err);
				return;
			}

			users = createdUsers;
			done();
		});
	});

	function registerUserForSections(user, sections, cb) {
		authHelper.getUserLoggedInAgent(sails.hooks.http.app, user, (err, agent) => {
			if (err) {
				return cb(err);
			}

			agent
				.put(`/user/${user.id}`)
				.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
				.send({
					password: user.password,
					sections: _.pluck(sections, 'id')
				})
				.expect(200)
				.end((err, res) => {
					if (err) {
						cb(err);
					} else {
						var updatedUser = res.body;
						updatedUser.password = user.password; // attach the password since its stripped in the response
						cb(null, updatedUser);
					}
				});

		});
	}

	it('Should register each user for all of the sections', done => {
		async.map(users, (user, cb) => registerUserForSections(user, sections, cb), (err, updatedUsers) => {
			if (err) {
				return done(err);
			}

			users = updatedUsers;
			done();
		});
	});

	function getRecordingsForSection(section, cb) {
		var sectionID = _.isNumber(section) ? section : section.id;
		var recordings = [];
		agent
			.get(`/recording?section=${sectionID}`)
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.expect(res => {
				recordings = res.body;
				recordings.length.should.be.above(0);
			})
			.expect(200, err => cb(err, recordings));
	}

	it(`Should make a comment for each recording for each user`, done => {
		async.map(sections, getRecordingsForSection, (err, recordings) => {
			if (err) {
				return done(err);
			}

			recordings = _.flatten(recordings);

			async.forEach(recordings, (recording, cb) => {
				var start = new Date(recording.startTime).getTime();
				var end = new Date(recording.endTime).getTime();

				var idx = 0;
				async.forEach(users, (user, commentCb) => {
					authHelper.getUserLoggedInAgent(sails.hooks.http.app, user, (err, agent) => {
						if (err) {
							return commentCb(err);
						}

						var time = start + ((end-start) * ((idx++) / users.length));
						agent
							.post('/comment/')
							.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
							.send({
								content: chance.sentence(),
								time: new Date(time),
								poster: user.id,
								recording: recording.id
							})
							.expect(res => {
								var comment = res.body;
								comment.should.have.property('content');
								comment.should.have.property('time');
								time.should.equal(new Date(comment.time).getTime());
								comment.should.have.property('poster');
								comment.should.have.property('recording');
							})
							.expect(201, commentCb);
					});
				}, cb);
			}, done);
		});
	});

});