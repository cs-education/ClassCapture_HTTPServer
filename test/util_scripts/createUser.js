/**
 * Given a fist name, last name, and NetID, registers a new account with that User information
 * Password for account is random and printed out at the end
 */
const readline = require('readline');
const Chance   = require('chance');
const async    = require('sails/node_modules/async');
const _        = require('sails/node_modules/lodash');
const path     = require('path');
const request  = require('supertest');
const helpers  = require('./helpers');

const chance = new Chance();

const DEFAULT_API_ENDPOINT = 'https://classcapture.ncsa.illinois.edu/';

const MOCK_DEVICE_ID = chance.word();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var endpoint = null;

var userInfo = {};

// ask for host
before(done => {
	rl.question(`What is the WebApp endpoint? Leave empty for default (${DEFAULT_API_ENDPOINT})\n`, answer => {
		answer = answer.trim();
		endpoint = _.isEmpty(answer) ? DEFAULT_API_ENDPOINT : answer;
		done();
	});
});

// Set first & last names
before(done => {
	rl.question('First Name:\n', firstName => {
		firstName = firstName.trim();
		
		if (_.isString(firstName) && !_.isEmpty(firstName)) {
			userInfo.firstName = firstName;
			
			rl.question('Last Name:\n', lastName => {
				lastName = lastName.trim();
				
				if (_.isString(lastName) && !_.isEmpty(lastName)) {
					userInfo.lastName = lastName;
					done();
				} else {
					done(new Error(`Invalid input: "${lastName}"`));
				}
			});
		} else {
			done(new Error(`Invalid input: "${firstName}"`));
		}
	});
});

// set netid
before(done => {
	rl.question('NetID:\n', netID => {
		netID = netID.trim();
		if (_.isString(netID) && !_.isEmpty(netID)) {
			userInfo.email = `${netID}@illinois.edu`;
			done();
		} else {
			done(new Error(`Invalid input: ${netID}`));
		}
	});
});

describe('create a user based on given inputs', () => {
	it('Should register the user', done => {
		userInfo.password = chance.word({length: 5});
		console.log(`Here's the userInfo:\n${JSON.stringify(userInfo, null, 2)}`);

		request(endpoint)
			.post('api/user/register')
			.set("consumer-device-id", MOCK_DEVICE_ID)
			.send(userInfo)
			.expect(201)
			.end((err, res) => {
				if (res.body) {
					console.log(JSON.stringify(res.body, null, 2));
				}
				done(err);
			});
	});
});