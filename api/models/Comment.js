/**
* Comment.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  attributes: {
    content: {
      type: 'string',
      required: true
    },
    time: {
      type: 'datetime',
      required: true
    },
    poster: {
      model: 'user',
      required: true
    },
    recording: {
      model: 'recording',
      required: true
    },
    replies: {
      collection: 'comment',
      via: 'parent'
    },
    parent: {
      model: 'comment'
    }
  }
};

