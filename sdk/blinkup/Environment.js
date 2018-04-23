'use strict';

var exports = {};

exports.isOnMobile = function (userAgent) {
  userAgent = userAgent || navigator.userAgent;
  return (/tablet|pad|mobile|phone|symbian|android|ipod|ios|blackberry|webos/i.test(userAgent));
};

exports.isOnIOS = function (userAgent) {
  userAgent = userAgent || navigator.userAgent;
  return (/(iPhone|iPod|iPod touch|iPad)/i.test(userAgent) && !exports.isOnIE(userAgent));
};

exports.iOSMajorVersion = function (global, userAgent) {
  if (exports.isOnIOS(userAgent)) {
    global = global || window;
    /* eslint-disable */
    if (!!global.indexedDB) { return 8; }
    if (!!global.SpeechSynthesisUtterance) { return 7; }
    if (!!global.webkitAudioContext) { return 6; }
    if (!!global.matchMedia) { return 5; }
    if (!!global.history && 'pushState' in global.history) { return 4; }
    /* eslint-enable */
    return 3;
  }
  return null;
};

exports.isOnChrome = function (userAgent) {
  userAgent = userAgent || navigator.userAgent;
  return (/chrome|crios/i.test(userAgent) && !exports.isOnIE(userAgent));
};

exports.isOnIE = function (userAgent) {
  userAgent = userAgent || navigator.userAgent;
  return (/msie|trident|edge/i.test(userAgent));
};

exports.isOnFirefox = function (userAgent) {
  userAgent = userAgent || navigator.userAgent;
  return (/firefox|seamonkey/i.test(userAgent));
};

module.exports = exports;
