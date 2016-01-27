/**
 * A bunch of helper functions used by the other Util Scripts
 */

var request = require('supertest');
var Chance  = require('chance');

var chance = new Chance();

const MOCK_DEVICE_ID = chance.word();

exports.getUserLoggedInAgent = (endpoint, user, cb) => {
	var agent = request.agent(endpoint);

	agent
		.post('/api/user/login')
		.set("consumer-device-id", MOCK_DEVICE_ID)
		.send({
			email: user.email,
			password: user.password
		})
		.expect(200, err => cb(err, err ? null : agent));
};