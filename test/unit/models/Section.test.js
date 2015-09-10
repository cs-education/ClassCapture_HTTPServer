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

var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

// Return object with two dates, named chronologically
function getDates() {
	var currDate = new Date();
	var hours = currDate.getHours();
	var futureDate = new Date();
	futureDate.setHours(hours + 1); // 1 Year into the future.

	return {
		"start": currDate,
		"end": futureDate
	};
}

describe('Basic CRUD Tests for Section Object', () => {
	var courseBody  = null; // to be populated and modified by tests
	var sectionBody = null; // to be populated and modified by tests

	const courseDept = "CS";
	const courseNum  = 225;

	it('Should Create a Course', done => {
		request(sails.hooks.http.app)
			.post('/course/')
			.send({
				"department": "CS",
				"number": 225
			})
			.expect(res => {
				courseBody = res.body;
				courseBody.should.have.property('department');
				courseBody.department.should.equal(courseDept);
				courseBody.should.have.property('number');
				courseBody.number.should.equal(courseNum);
				courseBody.should.have.property('id');

				// Upon creation, the returned object doesn't have the sections property
				// Manually add it here so it can be referenced in future tests
				courseBody.sections = [];
			})
			.expect(201, done);
	});

	it('Should create a section for the newly created Course', done => {
		var dates = getDates();

		var startTime   = dates.start;
		var endTime     = dates.end;
		var sectionName = "AL1";

		request(sails.hooks.http.app)
			.post('/section/')
			.send({
				startTime,
				endTime,
				"name": sectionName,
				"course": courseBody.id
			})
			.expect(res => {
				sectionBody = res.body;
				// Check that properties of returned section are appropriately defined and valued
				// startTime and endTime are returned as string formatted Dates, so need to convert them back to Date type
				sectionBody.should.have.property("startTime");
				var resStartTime = new Date(sectionBody.startTime);
				resStartTime.getHours().should.equal(startTime.getHours());
				resStartTime.getMinutes().should.equal(startTime.getMinutes());
				
				sectionBody.should.have.property("endTime");
				var resEndTime = new Date(sectionBody.endTime);
				resEndTime.getHours().should.equal(endTime.getHours());
				resEndTime.getMinutes().should.equal(endTime.getMinutes());
				
				sectionBody.should.have.property("name");
				sectionBody.name.should.equal(sectionName);
				
				sectionBody.should.have.property("course");
				sectionBody.course.should.equal(courseBody.id);
			})
			.expect(201, done);
	});

	it('Should read the previously created course and check that it now contains the section linked with it', done => {
		request(sails.hooks.http.app)
			.get(`/course/${courseBody.id}`)
			.expect(res => {
				courseBody = res.body;
				// Just need to check that courseBody.sections contains the newly created section
				courseBody.should.have.property('sections');
				courseBody.sections.should.have.length(1);
				courseBody.sections[0].id.should.equal(sectionBody.id);
			})
			.expect(200, done);
	});

	it('Should be able to delete the course', done => {
		request(sails.hooks.http.app)
			.del(`/course/${courseBody.id}`)
			.expect(res => {
				// Upon deletion, the deleted object is sent as a response.
				// Make sure its the same object that we expected to be deleted
				courseBody.should.eql(res.body);
			})
			.expect(200, done);
	});

	it('Should be able to delete the section record', done => {
		request(sails.hooks.http.app)
			.del(`/section/${sectionBody.id}`)
			.expect(200, done);
	});
});