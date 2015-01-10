/**
    Event handlers for touch and non-touch.
*/

function initializeTouch(app) {
    document.addEventListener("touchend", app.pause.bind(app));
    window.addEventListener("scroll", function(e) {
        e.preventDefault();
        e.stopPropagation();
        }, false);

        app.displayStatus("swipe the time, tap to go!");
}

function initializeNonTouch(app) {
    document.addEventListener("click", app.pause.bind(app));
    document.addEventListener("keydown", function(e) {
        switch (e.keyCode) {
            case 32: app.pause(); break;
            case 38: app.adjustMinutes(+1); break; // up
            case 40: app.adjustMinutes(-1); break; // down
            case 37: app.adjustSeconds(-1); break; // left
            case 39: app.adjustSeconds(+1); break; // right
        }
        }.bind(app));

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
