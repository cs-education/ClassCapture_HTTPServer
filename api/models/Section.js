/**
* Section.js
*
* @description :: Schema to contain all metadata related to a course section such as timing
* @docs        :: http://sailsjs.org/#!documentation/models
*/

const MIN_SECTION_NAME_LENGTH = 2;
const UUID_PATTERN = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

module.exports = {
	"types": {
		"isUUID": uuid => {
			var matches = uuid.match(UUID_PATTERN);
			return _.isArray(matches) && matches.length === 1;
		}
	},
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
		},
		"echo360UUID": {
			"type": "string",
			"isUUID": true
		}
	}
};

