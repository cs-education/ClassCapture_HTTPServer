var jwt = require('jsonwebtoken');
var StatusError = require('statuserror');

const COOKIE_FIELD_NAME = 'user';
const JWT_SECRET = sails.config.jwtSecret;
const JWT_EXPIRATION = sails.config.jwtExpiration;
const INVALID_REGISTRATION_ATTRS = ['sections', 'comments'];

exports.COOKIE_FIELD_NAME = COOKIE_FIELD_NAME;
exports.INVALID_REGISTRATION_ATTRS = INVALID_REGISTRATION_ATTRS;

exports.verifyToken = (token, cb) => {
	jwt.verify(token, JWT_SECRET, cb);
};

exports.signPayload = payload => {
	return jwt.sign(payload, JWT_SECRET, {
		expiresIn: JWT_EXPIRATION
	});
};

exports.getUserCookie = user => {
	if ([user.id, user.email, user.password].some(_.isUndefined)) {
		throw new Error("Provided User Object must have following properties: 'id', 'email', 'password'");
	} else {
		var payload = _.pick(user, ['id', 'email', 'password']);
		return exports.signPayload(payload);
	}
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

					cb(null, user);
				}
			});
	}
};