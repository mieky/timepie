///<reference path='./types/node.d.ts' />
///<reference path='./types/d3.d.ts' />

import types  = require("./types");

var d3     = require("d3");
var graph  = require("./graph");
var util   = require("./util");
var Beeper = require("./beeper");

class Timepie {

    private pie:            types.Pie;
    private pieVis:         types.PieVisualization;
    private lastTimestamp:  number;
    private lastUpdate:     number;
    private paused:         boolean;
    private statusEl:       D3.Selection;
    private beeper:         any; // TODO: Beeper

    constructor(duration: types.Duration) {
        this.pie           = this.createPie(duration);
        this.pieVis        = graph.create(this.pie);
        this.lastTimestamp = null;
        this.lastUpdate    = null;
        this.paused        = true;
        this.beeper        = new Beeper();

        window.addEventListener("resize", this.recreate.bind(this));
        this.displayStatus("<em>space</em> plays / pauses<br /><em>arrow keys</em> adjust time");
    }

    private createPie(duration: types.Duration): types.Pie {
        return <types.Pie>{
            width: window.innerWidth,
            height: window.innerHeight,
            radius: (Math.min(window.innerHeight, window.innerWidth) - 50) / 2,
            duration: duration
        };
    }

    private recreate() {
        graph.clear();
        this.pie = this.createPie(this.pie.duration);
        this.pieVis = graph.create(this.pie);
    }

    private adjustMinutes(amount: number) {
        this.adjustSeconds(amount * 60);
    }

    private adjustSeconds(amount: number) {
        if (!this.paused) {
            return;
        }

        var diff = amount * 1000;
        this.pie.duration.current = Math.max(1000, this.pie.duration.current + diff);
        this.pie.duration.total = this.pie.duration.current;

        graph.update(this.pie, this.pieVis, { immediate: true });
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
            window.setTimeout(() => {
                this.displayStatus("time's up! hit <em>space</em> to reset.");
                this.beeper.makeNoise();
            }, 250);

            return;
        }

        window.requestAnimationFrame(this.tick);
    }

    displayStatus(text: string) {
        if (this.statusEl === undefined) {
            this.statusEl = d3.select("body")
                .append("div")
                .attr("class", "status-text");
        }
        this.statusEl.html(text);
    }

    pause() {
        this.paused = !this.paused;
        this.lastTimestamp = null;

        if (this.paused) {
            this.displayStatus("&#10073;&#10073;"); // "pause"
        } else {
            this.displayStatus("&#9658;");          // "play"
        }

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
