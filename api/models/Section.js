/**
* Section.js
*
* @description :: Schema to contain all metadata related to a course section such as timing
* @docs        :: http://sailsjs.org/#!documentation/models
*/

const MIN_SECTION_NAME_LENGTH = 2;

module.exports = {

	"attributes": {
		// Common example of section name: "AL1"
		"name": {
			"type": "string",
			"required": true,
			"minLength": MIN_SECTION_NAME_LENGTH
		},
		"course": {
			"model": "Course",
			"required": true
		},
		"students": {
			"collection": "User",
			"via": "sections",
			dominant: true
		}
	}
};

