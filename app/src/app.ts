///<reference path='./types/node.d.ts' />

var TimepieApp = require("./timepie");

var app = new TimepieApp({
    total:   300 * 1000,
    current: 300 * 1000
});
app.start();
