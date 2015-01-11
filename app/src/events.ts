/**
    Event handlers for touch and non-touch.
*/

var Rx = require("rx");

function initializeTouch(app) {
    window.addEventListener("scroll", function(e) {
        e.preventDefault();
        e.stopPropagation();
    }, false);

    var tapStream = Rx.Observable.fromEvent(document, "touchstart");
    var multiTapStream = tapStream
        .buffer((x) => { return tapStream.throttle(250); })
        .map((list) => { return list.length; })
        .filter((x) => { return x === 2; })
        .subscribe(app.pause.bind(app));

    var touchStream = Rx.Observable.fromEvent(document, "touchstart")
        .do((e) => {
            this.dy = 0;
            this.dx = 0;
            this.startXy = {
                x: e.touches[0].pageX,
                y: e.touches[0].pageY
            };
        })
        .map((e) => {
            e.preventDefault();
            e.stopPropagation();

            return Rx.Observable.fromEvent(document, "touchmove")
                .takeUntil(Rx.Observable.fromEvent(document, "touchend"));
        })
        .switch();

    var swipeVerticalStream = touchStream
        .filter(() => {
            return this.dy !== undefined;
        })
        .do((e) => {
            if (Math.abs(e.touches[0].pageY - this.startXy.y) >= 5) {
                delete this.dx;
            }
        })
        .map((e) => {
            var prevY = this.prevY || 0;
            var dir = e.touches[0].pageY > prevY ? -1 : 1;

            // Don't change values until locked on an axis, or if position unchanged
            if (this.dx !== undefined && this.dy !== undefined || e.touches[0].pageY === prevY) {
                dir = 0;
            }

            this.prevY = e.touches[0].pageY;
            return dir;
        })
        .throttleFirst(40) // slow down a bit
        .do((dir) => { app.adjustMinutes(dir); })
        .subscribe();

    var swipeHorizontalStream = touchStream
        .filter(() => {
            return this.dx !== undefined;
        })
        .do((e) => {
            if (Math.abs(e.touches[0].pageX - this.startXy.x) >= 5) {
                delete this.dy;
            }
        })
        .map((e) => {
            var prevX = this.prevX || 0;
            var dir = e.touches[0].pageX > prevX ? 1 : -1;

            // Don't change values until locked on an axis, or if position unchanged
            if (this.dx !== undefined && this.dy !== undefined || e.touches[0].pageX === prevX) {
                dir = 0;
            }

            this.prevX = e.touches[0].pageX;
            return dir;
        })
        .throttleFirst(20)
        .do((dir) => { app.adjustSeconds(dir); })
        .subscribe();

    app.displayStatus("swipe the time, double-tap to go!");
}

function initializeNonTouch(app) {
    var keyStream = Rx.Observable.fromEvent(document, "keydown")
        .do((e) => {
            switch (e.keyCode) {
                case 32: app.pause(); break;
                case 38: app.adjustSeconds(+1); break; // up
                case 40: app.adjustSeconds(-1); break; // down
                case 37: app.adjustMinutes(-1); break; // left
                case 39: app.adjustMinutes(+1); break; // right
            }
        })
        .subscribe();

    window.addEventListener("dbclick", app.pause.bind(app));

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
