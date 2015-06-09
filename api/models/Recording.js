/**
* Recording.js
*
* @description :: Model that contains metadata for a recording as well as path to video stored on disk
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var path = require("path");
var fs   = require("fs");

module.exports = {
	// Unique name for this model
	"types": {
		"is_start_time": function () {
			// Check that startTime is in fact before endTime
			return this.startTime < this.endTime;
		}
	},
	"identity": 'recording',
	"attributes": {
		"startTime": {
			"type": 'date',
			"required": true,
			"is_start_time": true
		},
		"endTime": {
			"type": 'date',
			"required": true
		},
		"filename": {
			"type": 'string',
			"required": true,
			"unique": true
		}
	},

	// Lifecycle callbacks (more info: http://sailsjs.org/#!/documentation/concepts/ORM/Lifecyclecallbacks.html)
	// Before validation, create the filename with the given startTime and endTime.
	// Also use current timestamp and a random value to make filename unique
	beforeValidate: function (values, cb) {		
		// Set the filename of the values object to the one generated
		values.filename = RecordingService.generateRecordingTitle(values);
		
		// Call the callback in the future to maintain caller consistency
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