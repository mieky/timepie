/**
    Application logic.
*/
///<reference path='./types/d3.d.ts' />

import d3     = require("d3");
import graph  = require("./graph");
import util   = require("./util");
import Beeper = require("./beeper")
import types  = require("./types");

class Timepie {

    private options:        types.StartupOptions;
    private pie:            types.Pie;
    private pieVis:         types.PieVisualization;
    private lastTimestamp:  number;
    private lastUpdate:     number;
    private paused:         boolean;
    private statusEl:       D3.Selection;
    private beeper:         any; // TODO: Beeper

    constructor(options: types.StartupOptions) {
        this.options       = options;

        this.pie           = this.createPie(options.duration);
        this.pieVis        = graph.create(this.pie);

        this.lastTimestamp = null;
        this.lastUpdate    = null;
        this.paused        = true;
        this.beeper        = new Beeper();
    }

    private createPie(duration: types.Duration): types.Pie {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            radius: (Math.min(window.innerHeight, window.innerWidth) - 50) / 2,
            duration: <types.Duration>{
                total: duration.total,
                current: duration.current || duration.total
            }
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
        if (diff < 0 && this.pie.duration.current < Math.abs(diff)) {
            return;
        }

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
                this.displayStatus("time's up! go again?");
                this.beeper.makeNoise();

                if (this.options.onFinish) {
                    this.options.onFinish(this.pie.duration.total);
                }
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

    resize() {
        this.recreate();
    }

    start() {
        this.tick = this.tick.bind(this);
        window.requestAnimationFrame(this.tick);
    }

}

// module.exports = Timepie;
export = Timepie;
