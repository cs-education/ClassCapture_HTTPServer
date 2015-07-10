/**
 * Easy layer for interaction with JWT module
 */

var jwt = require('jsonwebtoken');

// This constant will be used to sign the JWTs
const TOKEN_SIGNATURE = "do_not-REVEAL-2_ANY1$5b03se4gf54gf";

/**
 * Given a User ID, will generate a JWT
 */
exports.generateTokenFromId = function (id, cb) {
	User
		.findOne()
		.where({
			"id": id
		})
		.exec(function (err, user) {
			if (err) {
				return cb(err);
			}

			// Generate JWT given user metadata
			var jwtData = {
				id: user.id,
				email: user.email,
				password: user.password
			};

			var token = jwt.sign(jwtData, TOKEN_SIGNATURE);

			cb(null, token);
		});
};

/**
 * Given credentials for a User (email & password), will generate a JWT
 */
exports.generateTokenFromCreds = function (creds, cb) {
	var hasCreds = _.has(creds, "email") && _.has(creds, "password");

	if (!hasCreds) {
		process.nextTick(function () {
			cb(new Error("creds arg passed to 'existsUserWithCredentials' must have email & password"));
		});
		return;
	}

	UserService.findUserWithCredentials(creds, function (err, user) {
			if (err) {
				return cb(err);
			}

			// Generate JWT given user metadata
			var jwtData = {
				id: user.id,
				email: user.email,
				password: user.password
			};

			var token = jwt.sign(jwtData, TOKEN_SIGNATURE);

			cb(null, token);
	});
};

exports.decodeToken = function (token, cb) {
	jwt.verify(token, TOKEN_SIGNATURE, function (err, decoded) {
		cb(err, decoded);
	});
};