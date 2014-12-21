///<reference path='./node.d.ts' />

var d3 = require("d3");
console.log("d3", d3);

function greeter(d3 : any) {
    return "Got us some d3 here: " + d3.version;
}

document.body.innerHTML = greeter(d3);
