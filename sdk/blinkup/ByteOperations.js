'use strict';

module.exports = exports = {};

var ByteOperations = {
  utf8: function (s) {
    return unescape(encodeURIComponent(s));
  },
  hexStringToLEBytes: function (hexstring) {
    // Convert a hex string to a little-endian byte string
    var bytes = [];
    while (hexstring.length) {
      bytes = String.fromCharCode(parseInt(hexstring.slice(0, 2), 16)) + bytes;
      hexstring = hexstring.slice(2);
    }
    return bytes;
  },
  dottedQuadToLEBytes: function (quad) {
    // Convert a dotted quad string to a little-endian byte string
    var buf = '';
    quad.split('.').forEach(function (part) {
      // Make sure it's zero-padded to two digits
      buf += ('0' + parseInt(part, 10).toString(16)).slice(-2);
    });
    return this.hexStringToLEBytes(buf);
  },
  dottedQuadToBytes: function (quad) {
    // Convert a dotted quad string to a big-endian byte string
    var bytes = [];
    quad.split('.').forEach(function (part) {
      bytes += String.fromCharCode(parseInt(part, 10));
    });
    return bytes;
  }
};

exports.utf8 = ByteOperations.utf8;
exports.hexStringToLEBytes = ByteOperations.hexStringToLEBytes;
exports.dottedQuadToLEBytes = ByteOperations.dottedQuadToLEBytes;
exports.dottedQuadToBytes = ByteOperations.dottedQuadToBytes;
