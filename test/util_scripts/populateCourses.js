/**
 * Gets a list of all the courses for a given semester, and creates a course entry in the API
 * Given endpoint must be for the WebApp which proxies '/api/' requests to the API Server
 */
const readline = require('readline');
const Chance  = require('chance');
const async    = require('sails/node_modules/async');
const _        = require('sails/node_modules/lodash');
const request  = require('request');
const helpers  = require('./helpers');

const chance = new Chance();

const DEFAULT_API_ENDPOINT = 'http://localhost:9000/';

const MOCK_DEVICE_ID = chance.word();

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
	var departments = null;

	it('Should obtain the list of all departments', done => {
		request(`http://courses.illinois.edu/cisapp/explorer/catalog/${year}/${semester}.xml`, (err, response, body) => {
				if (err) {
					done(err);
				} else {
					// Parse the xml and store the departments data into the departments variable
					helpers.extractDepartmentsFromXML(body, (err, parsedDepts) => {
						if (err) {
							return done(err);
						}
						departments = parsedDepts;
						done();
					});
				}
			});
	});

	var courses = [];

	it('Should get all courses under each department', done => {
		// this.slow(20e3); // allows this test to take at least 20 seconds before timing out
		function getDepartmentCourses(dept, cb) {
			request(`http://courses.illinois.edu/cisapp/explorer/catalog/${year}/${semester}/${dept}.xml`, (err, response, body) => {
				if (err) {
					return cb(err);
				}
				
				helpers.extractCoursesFromXML(body, (err, courseNums) => {
					if (err) {
						return cb(err);
					}

					var courses = courseNums.map(courseNum => {
						return {
							year: Number(year),
							semester: String(semester),
							department: String(dept),
							number: Number(courseNum)
						};
					});

					console.log(`Got ${courses.length} courses under ${dept} department`);

					cb(null, courses);
				});
			});
		}

		async.map(departments, getDepartmentCourses, (err, deptCourses) => {
			if (err) {
				return done(err);
			}

			courses = _.flatten(deptCourses);
			done();
		});
	});

	it('Should create an entry for each of the courses to the backend', done => {
		function createCourseEntry(course, cb) {
			agent
				.post('api/course')
				.set("consumer-device-id", MOCK_DEVICE_ID)
				.send(course)
				.expect(201)
				.end((err, res) => {
					if (err) {
						cb(err);
					} else {
						var resCourse = res.body;
						// Print without trailing newline to preserve room in terminal
						process.stdout.write(`Created ${resCourse.department} ${resCourse.number}\t`);
						cb(resCourse);
					}
				});
		}

		async.map(courses, createCourseEntry, (err, courses) => {
			if (err) {
				done(err);
			} else {
				console.log('\nDone creating courses!');

				var ids = _.pluck(courses, 'id');

				console.log('Printing IDs for Created Courses');
				console.log(JSON.stringify(ids, null, 2));
				done();
			}
		});
	});

});