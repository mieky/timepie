///<reference path='./node.d.ts' />

var graph = require("./graph");
var util  = require("./util");

interface Duration {
    total: number
    current: number
}

interface Pie {
    width: number
    height: number
    radius: number
    duration: Duration
}

class Timepie {

    pie: any;
    pieVis: any;
    lastTimestamp: number;
    lastUpdate: number;
    paused: boolean;

    constructor(duration: Duration) {
        this.pie           = this.createPie(duration);
        this.pieVis        = graph.create(this.pie);
        this.lastTimestamp = null;
        this.lastUpdate    = null;
        this.paused        = true;

        this.setListeners();
    }

    private createPie(duration: Duration) {
        return {
            width: window.innerWidth,
            height: window.innerHeight - 30,
            radius: (Math.min(window.innerHeight, window.innerWidth) - 50) / 2,
            duration: duration
        };
    }

    private recreate() {
        graph.clear();
        this.pie = this.createPie(this.pie.duration);
        this.pieVis = graph.create(this.pie);        
    }

    private setListeners() {
        window.addEventListener("resize", this.recreate.bind(this));

        document.addEventListener("click", this.pause.bind(this));
        document.addEventListener("keypress", function(e) {
            if (e.keyCode === 32) {
                this.pause();
            }
        }.bind(this));
    }

    private tick(timestamp: number) {
        if (this.paused) {
            return;
        }

        if (!this.lastTimestamp) {
            this.lastTimestamp = timestamp;
        }

        this.pie.duration.current = this.pie.duration.current - (timestamp - this.lastTimestamp);
        this.lastTimestamp = timestamp;

        if (!this.lastUpdate || this.lastUpdate !== util.millis2seconds(this.pie.duration.current)) {
            this.lastUpdate = util.millis2seconds(this.pie.duration.current);
            graph.update(this.pie, this.pieVis);
        }

        if (this.pie.duration.current <= 0) {
            console.log("Finished!");
            return;
        }

        window.requestAnimationFrame(this.tick);
    }

    pause() {
        this.paused = !this.paused;
        this.lastTimestamp = null;

        // Reset
        if (this.pie.duration.current <= 0) {
            this.reset();
            return;
        }

        if (!this.paused) {
            window.requestAnimationFrame(this.tick);
        }
    }

    reset() {
        this.pie.duration.current = this.pie.duration.total;
        this.recreate();
    }

    start() {
        this.tick = this.tick.bind(this);
        window.requestAnimationFrame(this.tick);
    }

}

module.exports = Timepie;
