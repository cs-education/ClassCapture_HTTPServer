var request = require('supertest');
var chai    = require("chai");
var Chance  = require('chance');
var _       = require('sails/node_modules/lodash');

var chance = new Chance();
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

const NUM_COURSES = 1;

function createCourse(dept, num, semester, year) {
	const MOCK_DEVICE_ID = "TESTTEST$$TESTTEST";
	it(`Should create a Course Entry called "${dept} ${num}, ${semester} ${year}"`, done => {
		request(sails.hooks.http.app)
			.post('/course/')
			.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
			.send({
				"department": dept,
				"number": num,
				"year": year,
				"semester": semester
			})
			.expect(res => {
				var courseBody = res.body;
				courseBody.should.have.property('department');
				courseBody.department.should.equal(dept);
				courseBody.should.have.property('number');
				courseBody.number.should.equal(num);
				courseBody.should.have.property('id');
				courseBody.should.have.property('year');
				courseBody.year.should.equal(year);
				courseBody.should.have.property('semester');
				courseBody.semester.should.equal(semester);

				// Upon creation, the returned object doesn't have the sections property
				// Manually add it here so it can be referenced in future tests
			 	courseBody.sections = [];
			})
			.expect(201, done);
	});
}

describe(`Create ${NUM_COURSES} Course Entries`, () => {
	var courseDept = "CS";
	var courseNum = 225;
	var semester = "fall";
	var year = 2015;
	createCourse(courseDept, courseNum, semester, year);

	courseNum = 410;
	semester = "spring"
	createCourse(courseDept, courseNum, semester, year);
});
