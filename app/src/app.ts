///<reference path='./types/node.d.ts' />

var TimepieApp = require("./timepie");

var app = new TimepieApp({
    total:   194 * 1000,
    current: 194 * 1000
});

document.addEventListener("click", app.pause.bind(app));
document.addEventListener("keydown", function(e) {
    switch (e.keyCode) {
        case 32: app.pause(); break;
        case 38: app.adjustMinutes(+1); break; // up
        case 40: app.adjustMinutes(-1); break; // down
        case 37: app.adjustSeconds(-1); break; // left
        case 39: app.adjustSeconds(+1); break; // right
    }
}.bind(app));

window['timepie'] = app;
app.start();
