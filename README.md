timepie
=======

A pie-shaped timer!

Features:
- set custom duration
- nicely visualize the remaining time
- beep when done

Potentially useful as an egg timer when cooking an omelette, or as a presentation for events such as [Webbisauna](http://www.webbisauna.fi/).

![Screenshot](https://github.com/mieky/timepie/raw/master/screenshot.png)

### Running

```
npm install
gulp
```

... and then http://localhost:8000/.

Play/pause with a mouse click or spacebar. Reset with spacebar.

### Tech

This project is mainly for me to tinker with some fascinating tech:

- TypeScript
- D3 for visualizing
- Gulp for building
- Browserify (+tsify for TypeScript)
- autoprefixer for not having to type CSS vendor-prefixes

### TODO

- touch support, ipad compatibility
- make sure sound plays onmobile
- get rid of timeouts if possible
- rounded corners without graphics bugs

### Miscellanous notes

Does (at least partial) Livereload and source maps for Typescript.

The command-line equivalent of 'gulp ts':

```watchify src/index.ts -p tsify --debug -o build/index.js```
