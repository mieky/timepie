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
        .outerRadius(radius); // .cornerRadius(5);

    var outerArc = d3.svg.arc()
        .innerRadius(radius * 0.74 - 3)
        .outerRadius(radius + 3);

    var layout = d3.layout.pie() // .padAngle(.01)
        .sort(null);

    var color = d3.scale.category20();

    var svg = d3.select("body")
        .append("svg")
        .attr("class", "pie")
        .attr("width", width)
        .attr("height", height);

    var grads = svg.append("defs").selectAll("radialGradient").data(layout(data))
        .enter().append("radialGradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("cx", "5%")
        .attr("cy", "5%")
        .attr("r", "80%")
        .attr("id", function(d, i) { return "grad" + i; });

    grads.append("stop").attr("offset", "0%").style("stop-color", "#999");
    grads.append("stop").attr("offset", "100%").style("stop-color", function(d, i) {
        return color(i);
    });

    var arcs = svg.selectAll("g.arc")
        .data(layout(data))
        .enter()
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    arcs.append("path")
        .attr("class", "bg")
        .attr("d", outerArc);

    arcs.append("path")
        .attr("class", "fg")
        .each(function(d) {
            this._current = d;
        })
        .attr("fill", function(d, i) {
            return "url(#grad" + i + ")";
        })
        .attr("d", arc);

    var time = d3.select("body").append("div")
        .attr("class", "time-counter")
        .text(formatDuration(pie.duration.current));

    return {
        color: color,
        arc: arc,
        layout: layout,
        time: time
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

    d3.selectAll("path.fg")
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

function recreate() {
    d3.select("svg").remove();
    d3.select(".time-counter").remove();
    pie = createPie(pie.duration);
    pieVis = create(pie);
}

function reset() {
    pie.duration.current = pie.duration.total;
    recreate();
}

document.addEventListener("click", pause);
document.addEventListener("keypress", function(e) {
    if (e.keyCode === 32) {
        pause();
    }
});

window.addEventListener("resize", recreate);

var pie = createPie({
    total:   30 * 1000,
    current: 30 * 1000
});

var pieVis = create(pie);
var lastTimestamp = null;
var lastUpdate = null;
var paused = true;

function pause() {
    paused = !paused;
    lastTimestamp = null;

    // Reset
    if (pie.duration.current <= 0) {
        reset();
        return;
    }

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
