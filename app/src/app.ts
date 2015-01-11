/**
    App entry point.
*/
///<reference path='./types/node.d.ts' />

var TimepieApp = require("./timepie");
var events     = require("./events");

var app = new TimepieApp({
    total:   300 * 1000,
    current: 300 * 1000
});

window["timepie"] = app;

events.initialize(app);

app.start();
