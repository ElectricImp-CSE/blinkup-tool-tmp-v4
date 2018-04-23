'use strict';
var env = require('./Environment');
var FlashPacket = require('./FlashPacket');

var flasher = {
  flashBits: null,
  preambleFlashBits: null,
  mPos: 0,
  mPreamblePos: 0,
  mWidth: 0,
  mHeight: 0,
  stopFlashing: false,
  cb: null,
  animator: null,
  drawNextFrame: null,
  alphaDiv: null,
  useAlphaFlash: false,
  currentProgress: 0,
  lastframeTime: 0,
  minFPSInterval: 50.0, // minimum interval between frames,
  maxFPS: 60,
  drawValues: null,
  preambleDrawValues: null,
  generateDrawValueArray: function (alphaFlash) {
    var values = [0x00, 0xbf, 0xff];

    var output = values.map(function (byte) {
      if (alphaFlash) {
        return 1.0 - byte / 255;
      } else {
        var str = ('0' + byte.toString(16)).slice(-2);
        return '#' + str + str + str;
      }
    });

    return output;
  },
  findAnimationMethod: function () {
    var nativeRAF = global.requestAnimationFrame;
    var vendors = ['Webkit', 'Moz', 'ms', 'O'];
    for (var i = 0; i < vendors.length && !nativeRAF; i++) {
      nativeRAF = global[vendors[i] + 'RequestAnimationFrame'];
    }

    if (!nativeRAF) {
      this.animator = global.AnimationFrame(this.maxFPS);
      this.drawNextFrame = this.animator.request;
    } else {
      this.animator = null;
      this.drawNextFrame = nativeRAF;
    }
  },
  forceToNewLayer: function (element) {
    var transform = 'translate3d(0,0,0)';
    element.style.webkitTransform = transform;
    element.style.MozTransform = transform;
    element.style.msTransform = transform;
    element.style.OTransform = transform;
    element.style.transform = transform;
    element.style.willChange = 'transform, opacity';
  },
  getAlphaDiv: function (box) {
    var backColor = global.getComputedStyle(box.parentElement).getPropertyValue('background-color');
    if (backColor !== 'rgb(255, 255, 255)') {
      box.parentElement.style.backgroundColor = '#FFFFFF';
      console.log('BU: BU-canvas must be placed in a parent that has a white background color.');  // eslint-disable-line no-console
    }
    return box;
  },
  getBox: function () {
    // Set stuff up to be hopefully faster
    var box = document.getElementById('BU-canvas');
    this.mWidth = box.width;
    this.mHeight = box.height;
    this.forceToNewLayer(box);
    box.style.zIndex = 0;

    var box_c = box.getContext('2d');
    box_c.imageSmoothingEnabled = false;
    box_c.msImageSmoothingEnabled = false;
    this.useAlphaFlash = env.isOnChrome();
    if (this.useAlphaFlash) {
      this.alphaDiv = this.getAlphaDiv(box);
    }

    box_c.fillStyle = this.black;
    box_c.fillRect(0, 0, this.mWidth, this.mHeight);
    // We set a global variable for the internal flash state
    // Although this isn't ideal, it is needed for performance
    global.BUInteralFlashState = this;
    return box_c;
  },
  // Should contain the same processing code as sendbit to return
  // the list of color or opacity data that will actually be outputted
  testSendBitData: function (self) {
    var output = [];
    var keepGoing = true;
    while (keepGoing) {
      var bitValue = 0;
      var drawValue = 0;

      if (self.mPreamblePos < self.preambleFlashBits.length) {
        // Draw the flashing box
        bitValue = parseInt(self.preambleFlashBits[self.mPreamblePos], 17);
        // Could be opacity or hex color
        drawValue = self.preambleDrawValues[bitValue];

        // Onto the next bit
        self.mPreamblePos++;
      } else {
        // Draw the flashing box
        bitValue = parseInt(self.flashBits[self.mPos], 17);
        // Could be opacity or hex color
        drawValue = self.drawValues[bitValue];

        // Onto the next bit
        self.mPos++;
      }

      output.push(drawValue);

      // Reschedule if there's anything left
      if (self.mPos < self.flashBits.length) {
        // Keep going
      } else {
        keepGoing = false;
      }
    }
    return output;
  },
  // use an internal object as memory so we never have to allocate during the run loop
  sendBitMem: {delta: 0, bitValue: 0, drawValue: 0, progress: 0.0},
  sendbit: function (time) { // DOMHighResTimeStamp
    var self = global.BUInteralFlashState;
    if (self._stopFlashing) {
      return;
    }

    self.sendBitMem.delta = time - self.lastframeTime;
    if (self.sendBitMem.delta > self.minFPSInterval) {
      // Get ready for next frame by setting lastDrawTime=now, but...
      // Also, adjust for fpsInterval not being multiple of 16.67
      self.lastframeTime = time - (self.sendBitMem.delta % self.minFPSInterval);

      if (self.mPreamblePos < self.preambleFlashBits.length) {
        // Draw the flashing box
        self.sendBitMem.bitValue = parseInt(self.preambleFlashBits[self.mPreamblePos], 17);
        // Could be opacity or hex color
        self.sendBitMem.drawValue = self.preambleDrawValues[self.sendBitMem.bitValue];

        // Onto the next bit
        self.mPreamblePos++;
      } else {
        // Draw the flashing box
        self.sendBitMem.bitValue = parseInt(self.flashBits[self.mPos], 17);
        // Could be opacity or hex color
        self.sendBitMem.drawValue = self.drawValues[self.sendBitMem.bitValue];

        // Onto the next bit
        self.mPos++;
      }

      if (self.useAlphaFlash) {
        self.alphaDiv.style.opacity = self.sendBitMem.drawValue;
      } else {
        self.mBox.fillStyle = self.sendBitMem.drawValue;
        self.mBox.fillRect(0, 0, self.mWidth, self.mHeight);
      }

      // Show progress bar
      self.sendBitMem.progress = parseInt(((self.mPos + self.mPreamblePos) / (self.flashBits.length + self.preambleFlashBits.length)) * 100, 10);
      if (self.currentProgress !== self.sendBitMem.progress) {
        self.currentProgress = self.sendBitMem.progress;
        self.progressCallback(self.sendBitMem.progress);
      }
    }

    // Reschedule if there's anything left
    if (self.mPos < self.flashBits.length) {
      self.drawNextFrame.call(self.animator, global.BUInteralFlashState.sendbit);
    } else {
      self.cb();
    }
  },

  // Reset the counters associated with sending bits
  resetFlashState: function () {
    this.mPos = 0;
    this.mPreamblePos = 0;
    this.currentProgress = 0;
    this.minFPSInterval = 1000.0 / this.maxFPS;
    this.progressCallback(0);
    this.lastframe = 0;
    this._stopFlashing = false;
  },
  start: function (configId, networkConfig, options, cb) {
    // Cache box
    this.mBox = this.getBox();
    this.cb = cb;
    var flashData = FlashPacket.init(configId, networkConfig, options).flashData;
    this.flashBits = flashData.asciiEncode();
    this.flashBits += '000000'; // Add some black to the end
    this.drawValues = this.generateDrawValueArray(this.useAlphaFlash);
    this.preambleFlashBits = flashData.asciiEncodePreamble();
    this.preambleDrawValues = this.generateDrawValueArray(this.useAlphaFlash);
    this.findAnimationMethod();
    this.resetFlashState();
    this.sendbit(this.lastframe);
  },
  startDisconnect: function (options, cb) {
    // Cache box
    this.mBox = this.getBox();
    this.cb = cb;
    var flashData = FlashPacket.initForClearWirelessConfiguration(options).flashData;
    this.flashBits = flashData.asciiEncode();
    this.flashBits += '000000'; // Add some black to the end
    this.drawValues = this.generateDrawValueArray(this.useAlphaFlash);
    this.preambleFlashBits = flashData.asciiEncodePreamble();
    this.preambleDrawValues = this.generateDrawValueArray(this.useAlphaFlash);
    this.findAnimationMethod();
    this.resetFlashState();
    this.sendbit(this.lastframe);
  },
  testDisconnect: function (options, useAlphaFlash) {
    var flashData = FlashPacket.initForClearWirelessConfiguration(options).flashData;
    this.flashBits = flashData.asciiEncode();
    this.flashBits += '000000'; // Add some black to the end
    this.drawValues = this.generateDrawValueArray(this.useAlphaFlash);
    this.preambleFlashBits = flashData.asciiEncodePreamble();
    this.preambleDrawValues = this.generateDrawValueArray(this.useAlphaFlash);
    this.resetFlashState();
    return this.testSendBitData(this);
  },
  stop: function () {
    this._stopFlashing = true;
  },
  // use a mem cache to prevent object allocation
  progressCallbackMem: {scale: '', element: null},
  progressCallback: function (progress) {
    if (this.maxFPS > 29 || env.isOnFirefox()) {
      return;
    }
    // Can be overwritten in exports
    // We use scale as it is a very fast gpu operation
    this.progressCallbackMem.scale = 'translateZ(0) scale(' + progress / 100.0 + ',1)';
    this.progressCallbackMem.element = document.getElementById('BU-progress');
    this.progressCallbackMem.element.style.webkitTransform = this.progressCallbackMem.scale;
    this.progressCallbackMem.element.style.MozTransform = this.progressCallbackMem.scale;
    this.progressCallbackMem.element.style.msTransform = this.progressCallbackMem.scale;
    this.progressCallbackMem.element.style.OTransform = this.progressCallbackMem.scale;
    this.progressCallbackMem.element.style.transform = this.progressCallbackMem.scale;
  }
};

module.exports = flasher;
