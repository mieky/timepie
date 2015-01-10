/**
    Event handlers for touch and non-touch.
*/

var Rx = require("rx");

function initializeTouch(app) {
    document.addEventListener("touchend", app.pause.bind(app));
    window.addEventListener("scroll", function(e) {
        e.preventDefault();
        e.stopPropagation();
    }, false);

    app.displayStatus("swipe the time, tap to go!");
}

function initializeNonTouch(app) {
    var clickStream = Rx.Observable.fromEvent(document, "click")
        .do(app.pause.bind(app))
        .subscribe();

    var keyStream = Rx.Observable.fromEvent(document, "keydown")
        .do((e) => {
            switch (e.keyCode) {
                case 32: app.pause(); break;
                case 38: app.adjustMinutes(+1); break; // up
                case 40: app.adjustMinutes(-1); break; // down
                case 37: app.adjustSeconds(-1); break; // left
                case 39: app.adjustSeconds(+1); break; // right
            }
        })
        .subscribe();

    app.displayStatus("<em>space</em> plays / pauses<br /><em>arrow keys</em> adjust time");
}

export function initialize(app) {
    window.addEventListener("resize", app.resize.bind(app));

    var hasTouch: boolean = "ontouchstart" in window;

    if (hasTouch) {
        initializeTouch(app);
    } else {
        initializeNonTouch(app);
    }
}
