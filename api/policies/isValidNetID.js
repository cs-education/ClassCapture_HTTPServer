var StatusError = require('statuserror');

module.exports = (req, res, next) => {
	var user = req.body;

	if (_.has(user, 'email')) {
		var netID = LDAPService.extractNetIDFromEmail(user.email);
		LDAPService.isValidNetID(netID, isValid => {
			if (!isValid) {
				res.negotiate(new StatusError(400, `Given email '${user.email}' doesn't correspond to a valid UIUC NetID`));
			} else {
				next();
			}
		});
	} else {
		next();
	}
};