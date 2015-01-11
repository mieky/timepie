/**
    Beeper to make some noise.
*/
///<reference path="./types/webaudioapi/waa.d.ts"/>

class Beeper {

    private audioContext: AudioContext;
    private isUnlocked: boolean = false;

    constructor() {
        var ContextClass = window["AudioContext"] ||
            window["webkitAudioContext"] ||
            window["mozAudioContext"] ||
            window["oAudioContext"] ||
            window["msAudioContext"];

        this.audioContext = new ContextClass();

        // Web audio is by default muted on iOS. Let's have it unlock
        // as soon as the user touches the screen.
        this.unlockAudio = this.unlockAudio.bind(this);
        window.addEventListener("touchstart", this.unlockAudio);
    }

    private createOscillator() {
        var osc = this.audioContext.createOscillator();
        osc.connect(this.audioContext.destination);
        return osc;
    }

    // Thanks to http://paulbakaus.com/tutorials/html5/web-audio-on-ios/!
    private unlockAudio() {
        if (this.isUnlocked) {
            return;
        }

        // Create empty buffer and play it
        var buffer = this.audioContext.createBuffer(1, 1, 22050);
        var source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source["noteOn"](0);

        // By checking the play state after some time, we know if we're really unlocked
        setTimeout(function() {
            if ((source.playbackState === source["PLAYING_STATE"] ||
                 source.playbackState === source["FINISHED_STATE"])) {
                this.isUnlocked = true;
                window.removeEventListener("touchstart", this.unlockAudio);
            }
        }.bind(this), 0);
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
