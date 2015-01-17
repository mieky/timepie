/**
    Data storage.
*/
import types = require("./types");

var DEFAULT_DURATION  = 300;
var LAST_DURATION_KEY = "timepie_last_duration";

export function getStartupDuration(): types.Duration {
    var lastDurationStr:string =
        window["localStorage"][LAST_DURATION_KEY] || "" + DEFAULT_DURATION;

    return {
        total: parseInt(lastDurationStr, 10) * 1000
    }
}

export function memorizeDuration(duration: number): void {
    // Memorize last finished duration for next startup
    var durationStr = "" + Math.round(duration / 1000);
    window["localStorage"][LAST_DURATION_KEY] = durationStr;
}
