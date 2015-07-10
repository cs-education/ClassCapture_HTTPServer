/**
 * Helper methods to be used in User model and AuthController
 */

 exports.existsUserWithCredentials = function (creds, cb) {
 	// creds must have id, email, & password
 	var hasCreds = _.has(creds, 'id') && _.has(creds, 'email') && _.has(creds, 'password');
 	
 	if (!hasCreds) {
 		process.nextTick(function () {
 			cb(new Error("creds arg passed to 'existsUserWithCredentials' must have id, email, & password"));
 		});
 		return;
 	}

 	User
 		.findOne()
 		.where(creds)
 		.exec(function (err, user) {
 			const foundUser = !err && user;
 			cb(foundUser);
 		});
 };