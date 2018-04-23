'use strict';

/**
 * @class
 * @classdesc Configure static networking information for imp configuration.
 * @memberof module:blinkupSDK~
 * @static
 * @param {object} params Initialization parameters
 * @param {string} params.ip The IP of the device to be configured
 * @param {string} params.netmask The netmask of the device to be configured
 * @param {string} params.gateway The gateway of the device to be configured
 * @param {string} params.dns1 The seconday dns of the device to be configured
 * @param {string} [params.dns2] The seconday dns of the device to be configured
 * @example
 * // Use static network addressing with a single DNS
 * var blinkup = require('blinkup/blinkupSDK');
 * var addressing = new blinkup.StaticAddressing({ip: '192.168.1.200', netmask: '255.255.0.0', gateway: '192.168.1.1', dns1: '8.8.8.8'});
 * @example
 * // Use static network addressing with a two DNS servers
 * var blinkup = require('blinkup/blinkupSDK');
 * var addressing = new blinkup.StaticAddressing({ip: '192.168.1.200', netmask: '255.255.0.0', gateway: '192.168.1.1', dns1: '8.8.8.8', dns2: '8.8.4.4'});
 * @example
 * // Using globals rather than modules
 * var addressing = new BU.StaticAddressing({ip: '192.168.1.200', netmask: '255.255.0.0', gateway: '192.168.1.1', dns1: '8.8.8.8'});
 */
function StaticAddressing (params) {
  /** (Required) The IP of the device to be configured */
  this.ip = params.ip;
  /** (Required) The netmask of the device to be configured */
  this.netmask = params.netmask;
  /** (Required) The gateway of the device to be configured */
  this.gateway = params.gateway;
  /** (Required) The dns of the device to be configured */
  this.dns1 = params.dns1;
  /** (Optional) The seconday dns of the device to be configured */
  this.dns2 = params.dns2 || '';
};

/** Validates that the object represents a valid network configuration */
StaticAddressing.prototype.isComplete = function () {
  if (this.ip !== '' || this.netmask !== '' || this.gateway !== '' || this.dns1 !== '' || this.dns2 !== '') {
    return (!(this.ip === '' || this.netmask === '' || this.gateway === '' || this.dns1 === ''));
  } else {
    return true;
  }
};

module.exports = StaticAddressing;
