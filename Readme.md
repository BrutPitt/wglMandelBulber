# WebGL MandelBulb Ray Marching 3D rendering

WebGL MandelBulb Ray Marching 3D rendering with the following features:
- light model (blinn-phong)
- shadows
- ambient occlusion
- subpixel subdivision
- level of details (epsilon)
- auto-progressive step of accuracy.

![](https://raw.githubusercontent.com/BrutPitt/wglMandelBulber/master/screenShots/mbulb.jpg)

### Commands
- LeftMouseButton - Rotate object
- RightMouseButton - Rotate light
- MouseWheel - Zoom in/out

### Live WebGL
[https://www.michelemorrone.eu/WebGL/MBulb/WebGL/MBulber/MBulb.html](https://www.michelemorrone.eu/WebGL/MBulb/WebGL/MBulber/MBulb.html)

### Description

This is my 2012 **pure** WebGL 1.0 Experiment, without 3th party WebGL tools/library.

It uses only [gl-matrix](https://github.com/toji/gl-matrix) js library for 3D transformations, and other self-made tools in the [jsLib](https://github.com/BrutPitt/wglMandelBulber/tree/master/jsLib) directory

### Warnings
For standalone use, on local computer, need of an http server to load external **glsl** shader file.

**Commons workarounds**

For safety the browsers can't load external files from local machine, but if you want to test this experiment, without a http server, you can use a workaround:


**Chrome** 

Launch browser with `--allow-file-access-from-files` command line option.

**Firefox** (from v.68 and above: before works fine w/o any settings)

In `about:config` url (config page), set `privacy.file_unique_origin = false`