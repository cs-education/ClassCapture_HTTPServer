# ClassCapture
A platform whereby students participate in a crowdsourced effort to aggregate quality lecture video content via mobile devices.

## Why SailsJS
This is a [Sails](http://sailsjs.org) application.

There are a whole host of reasons for choosing SailsJS

	* [API Model Scaffolding](https://youtu.be/GK-tFvpIR7c?t=1m35s)
	* [Real time Pub Sub to API backend](https://youtu.be/GK-tFvpIR7c?t=5m20s) via [Socket.IO](http://socket.io/)
	* Built on top of solid, mature middleware like [Express](http://expressjs.com/) and [Socket.IO](http://socket.io/)
	* Promotes modularized project structure with Models/Controllers/Services
	* Wraps Model interaction with the *database agnostic* ORM [Waterline](https://github.com/balderdashy/waterline)
	
## Schemas
All database models are stored in the `api/models/` directory.
The API to interact with these Schemas are scaffolded by the SailsJS framework.
The blueprint of the scaffolded API are detailed [here](http://sailsjs.org/documentation/reference/blueprint-api).

### Recording
Look into `api/models/Recording.js` for a concrete, up to date representation of this model. A Recording contains basic metadata regarding a given user uploaded video.

- Attributes
	- `startTime`
		- The timestamp for the starting time of the related recording file
		- Type: `Date`
		- Required
		- Must be chronologically before `endTime`
	- `endTime`
		- The timestamp for the ending time of the related recording file
		- Type: `Date`
		- Require
		- Must be chronologically after `startTime`
	- `filename`
		- The filename for the video resource that this Recording object holds metadata for
		- Type: `String`
		- Required
		- Unique
