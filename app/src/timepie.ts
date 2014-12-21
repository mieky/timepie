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

interface PieVisualization {

}

function formatDuration(seconds: number) {
    var mins = Math.floor(seconds / 60);
    var secs = seconds - mins * 60;

    return mins + ":" + (secs < 10 ? "0" + secs : "" + secs);
}

function create(pie: Pie) {
    var width = pie.width;
    var height = pie.height;
    var radius = pie.radius;

    var data = [
        pie.duration.current,
        pie.duration.total - pie.duration.current
    ];

    var arc = d3.svg.arc()
        .innerRadius(radius - 70)
        .outerRadius(radius)
        .cornerRadius(5);

    var layout = d3.layout.pie()
        .padAngle(.01)
        .sort(null);

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var color = d3.scale.category20();
    var paths = svg.selectAll("path")
        .data(layout(data))
        .enter()
            .append("path")
            .each(function(d) {
                this._current = d;
            })
            .style("fill", function(d, i) { return color(i); })
            .attr("d", arc);

    var time = svg.append("text")
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
    pieVis.time.text(formatDuration(pie.duration.current));
    
    var path = d3.select("svg").selectAll("path")
        .data(pieVis.layout(data))
        .attr("d", pieVis.arc)
        .transition().duration(1000).attrTween("d", arcTween);


}

var duration = {
    total: 10,
    current: 9
};

var pie = {
    width: 960,
    height: 500,
    radius: 500 / 2 - 10,
    duration: duration
};

var pieVis = create(pie);

window["pie"] = pie;
window["pieVis"] = pieVis;
window["create"] = create;
window["update"] = update;

function tick() {
    if (pie.duration.current === 0) {
        console.log("Time's up!");
        clearInterval(countdown);
        return;
    }

    pie.duration.current = pie.duration.current - 1;
    update(pie, pieVis);
}
var countdown = setInterval(tick, 1000);
