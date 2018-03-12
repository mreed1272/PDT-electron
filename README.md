# PDT-electron
Project to create interface software to PDT Arduino based pinewood derby timer

Being written for Pack 54, Lawrenceville, GA.

Requires Electron v1.4.15 or higher plus dependecies.
Requires node serialport (version 4.0.7) which will need to be rebuilt against electron using rebuild-module.cmd.  Look up information about rebuild native modules for use with Electron at http://electron.atom.io.  You will need to install several items including the modules node-gyp and windows-build-tools.

The module electron-packager is used to build the application.  Once the module is installed, there is a bat file included that will build the application - pdt-package.bat.
