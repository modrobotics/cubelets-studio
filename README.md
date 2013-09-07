CUBELETS STUDIO
===============

Cubelets Studio is a programming environment for Mac OS X. Connect to your Bluetooth Cubelet, and unlock the power of Cubelets CODE to create new advanced behaviors for your robot constructions.

Step 1: Connect
---------------
Pair your Bluetooth Cubelet adding the device using Apple > System Preferences > Bluetooth. Once paired, click the Connect button in Cubelets Studio to connect to your device.

Step 2: Create
--------------
Make Cubelets CODE programs in the code editor! Use the File menu to create, save, or open program files.

Step 3: Build
-------------
Select the program you want to build, then select the target Cubelet in the construction orbit control. The target must be attached to the Bluetooth Cubelet. Click the Build button to compile your programs! Keep an eye on the console to debug any syntax errors that may exist in your program.

Step 4: Flash
-------------
Once you've successfully built your program, click the Flash button! Try not disconnect the target Cubelet, otherwise flashing may fail.

Troubleshooting
---------------
Connecting, creating, building, and flashing are not always perfect processes. Here's what could go wrong, along with recommended solutions.

* __Can't connect to a paired Bluetooth Cubelet?__ Try resetting the Bluetooth Cubelet by turning the power off and back on. Then try reconnecting through Cubelets Studio.

* __Cubelet is connected, but don't see full construction?__ Only Cubelets that are directly attached to the Bluetooth Cubelet can be flashed. If you don't see neighboring Cubelet, right click on the construction viewport, and select 'Discover nearby cubelets' in the context menu to attempt to discover your Cubelets.

* __Cubelet is unknown and displays a question mark?__ If you see a Cubelet in the construction viewport that has a question mark icon, it means Cubelets Studio doesn't have the information it needs to reprogram that particular Cubelet. You must be connected to the Internet to fetch this information from Modular Robotics' databases. Cubelet information should normally refresh automatically, but if it doesn't you can right click, and select 'Identify cubelets' in the construction viewport to force a refresh.

* __Does a build fail?__ You must be connected to the Internet to build your programs on Modular Robotics' online compiler. If you received a bad response from the compiler, try again. Check your console for a possible syntax error in your program. If you need help debugging your program, post your source code on the [Cubelets Programming Forum](https://www.modrobotics.com/blog/?forum=cubelets-programming) and ask for help.

* __Timeout occurs during flashing?__ Sometimes, flashing will fail and you may have to make an adjustment and try again. You may receive a message that says: "Timed out waiting for '?'" where '?' is the flash code. Here is a list of flash codes, what they mean, and how to troubleshoot your Cubelet:

    * '4': The Cubelet isn't ready for flashing. Wait a few seconds, then try again. If flashing fails again, reset the target Cubelet by briefly disconnecting it from the Bluetooth Cubelet.

    * 'Y': Uploading the flash program to the Bluetooth Cubelet failed. Make sure the Bluetooth Cubelet is still connected to your computer, and that your Battery Cubelet isn't low on charge.

    * 'Z': The Cubelet failed a self-diagnostic test and may be in danger of becoming bricked. Try flashing your program again. If this timeout persists, reset your Bluetooth Cubelet, reconnect, and try again.

    If the target Cubelet still can't be flashed after five or more attempts, your Cubelet may be 'permabricked' and need to be sent back to Modular Robotics for repairs. Try flashing another Cubelet to see if the problem only happens on a particular Cubelet. If so, contact support to have your Cubelet serviced.

Resources
---------
The [Cubelets CODE API Reference](http://code.modrobotics.com/documentation/) documents available Functions, Variables, and Structures for Cubelets programming. Please see the [Cubelets Programming Forum](https://www.modrobotics.com/blog/?forum=cubelets-programming) to ask questions and help others in the Cubelets community!