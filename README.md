CUBELETS STUDIO
===============

Cubelets Studio is a programming environment for [Cubelets](https://modrobotics.com/cubelets) on Mac OS X. Connect your Bluetooth Cubelet to your Mac to create new advanced behaviors for your robot constructions!

Overview
--------
![Screenshot](https://github.com/modrobotics/cubelets-studio/blob/master/img/studio.png?raw=true)

Step 1: Connect
---------------
Pair your Bluetooth Cubelet adding the device using `Apple > System Preferences > Bluetooth`. Once paired, click the Connect button in Cubelets Studio to connect to your device. Keep an eye on it: When you're connected the Connect button is green; if your connection is dropped it turns red.

Step 2: Create
--------------
Make Cubelets CODE programs in the code editor! Use the File menu to create, save, or open program files. We've provided a few example programs to help you get started.

Step 3: Build
-------------
Select the program tab you want to build, then select the target Cubelet you want to reprogram in the construction viewport. The target Cubelet must be attached to the Bluetooth Cubelet (an immediate neighbor). Click the Build button to compile your programs! Keep an eye on the console to debug any syntax errors that the compiler finds in your program.

Step 4: Flash
-------------
Once you've successfully built your program, see the new behavior you created by flashing it to your Cubelet! You can follow flashing progress by watching the LEDs on your Cubelets. While the program is uploading the Bluetooth LED will blink. Then, the target Cubelet LED will blink while it is being reprogrammed.

Troubleshooting
---------------
Connecting, creating, building, and flashing don't always work perfectly. Here's what could go wrong, along with recommended solutions.

__Can't connect to a paired Bluetooth Cubelet?__ Try resetting the Bluetooth Cubelet by turning the power off and back on. Then try reconnecting through Cubelets Studio.

__Cubelet is connected, but don't see full construction?__ Only Cubelets that are directly attached to the Bluetooth Cubelet can be flashed. If you don't see neighboring Cubelet, right click on the construction viewport, and select 'Discover nearby cubelets' in the context menu to attempt to discover your Cubelets.

__Cubelet is unknown and displays a question mark?__ If you see a Cubelet in the construction viewport that has a question mark icon, it means Cubelets Studio doesn't have the information it needs to reprogram that particular Cubelet. You must be connected to the Internet to fetch this information from Modular Robotics' databases. Cubelet information should normally refresh automatically, but if it doesn't you can right click, and select 'Identify cubelets' in the construction viewport to force a refresh.

__Does a build fail?__ You must be connected to the Internet to build your programs on Modular Robotics' online compiler. If you received a bad response from the compiler, try again. Check your console for a possible syntax error in your program. If you need help debugging your program, post your source code on the Cubelets Programming Forum and ask for help.

__Timeout occurs during flashing?__ Sometimes, flashing will fail and you may have to make an adjustment and try again. You may receive a message that says: "Timed out waiting for '?'" where '?' is the flash code. Here is a list of flash codes, what they mean, and how to troubleshoot your Cubelet:

  - __'4':__ The Cubelet isn't ready for flashing. Wait a few seconds, then try again. If flashing fails again, reset the target Cubelet by briefly disconnecting it from the Bluetooth Cubelet.
    
  - __'Y':__ Uploading the flash program to the Bluetooth Cubelet failed. Make sure the Bluetooth Cubelet is still connected to your computer, and that your Battery Cubelet isn't low on charge.
    
  - __'Z':__ The Cubelet failed a self-diagnostic test and may be in danger of becoming bricked. Try flashing your program again. If this timeout persists, reset your Bluetooth Cubelet, reconnect, and try again.

__Flashing fails after many repeated attempts?__ If a target Cubelet can't be flashed after five or more attempts, your Cubelet may be 'permabricked' and need to be sent back to Modular Robotics for repairs. Try flashing another Cubelet to see if the problem only happens on a particular Cubelet. If so, contact support to have your Cubelet serviced.

__Need to return a Cubelet to default factory behavior?__ Select your Cubelet in the construction viewport, and select "Restore Default Firmware".

Resources
---------
  - [Cubelets CODE API Reference](http://code.modrobotics.com/documentation/): documents available Functions, Variables, and Structures for Cubelets programming.
  - [Cubelets Programming Forum](https://www.modrobotics.com/blog/?forum=cubelets-programming): ask questions and help others in the Cubelets community!
  - [Arduino C Reference](http://arduino.cc/en/Reference/HomePage)
