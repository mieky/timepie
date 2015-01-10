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

    var mouseStream = Rx.Observable.fromEvent(document, "mousedown")
        .do((e) => {
            this.dy = 0;
            this.dx = 0;
            this.startXy = {
                x: e.x,
                y: e.y
            };
        })
        .map((e) => {
            e.stopPropagation();

            return Rx.Observable.fromEvent(document, "mousemove")
                .takeUntil(Rx.Observable.fromEvent(document, "mouseup"));
        })
        .switch();

    var mouseVerticalStream = mouseStream
        .filter(() => {
            return this.dy !== undefined;
        })
        .do((e) => {
            if (Math.abs(e.y - this.startXy.y) >= 5) {
                delete this.dx;
            }
        })
        .map((e) => {
            var prevY = this.prevY || 0;
            var dir = e.y > prevY ? -1 : 1;

            this.prevY = e.y;
            return dir;
        })
        .throttleFirst(40) // slow down a bit
        .do((dir) => { app.adjustMinutes(dir); })
        .subscribe();

    var mouseHorizontalStream = mouseStream
        .filter(() => {
            return this.dx !== undefined;
        })
        .do((e) => {
            if (Math.abs(e.x - this.startXy.x) >= 5) {
                delete this.dy;
            }
        })
        .map((e) => {
            var prevX = this.prevX || 0;
            var dir = e.x > prevX ? 1 : -1;

            this.prevX = e.x;
            return dir;
        })
        .throttleFirst(20)
        .do((dir) => { app.adjustSeconds(dir); })
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
