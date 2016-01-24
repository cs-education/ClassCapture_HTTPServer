/**
 * Mocks CatalogValidationService to make the validation function always return true
 */

 var ORIGINAL_FUNC = null;

exports.startMocking = () => {
	ORIGINAL_FUNC = ORIGINAL_FUNC || CatalogValidationService.isValidCourse;

	CatalogValidationService.isValidCourse = (course, cb) => {
		process.nextTick(() => cb(true)); // just say its valid regardless of input
	};
};

exports.stopMocking = () => {
	// Restore original functionality
	CatalogValidationService.isValidCourse = ORIGINAL_FUNC || CatalogValidationService.isValidCourse;
};