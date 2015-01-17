timepie
=======

[![Build Status](https://travis-ci.org/mieky/timepie.svg?branch=master)](https://travis-ci.org/mieky/timepie)

A pie-shaped timer! Live installation at [mike.fi/timepie](http://mike.fi/timepie/).

Should work smoothly on Chrome and Safari, and a little less smoothly on Firefox.

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

Play/pause with a mouse doubleclick or spacebar. Reset with spacebar.
On touch devices, you scan swipe to set duration, and double-tap to play.

You can also pass the time via URL parameter, e.g.
- minutes + seconds: http://mike.fi/timepie/#t=5m30
- just seconds: http://mike.fi/timepie/#t=300
- short! http://mike.fi/timepie/#15

### Tech

This project is mainly for me to tinker with some fascinating tech:

- TypeScript
- D3 for visualizing
- Gulp for building
- Browserify (+tsify for TypeScript)
- autoprefixer for not having to type CSS vendor-prefixes
- RxJS
- Web Audio API

### TODO

- use Typescript 1.4 when possible (let, const)
- support for being able to resume from becoming inactive
- prevent screen sleep ([this hack](http://jsbin.com/dubezaqu/3/) seems to work on iOS 8)
- use event streams instead of callbacks for memorizing durations
- possibly remove tweening for mobile devices
- get rid of timeouts if possible
- rounded corners without graphics bugs

### Acknowledgements

- Thanks to [anttti](https://github.com/anttti) for providing a good [Gulp boilerplate](https://gist.github.com/anttti/a387fa2c87b34de5d9f8) for getting up to speed
- Thanks to pohjammikko for the beeper MVP!
- This project is a grateful recipient of the [Futurice Open Source sponsorship program](http://futurice.com/blog/sponsoring-free-time-open-source-activities).

### Miscellanous notes

Does (at least partial) Livereload and source maps for Typescript.

The command-line equivalent of 'gulp ts':

```watchify src/index.ts -p tsify --debug -o build/index.js```
