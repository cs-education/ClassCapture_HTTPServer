/**
 * A bunch of helper functions used by the other Util Scripts
 */

const request = require('supertest');
const Chance  = require('chance');
const xml2js  = require('xml2js');
const _       = require('sails/node_modules/lodash');

const chance = new Chance();
const parseXMLString = xml2js.parseString;

const MOCK_DEVICE_ID = chance.word();

exports.getUserLoggedInAgent = (endpoint, user, cb) => {
	var agent = request.agent(endpoint);

	agent
		.post('api/user/login')
		.set("consumer-device-id", MOCK_DEVICE_ID)
		.send({
			email: user.email,
			password: user.password
		})
		.expect(200, err => cb(err, err ? null : agent));
};

exports.extractDepartmentsFromXML = (xmlStr, cb) => {
	parseXMLString(xmlStr, (err, parsed) => {
		if (err) {
			return cb(err);
		}

		var subjects = parsed['ns2:term'].subjects[0].subject;
		var depts = _.map(subjects, subject => subject.$.id);

		cb(null, depts);
	});
};

exports.extractCoursesFromXML = (xmlStr, cb) => {
	parseXMLString(xmlStr, (err, parsed) => {
		if (err) {
			return cb(err);
		}

		var courseObjs = parsed['ns2:subject'].courses[0].course;
		var courseNums = courseObjs.map(courseObj => parseInt(courseObj.$.id));
		
		if (courseNums.some(isNaN)) {
			cb(new Error('Invalid Course ID Found'));
		} else {
			cb(null, courseNums);
		}
	});
};