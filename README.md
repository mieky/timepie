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

### TODO

- further split into proper TypeScript modules/interfaces
- instructions on how to play/pause
- set custom duration
- touch support, ipad compatibility
- make some noise when time runs out
- rounded corners without graphics bugs

### Miscellanous notes

Does (at least partial) Livereload and source maps for Typescript.

The command-line equivalent of 'gulp ts':

```watchify src/index.ts -p tsify --debug -o build/index.js```
