var path        = require("path");
var fs          = require('fs');
var os          = require('os');
var StatusError = require("statuserror");

// Directory where all videos will be saved...this is an absolute path
exports.SAVED_VIDEOS_DIR = path.join(os.homedir(), "classcapture_videos");

// Given a filename for a video, delete the video from the local file system
exports.deleteVideo = (filename, cb) => {
	var videoPath = path.join(exports.SAVED_VIDEOS_DIR, filename);
	
	// First check if the video exists 
	fs.exists(videoPath, function (exists) {
		if (exists) {
			// Delete the file if it exists
			fs.unlink(videoPath, function (err) {
				cb(err);
			});
		} else {
			// Pass an error to the callback if couldn't find the file
			cb(new StatusError(404,`Video doesn't exist at specified path: ${videoPath}`));
		}
	});
};

// Given a recording object, will delete the video file for the recording.
exports.deleteVideoForRecording = function (recording, cb) {
	exports.deleteVideo(recording.filename, cb);
};