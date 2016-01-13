// ldapsearch -H ldap://ldap.illinois.edu -b ou=people,dc=uiuc,dc=edu -xLL uid=svdesai2 uid
// LDAPService.isValidNetID('svdesai2', (err, res) => {if (err) {console.log('got error :('); console.log(err);} else {console.log('got result'); console.log(res);} });
var ldap        = require('ldapjs');
var StatusError = require('statuserror');

const LDAP_URL = sails.config.ldapUrl;
const SEARCH_BASE = 'ou=people,dc=uiuc,dc=edu';
// can get a LOT more from LDAP server than just netid...good to know: https://docs.google.com/viewer?url=https%3A%2F%2Fanswers.uillinois.edu%2Fimages%2Fgroup180%2Fshared%2F47815-schema.xls
const NETID_ATTR_NAME = 'uiucEduNetID';
const RESULT_ATTRIBUTES = [NETID_ATTR_NAME];

var client = ldap.createClient({
	url: LDAP_URL
});

exports.isValidNetID = (netID, cb) => {
	var opts = {
		scope: 'sub',
		filter: `uid=${netID}`,
		attributes: RESULT_ATTRIBUTES,
		sizeLimit: 1, // only want at max 1 result back
	};

	client.search(SEARCH_BASE, opts, (err, res) => {
		if (err) {
			sails.log(err);
			cb(false);
		} else {
			var err = null;
			var foundMatch = false;

			res.on('searchEntry', function(entry) {
				var attrs = entry.json.attributes;
				var netIDAttr = _.findWhere(attrs, {type: NETID_ATTR_NAME});

				if (netIDAttr) {
					var resultNetID = _.first(netIDAttr.vals);
					foundMatch = netID === resultNetID;
				}
			});

			res.on('error', function(error) {
				err = error;
			});

			res.on('end', function(result) {
				if (err) {
					cb(false);
				} else if (result.status !== 0) { // status code 0 indicates success
					cb(false);
					sails.log(`Got a status code of ${result.status} from LDAP Search Request`);
					sails.log(result);
				} else {
					cb(foundMatch);
				}
			});
		}
	});
};

exports.extractNetIDFromEmail = email => {
	var atIdx = email.indexOf('@');
	
	if (atIdx < 0) {
		throw new Error(`Invalid input to LDAPService.extractNetIDFromEmail: ${email}`);
	} else {
		return email.substring(0, atIdx);
	}
};