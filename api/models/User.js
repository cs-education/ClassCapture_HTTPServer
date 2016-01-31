/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var StatusError = require('statuserror');

const MIN_PASSWORD_LENGTH = UserService.MIN_PASSWORD_LENGTH;
const VALID_EMAIL_DOMAINS = UserService.VALID_EMAIL_DOMAINS;

module.exports = {

  types: {
    isExpectedEmailDomain: (email) => {
      return VALID_EMAIL_DOMAINS.some(domain => _.endsWith(email, domain));
    }
  },

  attributes: {
    email: {
      type: 'email',
      required: true,
      unique: true,
      isExpectedEmailDomain: true
    },
    password: {
      type: 'string',
      required: true,
      minLength: MIN_PASSWORD_LENGTH
    },
    firstName: {
      type: 'string',
      required: true,
      minLength: 1 // cant have a name of length 0
    },
    lastName: {
      type: 'string',
      required: true,
      minLength: 1 // cant have a name of length 0
    },
    sections: {
      collection: 'Section',
      via: 'students'
    },
    comments: {
      collection: 'comment',
      via: 'poster'
    },

    toJSON: function () {
      var obj = this.toObject();
      
      // delete hidden fields
      obj = UserService.hideHiddenUserFields(obj);

      return obj;
    }
  }
};

