/**
    Graph drawing.
*/

///<reference path='./types/node.d.ts' />

import types = require("./types");

var d3   = require("d3");
var util = require("./util");

function formatDuration(milliseconds: number) {
    var seconds = util.millis2seconds(milliseconds);
    var mins = Math.floor(seconds / 60);
    var secs = seconds - mins * 60;

    return mins + ":" + (secs < 10 ? "0" + secs : "" + secs);
}

export function clear() {
    d3.select("svg").remove();
    d3.select(".time-counter").remove();
}

export function create(pie: types.Pie) {
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
        .each(function(d) { this._current = d; })
        .attr("fill", function(d, i) { return "url(#grad" + i + ")"; })
        .attr("d", arc);

    var time = d3.select("body").append("div")
        .attr("class", "time-counter")
        .text(formatDuration(pie.duration.current));

    return <types.PieVisualization>{
        color: color,
        arc: arc,
        layout: layout,
        time: time
    }
}

export function update(pie: types.Pie, pieVis: types.PieVisualization, options: any) {
    options = options || {};

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
    }, options.immediate ? 0 : 250);

    d3.selectAll("path.fg")
        .attr("d", pieVis.arc)
        .data(pieVis.layout(data))
        .transition()
            .duration(500)
            .attrTween("d", arcTween);
}
