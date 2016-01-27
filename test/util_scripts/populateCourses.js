/**
 * Gets a list of all the courses for a given semester, and creates a course entry in the API
 * Given endpoint must be for the WebApp which proxies '/api/' requests to the API Server
 */
const readline = require('readline');
const async = require('sails/node_modules/async');
const _ = require('sails/node_modules/lodash');
const supertest = require('supertest');
const helpers = require('./helpers');

const DEFAULT_API_ENDPOINT = 'http://localhost:9000';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var endpoint = null;
var semester = null;
var year = null;

before(done => {
	rl.question(`What is the WebApp endpoint? Leave empty for default (${DEFAULT_API_ENDPOINT})\n`, answer => {
		answer = answer.trim();
		endpoint = _.isEmpty(answer) ? DEFAULT_API_ENDPOINT : answer;
		done();
	});
});

before(done => {
	rl.question('What Year are these courses during?\n', inputYear => {
		year = parseInt(inputYear.trim());
		if (isNaN(year)) {
			throw new Error(`Invalid year input: "${inputYear}"`);
		} else {
			rl.question('What Semester are these courses during?\n', inputSemester => {
				semester = inputSemester.trim();
				done();
			});
		}
	});
});

before(done => {
	rl.question('Email:\n', inputEmail => {
		var email = inputEmail.trim();
		rl.question('Password:\n', inputPassword => {
			var password = inputPassword.trim();
			console.log('Logging In');
			helpers.getUserLoggedInAgent(endpoint, {email, password}, (err, loggedInAgent) => {
				agent = loggedInAgent;
				done(err);
			});
		});
	});
});

describe('Should obtain list of all courses during specified semester and make courses entries for them in the API', () => {
	it('Should pass', done => done());
});