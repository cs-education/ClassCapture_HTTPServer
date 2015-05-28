/**
* Recording.js
*
* @description :: Model that contains metadata for a recording as well as path to video stored on disk
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var path = require("path");
var fs   = require("fs");

var FILE_EXTENSION = 'mp4'; // Only accepted file format
var RAND_RANGE = 10e3; // Range for random number value attached to each filename

module.exports = {
	// Unique name for this model
	"types": {
		"is_start_time": function (startTime) {
			// Check that startTime is in fact before endTime
			return startTime < this.endTime;
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
		var currTimeMillis = Date.now(); // curr millis since epoch
		var randVal = Math.round(Math.random() * RAND_RANGE); // some random int within specified range
		
		// Stringify the values and delimit them with underscores
		var fileTitle = [
			new Date(values.startTime).getTime(),
			new Date(values.endTime).getTime(),
			currTimeMillis,
			randVal
		].map(String).join('_');

		// Attatch the file extension with a dot before it
		var filename = [fileTitle, FILE_EXTENSION].join('.');
		
		// Set the filename of the values object to the one just generated
		values.filename = filename;
		
		// Call the callback in the future to maintain caller consistency
		process.nextTick(function () {
			cb();
		});
	},

	// After deletion, delete the video files corresponding to each recording
	afterDestroy: function(destroyedRecords, cb) {
		// Extract video filenames from records
		var vidsDir = path.resolve("./assets/videos");
		
		var filepaths = destroyedRecords.map(function (record) {
			return path.join(vidsDir, record.filename);
		});

		// First check which of the files are existent
		async.filter(filepaths, fs.exists, function (filesToDelete) {
			// Then delete the ones that do exist
			async.each(filesToDelete, fs.unlink, function (err) {
				if (err)
					sails.log(err);
				cb();
			});
		});
	}
};