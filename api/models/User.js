/**
* User.js
*
* @description :: Schema for User Model with various academic attributes and auth attributes
* @docs        :: http://sailsjs.org/#!documentation/models
*/

/**
 * Constants
 */

const UIUC_EMAIL_SUFFIX = "@illinois.edu";

// List of possible semester seasons
const SEMESTER_SEASONS = ["fall", "spring", "summer"];

const YEAR_UPPER_BOUND = 2050;
const YEAR_LOWER_BOUND = 1950;

// TODO: Look up more degree types
const DEGREE_TYPES = ["BS", "MS", "Phd"];

const MIN_CONCENTRATION_LENGTH = 3;

module.exports = {

	"types": {
		"isUIUCEmail": function () {
			return _.endsWith(this.email, UIUC_EMAIL_SUFFIX);
		},
		"isRecentYear": function () {
			// Being pretty generous here
			return this.startingYear > YEAR_LOWER_BOUND &&
				   this.startingYear < YEAR_UPPER_BOUND;
		},
		"isNumArray": function () {
			return this.classes.every(function (class) {
				return !isNaN(class) && typeof class === "number";
			});
		}
	},

	"attributes": {
		// Authentication info
		"email": {
			"type": "string",
			"required": true,
			"email": true,
			"isUIUCEmail": true,
			"unique": true
		},
		"password": {
			"type": "string",
			"required": true
		},
		// Academic Info
		"startingSeason": {
			"type": "string",
			"enum": SEMESTER_SEASONS,
			"required": true
		},
		"startingYear": {
			"type": "integer",
			"isRecentYear": true,
			"required": true
		},
		"degree": {
			"type": "string",
			"enum": DEGREE_TYPES,
			"required": true
		},
		"concentration": {
			"type": "string",
			"minLength": MIN_CONCENTRATION_LENGTH,
			"required": true
		},
		"courses": {
			"collection": "Course",
			"defaultsTo": []
		}
	}
};

