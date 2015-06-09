var path = require("path");
var fs   = require('fs');

exports.FILE_EXTENSION = 'mp4'; // Only accepted file format

exports.RAND_RANGE = 10e3; // Range for random number value attached to each filename

// Directory where all videos will be saved...this is an absolute path
exports.SAVED_VIDEOS_DIR = path.resolve("./assets/videos");

// Given a recording object, will delete the video file for the recording.
exports.deleteFileForRecording = function (recording, cb) {
	var videoPath = path.join(exports.SAVED_VIDEOS_DIR, recording.filename);
	fs.exists(videoPath, function (exists) {
		if (exists) {
			// Delete the file if it exists
			fs.unlink(videoPath, function (err) {
				cb(err);
			});
		} else {
			// Pass an error to the callback if couldn't find the file
			cb(new Error("Video doesn't exist at specified path: " + videoPath));
		}
	});
};

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