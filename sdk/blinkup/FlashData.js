'use strict';

function FlashData (params) {
  params = params || {};
  this.byteArray = params.byteArray || [];
};

var translate = function (bytes) {
  // handle empty case
  if (bytes.length === 0) {
    return '';
  }

  var string = '';

  var holder = 0x00;
  var mask = 0x01;
  var shiftSize = -1;

  for (var i = 0, len = bytes.length; i < len; i++) {
    // Move old value in case it is needed (for 3 bits)
    // OR in new byte
    shiftSize += 8; // Add on 8 more bytes
    holder = (holder << 8) | bytes[i];

    // Process the lower 8 bits that we can
    while (shiftSize >= 0) {
      // Find the value
      var value = (holder >>> shiftSize) & mask;
      // Add 1 as 0 is clock
      value += 1;
      // Prepend clock and now we are in bitsPerFlash^2 + 1 radix system
      string += '0' + value.toString(17);

      // Shift less next time
      shiftSize -= 1;
    }
  }

  return string;
};

FlashData.prototype.preambleByteArray = function () {
  // sync header; this is just the 01 pattern (ie trilevel 0x00 gives
  // the pattern "0101010101010101". This should go on for ~1s to ensure
  // that the imp is listening.
  var preamble = [0x00, 0x00, 0x00];

  // Magic number (2a) header which signifies end of sync and start of packet
  preamble.push(0x2a);

  return preamble;
};

FlashData.prototype.asciiEncodePreamble = function () {
  var dataString = translate(this.preambleByteArray());
  return dataString;
};

FlashData.prototype.asciiEncode = function () {
  var dataString = translate(this.byteArray);
  return dataString;
};

module.exports = FlashData;
