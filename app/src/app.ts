/**
    App entry point.
*/
import types   = require("./types");
import Timepie = require("./timepie");
import events  = require("./events");

var DEFAULT_DURATION  = 300;
var LAST_DURATION_KEY = "timepie_last_duration";

function getStartupDuration(): types.Duration {
    var lastDurationStr:string =
        window["localStorage"][LAST_DURATION_KEY] || "" + DEFAULT_DURATION;

    return {
        total: parseInt(lastDurationStr, 10) * 1000
    }
}

function memorizeDuration(duration: number) {
    // Memorize last finished duration for next startup
    var durationStr = "" + Math.round(duration / 1000);
    window["localStorage"][LAST_DURATION_KEY] = durationStr;
}

var options = <types.StartupOptions>{
    duration: getStartupDuration(),
    onFinish: memorizeDuration
};

var app = new Timepie(options);
events.initialize(app);
app.start();

window["timepie"] = app;
