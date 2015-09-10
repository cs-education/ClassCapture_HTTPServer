var path = require("path");
var fs   = require('fs');

exports.FILE_EXTENSION = 'mp4'; // Only accepted file format

exports.RAND_RANGE = 10e3; // Range for random number value attached to each filename

// Given the values for a Recording object, generate a *unique* filename for the recording.
exports.generateRecordingTitle = function (values) {
	var currTimeMillis = Date.now(); // curr millis since epoch
	var randVal = Math.round(Math.random() * exports.RAND_RANGE); // some random int within specified range
	
	// Stringify the values and then delimit them with underscores
	var fileTitle = [
		new Date(values.startTime).getTime(),
		new Date(values.endTime).getTime(),
		currTimeMillis,
		randVal
	].map(String).join('_');

	// Attatch the file extension with a dot before it
	var filename = [fileTitle, exports.FILE_EXTENSION].join('.');
	
	// Set the filename of the values object to the one just generated
	return filename;
};