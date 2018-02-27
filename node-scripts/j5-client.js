// make socket-js-server pass all passthrough events to this script as well?
// 

/**
* 
* @returns {undefined}
*/
const zup = function(msg) {
	console.log(msg);
};


exports.zup = zup;
