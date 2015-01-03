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

### TODO

- clean up the messy code
- write proper interfaces
- instructions/better UI for starting & stopping timer
- set custom duration
- realign on window resize
- make some noise when time runs out
- have rounded corners without graphics bugs
- facelift: nicer colors, shades, etc.

### Miscellanous notes

Does (at least partial) Livereload and source maps for Typescript.

The command-line equivalent of 'gulp ts':

```watchify src/index.ts -p tsify --debug -o build/index.js```
