///<reference path='./types/node.d.ts' />
///<reference path='./types/d3.d.ts' />

import types = require("./types");

var d3    = require("d3");
var graph = require("./graph");
var util  = require("./util");

class Timepie {

    pie:            types.Pie;
    pieVis:         types.PieVisualization;
    lastTimestamp:  number;
    lastUpdate:     number;
    paused:         boolean;
    statusEl:       D3.Selection;

    constructor(duration: types.Duration) {
        this.pie           = this.createPie(duration);
        this.pieVis        = graph.create(this.pie);
        this.lastTimestamp = null;
        this.lastUpdate    = null;
        this.paused        = true;

        this.setListeners();
        this.displayStatus("<em>space</em> plays / pauses<br /><em>arrow keys</em> adjust time");
    }

    private createPie(duration: types.Duration): types.Pie {
        return <types.Pie>{
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
        document.addEventListener("keydown", function(e) {
            switch (e.keyCode) {
                case 32: this.pause(); break;
                case 38: this.adjustMinutes(+1); break; // up
                case 40: this.adjustMinutes(-1); break; // down
                case 37: this.adjustSeconds(-1); break; // left
                case 39: this.adjustSeconds(+1); break; // right
            }
        }.bind(this));
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
