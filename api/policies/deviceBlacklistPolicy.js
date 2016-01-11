/**
* As a temporary security measure, all apps that interact with the backend will need to include a header that
* uniquely identifies the device consuming the API.
* The header goes by the name "ConsumerDeviceID"
*/

module.exports = (req, res, next) => {
	var hasDeviceIDHeader = BlacklistService.DEVICE_ID_HEADER_NAME in req.headers;

	if (!hasDeviceIDHeader) {
		sails.log.warn("DeviceID Header not found for request");
		return res.forbidden('Need to have appropriate headers to access API');
	} else {
		var deviceID = req.headers[BlacklistService.DEVICE_ID_HEADER_NAME];
		var inBlacklist = BlacklistService.isInBlacklist(deviceID);

		if (inBlacklist) {
			sails.log.warn("Request was from Blacklisted Device");
			return res.forbidden("Your access to the API has been revoked");
		}

		next();
	}
};