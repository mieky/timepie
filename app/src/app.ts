///<reference path='./types/node.d.ts' />

var TimepieApp = require("./timepie");

var app = new TimepieApp({
    total:   30 * 1000,
    current: 30 * 1000
});
app.start();
