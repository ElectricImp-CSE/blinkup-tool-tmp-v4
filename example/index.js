/**
 *  JavaScript BlinkUp
 *
 * @version 0.3.2
 * @copyright Electric Imp Inc. 2016
 * @website https://electricimp.com
 * @license Closed
 */
module.exports = require('./lib/blinkup/blinkupSDK');

/**
 * Global accessor for blinkupSDK module if needed
 * @global
 */
global.BU = module.exports;

/**
 * Global accessor for a NetworkConfig class if not using modules
 * @deprecated Please use BU.NetworkConfig if not using modules
 * @global
 */
global.BUNetworkConfig = require('./lib/blinkup/NetworkConfig');

/**
 * Global accessor for a StaticAddressing class if not using modules
 * @deprecated Please use BU.StaticAddressing if not using modules
 * @global
 */
global.BUStaticAddressing = require('./lib/blinkup/StaticAddressing');

/**
 * Global accessor for a NetworkProxy class if not using modules
 * @deprecated Please use BU.NetworkProxy if not using modules
 * @global
 */
global.BUNetworkProxy = require('./lib/blinkup/NetworkProxy');
