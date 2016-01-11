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

					var token = jwt.sign(payload, JWT_SECRET, {
						expiresIn: JWT_EXPIRATION
					});

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
			sails.log("UserController.me\t pringint user");
			sails.log(JSON.stringify(req.user, null, 2));
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
		var hasRequiredAttrs = UserService.REQUIRED_USER_ATTRS.every(attr => _.has(userInfo, attr));
		var hasInvalidAttrs = UserService.INVALID_REGISTRATION_ATTRS.some(attr => _.has(userInfo, attr));

		if (!hasRequiredAttrs) {
			res.negotiate(new StatusError(400, "Missing Some Required Attributes for Registration"));
		} else if (hasInvalidAttrs) {
			res.negotiate(new StatusError(400, `Cannot attatch the following properties upon registration: ${UserService.INVALID_REGISTRATION_ATTRS.join(", ")}`));
		} else {
			User.create(userInfo)
			.exec((err, user) => {
				if (err) {
					res.negotiate(err);
				} else {
					user = _.clone(user); // if you don't clone, you wont be able to add sections and comments below

					// Generate the cookie to be set on the client side
					var payload = {
						id: user.id,
						email: user.email,
						password: user.password // passwords are stripped from exec response
					};

					var token = jwt.sign(payload, JWT_SECRET, {
						expiresIn: JWT_EXPIRATION
					});

					res.cookie('user', token, {httpOnly: true});

					// Artificially attatch sections and comments empty lists to user object
					user.sections = [];
					user.comments = [];

					// hide the password from the client
					delete user.password;
					
					res.json(user);
				}
			});
		}
	}
};

