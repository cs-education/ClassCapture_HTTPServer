/**
 * Does User Authentication using expiring cookies
 * Cookies are a JWT which contain the logged in Users ID.
 * This ID is used to look up the users information
 */

var jwt = require('jsonwebtoken');
var StatusError = require('statuserror');

const JWT_SECRET = sails.config.jwtSecret;
const JWT_EXPIRATION = sails.config.jwtExpiration;

module.exports = function (req, res, next) {
	if (!_.has(req.cookies, 'user')) {
		res.negotiate(new StatusError(403, 'No Login Credentials'));
		return;
	}

	jwt.verify(req.cookies.user, JWT_SECRET, (err, payload) => {
		if (err) {
			// Token must have expired
			res.negotiate(new StatusError(401, 'Corrupt Credentials'));
			return;
		}

		id       = payload.id;
		email    = payload.email;
		password = payload.password;

		User.findOne({id, email, password})
		.populateAll()
		.exec((err, user) => {
			if (err) {
				res.negotiate(new StatusError(401, "Invalid Credentials"));
			} else {
				req.user = user;
				next();
			}
		});
	});


};