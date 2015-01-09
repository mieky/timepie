///<reference path="./types/webaudioapi/waa.d.ts"/>

class Beeper {

    private audioContext: AudioContext;
    private osc: any;

    constructor() {
        window["AudioContext"] = window["AudioContext"] || window["webkitAudioContext"];
        this.audioContext = new AudioContext();

        this.osc = this.audioContext.createOscillator();
        this.osc.connect(this.audioContext.destination);
        this.osc.frequency.setValueAtTime(0, this.audioContext.currentTime);
        this.osc.start(0);
    }

    private bebebeep(offset, count) {
        offset = offset || 0;
        count = count || 3;

        var pitch = 35;
        var increment = 0.05;
        var start = this.audioContext.currentTime;

        for (var i = 0; i < count; i++) {
            this.osc.frequency.setValueAtTime(this.freq(pitch), start + offset + increment * (i * 2));
            this.osc.frequency.setValueAtTime(0,                start + offset + increment * (i * 2 + 1));
        }
    }

    private freq(halfSteps) {
        return Math.pow(Math.pow(2, 1 / 12), halfSteps) * 220;
    }

    makeNoise() {
        if (!this.audioContext) {
            return;
        }

        this.bebebeep(0, 3);
        this.bebebeep(1, 3);
        this.bebebeep(2, 3);
    }

}

module.exports = Beeper;
