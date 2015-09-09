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
		},
		"isChronological": function () {
			// Check that startTime is in fact before endTime
			return this.startTime < this.endTime;
		}
	},
	"attributes": {
		// Timing
		// Dont want start and end times to be required attributes since some course sections do not have hard set timings (e.g. Independent Study courses).
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
	},

	"beforeValidate": function (values, cb) {
		// Only update times to epoch if both are present
		if (_.has(values, "startTime") && _.has(values, "endTime")) {
			// Change startTime and endTime to be at the same time of day, but have the date of epoch
			var epochStartTime = new Date(0);
			var epochEndTime   = new Date(0);

			// Update hours
			epochStartTime.setHours(values.startTime.getHours());
			epochEndTime.setHours(values.endTime.getHours());

			// Update minutes
			epochStartTime.setMinutes(values.startTime.getMinutes());
			epochEndTime.setMinutes(values.endTime.getMinutes());

			// Update the start and end times of the actual object
			values.startTime = epochStartTime;
			values.endTime   = epochEndTime;
		}

		// Call the callback in the future to maintain caller consistency
		process.nextTick(cb);
	}
};

