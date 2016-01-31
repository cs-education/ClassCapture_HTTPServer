/**
 * Does User Authentication using expiring cookies
 * Cookies are a JWT which contain the logged in Users ID.
 * This ID is used to look up the users information
 */

var jwt = require('jsonwebtoken');
var StatusError = require('statuserror');

module.exports = function (req, res, next) {
	if (!_.has(req.cookies, AuthService.COOKIE_FIELD_NAME)) {
		res.negotiate(new StatusError(403, 'No Login Credentials'));
		return;
	}

	AuthService.verifyToken(req.cookies[AuthService.COOKIE_FIELD_NAME], (err, payload) => {
		if (err) {
			// Token must have expired
			return res.negotiate(new StatusError(400, err.message || 'Corrupt Credentials'));
		}

		var id       = payload.id;
		var email    = payload.email;
		var password = payload.password;

		User.findOne({id, email, password})
		.populateAll()
		.exec((err, user) => {
			if (err) {
				res.negotiate(new StatusError(401, "Invalid Credentials"));
			} else {
				req.user = _.clone(user);
				next();
			}
		});
	});


};