var fs = require('fs');

/**
 * [saveFileToUploadDir description]
 * @param  {String} tmp_path         Temporary file path
 * @param  {String} target_path      target path for the upload file
 * @param  {Function} success_callback Success callback
 * @param  {Function} error_callback   Error Callback
 * @return {voie}
 */
exports.saveFileToUploadDir = function(tmp_path, target_path, success_callback, error_callback) {
	/** A better way to copy the uploaded file. **/
	var src = fs.createReadStream(tmp_path);
	var dest = fs.createWriteStream(target_path);
	src.pipe(dest);
	src.on('end', success_callback);
	src.on('error', error_callback);
};