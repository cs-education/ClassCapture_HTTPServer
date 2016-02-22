/**
 * VideoController
 *
 * @description :: Server-side logic for managing videos
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var path = require("path");
var fs   = require('fs');
var StatusError = require('statuserror');

const MAX_FILE_SIZE = sails.config.maxVideoSizeBytes; // in bytes

// Map from video name of a currently uploading video to Promise that is resolved upon upload completion
// Entries must be deleted upon video upload completion
const currUploadingVideos = {};

// get extension for a given filename. Returns null if doesn't have an extension
function getFileExtension(filename) {
	var extensionIdx = filename.lastIndexOf(".");

	if (extensionIdx <= 0) {
		return null;
	}

	var extension = filename.substring(extensionIdx + 1);
	
	return extension;
}

module.exports = {
	/**
	 * Handles all POST/PUT requests to /video/:videoname
	 * Request header should contain key-value pair of 'video': <video content>
	 * Video content from header will be stored in ./assets/videos/{videoname}
	 */
	uploadVideo: (req, res) => {
		var videoName = req.param('videoname');

		// The upload promise
		currUploadingVideos[videoName] = new Promise((resolve, reject) => {
			// File will be in header key 'video'
			req.file("video").upload({
				"dirname": VideoService.SAVED_VIDEOS_DIR,
				"saveAs": videoName,
				"maxBytes": MAX_FILE_SIZE // file upload limit
			}, function (err, uploadedFiles) {
				if (err) {
					res.negotiate(err);
					reject(err);
					delete currUploadingVideos[videoName]; // remove the entry as garbage collection
					return;
				}

				/**
				 * Example of uploadedFile (element of uploadedFiles array):
				 * {
				 * 		fd: "/Users/sourabhdesai/Documents/Node Projects/ClassCapture/assets/videos/jmarr_dashboard.mp4",
				 * 		size: 1387084,
				 * 		type: "video/mp4",
				 * 		filename: "Johnny Marr plays Dashboard by Modest Mouse.mp4",
				 * 		status: "bufferingOrWriting",
				 * 		field: "video"
				 * }
				 */

				var uploadedFile = uploadedFiles[0];

				var fileExtension = getFileExtension(uploadedFile.filename);

				// Check that the file is in fact an mp4 video file
				if (uploadedFile.type === 'video/mp4' || fileExtension === 'mp4') {

					// Update the updatedAt field for a given recording
			        sails.models.recording.update({filename: videoName}, {}).exec(function (err, updated) {
						if (err) {
							sails.log('could not find recording for video: ' + videoName);
							sails.log(err);
							reject(err);
						} else {
							// On success, will just display the uploadedFile's metadata
							res.json({
								"videoname": videoName,
								"size": uploadedFile.size, // In bytes
								"type": uploadedFile.type
							});
							resolve(videoName);
						}

						delete currUploadingVideos[videoName]; // remove the entry as garbage collection
			        });
				} else {
					// If not an mp4, respond with a 400 (Bad Request) and delete the saved video file
					var err = new StatusError(400, `Server only accepts mp4 format video files. Given file extension: ${fileExtension}`);
					res.negotiate(err);

					// Delete the saved video file ... uploadedFile.fd is a string of the filepath for the saved file.
					fs.unlink(uploadedFile.fd, err => {
						if (err)
							sails.log(err);
					});

					reject(err);
					delete currUploadingVideos[videoName]; // remove the entry as garbage collection
				}
			});
		});
	},

	/**
	 * Handles all GET requests to /video/:videoname
	 * Video to send out is in :videoname URL parameter.
	 */
	getVideo: (req, res) => {
		var videoName = req.param("videoname");
		// In case the video trying to be retrieved is in the process of upload, must take this precaution
		var videoUploadPromise = currUploadingVideos[videoName] || Promise.resolve();
		
		videoUploadPromise
		.then(() => {
			// Specify the directory of the file with "root"
			var opts = {
				"root": VideoService.SAVED_VIDEOS_DIR
			};

			// Internally takes care of setting Content-Type
			res.sendfile(videoName, opts, err => {
				if (err) {
					res.negotiate(err);
				}
			});
		})
		.catch(err => {
			res.negotiate(err);
		});
	},

	deleteVideo: (req, res) => {
		var videoName = req.param("videoname");
		VideoService.deleteVideo(videoName, err => {
			if (err) {
				return res.negotiate(err);
			}

			res.json({
				"message": `${videoName} has been deleted`
			});
		});
	}
};
