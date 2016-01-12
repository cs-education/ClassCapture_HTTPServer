var jwt = require('jsonwebtoken');
var StatusError = require('statuserror');

const JWT_SECRET = sails.config.jwtSecret;
const JWT_EXPIRATION = sails.config.jwtExpiration;
const INVALID_REGISTRATION_ATTRS = ['sections', 'comments'];

exports.INVALID_REGISTRATION_ATTRS = INVALID_REGISTRATION_ATTRS;

exports.verifyToken = (token, cb) => {
	jwt.verify(token, JWT_SECRET, cb);
};

exports.signPayload = payload => {
	return jwt.sign(payload, JWT_SECRET, {
		expiresIn: JWT_EXPIRATION
	});
};

exports.registerNewUser = (userInfo, cb) => {
	var hasRequiredAttrs = UserService.REQUIRED_USER_ATTRS.every(attr => _.has(userInfo, attr));
	var hasInvalidAttrs = INVALID_REGISTRATION_ATTRS.some(attr => _.has(userInfo, attr));

	if (!hasRequiredAttrs) {
		process.nextTick(() => {
			cb(new StatusError(400, "Missing Some Required Attributes for Registration"));
		});
	} else if (hasInvalidAttrs) {
		process.nextTick(() => {
			cb(new StatusError(400, `Cannot attatch the following properties upon registration: ${INVALID_REGISTRATION_ATTRS.join(", ")}`));
		});
	} else {
		User.create(userInfo)
			.exec((err, user) => {
				if (err) {
					cb(err);
				} else {
					user = _.clone(user); // if you don't clone, you wont be able to add sections and comments below
					// Artificially attatch sections and comments empty lists to user object
					user.sections = [];
					user.comments = [];

					// hide the password from the client
					delete user.password;

					cb(null, user);
				}
			});
	}
};