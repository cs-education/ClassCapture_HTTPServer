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
			"type": "datetime",
			"required": true,
			"isStartTime": true
		},
		"endTime": {
			"type": "datetime",
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
	beforeCreate: function (values, cb) {
		// Before creation, create the filename with the given startTime and endTime.
		values.filename = RecordingService.generateRecordingTitle(values);

		process.nextTick(cb);
	},

	// After deletion, delete the video files corresponding to each recording
	afterDestroy: function(destroyedRecords, cb) {
		// Delete the video files for the recordings
		async.each(destroyedRecords, VideoService.deleteVideoForRecording, function (err) {
			if (err) {
				sails.log.info(err);
			}
			cb();
		});
	}
};