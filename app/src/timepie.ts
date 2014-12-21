///<reference path='./node.d.ts' />

var d3 = require("d3");

function greeter(d3 : any) {
    return "Got us some d3 here: " + d3.version;
}

document.body.innerHTML = greeter(d3);

var data = [1, 1, 2, 3, 5, 8, 13, 21];

var width = 960,
    height = 500,
    radius = height / 2 - 10;

var arc = d3.svg.arc()
    .innerRadius(radius - 40)
    .outerRadius(radius)
    .cornerRadius(20);

var pie = d3.layout.pie()
    .padAngle(.02);

var color = d3.scale.category10();

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

svg.selectAll("path")
    .data(pie(data))
    .enter().append("path")
    .style("fill", function(d, i) { return color(i); })
    .attr("d", arc);
