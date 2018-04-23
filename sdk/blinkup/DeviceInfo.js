'use strict';

/**
 * Represents the results of a device poll event.
 * @class
 * @memberof module:blinkupSDK~
 * @param {object} params Initialization parameters
 * This object is created by the function module:blinkupSDK.pollForDeviceInfo as part of the polling process.
 * A device will only be returned if the flash was successful.
 * You should never have to create it yourself.
 * @example
 * var blinkup = require('blinkup/blinkupSDK');
 * blinkup.pollForDeviceInfo (configId, function(err, deviceInfo) {
 *   if (err) {
 *     // Handle error
 *     // (device rejected or server connection timed out)
 *   } else if (deviceInfo) {
 *     // Do something with deviceInfo data
 *   }
 * });
 */
function DeviceInfo (params) {
  /** The URL of the agent for the device that connected */
  this.agentURL = params.agentURL;
  /** The deviceId of the device that connected */
  this.deviceId = params.deviceId;
  /** The planId of the device that connected */
  this.planId = params.planId;
  /** The date when the device connected to the server */
  this.verificationDate = params.verificationDate;
};

module.exports = DeviceInfo;
