/**
 * This policy has the following two preconditions:
 * 	- This policy must be inserted after the isAuthenticated policy
 * 	- It must be a update/delete request for a user resource
 */

var StatusError = require('statuserror');

module.exports = (req, res, next) => {
	if (req.user) {
		var updatingUserID = parseInt(req.param("id")); // the User resource that the client is trying to update
		var loggedInUserID = req.user.id; // the ID

		if (updatingUserID === loggedInUserID) {
			next(); // update is for the same user as the logged in user
		} else {
			res.negotiate(new StatusError(403, "Can only make Update/Delete to User that You are Logged in As"));
		}
	} else {
		res.negotiate(new StatusError(400, 'No User Data'));
	}
};