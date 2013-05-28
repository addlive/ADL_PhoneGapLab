(function () {
  'use strict';
  // Imports
  var Log;

  // Consts

  var APP_ID = 1,
      API_KEY = 'CloudeoTestAccountSecret';

  // Variables
  var renderStarted = false,
      previewSinkId,
      availCams = [], currentCamIdx;


  function _onDeviceReady() {
    Log = ADL.Log;
    _onOrientationChanged();
    ADL.initStdLogging(true);
    Log.d('Got platform ready');
    var initListener = new ADL.PlatformInitListener();

    /**
     *
     * @param {ADL.InitStateChangedEvent}e
     */
    initListener.onInitStateChanged = function (e) {
      if (e.state == ADL.InitState.INITIALIZED) {
        _onPlatformReady();
      } else {
        Log.d("Got init state: " + JSON.stringify(e));
      }
    };
    ADL.initPlatform(initListener, {apiKey: API_KEY, applicationId: APP_ID});
  }

  function _onOrientationChanged() {
    if (_isInLandscape()) {
      $('#renderWrapper').addClass('landscape');
    } else {
      $('#renderWrapper').removeClass('landscape');
    }
    if (renderStarted) {
      ADL.relocateRenderer('localRenderer');
    }
  }

  function _onPlatformReady() {
    Log.d("Got platform ready");
    _populateVersion();
    _getCams();
    _initUI();
  }

  function _populateVersion() {
    var onV = function (version) {
      $('#sdkVersionLbl').text(version);
    };
    ADL.getService().getVersion(ADL.r(onV));
  }


  function _getCams() {
    var onCams = function (devs) {
      for (var id in devs) {
        availCams.push(id);
      }
      Log.d('Go cameras: ' + JSON.stringify(availCams));
      ADL.getService().getVideoCaptureDevice(ADL.r(onCam));
    }, onCam = function (id) {
      currentCamIdx = availCams.indexOf(id);
    };
    ADL.getService().getVideoCaptureDeviceNames(ADL.r(onCams));
  }

  function _initUI() {
    $('#startRenderBtn').click(_startLocalVideo);
    $('#stopRenderBtn').click(_stopLocalVideo);
    $('#toggleCamBtn').click(_toggleCam);
  }

  function _startLocalVideo() {
    var onVStarted = function (sinkId) {
      previewSinkId = sinkId;
      ADL.renderSink({sinkId: sinkId, containerId: 'localRenderer'});
      renderStarted = true;
      $('#startRenderBtn').hide();
      $('#stopRenderBtn').show();
    };
    ADL.getService().startLocalVideo(ADL.r(onVStarted));
  }

  function _stopLocalVideo() {
    var onVStopped = function () {
      previewSinkId = undefined;
      ADL.disposeRenderer('localRenderer');
      renderStarted = false;
      $('#startRenderBtn').show();
      $('#stopRenderBtn').hide();
    };
    ADL.getService().stopLocalVideo(ADL.r(onVStopped));
  }

  function _toggleCam() {
    Log.d('Toggling cam');
    var nextCamIdx = (currentCamIdx + 1) % availCams.length,
        onSet = function () {
          Log.d('Cam set. Updating camera index to: ' + nextCamIdx);
          currentCamIdx = nextCamIdx;
        };
    var camId = availCams[nextCamIdx];
    Log.d('Trying to set cam: ' + camId);
    ADL.getService().setVideoCaptureDevice(ADL.r(onSet), camId);
  }


  function _isInLandscape() {
    return window.orientation === 90 || window.orientation === -90;
  }

  document.addEventListener('deviceready', _onDeviceReady, false);
  window.addEventListener('orientationchange', _onOrientationChanged, true);
  document.addEventListener('touchmove', function (e) {
    e.preventDefault();
  }, false);

}());
