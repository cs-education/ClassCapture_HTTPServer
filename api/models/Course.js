/**
* Course.js
*
* @description :: Schema for Courses with relevant course metadata and linking to specific course sections
* @docs        : http://sailsjs.org/#!documentation/models
*/

var StatusError = require('statuserror');

const DEPT_MIN_LENGTH = 2;
const DEPT_NAME_REGEX = new RegExp(/^[A-Z]+$/);

module.exports = {
	"types": {
		"isDepartmentName": function (deptName) {
			return DEPT_NAME_REGEX.test(deptName);
		}
	},
	"attributes": {
		"department": { // Example: In "CS 225", department is "CS"
			"type": "string",
			"required": true,
			"isDepartmentName": true,
			"minLength": DEPT_MIN_LENGTH
		},
		"number": { // Example: In "CS 225", number is "225"
			"type": "integer",
			"required": true
		},
		"sections": { // Example: CS 225 may have 2 lecture sections, 5 lab sections, & 5 discussion sections
			"collection": "Section",
			"via": "course"
		},
		"year": { // Example: CS 225 in the year 2015
			"type": "integer",
			"required": true
		},
		"semester": { // Example: fall, spring, or summer semesters.
			"type": "string",
			"enum": ["spring", "summer", "fall"],
			"required" : true
		},
	},

	// Lifecycle Callbacks
	beforeCreate: function (values, next) {
		const validators = [CatalogValidationService.isUniqueCourse, CatalogValidationService.isValidCourse];
		
		async.every(validators, (validator, cb) => validator(values, cb), isValid => {
			if (isValid) {
				next();
			} else {
				next(new StatusError(400, 'Not a valid course'));
			}
		});
	},

	beforeUpdate: function (values, next) {
		next(new StatusError(400, "Course Entries Cannot Be Modified")); 
	}
};

