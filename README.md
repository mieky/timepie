timepie
=======

A pie-shaped timer!

Hopefully one day useful as a presentation timer, e.g. for those fine people presenting at [Webbisauna](http://www.webbisauna.fi/).

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

### TODO

- make some noise when time runs out
- touch support, ipad compatibility
- rounded corners without graphics bugs

### Miscellanous notes

Does (at least partial) Livereload and source maps for Typescript.

The command-line equivalent of 'gulp ts':

```watchify src/index.ts -p tsify --debug -o build/index.js```
