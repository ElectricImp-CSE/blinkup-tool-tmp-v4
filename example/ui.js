/*global BU*/
var blinkUpTemplate;
var countDownTimer;
var activeLightbox = null;
function isOnMobile () {
  return (/tablet|pad|mobile|phone|symbian|android|ipod|ios|blackberry|webos/i.test(navigator.userAgent));
}

$(function() {
  $('#ethernet,#wireless').change(function() {
    $('#password').val('');
    $('#ssid').val('');
    $('#password').parent().slideToggle('100');
    $('#ssid').parent().slideToggle('100');
  });
});

/**
* On load
*
* Setup UI elements
*/
window.onload = (function () {
  return function () {
    // Setup the UI accordions
    var icons = {
      header: 'closed-icon',
      activeHeader: 'open-icon'
    };

    $('#accordion-static-config').accordion({
      header: 'legend',
      active: false,
      collapsible: true,
      icons: icons,
      heightStyle: 'content'
    });

    $('#accordion-proxy-config').accordion({
      header: 'legend',
      active: false,
      collapsible: true,
      icons: icons,
      heightStyle: 'content'
    });

    $('#accordion-advanced-config').accordion({
      header: 'legend',
      active: false,
      collapsible: true,
      icons: icons,
      heightStyle: 'content'
    });

    // Grab the template and remove it from the DOM to prevent duplicate IDs in lightbox
    blinkUpTemplate = $('#lightbox-blinkUp');
    blinkUpTemplate.detach();
  };
})(window.onload);

/**
* Start requesting a ConfigId (token, planId) from Electric Imp AI before beginning flashing
*
* @param {string} environment  Either 'production', or 'disconnect'
*                       indicating type of BlinkUp to perform
*
*/
function blinkUp (environment) { // eslint-disable-line no-unused-vars
  if (environment === 'disconnect') {
    disconnectDevice();
  } else {
    var apiKey = document.getElementById('api_key').value;
    if (!apiKey) {
      showError('You must enter an API key');
    } else {
      flash(apiKey, environment);
    }
  }
}

/**
* Open the lightbox and show an error in the instruction line
*
* @param {string} errorMessage  A string containing the error to display
*/
function showError (errorMessage) {
  var configuration = {
    closeOnClick: true,
    closeOnEsc: true,
    closeIcon: '',
    afterClose: cancelBlinkUp,
    otherClose: '#lightbox-close',
    afterOpen: function () {
      if (!isOnMobile()) {
        // If not running on mobile, pin the blinkup lightbox to the bottom of the screen
        $('.featherlight-content').css('vertical-align', 'bottom');
      }
    }
  };

  openLightboxSingleton(blinkUpTemplate.clone(), configuration);

  document.getElementById('countdown').style.display = 'none';
  document.getElementById('imp-credit').style.display = 'none';
  document.getElementById('status').style.display = 'none';
  document.getElementById('BU-progress').style.display = 'none';
  document.getElementById('BU-canvas').style.display = 'none';
  setInstruction(errorMessage);
  hideFlashingElements(0);
  hideResult();
}

/**
* Cancel currently active BlinkUp process (i.e. flashing or polling)
*/
function cancelBlinkUp () {
  if (countDownTimer !== null) {
    clearInterval(countDownTimer);
  }

  document.body.removeEventListener('touchmove', captureEvent);
  BU.stopFlash();
  BU.stopPolling();
  activeLightbox = null;
}

/**
* This is registered when a countdown begins to prevent events from occuring
*/
function captureEvent (e) {
  e.preventDefault();
}

/**
* Perform BlinkUp flashing for disconnecting a device
*/
function disconnectDevice () {
  document.body.addEventListener('touchmove', captureEvent);
  if (configureLightbox(true)) {
    startCountdown(function () {
      setInstruction('Do not move the device');

      // Perform the BlinkUp (flashing)
      BU.startDisconnectFlash({},
      function () {
        // Hide the canvas and progress bar now that BlinkUp is complete
        hideFlashingElements();
        hidePollingProgress();

        // Display the results as success
        setInstruction('Complete');
        document.getElementById('status').style.display = 'block';
        showResult('Your device should now be flashing amber', true);
        return;
      }
    );
    });
    setInstruction('Press the device sensor against the screen within the blue box');
  }
}

/**
* Gather static network information from the UI
*
* @returns {BU.StaticAddressing} Network information or null
*/
function getAddressing () {
  var addressingData = null;
  var ip = document.getElementById('static_ip').value.trim();
  var netmask = document.getElementById('static_netmask').value.trim();
  var gateway = document.getElementById('static_gateway').value.trim();
  var dns1 = document.getElementById('static_dns1').value.trim();
  var dns2 = document.getElementById('static_dns2').value.trim();
  if (ip || netmask || gateway || dns1) {
    addressingData = new BU.StaticAddressing({
      ip: ip,
      netmask: netmask,
      gateway: gateway,
      dns1: dns1,
      dns2: dns2
    });
  }

  return addressingData;
}

/**
* Gather proxy information from the UI
*
* @returns {BU.NetworkProxy} Proxy information or null
*/
function getProxy () {
  var address = document.getElementById('proxy_address').value.trim();
  var port = document.getElementById('proxy_port').value.trim();
  var username = document.getElementById('proxy_username').value.trim();
  var password = document.getElementById('proxy_password').value;

  var proxyData = null;
  if (address || port || username || password) {
    proxyData = new BU.NetworkProxy({
      server: address,
      port: parseInt(port, 10),
      username: username,
      password: password
    });
  }
  return proxyData;
}

/**
* Perform BlinkUp flashing for production
*
* @param {string} apiKey  Key used to retrieve configId
* @param {string} environment  Either 'production', or 'disconnect'
*                       indicating type of BlinkUp to perform
*/
function flash (apiKey, environment) {
  document.body.addEventListener('touchmove', captureEvent);
  if (configureLightbox(false)) {
    showCountdownState();
    setInstruction('Retrieving BlinkUp Information');
    var captureLightbox = activeLightbox;
    BU.getConfigId(apiKey, null, environment, function (err, configId) {
      // Ensure that the same lightbox is still open
      if (captureLightbox === activeLightbox) {
        if (err !== null) {
          showError(err);
          return;
        } else if (configId !== null) {
          flashWithConfig(configId);
        } else {
          showError('Unknown issue retrieving configuration');
          return;
        }
      }
    });
  }
}

/**
* Start the flash process for a ConfigId
*
* @param {BU.ConfigId} configId The ConfigId to be used for configuring the device
*/
function flashWithConfig (configId) {
  startCountdown(function () {
    var networkConfig = new BU.NetworkConfig({
      ssid: '',
      password: '',
      addressing: getAddressing(),
      proxy: getProxy()
    });

    if (document.getElementById('wireless').checked) {
      networkConfig.ssid = document.getElementById('ssid').value;
      networkConfig.password = document.getElementById('password').value;
    }

    var options = {
    };

    setInstruction('Do not move the device');
  // BU.pollTimeout = 60;
  // Perform the BlinkUp (flashing)
    BU.startNetworkFlash(configId, networkConfig, options,
    function () {
      // Hide the canvas and progress bar now that BlinkUp is complete
      hideFlashingElements();

      // Show status of device polling
      setInstruction('Gathering device data (' + BU.pollTimeout + 's max)');
      document.getElementById('status').style.display = 'block';
      showPolling();

      // Poll the device for results of the BlinkUp process
      getDeviceStatus(configId);
    });
  });
}

/**
* Poll the device for flashing results and display them on the screen
*
* @param {BU.ConfigId} configId The ConfigId used during startNetworkFlash
*/
function getDeviceStatus (configId) {
  BU.pollForDeviceInfo(configId, function (err, deviceInfo) {
    // Show the process is finished and hide the polling progress
    hidePollingProgress();

    // FAKE testing data
    // Will not work currently as there is no access to DeviceInfo
    // err = null;
    // deviceInfo = new BU.DeviceInfo({agentURL: 'https://agent.electricimp.com/M7alL_I1i0OY7', deviceId: '762836287hjwhq872'});
    // deviceInfo = new BU.DeviceInfo({agentURL: '', deviceId: '762836287hjwhq872'});

    // Display the results
    if (err) {
      setInstruction('Device did not connect');
      showResult(err, false);
    } else if (deviceInfo) {
      setInstruction('Device is connected');
      if (deviceInfo.agentURL === '' || deviceInfo.agentURL === 'https://agent.devices.lunera.com/NoModelSetForDevice') {
        showResult('<h4>Agent URL</h4><span>Generate unique Agent URL using Electric Imp IDE to access this agent remotely. In IDE, assign this device to a model to get an Agent URL.</span><h4>Device ID</h4>' + deviceInfo.deviceId, true);
      } else {
        var splitArr = deviceInfo.agentURL.split('/');
        var lastElement = splitArr.pop();

        if (lastElement === '') {
          lastElement = splitArr.pop();
        }

        var frontURL = splitArr.join('/');

        lastElement = lastElement || '';
        frontURL = frontURL || '';

        showResult("<h4>Agent URL</h4><a class='agentURL' href='" + deviceInfo.agentURL + "'><p>" + frontURL + '</p><p>' + lastElement + '</p></a><h4>Device ID</h4>' + deviceInfo.deviceId, true);
      }
    }
  });
}

/*
* Helper Funtions
*/

/**
* Open a lightbox if one does not exist. If one is already open, cancel any
* actions and set the content. In this the configuration will be ignored
*/
function openLightboxSingleton (content, configuration) {
  if (activeLightbox !== null) {
    if (countDownTimer !== null) {
      clearInterval(countDownTimer);
    }

    BU.stopFlash();
    BU.stopPolling();
    activeLightbox.setContent(content);
  } else {
    activeLightbox = $.featherlight(content, configuration);
  }
}

/**
* Hide progress bar and BlinkUp canvas
* @param {int} hideSpeed The speed at which to transition (optional)
*/
function hideFlashingElements (hideSpeed) {
  if (typeof hideSpeed === 'undefined' || hideSpeed < 0) {
    hideSpeed = 400;
  }
  $('#BU-progress').hide(hideSpeed);
  $('#BU-canvas').hide(hideSpeed);
  $('#imp-credit').hide(hideSpeed);
  document.body.removeEventListener('touchmove', captureEvent);
}

/**
* Show progress activity monitor gif
*/
function showPolling () {
  $('status').show(400);
  $('#progress-img').show(400);
}

/**
* Hide progress activity monitor gif
*/
function hidePollingProgress () {
  $('status').show(400);
  $('.progress').hide(400);
  $('#progress-img').hide();
}

/**
* Set lightbox title
*
* @param {string} instructionString Set the instructions to put in the lightbox
*                                   title field
*/
function setInstruction (instructionString) {
  var instructions = document.getElementById('current-instruction');
  instructions.innerHTML = instructionString;
}

/**
* Show BlinkUp process results
*
* @param {string} resultString The result string to display
* @param {bool} success Indicates whether or not the result is a success or
*                       a failure and colours the result string accordingly
*/
function showResult (resultString, success) {
  var result = document.getElementById('result');
  result.innerHTML = resultString;
  if (success === true) {
    result.className = 'success';
  } else if (success === false) {
    result.className = 'failure';
  }
}

/**
* Hide BlinkUp process results
*/
function hideResult () {
  var result = document.getElementById('result');
  result.innerHTML = '';
  result.className = 'hidden';
}

/**
* Initialize and show the lightbox
*
* @param {bool} isDisconnectDevice  Indicates whether this is a disconnect device
*               operation; if false, does not validate network credentials
*/
function configureLightbox (isDisconnectDevice) {
  // If configuring a wireless network, need a SSID
  if (isDisconnectDevice !== true && document.getElementById('wireless').checked && document.getElementById('ssid').value === '') {
    var incompleteNetworkConfigurationMessage = 'Please provide a complete wireless network configuration';
    showError(incompleteNetworkConfigurationMessage);
    return false;
  }

  // Show the lightbox containing progress bar and canvas
  var configuration = {
    closeOnClick: true,
    closeOnEsc: true,
    closeIcon: '',
    otherClose: '#lightbox-close',
    afterClose: cancelBlinkUp,
    afterOpen: function () {
      if (!isOnMobile()) {
        // If not running on mobile, pin the blinkup lightbox to the bottom of the screen
        $('.featherlight-content').css('vertical-align', 'bottom');
      }
    }
  };

  openLightboxSingleton(blinkUpTemplate.clone(), configuration);

  // Validate all inputs to BlinkUp before proceeding
  document.getElementById('countdown').style.display = 'none';
  document.getElementById('imp-credit').style.visibility = 'none';
  document.getElementById('status').style.display = 'none';
  document.getElementById('BU-progress').style.display = 'none';
  document.getElementById('BU-canvas').style.display = 'none';

  if (isDisconnectDevice !== true) {
    var networkConfig = new BU.NetworkConfig({
      ssid: '',
      password: '',
      addressing: getAddressing(),
      proxy: getProxy()
    });

    if (document.getElementById('wireless').checked) {
      networkConfig.ssid = document.getElementById('ssid').value;
      networkConfig.password = document.getElementById('password').value;
    }

    var incompleteNetworkConfigurationMessage = 'Please provide a complete network configuration';

    if (networkConfig.isComplete() === false) {
      console.log('BU: Incomplete network configuration was provided'); // eslint-disable-line no-console
      showError(incompleteNetworkConfigurationMessage);
      return false;
    }

    if (!(networkConfig.addressing === null && typeof networkConfig.addressing === 'object')) {
      if (networkConfig.addressing.isComplete() === false) {
        console.log('BU: Incomplete static network configuration was provided'); // eslint-disable-line no-console
        showError(incompleteNetworkConfigurationMessage);
        return false;
      }
    }

    if (!(networkConfig.proxy === null && typeof networkConfig.proxy === 'object')) {
      if (networkConfig.proxy.isComplete() === false) {
        console.log('BU: Incomplete proxy configuration was provided'); // eslint-disable-line no-console
        showError(incompleteNetworkConfigurationMessage);
        return false;
      }
    }
  }

  return true;
}

/**
*  Configure the lightbox for a countdown
*/
function showCountdownState () {
  // Initialize BlinkUp and result elements; show progress bar but hide canvas
  // until countdown is over
  document.getElementById('countdown').style.display = 'block';
  document.getElementById('imp-credit').style.display = 'block';
  document.getElementById('status').style.display = 'none';
  document.getElementById('BU-progress').style.display = 'block';
  document.getElementById('BU-canvas').style.display = 'none';
}

/**
*  Start the countdown from 5 to 0
*
* @param {function} callback Called after lightbox is displayed
*/
function startCountdown (callback) {
  showCountdownState();
  setInstruction('Press the device sensor against the screen within the blue box');

  // Begin countdown
  var count = 5;
  document.getElementById('countdown').innerHTML = '<p>' + count + '</p>';

  countDownTimer = setInterval(function () {
    count--;

    if (count <= 0) {
      clearInterval(countDownTimer);
      document.getElementById('BU-canvas').style.display = 'block';
      document.getElementById('countdown').style.display = 'none';
      document.getElementById('imp-credit').style.visibility = 'hidden';

      return callback();
    }

    document.getElementById('countdown').innerHTML = '<p>' + count + '</p>';
  }, 1000);

  hideResult();
}
