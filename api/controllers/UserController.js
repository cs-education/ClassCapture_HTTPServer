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
				} if (_.isUndefined(user)) {
					res.negotiate(new StatusError(401, "Invalid Credentials"));
				} else {
					var cookie = AuthService.getUserCookie({
						id: user.id,
						email: user.email,
						password: user.password
					});

					var resUser = _.clone(user);
					resUser = UserService.hideHiddenUserFields(resUser);

					res.cookie(AuthService.COOKIE_FIELD_NAME, cookie, {httpOnly: true});
					res.json(resUser);
				}
			});
		} else {
			res.negotiate(new StatusError(400, "Must provide login credentials (email & password)"));
		}
	},

	me: (req, res) => {
		if (req.user) {
			var resUser = UserService.hideHiddenUserFields(req.user);
			res.json(resUser);
		} else {
			res.negotiate(new StatusError(404, "Couldn't find user info"));
		}
	},

	logout: (req, res) => {
		res.clearCookie(AuthService.COOKIE_FIELD_NAME);
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

			// Generate the cookie to be set on the client side cookie
			var cookie = AuthService.getUserCookie(user);

			user = UserService.hideHiddenUserFields(user);

			res.cookie(AuthService.COOKIE_FIELD_NAME, cookie, {httpOnly: true});
			res.status(201);
			res.json(user);
		});
	},

	createUser: (req, res) => {
		res.negotiate(new StatusError(404, "Can't use this endpoint to create users. Please use '/user/register' instead"));
	},

	update: (req, res) => {
		var userID = parseInt(req.param("id"));
		// First check that user is authenticated
		if (!_.has(req, AuthService.COOKIE_FIELD_NAME)) {
			return res.negotiate(new StatusError(400, "Must Be Logged in as the User you are trying to update"));
		} else if (req.user.id !== userID) {
			return res.negotiate(403, "Can only Make Updates to User that You are Logged in As");
		} else {
			var updatedInfo = req.body || {};

			// User must provide password if they want to update their record
			if (!_.has(updatedInfo, 'password')) {
				res.negotiate(400, 'Usre update requests must provide the current users password');
			} else {
				var currentPassword = updatedInfo.password;
				updatedInfo.password = updatedInfo.newPassword || currentPassword; // new password is stored in a field called 'newPassword'
				
				// Only choose updateable fields
				updatedInfo = _.pick(updatedInfo, UserService.UPDATEABLE_FIELDS);

				var searchCriteria = {
					id: userID,
					password: currentPassword
				};

				User.update(searchCriteria, updatedInfo)
				.exec((err, updatedUser) => {
					// update returns a list of updated records...in this case it should always be a list of size 1
					updatedUser = _.isArray(updatedUser) ? _.first(updatedUser) : updatedUser;
					
					if (err) {
						res.negotiate(err);
					} else if (_.isUndefined(updatedUser)) {
						res.negotiate(new StatusError(404, `Couldn't locate user with ID ${userID}`));
					} else {
						// Must do one final find query to retrieve user data with updated fields
						User.findOne(updatedUser.id)
						.populateAll()
						.exec((err, user) => {
							if (err) {
								res.negotiate(err);
							} else if (_.isUndefined(user)) {
								res.negotiate(new StatusError(404, `Couldn't locate user with ID ${updatedUser.id}`));
							} else {
								// Since the password may have changed, the cookies that the user has will no longer be valid
								// Generate the cookie to be set on the client side cookie
								var cookie = AuthService.getUserCookie(user);
								// set the updated cookie
								res.cookie(AuthService.COOKIE_FIELD_NAME, cookie, {httpOnly: true});

								// Respond with the updated user
								var resUser = _.clone(user);
								resUser = UserService.hideHiddenUserFields(resUser);
								res.json(resUser);
							}
						});
					}
				});
			}
		}
	}
};

