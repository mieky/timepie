/**
    App entry point.
*/
import Timepie = require("./timepie");
import events  = require("./events");
import storage = require("./storage");

var app = new Timepie({
    duration: storage.getStartupDuration(),
    onFinish: storage.memorizeDuration
});

events.initialize(app);
app.start();

window["timepie"] = app;
