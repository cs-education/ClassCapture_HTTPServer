module.exports = {
	isValidCourse : function(values, isValid){
		// Validate that the course is a valid course
		Course.findOne()
				.where({department: values.department})
				.where({number: values.number})
				.where({semester: values.semester})
				.where({year: values.year})
				.exec(function findOneCB(err, found){
			// If found matching course, do not want to create a second one
			if (found != undefined){
				isValid("Duplicate Course", false);
			}
			// No matching course, so we are good to create a new one
			else{
				var url = "http://courses.illinois.edu/cisapp/explorer/schedule/" + values.year + "/" + values.semester + "/" + values.department +"/" + values.number + ".xml";
				var request = require('request');
				request(url, function (error, response, body) {
					if (response.statusCode == 404) {
						isValid("Invalid course", false);
					}
					if (!error && response.statusCode == 200) {
						isValid(undefined, true);
					}
				})
			}
		})
	}
}
