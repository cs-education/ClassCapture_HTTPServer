/**
 * The LDAPService.isValidNetID function will check whether a given netid is valid by
 * checking it against the actual UIUC LDAP server.
 * This is problematic for tests as the emails (of format netid@illinois.edu) are generated randomly.
 * This module will allow you to switch between the actual functionality of LDAPService.isValidNetID and a mock
 * functionality which just returns true for every netID that is given as input.
 */

var ORIGINAL_FUNC = null;

exports.startMocking = () => {
	ORIGINAL_FUNC = ORIGINAL_FUNC || LDAPService.isValidNetID;

	LDAPService.isValidNetID = (netID, cb) => {
		process.nextTick(() => cb(true)); // just say its valid regardless of input
	};
};

exports.stopMocking = () => {
	// Restore original functionality
	LDAPService.isValidNetID = ORIGINAL_FUNC || LDAPService.isValidNetID;
};