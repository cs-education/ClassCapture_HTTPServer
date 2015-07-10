/**
* Course.js
*
* @description :: Schema for Courses with relevant course metadata and linking to specific course sections
* @docs        :: http://sailsjs.org/#!documentation/models
*/

const DEPT_MIN_LENGTH = 2;

module.exports = {

	"attributes": {
		"department": { // Example: In "CS 225", department is "CS"
			"type": "string",
			"required": true,
			"minLength": DEPT_MIN_LENGTH
		},
		"number": { // Example: In "CS 225", number is "225"
			"type": "integer",
			"required": true
		},
		"sections": { // Example: CS 225 may have 2 lecture sections, 5 lab sections, & 5 discussion sections
			"collection": "Section",
			"via": "course",
			"defaultsTo": []
		}
	}
};

