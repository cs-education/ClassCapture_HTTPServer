/**
 * jwtAuth
 *
 * @module      :: Policy
 * @description :: JSON Web Tokens policy to allow users with a valid JWT under Authentication header
 *                 Assumes that your login action in one of your controllers gives client a JWT
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

const FORBIDDEN_MESSAGE = "Cannot Access Specified Resource";

module.exports = function (req, res, next) {
	if (!_.has(req.headers, "Authorization")) {
		return res.forbidden(FORBIDDEN_MESSAGE);
	}

	var token = req.headers["Authorization"];

	JWTService.decodeToken(token, function (err, decodedUserCreds) {
		if (err) {
			sails.log(err);
			return res.forbidden(FORBIDDEN_MESSAGE);
		}

		// Verify that this is in fact a user in the DB
		UserService.existsUserWithCredentials(decodedUserCreds, function (userExists) {
			if (userExists) {
				// Successfully authenticated request via JSON web token
				next();
			} else {
				// Some bogus user, dont trust this token
				res.forbidden(FORBIDDEN_MESSAGE);
			}
		});
	});
};