'use strict';

/**
 * Represents the server proxy information for the device
 * @class
 * @classdesc Represents the server proxy information for the device
 * @memberof module:blinkupSDK~
 * @static
 * @param {object} params Initialization parameters
 * @param {string} params.server The server IP or hostname of the proxy
 * @param {string} params.port The server port running the proxy
 * @param {string} [params.username] The username of the proxy
 * @param {string} [params.password] The password of the proxy
 * @example
 * // Proxy without authentication
 * var blinkup = require('blinkup/blinkupSDK');
 * var proxy = new blinkup.NetworkProxy({server: 'proxyServer2.local', port: '8000'});
 * @example
 * // Proxy with authentication
 * var blinkup = require('blinkup/blinkupSDK');
 * var proxy = new blinkup.NetworkProxy({server: 'proxyServer2.local', port: '8000', username: 'user23', password: 'p@ssw0rd'});
 * @example
 * // Proxy using globals rather than modules
 * var proxy = new BU.NetworkProxy({server: 'proxyServer2.local', port: '8000', username: 'user23', password: 'p@ssw0rd'});
 */
function NetworkProxy (params) {
  /** (Required) The server IP or hostname of the proxy */
  this.server = params.server;
  /** (Required) The server port running the proxy */
  this.port = params.port;
  /** (Optional) The username of the proxy */
  this.username = params.username || '';
  /** (Optional) The password of the proxy */
  this.password = params.password || '';
};

/** Validates that the object represents a valid network configuration */
NetworkProxy.prototype.isComplete = function () {
  if (this.server !== '' || this.port !== '' || this.username !== '' || this.password !== '') {
    return (this.server !== '' && this.port !== '' && !isNaN(parseInt(this.port, 10)));
  } else {
    return true;
  }
};

module.exports = NetworkProxy;
