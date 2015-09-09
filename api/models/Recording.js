/**
* Recording.js
*
* @description :: Schema that contains metadata for a recording as well as path to video stored on disk
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var path = require("path");
var fs   = require("fs");

module.exports = {
	"types": {
		"isStartTime": function () {
			// Check that startTime is in fact before endTime
			if (_.has(this, 'startTime') && _.has(this, 'endTime')) {
				return this.startTime < this.endTime;
			}
			// Don't have enough info to make this validaiton...may only be updating either start or end time
			return true;
		}
	},
	"identity": 'recording',
	"attributes": {
		"startTime": {
			"type": "date",
			"required": true,
			"isStartTime": true
		},
		"endTime": {
			"type": "date",
			"required": true
		},
		"filename": {
			"type": "string",
			"unique": true
		},
		"section": {
			"model": "Section",
			"required": true
		}
	},

	// Lifecycle callbacks (more info: http://sailsjs.org/#!/documentation/concepts/ORM/Lifecyclecallbacks.html)
	beforeUpdate: function (values, cb) {
		console.log('typeof values.startTime: ' + typeof values.startTime);
		console.log('typeof values.endTime: ' + typeof values.endTime);
		// Call the callback in the future to maintain caller consistency
		process.nextTick(cb);
	},

	beforeCreate: function (values, cb) {
		// Before creation, create the filename with the given startTime and endTime.
		values.filename = RecordingService.generateRecordingTitle(values);

		process.nextTick(cb);
	},

	// After deletion, delete the video files corresponding to each recording
	afterDestroy: function(destroyedRecords, cb) {
		// Delete the video files for the recordings
		async.each(destroyedRecords, RecordingService.deleteFileForRecording, function (err) {
			if (err) {
				sails.log(err);
			}
			cb();
		});
	}
};