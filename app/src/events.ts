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
/*
    var clickStream = Rx.Observable.fromEvent(document, "click")
        .do(app.pause.bind(app))
        .subscribe();
*/
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
            this.dx = 0;
            this.dy = 0;
            this.xy = {
                x: e.x,
                y: e.y
            };
        })
        .map((e) => {
            e.stopPropagation();

            return Rx.Observable.fromEvent(document, "mousemove")
                .takeUntil(Rx.Observable.fromEvent(document, "mouseup"));
        })
        .switch()
        .do((e) => {
            if (this.dx !== undefined) this.dx = this.dx.x - e.x;
            if (this.dy !== undefined) this.dy = this.xy.y - e.y;
        });

    var mouseVerticalStream = mouseStream
        .filter((e) => {
            return this.dy >= 5 && this.dy > (this.dx || 0);
        })
        .do(() => { delete this.dx; });

    var mouseHorizontalStream = mouseStream
        .filter((e) => {
            return this.dx >= 5 && this.dx > (this.dy || 0);
        })
        .do(() => { delete this.dy; });

    var mouseVSub = mouseVerticalStream
        .do((e) => { console.log(this.dy); })
        .subscribe();

    var mouseHSub = mouseHorizontalStream
        .do((e) => { console.log(this.dx); })
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
