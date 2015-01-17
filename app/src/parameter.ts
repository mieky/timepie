import types = require("./types");

function seconds(mins: string, secs: string): number {
    return 60 * parseInt(mins, 10) + parseInt(secs, 10);
}

// Parse the URL for a time string
function parseTime(subject: string): number {
    var idx: number = subject.indexOf("#");

    if (idx === -1) {
        return null;
    }

    var rest = subject.substring(idx);

    // 03:08, 03m08
    var matches = rest.match(/^(?:#t=|#)?(\d+)[:m](\d{1,2})$/);
    if (matches && matches[2] !== undefined) {
        return seconds(matches[1], matches[2]);
    }

    // 188
    matches = rest.match(/^(?:#t=|#)?(\d+)$/);
    if (matches && matches[1] !== undefined) {
        return seconds("0", matches[1]);
    }

    return null;
}

export function parseDuration(uri: string = window.location.href): types.Duration {
    var seconds: number = parseTime(uri);

    if (seconds === null) {
        return null;
    }
    return {
        total: seconds * 1000
    };
}
