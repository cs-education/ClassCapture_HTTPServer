/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

exports.login = function (req, res) {
	var userEmail = req.body.email;
	var userPassword = req.body.password;

	// Both email & password must be given for login
	if (_.isUndefined(userEmail) || _.isUndefined(userPassword)) {
		return res.badRequest("Must provide Email and Password to login");
	}

	// store only email & password in creds arg
	var creds = {
		"email": userEmail,
		"userPassword": userPassword
	};

	// Creates token using internal signature secret
	JWTService.generateTokenFromCreds(creds, function (err, token) {
		if (err) {
			return res.negotiate(err);
		}

		// send access token in response body
		res.json({
			"accessToken": token
		});
	});
};

