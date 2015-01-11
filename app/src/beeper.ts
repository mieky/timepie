/**
    Beeper to make some noise.
*/
///<reference path="./types/webaudioapi/waa.d.ts"/>

class Beeper {

    private audioContext: AudioContext;

    constructor() {
        var ContextClass = window["AudioContext"] ||
            window["webkitAudioContext"] ||
            window["mozAudioContext"] ||
            window["oAudioContext"] ||
            window["msAudioContext"];

        this.audioContext = new ContextClass();
    }

    private createOscillator() {
        var osc = this.audioContext.createOscillator();
        osc.connect(this.audioContext.destination);
        return osc;
    }

    makeNoise() {
        if (!this.audioContext) {
            return;
        }

        var ac = this.audioContext;
        var osc = this.createOscillator();

        function bebebeep(offset, count) {
            offset = offset || 0;
            count = count || 3;

            var increment = 0.06;
            var freq = 1500;
            var start = ac.currentTime;

            for (var i = 0; i < count; i++) {
                osc.frequency.setValueAtTime(freq, start + offset + increment * (i * 2));
                osc.frequency.setValueAtTime(0,    start + offset + increment * (i * 2 + 1));
            }
        }

        bebebeep(0, 3);
        bebebeep(1, 3);
        bebebeep(2, 3);

        osc.start(0);
        window.setTimeout(function() {
            osc.disconnect();
        }, 3000);
    }

}

module.exports = Beeper;
