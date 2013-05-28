(function () {
  'use strict';
  // Imports
  var Log;

  // Consts

  var APP_ID = 1,
      API_KEY = 'CloudeoTestAccountSecret';

  // Variables
  var localRenderEnabled = false,
      remoteRenderEnabled = false,
      previewSinkId,
      availCams = [], currentCamIdx,

      /**
       * @type {ADL.MediaConnection}
       */
          activeConnection;


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
    setTimeout(function () {
      ADL.initPlatform(initListener, {apiKey: API_KEY, applicationId: APP_ID});
    }, 100);

  }

  function _onOrientationChanged() {
    if (_isInLandscape()) {
      Log.d('Got an orientation changed to landscape');
      $(document.body).addClass('landscape');
    } else {
      Log.d('Got an orientation changed to portrait');
      $(document.body).removeClass('landscape');
    }
    if (localRenderEnabled) {
      ADL.relocateRenderer('localRenderer');
    }
    if (remoteRenderEnabled) {
      ADL.relocateRenderer('remoteRenderer');
    }
  }

  function _onAppPause() {
    Log.d('Got app pause - suspending functionality');
    ADL.disposeRenderer('localRenderer');
    ADL.disposeRenderer('remoteRenderer');
    ADL.getService().stopLocalVideo(ADL.r());
    activeConnection.disconnect(ADL.r());
  }

  function _onAppResume() {
    _startLocalVideo();
    _connect();
  }


  function _onPlatformReady() {
    Log.d("Got platform ready");
    _setupListener();
    _populateVersion();
    _getCams();
    _startLocalVideo();
    _initUI();
  }

  function _populateVersion() {
    Log.d('Populating version');
    var onV = function (version) {
      $('#sdkVersionLbl').text(version);
    };
    ADL.getService().getVersion(ADL.r(onV));
  }

  function _setupListener() {
    Log.d('Setting up listener');
    var listener = new ADL.AddLiveServiceListener();

    /**
     *
     * @param {ADL.UserStateChangedEvent}e
     */
    listener.onUserEvent = function (e) {
      Log.d('Got user event');
      if (e.isConnected && e.videoPublished) {
        ADL.renderSink({containerId: 'remoteRenderer', sinkId: e.videoSinkId});
        remoteRenderEnabled = true;
      } else {
        ADL.disposeRenderer('remoteRenderer');
        remoteRenderEnabled = false;
      }
    };

    listener.onMediaStreamEvent = function (e) {
      Log.d('Got Media Stream event');
      switch (e.mediaType) {
        case ADL.MediaType.VIDEO:
          if (e.videoPublished) {
            remoteRenderEnabled = true;
            ADL.renderSink({containerId: 'remoteRenderer', sinkId: e.videoSinkId});
          } else {
            ADL.disposeRenderer('remoteRenderer');
            remoteRenderEnabled = false;
          }
      }
    };
    ADL.getService().addServiceListener(ADL.r(), listener);
  }


  function _getCams() {
    Log.d('Getting cams');
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
    Log.d('Initialising UI');
    $('#toggleCamBtn').click(_toggleCam);
    $('#connectBtn').click(_connect);
    $('#disconnectBtn').click(_disconnect);
    $('#enableAudioBtn').click(_publishAudio);
    $('#disableAudioBtn').click(_unpublishAudio);
    $('#enableVideoBtn').click(_publishVideo);
    $('#disableVideoBtn').click(_unpublishVideo);
  }

  function _startLocalVideo() {
    Log.d('Starting local video');
    var onVStarted = function (sinkId) {
      previewSinkId = sinkId;
      ADL.renderSink({sinkId: sinkId, containerId: 'localRenderer'});
      localRenderEnabled = true;
    };
    ADL.getService().startLocalVideo(ADL.r(onVStarted));
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

  function _connect() {
    Log.d('Connecting');
    var scopeId = $('#scopeIdInp').val();

    /**
     *
     * @param {ADL.MediaConnection} conn
     */
    var onConnected = function (conn) {
      $('#connectBtn').hide();
      $('#disconnectBtn').show();
      $('#disableAudioBtn').show();
      $('#disableVideoBtn').show();
      $('#scopeIdInp').attr('disabled', 'true');

      activeConnection = conn;
    };
    var connDescr = {
      scopeId: scopeId,
      authDetails: {
        userId: _randomUserId(),
        salt: '',
        signature: '',
        expires: new Date().getTime() + (5 * 60)
      }
    };
    ADL.getService().connect(ADL.r(onConnected), connDescr);
  }

  function _disconnect() {
    Log.d('Disconnecting from a scope');
    ADL.disposeRenderer('remoteRenderer');
    var onD = function () {
      activeConnection = undefined;
      $('#connectBtn').show();
      $('#hidden-on-start').hide();
      $('#scopeIdInp').removeAttr('disabled');
      remoteRenderEnabled = false;
    };
    activeConnection.disconnect(ADL.r(onD));
  }

  function _publishAudio() {
    var onDone = function () {
      $('#enableAudioBtn').hide();
      $('#disableAudioBtn').show();
    };
    activeConnection.publishAudio(ADL.r(onDone));
  }

  function _unpublishAudio() {
    var onDone = function () {
      $('#enableAudioBtn').show();
      $('#disableAudioBtn').hide();
    };
    activeConnection.unpublishAudio(ADL.r(onDone));
  }

  function _publishVideo() {
    var onDone = function () {
      $('#enableVideoBtn').hide();
      $('#disableVideoBtn').show();
    };
    activeConnection.publishVideo(ADL.r(onDone));
  }

  function _unpublishVideo() {
    var onDone = function () {
      $('#enableVideoBtn').show();
      $('#disableVideoBtn').hide();
    };
    activeConnection.unpublishVideo(ADL.r(onDone));
  }


  function _randomUserId() {
    return Math.floor(Math.random() * 1000);
  }

  function _isInLandscape() {
    return window.orientation === 90 || window.orientation === -90;
  }

  document.addEventListener('deviceready', _onDeviceReady, false);
  document.addEventListener('orientationchange', _onOrientationChanged, true);
  document.addEventListener('pause', _onAppPause, true);
  document.addEventListener('resume', _onAppResume, true);
  document.addEventListener('touchmove', function (e) {
    e.preventDefault();
  }, false);

}());
