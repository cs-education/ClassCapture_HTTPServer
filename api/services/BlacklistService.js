/**
Blacklist is persisted in assets/blacklist.json
Read ops on blacklist are done in-memory, and writes are updated in-memory and on-disk
*/

var path        = require("path");
var fs          = require("fs");
var StatusError = require("statuserror");

const BLACKLIST_FILEPATH = path.resolve("./assets/blacklist.json");

var blacklistIDSetStr = String(fs.readFileSync(BLACKLIST_FILEPATH));
var blacklistIDSet = JSON.parse(blacklistIDSetStr);

exports.DEVICE_ID_HEADER_NAME = "consumer-device-id";

// IDs are in the keys of the `blacklistIDSet` object map
exports.getBlacklist = () => Object.keys(blacklistIDSet);

// Just reads from in-memory set of blacklist IDs
exports.isInBlacklist = deviceID => deviceID in blacklistIDSet;

// writes JSON representation of Blacklist to designated filepath
exports.backupToDisk = cb => {
	var blacklistIDSetStr = JSON.stringify(blacklistIDSet);
	fs.writeFile(BLACKLIST_FILEPATH, blacklistIDSetStr, err => {
		cb(err);
	});
};

// Adds deviceID to blacklist set and writes it to blacklist.json file for persistence
exports.addToBlacklist = (deviceID, cb) => {
	blacklistIDSet[deviceID] = true; // keys are whats important, value is irrelevant
	exports.backupToDisk(cb);
};

// Remove a single ID form the Blacklist.
// Returns boolean representing that the give ID was in the blacklist to begin with
exports.removeFromBlacklist = (deviceID, cb) => {
	if (exports.isInBlacklist(deviceID)) {
		delete blacklistIDSet[deviceID];
		return exports.backupToDisk(err => cb(err, true))
	}

	process.nextTick(() => cb(null, false));
}

// Some more operations for testing purposes

// Get number of blacklisted IDs
exports.blacklistSize = () => Object.keys(blacklistIDSet).length;

// Clear blacklist
exports.clearBlacklist = cb => {
	blacklistIDSet = {}; // clear it by overwriting with empty set
	exports.backupToDisk(cb);
};