/**
    App entry point.
*/
import Timepie   = require("./timepie");
import events    = require("./events");
import storage   = require("./storage");
import parameter = require("./parameter");

var app = new Timepie({
    duration: parameter.parseDuration() || storage.getStartupDuration(),
    onFinish: storage.memorizeDuration
});

events.initialize(app);
app.start();

window["timepie"] = app;
