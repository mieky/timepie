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
    private beeper:         Beeper;

    private lastTimestamp:  number;
    private lastUpdate:     number;
    private paused:         boolean;
    private statusEl:       D3.Selection;

    constructor(options: types.StartupOptions) {
        this.options       = options;

        this.pie           = this.createPie(options.duration);
        this.pieVis        = graph.create(this.pie);

        this.lastTimestamp = null;
        this.lastUpdate    = null;
        this.paused        = true;
        this.beeper        = new Beeper();
    }

    private adjustMinutes(amount: number): void {
        this.adjustSeconds(amount * 60);
    }

    private adjustSeconds(amount: number): void {
        // Allow adjusting seconds only when paused or reset
        if (!this.paused || this.isFinished()) {
            return;
        }

        var diff = amount * 1000;
        if (diff < 0 && this.pie.duration.current < Math.abs(diff)) {
            return;
        }

        this.pie.duration.current = Math.max(1000, this.pie.duration.current + diff);
        this.pie.duration.total = this.pie.duration.current;

        this.update();
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

    private finish(): void {
        this.pie.duration.current = 0;
        this.pause(true);

        window.setTimeout(() => {
            this.update();
            this.displayStatus("time's up! go again?");
            this.beeper.makeNoise();

            if (this.options.onFinish) {
                this.options.onFinish(this.pie.duration.total);
            }
        }, 250);
    }

    private recreate(): void {
        graph.clear();

        this.pie = this.createPie(this.pie.duration);
        this.pieVis = graph.create(this.pie);
    }

    private setDuration(duration: types.Duration): void {
        this.pie.duration.total = duration.total;
        this.pie.duration.current = this.pie.duration.total;

        this.update();
    }

    private tick(timestamp: number): void {
        if (this.paused) {
            return;
        }

        if (!this.lastTimestamp) {
            this.lastTimestamp = timestamp;
        }

        this.pie.duration.current = Math.max(0, this.pie.duration.current - (timestamp - this.lastTimestamp));
        this.lastTimestamp = timestamp;

        if (!this.lastUpdate || this.lastUpdate !== util.millis2seconds(this.pie.duration.current)) {
            this.lastUpdate = util.millis2seconds(this.pie.duration.current);
            this.update(false);
        }

        // Timeup detected: finish, beep, etc.
        if (this.pie.duration.current <= 0) {
            this.finish();
            return;
        }

        // Continue as normal
        window.requestAnimationFrame(this.tick);
    }

    displayStatus(text: string, timeout: number = 0): void {
        if (this["statusTextTimeout"]) {
            clearTimeout(this["statusTextTimeout"]);
        }

        if (this.statusEl === undefined) {
            this.statusEl = d3.select("body")
                .append("div")
        }

        this.statusEl.attr("class", "status-text");
        this.statusEl.html(text);

        if (timeout > 0) {
            this["statusTextTimeout"] = setTimeout(() => {
                this.statusEl.attr("class", "status-text animation--disappear");
            }, timeout)
        }
    }

    isFinished(): boolean {
        return this.pie.duration.current <= 0 && this.paused;
    }

    pause(newValue: boolean = undefined): void {
        // Special case: toggling play when finished only resets, stays paused
        if (this.isFinished()) {
            this.reset();
            this.displayStatus("ready when you are!", 5000);
            return;
        }

        this.paused = newValue || !this.paused;
        this.lastTimestamp = null;

        if (this.isFinished()) {
            return;
        }

        if (this.paused) {
            this.displayStatus("paused");
        } else {
            this.displayStatus("playing...", 2000);
            window.requestAnimationFrame(this.tick);
        }
    }

    reset(): void {
        this.pie.duration.current = this.pie.duration.total;
        this.recreate();
    }

    resize(): void {
        this.recreate();
    }

    start(): void {
        this.tick = this.tick.bind(this);
        window.requestAnimationFrame(this.tick);
    }

    update(immediate: boolean = true): void {
        graph.update(this.pie, this.pieVis, {
            "immediate": immediate
        });
    }

}

export = Timepie;
