'use strict';

/**
 * Represents a ConfigId returned by the Electric Imp API corresponding to a BlinkUp attempt.
 * This object is created by the module:blinkupSDK.getConfigId method.
 * You should never have to create it yourself.
 * @class
 * @memberof module:blinkupSDK~
 * @param {object} params Initialization parameters
 * @example
 * var blinkup = require('blinkup/blinkupSDK');
 * blinkup.getConfigId('myElectricImpAPIKey', null, 'production', function (err, configId) {
 *   if (err) {
 *     // Handle error
 *   } else {
 *      // The configId has been retrieved.
 *      // Generally it should be passed to the startNetworkFlash function
 *      var theConfigId = configId;
 *   }
 * });
 */
function ConfigId (params) {
  /**
   * The ID of the token
   * @member {string} token
   * @memberof ConfigId
   */
  this.token = params.token;

  /**
   * @memberof module:blinkkupSDK~ConfigId
   * The plan ID if available
   */
  this.planId = params.planId;

  /**
   * @instance
   * Your API key from ElectricImp
   *
   */
  this.apiKey = params.apiKey;

    /**
    * Production environment for API calls
    * Ensure the correlating apiKey is used
    * Values: 'production'
    */
  this.environment = params.environment || 'production';
};

module.exports = ConfigId;
