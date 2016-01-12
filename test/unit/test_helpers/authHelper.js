var request = require('supertest');
var Chance  = require('chance');

var chance = new Chance();

const MOCK_DEVICE_ID = chance.word();

exports.getLoggedInAgent = (app, cb) => {
	var name = chance.name().split(' ');

	var userInfo = {
		email: chance.email({
			domain: chance.pick(UserService.VALID_EMAIL_DOMAINS) // pick rand valid email domain
		}),
		firstName: name[0],
		lastName: name[1],
		password: chance.word({length: 6})
	};

	var agent = request.agent(app);

	agent
		.post('/user/register')
		.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
		.send(userInfo)
		.expect(res => {
			var user = res.body;
			user.should.have.property('email');
			user.email.should.equal(userInfo.email);
			user.should.have.property('firstName');
			user.firstName.should.equal(userInfo.firstName);
			user.should.have.property('lastName');
			user.lastName.should.equal(userInfo.lastName);
			
			user.should.not.have.property('password');

			user.should.have.property('sections');
			user.sections.length.should.equal(0);
			user.should.have.property('comments');
			user.comments.length.should.equal(0);
		})
		.expect(201, err => cb(err, err ? null : agent));
};

exports.getUserLoggedInAgent = (app, user, cb) => {
	var agent = request.agent(app);

	agent
		.post('/user/login')
		.set(BlacklistService.DEVICE_ID_HEADER_NAME, MOCK_DEVICE_ID)
		.send({
			email: user.email,
			password: user.password
		})
		.expect(200, err => cb(err, err ? null : agent));
};