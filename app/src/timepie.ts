///<reference path='./node.d.ts' />

var d3 = require("d3");

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

function millis2seconds(milliseconds: number) {
    return Math.ceil(milliseconds / 1000);
}

function formatDuration(milliseconds: number) {
    var seconds = millis2seconds(milliseconds);
    var mins = Math.floor(seconds / 60);
    var secs = seconds - mins * 60;

    return mins + ":" + (secs < 10 ? "0" + secs : "" + secs);
}

function create(pie: Pie) {
    var width  = pie.width;
    var height = pie.height;
    var radius = pie.radius;

    var data = [
        pie.duration.current,
        pie.duration.total - pie.duration.current
    ];

    var arc = d3.svg.arc()
        .innerRadius(radius * 0.74)
        .outerRadius(radius)
        // .cornerRadius(5);

    var layout = d3.layout.pie()
        // .padAngle(.01)
        .sort(null);

    var svg = d3.select("body").append("svg")
        .attr("class", "pie")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var color = d3.scale.category20();
    var path = svg.selectAll("path")
        .data(layout(data))
        .enter()
            .append("path")
            .each(function(d) {
                this._current = d;
            })
            .style("fill", function(d, i) {
                return color(i);
            })
            .attr("d", arc);

    var time = d3.select("body").append("div")
        .attr("class", "time-counter")
        .text(formatDuration(pie.duration.current));

    return {
        color: color,
        arc: arc,
        layout: layout,
        time: time,
        path: path
    }
}

function update(pie: Pie, pieVis: any) {
    var data = [
        pie.duration.current,
        pie.duration.total - pie.duration.current
    ];

    function arcTween(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function(t) {
            return pieVis.arc(i(t));
        };
    }

    setTimeout(function() {
        pieVis.time.text(formatDuration(pie.duration.current));
    }, 250);

    pieVis.path
        .attr("d", pieVis.arc)
        .data(pieVis.layout(data))
        .transition()
            .duration(500)
            .attrTween("d", arcTween);
}

function createPie(duration) {
    return {
        width: window.innerWidth,
        height: window.innerHeight - 30,
        radius: (Math.min(window.innerHeight, window.innerWidth) - 50) / 2,
        duration: duration
    };
}

function resize() {
    d3.select("svg").remove();
    d3.select(".time-counter").remove();
    pie = createPie(pie.duration);
    pieVis = create(pie);
}

document.addEventListener("click", pause, false);
document.addEventListener("keypress", function(e) {
    if (e.keyCode === 32) {
        pause();
    }
}, false);

window.addEventListener("resize", resize, false);

var pie = createPie({
    total:   5 * 1000,
    current: 5 * 1000
});

var pieVis = create(pie);
var lastTimestamp = null;
var lastUpdate = null;
var paused = true;

function pause() {
    paused = !paused;
    lastTimestamp = null;

    if (!paused) {
        window.requestAnimationFrame(tick);
    }
}

function tick(timestamp) {
    if (paused) {
        return;
    }

    if (!lastTimestamp) {
        lastTimestamp = timestamp;
    }

    pie.duration.current = pie.duration.current - (timestamp - lastTimestamp);
    lastTimestamp = timestamp;

    if (!lastUpdate || lastUpdate !== millis2seconds(pie.duration.current)) {
        lastUpdate = millis2seconds(pie.duration.current);
        update(pie, pieVis);
    }

    if (pie.duration.current <= 0) {
        console.log("Finished!");
        return;
    }

    window.requestAnimationFrame(tick);
}

window.requestAnimationFrame(tick);
