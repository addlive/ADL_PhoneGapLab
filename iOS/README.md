# AddLive iOS PhoneGap Labs

This directory contains a sample project showcasing the AddLive iOS PhoneGap
plug-in.

To read more about the AddLive or to obtain the iOS SDK, visit
http://www.addlive.com


## About the sample application

The sample application provides 3 sample views showcasing single area of the 
platform functionality:

* PlatformInitDemo.html - shows how to initialize the platform
* LocalVideo.html - shows how to deal with local video preview, rendering and
  devices control
* CallApp.html - shows how to maintain connectivity using simple one on one
  calling app convention

## Building the application

To use the application you need to obtain AddLive iOS SDK and the PhoneGap
plug-in sources. To obtain those visit http://www.addlive.com.

Once you have all required components, copy the AddLive.framework to the iOS
directory, then for the PhoneGap plugin copy the files from the plug-in package
located in src/Obj-C directory to the PhoneGapLab/PhoneGapLab/Plugins and
files from src/JS directory to the PhoneGapLab/www/js.

To use particular sub-application, select one of the provided html files in the
PhoneGapLab/PhoneGapLab/config.xml
 

In case of any questions or issues - feel free to reach us at
http://community.addlive.com.
