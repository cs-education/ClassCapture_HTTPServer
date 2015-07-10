/**
* Section.js
*
* @description :: Schema to contain all metadata related to a course section such as timing
* @docs        :: http://sailsjs.org/#!documentation/models
*/

const MIN_SECTION_NAME_LENGTH = 2;

module.exports = {
	"types": {
		"isStartEndPaired": function () {
			// Can only have startTime attr if there is also an endTime attr
			return _.has(this, "startTime") && _.has(this, "endTime");
		}
		"isChronological": function () {
			// Check that startTime is in fact before endTime
			return this.startTime < this.endTime;
		}
	},
	"attributes": {
		// Timing
		"startTime": {
			"type": "date",
			"isStartEndPaired": true,
			"isChronological": true
		},
		"endTime": {
			"type": "date",
			"isStartEndPaired": true,
			"isChronological": true
		},
		// Common example of section name: "AL1"
		"name": {
			"type": "string",
			"required": true,
			"minLength": MIN_SECTION_NAME_LENGTH
		},
		"course": {
			"model": "Course",
			"required": true
		}
	}
};

