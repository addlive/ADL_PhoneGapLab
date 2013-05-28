(function () {
  'use strict';

  // Imports
  var Log;

  // Consts

  var APP_ID = 1,
      API_KEY = 'CloudeoTestAccountSecret';

  function _onDeviceReady() {
    Log = ADL.Log;
    ADL.initStdLogging(true);
    Log.d('Got platform ready');
    var initListener = new ADL.PlatformInitListener();

    /**
     *
     * @param {ADL.InitStateChangedEvent}e
     */
    initListener.onInitStateChanged = function (e) {
      _updateState(e.state);
      if (e.state == ADL.InitState.INITIALIZED) {
        _onPlatformReady();
      } else {
        Log.d("Got init state: " + JSON.stringify(e));
      }
    };
    ADL.initPlatform(initListener, {apiKey: API_KEY, applicationId: APP_ID});
  }

  function _onPlatformReady() {

    Log.d("Got platform ready");
    _populateVersion();
  }

  function _populateVersion() {
    var onV = function (version) {
      $('#sdkVersionLbl').text(version);
      _updateState('Platform Ready');
    };
    ADL.getService().getVersion(ADL.r(onV));
  }


  function _updateState(state) {
    $('#stateLbl').text(state);
  }

  document.addEventListener('deviceready', _onDeviceReady, false);

}());
