/**
    Event handlers for touch and non-touch.
*/

///<reference path='./types/node.d.ts' />
///<reference path='./types/rx/rx.all.d.ts' />

import parameter = require("./parameter");

var Rx = require("rx");

export function initialize(app) {
    var hasTouch: boolean = "ontouchstart" in window;

    if (hasTouch) {
        initializeTouch(app);
    } else {
        initializeNonTouch(app);
    }

    initializeNotifications(app);

    document.addEventListener("visibilitychange", getVisibilityChangeHandler(app));
    window.addEventListener("resize", app.resize.bind(app));

    window.addEventListener("hashchange", function(e) {
        var newDuration = parameter.parseDuration(e["newURL"]);
        app.setDuration(newDuration);
    });
}

function getVisibilityChangeHandler(app) {
    var alarmTimeout = null;
    var Notification = window["Notification"];

    function onTimeup() {
        if (Notification.permission === "granted") {
            var not = new Notification("timepie: time's up!");

            // Have the app trigger a tick – this causes a proper
            // update leading to a finish() even if requestAnimationFrame
            // isn't available.
            app.tick(new Date().getTime());
        }
    }

    return function() {
        if (document.hidden && !app.paused) {
            var timeout = Math.round(app.pie.duration.current);
            alarmTimeout = setTimeout(onTimeup, timeout);
        }
        // We're visible again. If we had set an alarm timeout before,
        // we can resume normal operations again: cancel the timeout.
        else if (!document.hidden && !app.paused && alarmTimeout) {
            window.clearTimeout(alarmTimeout);
        }
    };
}

function initializeTouch(app) {
    var tapStream = Rx.Observable.fromEvent(document, "touchstart");
    var multiTapStream = tapStream
        .buffer((x) => tapStream.throttle(250))
        .map((list) => list.length)
        .filter((x) => x === 2)
        .subscribe(() => app.pause());

    var THRESHOLD = 10;

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

            return Rx.Observable.fromEvent(document, "touchmove")
                .takeUntil(Rx.Observable.fromEvent(document, "touchend"));
        })
        .switch();

    var swipeVerticalStream = touchStream
        .filter(() => this.dy !== undefined)
        .do((e) => {
            if (Math.abs(e.touches[0].pageY - this.startXy.y) >= THRESHOLD) {
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
        .throttleFirst(20) // slow down a bit
        .do((dir) => app.adjustSeconds(dir))
        .subscribe();

    var swipeHorizontalStream = touchStream
        .filter(() => this.dx !== undefined)
        .do((e) => {
            if (Math.abs(e.touches[0].pageX - this.startXy.x) >= THRESHOLD) {
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
        .throttleFirst(40)
        .do((dir) => app.adjustMinutes(dir))
        .subscribe();

    app.displayStatus("swipe the time, double-tap to go!");
}

function initializeNonTouch(app) {
    var tapStream = Rx.Observable.fromEvent(document, "mousedown");
    var multiTapStream = tapStream
        .buffer((x) => tapStream.throttle(250))
        .map((list) => list.length)
        .filter((x) => x === 2)
        .subscribe(() => app.pause());

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

    app.displayStatus("arrow keys & space!");
}

function initializeNotifications(app) {
    if (!("Notification" in window)) {
        return;
    }

    var Notification = window["Notification"];
    if (Notification.permission !== "denied") {
        Notification.requestPermission();
    }
}
