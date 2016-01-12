// Define all user specific constants here
// Make sure to keep this up to date as you make changes to the User model
exports.VALID_EMAIL_DOMAINS = ['illinois.edu']; // emails must be illinois.edu emails
exports.MIN_PASSWORD_LENGTH = 5;
exports.REQUIRED_USER_ATTRS = ['email', 'firstName', 'lastName', 'password'];
exports.UPDATEABLE_FIELDS = ['email', 'firstName', 'lastName', 'password', 'sections', 'comments'];