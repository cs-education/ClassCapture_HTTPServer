/**
 * BlacklistController
 *
 * @description :: Server-side logic for managing Blacklists
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var StatusError = require("statuserror");

module.exports = {
	getBlacklistIDs: (req, res) => {
		res.json(BlacklistService.getBlacklist());
	},

	// Not entirely restful endpoint...
	isInBlacklist: (req, res) => {
		var id = req.param('id');
		var exists = BlacklistService.isInBlacklist(id);
		var status = exists ? 200 : 404;
		res.status(status);
		res.json(exists);
	},

	addToBlacklist: (req, res) => {
		var id = req.param('id');
		BlacklistService.addToBlacklist(id, err => {
			if (err) {
				res.negotiate(new StatusError(500, err.message));
			} else {
				res.json({
					"message": `Successfully added '${id}' to the blacklist`
				});
			}
		});
	},

	removeFromBlacklist: (req, res) => {
		var id = req.param('id');
		BlacklistService.removeFromBlacklist(id, (err, existed) => {
			if (err) {
				res.negotiate(new StatusError(500, err.message));
			} else {
				res.json(existed);
			}
		});
	}
};

