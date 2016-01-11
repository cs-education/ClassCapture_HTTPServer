/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var jwt = require('jsonwebtoken');
var StatusError = require('statuserror');

const JWT_SECRET = sails.config.jwtSecret;
const JWT_EXPIRATION = sails.config.jwtExpiration;

module.exports = {
	login: (req, res) => {
		var creds = req.body;

		if (_.has(creds, 'email') && _.has(creds, 'password')) {
			User.findOne({
				email: creds.email,
				password: creds.password
			})
			.populate('sections')
			.populate('comments')
			.exec((err, user) => {
				if (err) {
					res.negotiate(err);
				} else {
					var payload = {
						id: user.id,
						email: user.email,
						password: creds.password // passwords are stripped from exec response
					};

					var token = AuthService.signPayload(payload);

					res.cookie('user', token, {httpOnly: true});
					res.json(user);
				}
			});
		} else {
			res.negotiate(new StatusError(400, "Must provide login credentials (email & password)"));
		}
	},

	me: (req, res) => {
		if (req.user) {
			res.json(req.user);
		} else {
			res.negotiate(new StatusError(500, "Couldn't find user info"));
		}
	},

	logout: (req, res) => {
		res.clearCookie('user');
		res.json({
			message: "Logged Out"
		});
	},

	register: (req, res) => {
		var userInfo = req.body;

		AuthService.registerNewUser(userInfo, (err, user) => {
			if (err) {
				return res.negotiate(err);
			}

			// Generate the cookie to be set on the client side
			var payload = {
				id: user.id,
				email: user.email,
				password: userInfo.password // passwords are stripped from registerNewUser response
			};

			var token = AuthService.signPayload(payload);

			res.cookie('user', token, {httpOnly: true});
			res.json(user);
		});
	}
};

