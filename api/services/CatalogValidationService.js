var request = require('request');

module.exports = {
	isUniqueCourse: function (values, cb) {
		// Validate that the course is unique
		Course.findOne()
			.where({department: values.department})
			.where({number: values.number})
			.where({semester: values.semester})
			.where({year: values.year})
			.exec((err, course) => {
				if (err) {
					sails.log(err);
					return cb(false);
				}

				cb(_.isUndefined(course));
			});
	},

	isValidCourse: function (values, cb){
		var url = `http://courses.illinois.edu/cisapp/explorer/schedule/${values.year}/${values.semester}/${values.department}/${values.number}.xml`;
		request(url, function (err, response, body) {
			if (err) {
				sails.log(err);
				return cb(false);
			}

			cb(response.statusCode === 200);
		});
	}
}
