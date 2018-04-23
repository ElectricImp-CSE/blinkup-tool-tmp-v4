'use strict';

var StaticAddressing = require('./StaticAddressing');
var NetworkProxy = require('./NetworkProxy');

/**
 * Represents the configuration for a network connection.
 * @class
 * @classdesc Represents the configuration for a network connection.
 * @memberof module:blinkupSDK~
 * @static
 * @param {object} params Initialization parameters
 * @param {string} [params.ssid] The SSID of the network
 * @param {string} [params.password] The password for the network
 * @param {StaticAddressing} [params.addressing] The static IP information for the network
 * @param {NetworkProxy} [params.proxy] The proxy information for the network
 * @see module:blinkupSDK~StaticAddressing
 * @see module:blinkupSDK~NetworkProxy
 * @example
 * // Network with SSID and password
 * var blinkup = require('blinkup/blinkupSDK');
 * var networkConfig = new blinkup.NetworkConfig({ssid: 'myWifi', password: 'secret'});
 * @example
 * // Network with SSID, password, static network, and proxy
 * var blinkup = require('blinkup/blinkupSDK');
 * var addressing = new blinkup.StaticAddressing({ip: '192.168.1.200', netmask: '255.255.0.0', gateway: '192.168.1.1', dns1: '8.8.8.8'});
 * var proxy = new blinkup.NetworkProxy({server: 'proxyServer2.local', port: '8000'});
 * var networkConfig = new blinkup.NetworkConfig({ssid: 'myWifi', password: 'secret', addressing: addressing, proxy: proxy});
 * @example
 * // Use Globals rather than modules
 * // Network with SSID, password, static network, and proxy
 * var networkConfig = new BU.NetworkConfig({ssid: 'myWifi', password: 'secret'});
 * @example
 * // Ethernet Network (no SSID or password)
 * var networkConfig = new BU.NetworkConfig({});
 * @example
 * // Ethernet Network with static ip and proxy (no SSID or password)
 * var blinkup = require('blinkup/blinkupSDK');
 * var addressing = new blinkup.StaticAddressing({ip: '192.168.1.200', netmask: '255.255.0.0', gateway: '192.168.1.1', dns1: '8.8.8.8'});
 * var proxy = new blinkup.NetworkProxy({server: 'proxyServer2.local', port: '8000'});
 * var networkConfig = new blinkup.NetworkConfig({addressing: addressing, proxy: proxy});
 */
function NetworkConfig (params) {
  /** (Optional) The SSID of the wifi network (not required for ethernet) */
  this.ssid = params.ssid || '';
  /** (Optional) The password for the wifi network (not required for ethernet) */
  this.password = params.password || '';
  /** (Optional) The static IP information for the wifi network */
  this.addressing = params.addressing ? new StaticAddressing(params.addressing) : null;
  /** (Optional) The proxy information for the wifi network */
  this.proxy = params.proxy ? new NetworkProxy(params.proxy) : null;
};

/** Validates that the object represents a valid network configuration */
// if password is set and ssid is set, this is a wifi network
// if password is set and ssid is not set, this is not a valid network
// if password is not set and ssid is set, this is a wifi network
// if password is not set and ssid is not set, this is an ethernet network
NetworkConfig.prototype.isComplete = function () {
  return typeof this.ssid === 'string' && (this.ssid !== '' || this.password === '');
};

module.exports = NetworkConfig;
