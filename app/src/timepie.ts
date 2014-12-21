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

function formatDuration(seconds: number) {
    var mins = Math.floor(seconds / 60);
    var secs = seconds - mins * 60;

    return mins + ":" + (secs < 10 ? "0" + secs : "" + secs);
}

function draw(pie: Pie) {
    var width = pie.width;
    var height = pie.height;
    var radius = pie.radius;

    var data = [pie.duration.current, pie.duration.total - pie.duration.current];

    var arc = d3.svg.arc()
        .innerRadius(radius - 70)
        .outerRadius(radius)
        .cornerRadius(20);

    var pieLayout = d3.layout.pie()
        .padAngle(.01);

    var color = d3.scale.category10();

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    svg.selectAll("path")
        .data(pieLayout(data))
        .enter().append("path")
        .style("fill", function(d, i) { return color(i); })
        .attr("d", arc);

    var time = svg.append("text")
        .attr("class", "time-counter")
        .text(formatDuration(pie.duration.current));
}

var duration = {
    total: 20 * 60,
    current: 15 * 60
};

var pie = {
    width: 960,
    height: 500,
    radius: 500 / 2 - 10,
    duration: duration
};

draw(pie);

/*
setInterval(function() {
    pie.duration = pie.duration - 1;
    draw(pie);
}, 1000);
*/
