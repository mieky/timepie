(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./app/src/app.ts":[function(require,module,exports){
///<reference path='./types/node.d.ts' />
var TimepieApp = require("./timepie");
var app = new TimepieApp({
    total: 194 * 1000,
    current: 194 * 1000
});
document.addEventListener("touchend", app.pause.bind(app));
document.addEventListener("click", app.pause.bind(app));
document.addEventListener("keydown", function (e) {
    switch (e.keyCode) {
        case 32:
            app.pause();
            break;
        case 38:
            app.adjustMinutes(+1);
            break;
        case 40:
            app.adjustMinutes(-1);
            break;
        case 37:
            app.adjustSeconds(-1);
            break;
        case 39:
            app.adjustSeconds(+1);
            break;
    }
}.bind(app));
window['timepie'] = app;
app.start();

},{"./timepie":"/Users/marv/dev/mike/timepie/app/src/timepie.ts"}],"/Users/marv/dev/mike/timepie/app/src/beeper.ts":[function(require,module,exports){
///<reference path="./types/webaudioapi/waa.d.ts"/>
var Beeper = (function () {
    function Beeper() {
        window["AudioContext"] = window["AudioContext"] || window["webkitAudioContext"];
        this.audioContext = new AudioContext();
        this.osc = this.audioContext.createOscillator();
        this.osc.connect(this.audioContext.destination);
        this.osc.frequency.setValueAtTime(0, this.audioContext.currentTime);
        this.osc.start(0);
    }
    Beeper.prototype.bebebeep = function (offset, count) {
        if (offset === void 0) { offset = 0; }
        if (count === void 0) { count = 3; }
        var pitch = 35;
        var increment = 0.05;
        var start = this.audioContext.currentTime;
        for (var i = 0; i < count; i++) {
            this.osc.frequency.setValueAtTime(this.freq(pitch), start + offset + increment * (i * 2));
            this.osc.frequency.setValueAtTime(0, start + offset + increment * (i * 2 + 1));
        }
    };
    Beeper.prototype.freq = function (halfSteps) {
        return Math.pow(Math.pow(2, 1 / 12), halfSteps) * 220;
    };
    Beeper.prototype.makeNoise = function () {
        if (!this.audioContext) {
            return;
        }
        this.bebebeep(0, 3);
        this.bebebeep(1, 3);
        this.bebebeep(2, 3);
    };
    return Beeper;
})();
module.exports = Beeper;

},{}],"/Users/marv/dev/mike/timepie/app/src/graph.ts":[function(require,module,exports){
///<reference path='./types/node.d.ts' />
var d3 = require("d3");
var util = require("./util");
function formatDuration(milliseconds) {
    var seconds = util.millis2seconds(milliseconds);
    var mins = Math.floor(seconds / 60);
    var secs = seconds - mins * 60;
    return mins + ":" + (secs < 10 ? "0" + secs : "" + secs);
}
function clear() {
    d3.select("svg").remove();
    d3.select(".time-counter").remove();
}
exports.clear = clear;
function create(pie) {
    var width = pie.width;
    var height = pie.height;
    var radius = pie.radius;
    var data = [
        pie.duration.current,
        pie.duration.total - pie.duration.current
    ];
    var arc = d3.svg.arc().innerRadius(radius * 0.74).outerRadius(radius); // .cornerRadius(5);
    var outerArc = d3.svg.arc().innerRadius(radius * 0.74 - 3).outerRadius(radius + 3);
    var layout = d3.layout.pie().sort(null);
    var color = d3.scale.category20();
    var svg = d3.select("body").append("svg").attr("class", "pie").attr("width", width).attr("height", height);
    var grads = svg.append("defs").selectAll("radialGradient").data(layout(data)).enter().append("radialGradient").attr("gradientUnits", "userSpaceOnUse").attr("cx", "5%").attr("cy", "5%").attr("r", "80%").attr("id", function (d, i) {
        return "grad" + i;
    });
    grads.append("stop").attr("offset", "0%").style("stop-color", "#999");
    grads.append("stop").attr("offset", "100%").style("stop-color", function (d, i) {
        return color(i);
    });
    var arcs = svg.selectAll("g.arc").data(layout(data)).enter().append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    arcs.append("path").attr("class", "bg").attr("d", outerArc);
    arcs.append("path").attr("class", "fg").each(function (d) {
        this._current = d;
    }).attr("fill", function (d, i) {
        return "url(#grad" + i + ")";
    }).attr("d", arc);
    var time = d3.select("body").append("div").attr("class", "time-counter").text(formatDuration(pie.duration.current));
    return {
        color: color,
        arc: arc,
        layout: layout,
        time: time
    };
}
exports.create = create;
function update(pie, pieVis, options) {
    options = options || {};
    var data = [
        pie.duration.current,
        pie.duration.total - pie.duration.current
    ];
    function arcTween(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function (t) {
            return pieVis.arc(i(t));
        };
    }
    setTimeout(function () {
        pieVis.time.text(formatDuration(pie.duration.current));
    }, options.immediate ? 0 : 250);
    d3.selectAll("path.fg").attr("d", pieVis.arc).data(pieVis.layout(data)).transition().duration(500).attrTween("d", arcTween);
}
exports.update = update;

},{"./util":"/Users/marv/dev/mike/timepie/app/src/util.ts","d3":"/Users/marv/dev/mike/timepie/node_modules/d3/d3.js"}],"/Users/marv/dev/mike/timepie/app/src/timepie.ts":[function(require,module,exports){
///<reference path='./types/node.d.ts' />
///<reference path='./types/d3.d.ts' />
var d3 = require("d3");
var graph = require("./graph");
var util = require("./util");
var Beeper = require("./beeper");
var Timepie = (function () {
    function Timepie(duration) {
        this.pie = this.createPie(duration);
        this.pieVis = graph.create(this.pie);
        this.lastTimestamp = null;
        this.lastUpdate = null;
        this.paused = true;
        this.beeper = new Beeper();
        window.addEventListener("resize", this.recreate.bind(this));
        this.displayStatus("<em>space</em> plays / pauses<br /><em>arrow keys</em> adjust time");
    }
    Timepie.prototype.createPie = function (duration) {
        return {
            width: window.innerWidth,
            height: window.innerHeight - 30,
            radius: (Math.min(window.innerHeight, window.innerWidth) - 50) / 2,
            duration: duration
        };
    };
    Timepie.prototype.recreate = function () {
        graph.clear();
        this.pie = this.createPie(this.pie.duration);
        this.pieVis = graph.create(this.pie);
    };
    Timepie.prototype.adjustMinutes = function (amount) {
        this.adjustSeconds(amount * 60);
    };
    Timepie.prototype.adjustSeconds = function (amount) {
        if (!this.paused) {
            return;
        }
        var diff = amount * 1000;
        this.pie.duration.current = Math.max(1000, this.pie.duration.current + diff);
        this.pie.duration.total = this.pie.duration.current;
        graph.update(this.pie, this.pieVis, { immediate: true });
    };
    Timepie.prototype.tick = function (timestamp) {
        var _this = this;
        if (this.paused) {
            return;
        }
        if (!this.lastTimestamp) {
            this.lastTimestamp = timestamp;
        }
        this.pie.duration.current = this.pie.duration.current - (timestamp - this.lastTimestamp);
        this.lastTimestamp = timestamp;
        if (!this.lastUpdate || this.lastUpdate !== util.millis2seconds(this.pie.duration.current)) {
            this.lastUpdate = util.millis2seconds(this.pie.duration.current);
            graph.update(this.pie, this.pieVis);
        }
        if (this.pie.duration.current <= 0) {
            window.setTimeout(function () {
                _this.displayStatus("time's up! hit <em>space</em> to reset.");
                _this.beeper.makeNoise();
            }, 250);
            return;
        }
        window.requestAnimationFrame(this.tick);
    };
    Timepie.prototype.displayStatus = function (text) {
        if (this.statusEl === undefined) {
            this.statusEl = d3.select("body").append("div").attr("class", "status-text");
        }
        this.statusEl.html(text);
    };
    Timepie.prototype.pause = function () {
        this.paused = !this.paused;
        this.lastTimestamp = null;
        if (this.paused) {
            this.displayStatus("&#10073;&#10073;"); // "pause"
        }
        else {
            this.displayStatus("&#9658;"); // "play"
        }
        // Reset
        if (this.pie.duration.current <= 0) {
            this.reset();
            return;
        }
        if (!this.paused) {
            window.requestAnimationFrame(this.tick);
        }
    };
    Timepie.prototype.reset = function () {
        this.pie.duration.current = this.pie.duration.total;
        this.recreate();
    };
    Timepie.prototype.start = function () {
        this.tick = this.tick.bind(this);
        window.requestAnimationFrame(this.tick);
    };
    return Timepie;
})();
module.exports = Timepie;

},{"./beeper":"/Users/marv/dev/mike/timepie/app/src/beeper.ts","./graph":"/Users/marv/dev/mike/timepie/app/src/graph.ts","./util":"/Users/marv/dev/mike/timepie/app/src/util.ts","d3":"/Users/marv/dev/mike/timepie/node_modules/d3/d3.js"}],"/Users/marv/dev/mike/timepie/app/src/util.ts":[function(require,module,exports){
///<reference path='./types/node.d.ts' />
function millis2seconds(milliseconds) {
    return Math.ceil(milliseconds / 1000);
}
exports.millis2seconds = millis2seconds;

},{}],"/Users/marv/dev/mike/timepie/node_modules/d3/d3.js":[function(require,module,exports){
!function() {
  var d3 = {
    version: "3.5.2"
  };
  if (!Date.now) Date.now = function() {
    return +new Date();
  };
  var d3_arraySlice = [].slice, d3_array = function(list) {
    return d3_arraySlice.call(list);
  };
  var d3_document = document, d3_documentElement = d3_document.documentElement, d3_window = window;
  try {
    d3_array(d3_documentElement.childNodes)[0].nodeType;
  } catch (e) {
    d3_array = function(list) {
      var i = list.length, array = new Array(i);
      while (i--) array[i] = list[i];
      return array;
    };
  }
  try {
    d3_document.createElement("div").style.setProperty("opacity", 0, "");
  } catch (error) {
    var d3_element_prototype = d3_window.Element.prototype, d3_element_setAttribute = d3_element_prototype.setAttribute, d3_element_setAttributeNS = d3_element_prototype.setAttributeNS, d3_style_prototype = d3_window.CSSStyleDeclaration.prototype, d3_style_setProperty = d3_style_prototype.setProperty;
    d3_element_prototype.setAttribute = function(name, value) {
      d3_element_setAttribute.call(this, name, value + "");
    };
    d3_element_prototype.setAttributeNS = function(space, local, value) {
      d3_element_setAttributeNS.call(this, space, local, value + "");
    };
    d3_style_prototype.setProperty = function(name, value, priority) {
      d3_style_setProperty.call(this, name, value + "", priority);
    };
  }
  d3.ascending = d3_ascending;
  function d3_ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }
  d3.descending = function(a, b) {
    return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
  };
  d3.min = function(array, f) {
    var i = -1, n = array.length, a, b;
    if (arguments.length === 1) {
      while (++i < n) if ((b = array[i]) != null && b >= b) {
        a = b;
        break;
      }
      while (++i < n) if ((b = array[i]) != null && a > b) a = b;
    } else {
      while (++i < n) if ((b = f.call(array, array[i], i)) != null && b >= b) {
        a = b;
        break;
      }
      while (++i < n) if ((b = f.call(array, array[i], i)) != null && a > b) a = b;
    }
    return a;
  };
  d3.max = function(array, f) {
    var i = -1, n = array.length, a, b;
    if (arguments.length === 1) {
      while (++i < n) if ((b = array[i]) != null && b >= b) {
        a = b;
        break;
      }
      while (++i < n) if ((b = array[i]) != null && b > a) a = b;
    } else {
      while (++i < n) if ((b = f.call(array, array[i], i)) != null && b >= b) {
        a = b;
        break;
      }
      while (++i < n) if ((b = f.call(array, array[i], i)) != null && b > a) a = b;
    }
    return a;
  };
  d3.extent = function(array, f) {
    var i = -1, n = array.length, a, b, c;
    if (arguments.length === 1) {
      while (++i < n) if ((b = array[i]) != null && b >= b) {
        a = c = b;
        break;
      }
      while (++i < n) if ((b = array[i]) != null) {
        if (a > b) a = b;
        if (c < b) c = b;
      }
    } else {
      while (++i < n) if ((b = f.call(array, array[i], i)) != null && b >= b) {
        a = c = b;
        break;
      }
      while (++i < n) if ((b = f.call(array, array[i], i)) != null) {
        if (a > b) a = b;
        if (c < b) c = b;
      }
    }
    return [ a, c ];
  };
  function d3_number(x) {
    return x === null ? NaN : +x;
  }
  function d3_numeric(x) {
    return !isNaN(x);
  }
  d3.sum = function(array, f) {
    var s = 0, n = array.length, a, i = -1;
    if (arguments.length === 1) {
      while (++i < n) if (d3_numeric(a = +array[i])) s += a;
    } else {
      while (++i < n) if (d3_numeric(a = +f.call(array, array[i], i))) s += a;
    }
    return s;
  };
  d3.mean = function(array, f) {
    var s = 0, n = array.length, a, i = -1, j = n;
    if (arguments.length === 1) {
      while (++i < n) if (d3_numeric(a = d3_number(array[i]))) s += a; else --j;
    } else {
      while (++i < n) if (d3_numeric(a = d3_number(f.call(array, array[i], i)))) s += a; else --j;
    }
    if (j) return s / j;
  };
  d3.quantile = function(values, p) {
    var H = (values.length - 1) * p + 1, h = Math.floor(H), v = +values[h - 1], e = H - h;
    return e ? v + e * (values[h] - v) : v;
  };
  d3.median = function(array, f) {
    var numbers = [], n = array.length, a, i = -1;
    if (arguments.length === 1) {
      while (++i < n) if (d3_numeric(a = d3_number(array[i]))) numbers.push(a);
    } else {
      while (++i < n) if (d3_numeric(a = d3_number(f.call(array, array[i], i)))) numbers.push(a);
    }
    if (numbers.length) return d3.quantile(numbers.sort(d3_ascending), .5);
  };
  d3.variance = function(array, f) {
    var n = array.length, m = 0, a, d, s = 0, i = -1, j = 0;
    if (arguments.length === 1) {
      while (++i < n) {
        if (d3_numeric(a = d3_number(array[i]))) {
          d = a - m;
          m += d / ++j;
          s += d * (a - m);
        }
      }
    } else {
      while (++i < n) {
        if (d3_numeric(a = d3_number(f.call(array, array[i], i)))) {
          d = a - m;
          m += d / ++j;
          s += d * (a - m);
        }
      }
    }
    if (j > 1) return s / (j - 1);
  };
  d3.deviation = function() {
    var v = d3.variance.apply(this, arguments);
    return v ? Math.sqrt(v) : v;
  };
  function d3_bisector(compare) {
    return {
      left: function(a, x, lo, hi) {
        if (arguments.length < 3) lo = 0;
        if (arguments.length < 4) hi = a.length;
        while (lo < hi) {
          var mid = lo + hi >>> 1;
          if (compare(a[mid], x) < 0) lo = mid + 1; else hi = mid;
        }
        return lo;
      },
      right: function(a, x, lo, hi) {
        if (arguments.length < 3) lo = 0;
        if (arguments.length < 4) hi = a.length;
        while (lo < hi) {
          var mid = lo + hi >>> 1;
          if (compare(a[mid], x) > 0) hi = mid; else lo = mid + 1;
        }
        return lo;
      }
    };
  }
  var d3_bisect = d3_bisector(d3_ascending);
  d3.bisectLeft = d3_bisect.left;
  d3.bisect = d3.bisectRight = d3_bisect.right;
  d3.bisector = function(f) {
    return d3_bisector(f.length === 1 ? function(d, x) {
      return d3_ascending(f(d), x);
    } : f);
  };
  d3.shuffle = function(array, i0, i1) {
    if ((m = arguments.length) < 3) {
      i1 = array.length;
      if (m < 2) i0 = 0;
    }
    var m = i1 - i0, t, i;
    while (m) {
      i = Math.random() * m-- | 0;
      t = array[m + i0], array[m + i0] = array[i + i0], array[i + i0] = t;
    }
    return array;
  };
  d3.permute = function(array, indexes) {
    var i = indexes.length, permutes = new Array(i);
    while (i--) permutes[i] = array[indexes[i]];
    return permutes;
  };
  d3.pairs = function(array) {
    var i = 0, n = array.length - 1, p0, p1 = array[0], pairs = new Array(n < 0 ? 0 : n);
    while (i < n) pairs[i] = [ p0 = p1, p1 = array[++i] ];
    return pairs;
  };
  d3.zip = function() {
    if (!(n = arguments.length)) return [];
    for (var i = -1, m = d3.min(arguments, d3_zipLength), zips = new Array(m); ++i < m; ) {
      for (var j = -1, n, zip = zips[i] = new Array(n); ++j < n; ) {
        zip[j] = arguments[j][i];
      }
    }
    return zips;
  };
  function d3_zipLength(d) {
    return d.length;
  }
  d3.transpose = function(matrix) {
    return d3.zip.apply(d3, matrix);
  };
  d3.keys = function(map) {
    var keys = [];
    for (var key in map) keys.push(key);
    return keys;
  };
  d3.values = function(map) {
    var values = [];
    for (var key in map) values.push(map[key]);
    return values;
  };
  d3.entries = function(map) {
    var entries = [];
    for (var key in map) entries.push({
      key: key,
      value: map[key]
    });
    return entries;
  };
  d3.merge = function(arrays) {
    var n = arrays.length, m, i = -1, j = 0, merged, array;
    while (++i < n) j += arrays[i].length;
    merged = new Array(j);
    while (--n >= 0) {
      array = arrays[n];
      m = array.length;
      while (--m >= 0) {
        merged[--j] = array[m];
      }
    }
    return merged;
  };
  var abs = Math.abs;
  d3.range = function(start, stop, step) {
    if (arguments.length < 3) {
      step = 1;
      if (arguments.length < 2) {
        stop = start;
        start = 0;
      }
    }
    if ((stop - start) / step === Infinity) throw new Error("infinite range");
    var range = [], k = d3_range_integerScale(abs(step)), i = -1, j;
    start *= k, stop *= k, step *= k;
    if (step < 0) while ((j = start + step * ++i) > stop) range.push(j / k); else while ((j = start + step * ++i) < stop) range.push(j / k);
    return range;
  };
  function d3_range_integerScale(x) {
    var k = 1;
    while (x * k % 1) k *= 10;
    return k;
  }
  function d3_class(ctor, properties) {
    for (var key in properties) {
      Object.defineProperty(ctor.prototype, key, {
        value: properties[key],
        enumerable: false
      });
    }
  }
  d3.map = function(object, f) {
    var map = new d3_Map();
    if (object instanceof d3_Map) {
      object.forEach(function(key, value) {
        map.set(key, value);
      });
    } else if (Array.isArray(object)) {
      var i = -1, n = object.length, o;
      if (arguments.length === 1) while (++i < n) map.set(i, object[i]); else while (++i < n) map.set(f.call(object, o = object[i], i), o);
    } else {
      for (var key in object) map.set(key, object[key]);
    }
    return map;
  };
  function d3_Map() {
    this._ = Object.create(null);
  }
  var d3_map_proto = "__proto__", d3_map_zero = "\x00";
  d3_class(d3_Map, {
    has: d3_map_has,
    get: function(key) {
      return this._[d3_map_escape(key)];
    },
    set: function(key, value) {
      return this._[d3_map_escape(key)] = value;
    },
    remove: d3_map_remove,
    keys: d3_map_keys,
    values: function() {
      var values = [];
      for (var key in this._) values.push(this._[key]);
      return values;
    },
    entries: function() {
      var entries = [];
      for (var key in this._) entries.push({
        key: d3_map_unescape(key),
        value: this._[key]
      });
      return entries;
    },
    size: d3_map_size,
    empty: d3_map_empty,
    forEach: function(f) {
      for (var key in this._) f.call(this, d3_map_unescape(key), this._[key]);
    }
  });
  function d3_map_escape(key) {
    return (key += "") === d3_map_proto || key[0] === d3_map_zero ? d3_map_zero + key : key;
  }
  function d3_map_unescape(key) {
    return (key += "")[0] === d3_map_zero ? key.slice(1) : key;
  }
  function d3_map_has(key) {
    return d3_map_escape(key) in this._;
  }
  function d3_map_remove(key) {
    return (key = d3_map_escape(key)) in this._ && delete this._[key];
  }
  function d3_map_keys() {
    var keys = [];
    for (var key in this._) keys.push(d3_map_unescape(key));
    return keys;
  }
  function d3_map_size() {
    var size = 0;
    for (var key in this._) ++size;
    return size;
  }
  function d3_map_empty() {
    for (var key in this._) return false;
    return true;
  }
  d3.nest = function() {
    var nest = {}, keys = [], sortKeys = [], sortValues, rollup;
    function map(mapType, array, depth) {
      if (depth >= keys.length) return rollup ? rollup.call(nest, array) : sortValues ? array.sort(sortValues) : array;
      var i = -1, n = array.length, key = keys[depth++], keyValue, object, setter, valuesByKey = new d3_Map(), values;
      while (++i < n) {
        if (values = valuesByKey.get(keyValue = key(object = array[i]))) {
          values.push(object);
        } else {
          valuesByKey.set(keyValue, [ object ]);
        }
      }
      if (mapType) {
        object = mapType();
        setter = function(keyValue, values) {
          object.set(keyValue, map(mapType, values, depth));
        };
      } else {
        object = {};
        setter = function(keyValue, values) {
          object[keyValue] = map(mapType, values, depth);
        };
      }
      valuesByKey.forEach(setter);
      return object;
    }
    function entries(map, depth) {
      if (depth >= keys.length) return map;
      var array = [], sortKey = sortKeys[depth++];
      map.forEach(function(key, keyMap) {
        array.push({
          key: key,
          values: entries(keyMap, depth)
        });
      });
      return sortKey ? array.sort(function(a, b) {
        return sortKey(a.key, b.key);
      }) : array;
    }
    nest.map = function(array, mapType) {
      return map(mapType, array, 0);
    };
    nest.entries = function(array) {
      return entries(map(d3.map, array, 0), 0);
    };
    nest.key = function(d) {
      keys.push(d);
      return nest;
    };
    nest.sortKeys = function(order) {
      sortKeys[keys.length - 1] = order;
      return nest;
    };
    nest.sortValues = function(order) {
      sortValues = order;
      return nest;
    };
    nest.rollup = function(f) {
      rollup = f;
      return nest;
    };
    return nest;
  };
  d3.set = function(array) {
    var set = new d3_Set();
    if (array) for (var i = 0, n = array.length; i < n; ++i) set.add(array[i]);
    return set;
  };
  function d3_Set() {
    this._ = Object.create(null);
  }
  d3_class(d3_Set, {
    has: d3_map_has,
    add: function(key) {
      this._[d3_map_escape(key += "")] = true;
      return key;
    },
    remove: d3_map_remove,
    values: d3_map_keys,
    size: d3_map_size,
    empty: d3_map_empty,
    forEach: function(f) {
      for (var key in this._) f.call(this, d3_map_unescape(key));
    }
  });
  d3.behavior = {};
  d3.rebind = function(target, source) {
    var i = 1, n = arguments.length, method;
    while (++i < n) target[method = arguments[i]] = d3_rebind(target, source, source[method]);
    return target;
  };
  function d3_rebind(target, source, method) {
    return function() {
      var value = method.apply(source, arguments);
      return value === source ? target : value;
    };
  }
  function d3_vendorSymbol(object, name) {
    if (name in object) return name;
    name = name.charAt(0).toUpperCase() + name.slice(1);
    for (var i = 0, n = d3_vendorPrefixes.length; i < n; ++i) {
      var prefixName = d3_vendorPrefixes[i] + name;
      if (prefixName in object) return prefixName;
    }
  }
  var d3_vendorPrefixes = [ "webkit", "ms", "moz", "Moz", "o", "O" ];
  function d3_noop() {}
  d3.dispatch = function() {
    var dispatch = new d3_dispatch(), i = -1, n = arguments.length;
    while (++i < n) dispatch[arguments[i]] = d3_dispatch_event(dispatch);
    return dispatch;
  };
  function d3_dispatch() {}
  d3_dispatch.prototype.on = function(type, listener) {
    var i = type.indexOf("."), name = "";
    if (i >= 0) {
      name = type.slice(i + 1);
      type = type.slice(0, i);
    }
    if (type) return arguments.length < 2 ? this[type].on(name) : this[type].on(name, listener);
    if (arguments.length === 2) {
      if (listener == null) for (type in this) {
        if (this.hasOwnProperty(type)) this[type].on(name, null);
      }
      return this;
    }
  };
  function d3_dispatch_event(dispatch) {
    var listeners = [], listenerByName = new d3_Map();
    function event() {
      var z = listeners, i = -1, n = z.length, l;
      while (++i < n) if (l = z[i].on) l.apply(this, arguments);
      return dispatch;
    }
    event.on = function(name, listener) {
      var l = listenerByName.get(name), i;
      if (arguments.length < 2) return l && l.on;
      if (l) {
        l.on = null;
        listeners = listeners.slice(0, i = listeners.indexOf(l)).concat(listeners.slice(i + 1));
        listenerByName.remove(name);
      }
      if (listener) listeners.push(listenerByName.set(name, {
        on: listener
      }));
      return dispatch;
    };
    return event;
  }
  d3.event = null;
  function d3_eventPreventDefault() {
    d3.event.preventDefault();
  }
  function d3_eventSource() {
    var e = d3.event, s;
    while (s = e.sourceEvent) e = s;
    return e;
  }
  function d3_eventDispatch(target) {
    var dispatch = new d3_dispatch(), i = 0, n = arguments.length;
    while (++i < n) dispatch[arguments[i]] = d3_dispatch_event(dispatch);
    dispatch.of = function(thiz, argumentz) {
      return function(e1) {
        try {
          var e0 = e1.sourceEvent = d3.event;
          e1.target = target;
          d3.event = e1;
          dispatch[e1.type].apply(thiz, argumentz);
        } finally {
          d3.event = e0;
        }
      };
    };
    return dispatch;
  }
  d3.requote = function(s) {
    return s.replace(d3_requote_re, "\\$&");
  };
  var d3_requote_re = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;
  var d3_subclass = {}.__proto__ ? function(object, prototype) {
    object.__proto__ = prototype;
  } : function(object, prototype) {
    for (var property in prototype) object[property] = prototype[property];
  };
  function d3_selection(groups) {
    d3_subclass(groups, d3_selectionPrototype);
    return groups;
  }
  var d3_select = function(s, n) {
    return n.querySelector(s);
  }, d3_selectAll = function(s, n) {
    return n.querySelectorAll(s);
  }, d3_selectMatcher = d3_documentElement.matches || d3_documentElement[d3_vendorSymbol(d3_documentElement, "matchesSelector")], d3_selectMatches = function(n, s) {
    return d3_selectMatcher.call(n, s);
  };
  if (typeof Sizzle === "function") {
    d3_select = function(s, n) {
      return Sizzle(s, n)[0] || null;
    };
    d3_selectAll = Sizzle;
    d3_selectMatches = Sizzle.matchesSelector;
  }
  d3.selection = function() {
    return d3_selectionRoot;
  };
  var d3_selectionPrototype = d3.selection.prototype = [];
  d3_selectionPrototype.select = function(selector) {
    var subgroups = [], subgroup, subnode, group, node;
    selector = d3_selection_selector(selector);
    for (var j = -1, m = this.length; ++j < m; ) {
      subgroups.push(subgroup = []);
      subgroup.parentNode = (group = this[j]).parentNode;
      for (var i = -1, n = group.length; ++i < n; ) {
        if (node = group[i]) {
          subgroup.push(subnode = selector.call(node, node.__data__, i, j));
          if (subnode && "__data__" in node) subnode.__data__ = node.__data__;
        } else {
          subgroup.push(null);
        }
      }
    }
    return d3_selection(subgroups);
  };
  function d3_selection_selector(selector) {
    return typeof selector === "function" ? selector : function() {
      return d3_select(selector, this);
    };
  }
  d3_selectionPrototype.selectAll = function(selector) {
    var subgroups = [], subgroup, node;
    selector = d3_selection_selectorAll(selector);
    for (var j = -1, m = this.length; ++j < m; ) {
      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
        if (node = group[i]) {
          subgroups.push(subgroup = d3_array(selector.call(node, node.__data__, i, j)));
          subgroup.parentNode = node;
        }
      }
    }
    return d3_selection(subgroups);
  };
  function d3_selection_selectorAll(selector) {
    return typeof selector === "function" ? selector : function() {
      return d3_selectAll(selector, this);
    };
  }
  var d3_nsPrefix = {
    svg: "http://www.w3.org/2000/svg",
    xhtml: "http://www.w3.org/1999/xhtml",
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/"
  };
  d3.ns = {
    prefix: d3_nsPrefix,
    qualify: function(name) {
      var i = name.indexOf(":"), prefix = name;
      if (i >= 0) {
        prefix = name.slice(0, i);
        name = name.slice(i + 1);
      }
      return d3_nsPrefix.hasOwnProperty(prefix) ? {
        space: d3_nsPrefix[prefix],
        local: name
      } : name;
    }
  };
  d3_selectionPrototype.attr = function(name, value) {
    if (arguments.length < 2) {
      if (typeof name === "string") {
        var node = this.node();
        name = d3.ns.qualify(name);
        return name.local ? node.getAttributeNS(name.space, name.local) : node.getAttribute(name);
      }
      for (value in name) this.each(d3_selection_attr(value, name[value]));
      return this;
    }
    return this.each(d3_selection_attr(name, value));
  };
  function d3_selection_attr(name, value) {
    name = d3.ns.qualify(name);
    function attrNull() {
      this.removeAttribute(name);
    }
    function attrNullNS() {
      this.removeAttributeNS(name.space, name.local);
    }
    function attrConstant() {
      this.setAttribute(name, value);
    }
    function attrConstantNS() {
      this.setAttributeNS(name.space, name.local, value);
    }
    function attrFunction() {
      var x = value.apply(this, arguments);
      if (x == null) this.removeAttribute(name); else this.setAttribute(name, x);
    }
    function attrFunctionNS() {
      var x = value.apply(this, arguments);
      if (x == null) this.removeAttributeNS(name.space, name.local); else this.setAttributeNS(name.space, name.local, x);
    }
    return value == null ? name.local ? attrNullNS : attrNull : typeof value === "function" ? name.local ? attrFunctionNS : attrFunction : name.local ? attrConstantNS : attrConstant;
  }
  function d3_collapse(s) {
    return s.trim().replace(/\s+/g, " ");
  }
  d3_selectionPrototype.classed = function(name, value) {
    if (arguments.length < 2) {
      if (typeof name === "string") {
        var node = this.node(), n = (name = d3_selection_classes(name)).length, i = -1;
        if (value = node.classList) {
          while (++i < n) if (!value.contains(name[i])) return false;
        } else {
          value = node.getAttribute("class");
          while (++i < n) if (!d3_selection_classedRe(name[i]).test(value)) return false;
        }
        return true;
      }
      for (value in name) this.each(d3_selection_classed(value, name[value]));
      return this;
    }
    return this.each(d3_selection_classed(name, value));
  };
  function d3_selection_classedRe(name) {
    return new RegExp("(?:^|\\s+)" + d3.requote(name) + "(?:\\s+|$)", "g");
  }
  function d3_selection_classes(name) {
    return (name + "").trim().split(/^|\s+/);
  }
  function d3_selection_classed(name, value) {
    name = d3_selection_classes(name).map(d3_selection_classedName);
    var n = name.length;
    function classedConstant() {
      var i = -1;
      while (++i < n) name[i](this, value);
    }
    function classedFunction() {
      var i = -1, x = value.apply(this, arguments);
      while (++i < n) name[i](this, x);
    }
    return typeof value === "function" ? classedFunction : classedConstant;
  }
  function d3_selection_classedName(name) {
    var re = d3_selection_classedRe(name);
    return function(node, value) {
      if (c = node.classList) return value ? c.add(name) : c.remove(name);
      var c = node.getAttribute("class") || "";
      if (value) {
        re.lastIndex = 0;
        if (!re.test(c)) node.setAttribute("class", d3_collapse(c + " " + name));
      } else {
        node.setAttribute("class", d3_collapse(c.replace(re, " ")));
      }
    };
  }
  d3_selectionPrototype.style = function(name, value, priority) {
    var n = arguments.length;
    if (n < 3) {
      if (typeof name !== "string") {
        if (n < 2) value = "";
        for (priority in name) this.each(d3_selection_style(priority, name[priority], value));
        return this;
      }
      if (n < 2) return d3_window.getComputedStyle(this.node(), null).getPropertyValue(name);
      priority = "";
    }
    return this.each(d3_selection_style(name, value, priority));
  };
  function d3_selection_style(name, value, priority) {
    function styleNull() {
      this.style.removeProperty(name);
    }
    function styleConstant() {
      this.style.setProperty(name, value, priority);
    }
    function styleFunction() {
      var x = value.apply(this, arguments);
      if (x == null) this.style.removeProperty(name); else this.style.setProperty(name, x, priority);
    }
    return value == null ? styleNull : typeof value === "function" ? styleFunction : styleConstant;
  }
  d3_selectionPrototype.property = function(name, value) {
    if (arguments.length < 2) {
      if (typeof name === "string") return this.node()[name];
      for (value in name) this.each(d3_selection_property(value, name[value]));
      return this;
    }
    return this.each(d3_selection_property(name, value));
  };
  function d3_selection_property(name, value) {
    function propertyNull() {
      delete this[name];
    }
    function propertyConstant() {
      this[name] = value;
    }
    function propertyFunction() {
      var x = value.apply(this, arguments);
      if (x == null) delete this[name]; else this[name] = x;
    }
    return value == null ? propertyNull : typeof value === "function" ? propertyFunction : propertyConstant;
  }
  d3_selectionPrototype.text = function(value) {
    return arguments.length ? this.each(typeof value === "function" ? function() {
      var v = value.apply(this, arguments);
      this.textContent = v == null ? "" : v;
    } : value == null ? function() {
      this.textContent = "";
    } : function() {
      this.textContent = value;
    }) : this.node().textContent;
  };
  d3_selectionPrototype.html = function(value) {
    return arguments.length ? this.each(typeof value === "function" ? function() {
      var v = value.apply(this, arguments);
      this.innerHTML = v == null ? "" : v;
    } : value == null ? function() {
      this.innerHTML = "";
    } : function() {
      this.innerHTML = value;
    }) : this.node().innerHTML;
  };
  d3_selectionPrototype.append = function(name) {
    name = d3_selection_creator(name);
    return this.select(function() {
      return this.appendChild(name.apply(this, arguments));
    });
  };
  function d3_selection_creator(name) {
    return typeof name === "function" ? name : (name = d3.ns.qualify(name)).local ? function() {
      return this.ownerDocument.createElementNS(name.space, name.local);
    } : function() {
      return this.ownerDocument.createElementNS(this.namespaceURI, name);
    };
  }
  d3_selectionPrototype.insert = function(name, before) {
    name = d3_selection_creator(name);
    before = d3_selection_selector(before);
    return this.select(function() {
      return this.insertBefore(name.apply(this, arguments), before.apply(this, arguments) || null);
    });
  };
  d3_selectionPrototype.remove = function() {
    return this.each(d3_selectionRemove);
  };
  function d3_selectionRemove() {
    var parent = this.parentNode;
    if (parent) parent.removeChild(this);
  }
  d3_selectionPrototype.data = function(value, key) {
    var i = -1, n = this.length, group, node;
    if (!arguments.length) {
      value = new Array(n = (group = this[0]).length);
      while (++i < n) {
        if (node = group[i]) {
          value[i] = node.__data__;
        }
      }
      return value;
    }
    function bind(group, groupData) {
      var i, n = group.length, m = groupData.length, n0 = Math.min(n, m), updateNodes = new Array(m), enterNodes = new Array(m), exitNodes = new Array(n), node, nodeData;
      if (key) {
        var nodeByKeyValue = new d3_Map(), keyValues = new Array(n), keyValue;
        for (i = -1; ++i < n; ) {
          if (nodeByKeyValue.has(keyValue = key.call(node = group[i], node.__data__, i))) {
            exitNodes[i] = node;
          } else {
            nodeByKeyValue.set(keyValue, node);
          }
          keyValues[i] = keyValue;
        }
        for (i = -1; ++i < m; ) {
          if (!(node = nodeByKeyValue.get(keyValue = key.call(groupData, nodeData = groupData[i], i)))) {
            enterNodes[i] = d3_selection_dataNode(nodeData);
          } else if (node !== true) {
            updateNodes[i] = node;
            node.__data__ = nodeData;
          }
          nodeByKeyValue.set(keyValue, true);
        }
        for (i = -1; ++i < n; ) {
          if (nodeByKeyValue.get(keyValues[i]) !== true) {
            exitNodes[i] = group[i];
          }
        }
      } else {
        for (i = -1; ++i < n0; ) {
          node = group[i];
          nodeData = groupData[i];
          if (node) {
            node.__data__ = nodeData;
            updateNodes[i] = node;
          } else {
            enterNodes[i] = d3_selection_dataNode(nodeData);
          }
        }
        for (;i < m; ++i) {
          enterNodes[i] = d3_selection_dataNode(groupData[i]);
        }
        for (;i < n; ++i) {
          exitNodes[i] = group[i];
        }
      }
      enterNodes.update = updateNodes;
      enterNodes.parentNode = updateNodes.parentNode = exitNodes.parentNode = group.parentNode;
      enter.push(enterNodes);
      update.push(updateNodes);
      exit.push(exitNodes);
    }
    var enter = d3_selection_enter([]), update = d3_selection([]), exit = d3_selection([]);
    if (typeof value === "function") {
      while (++i < n) {
        bind(group = this[i], value.call(group, group.parentNode.__data__, i));
      }
    } else {
      while (++i < n) {
        bind(group = this[i], value);
      }
    }
    update.enter = function() {
      return enter;
    };
    update.exit = function() {
      return exit;
    };
    return update;
  };
  function d3_selection_dataNode(data) {
    return {
      __data__: data
    };
  }
  d3_selectionPrototype.datum = function(value) {
    return arguments.length ? this.property("__data__", value) : this.property("__data__");
  };
  d3_selectionPrototype.filter = function(filter) {
    var subgroups = [], subgroup, group, node;
    if (typeof filter !== "function") filter = d3_selection_filter(filter);
    for (var j = 0, m = this.length; j < m; j++) {
      subgroups.push(subgroup = []);
      subgroup.parentNode = (group = this[j]).parentNode;
      for (var i = 0, n = group.length; i < n; i++) {
        if ((node = group[i]) && filter.call(node, node.__data__, i, j)) {
          subgroup.push(node);
        }
      }
    }
    return d3_selection(subgroups);
  };
  function d3_selection_filter(selector) {
    return function() {
      return d3_selectMatches(this, selector);
    };
  }
  d3_selectionPrototype.order = function() {
    for (var j = -1, m = this.length; ++j < m; ) {
      for (var group = this[j], i = group.length - 1, next = group[i], node; --i >= 0; ) {
        if (node = group[i]) {
          if (next && next !== node.nextSibling) next.parentNode.insertBefore(node, next);
          next = node;
        }
      }
    }
    return this;
  };
  d3_selectionPrototype.sort = function(comparator) {
    comparator = d3_selection_sortComparator.apply(this, arguments);
    for (var j = -1, m = this.length; ++j < m; ) this[j].sort(comparator);
    return this.order();
  };
  function d3_selection_sortComparator(comparator) {
    if (!arguments.length) comparator = d3_ascending;
    return function(a, b) {
      return a && b ? comparator(a.__data__, b.__data__) : !a - !b;
    };
  }
  d3_selectionPrototype.each = function(callback) {
    return d3_selection_each(this, function(node, i, j) {
      callback.call(node, node.__data__, i, j);
    });
  };
  function d3_selection_each(groups, callback) {
    for (var j = 0, m = groups.length; j < m; j++) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; i++) {
        if (node = group[i]) callback(node, i, j);
      }
    }
    return groups;
  }
  d3_selectionPrototype.call = function(callback) {
    var args = d3_array(arguments);
    callback.apply(args[0] = this, args);
    return this;
  };
  d3_selectionPrototype.empty = function() {
    return !this.node();
  };
  d3_selectionPrototype.node = function() {
    for (var j = 0, m = this.length; j < m; j++) {
      for (var group = this[j], i = 0, n = group.length; i < n; i++) {
        var node = group[i];
        if (node) return node;
      }
    }
    return null;
  };
  d3_selectionPrototype.size = function() {
    var n = 0;
    d3_selection_each(this, function() {
      ++n;
    });
    return n;
  };
  function d3_selection_enter(selection) {
    d3_subclass(selection, d3_selection_enterPrototype);
    return selection;
  }
  var d3_selection_enterPrototype = [];
  d3.selection.enter = d3_selection_enter;
  d3.selection.enter.prototype = d3_selection_enterPrototype;
  d3_selection_enterPrototype.append = d3_selectionPrototype.append;
  d3_selection_enterPrototype.empty = d3_selectionPrototype.empty;
  d3_selection_enterPrototype.node = d3_selectionPrototype.node;
  d3_selection_enterPrototype.call = d3_selectionPrototype.call;
  d3_selection_enterPrototype.size = d3_selectionPrototype.size;
  d3_selection_enterPrototype.select = function(selector) {
    var subgroups = [], subgroup, subnode, upgroup, group, node;
    for (var j = -1, m = this.length; ++j < m; ) {
      upgroup = (group = this[j]).update;
      subgroups.push(subgroup = []);
      subgroup.parentNode = group.parentNode;
      for (var i = -1, n = group.length; ++i < n; ) {
        if (node = group[i]) {
          subgroup.push(upgroup[i] = subnode = selector.call(group.parentNode, node.__data__, i, j));
          subnode.__data__ = node.__data__;
        } else {
          subgroup.push(null);
        }
      }
    }
    return d3_selection(subgroups);
  };
  d3_selection_enterPrototype.insert = function(name, before) {
    if (arguments.length < 2) before = d3_selection_enterInsertBefore(this);
    return d3_selectionPrototype.insert.call(this, name, before);
  };
  function d3_selection_enterInsertBefore(enter) {
    var i0, j0;
    return function(d, i, j) {
      var group = enter[j].update, n = group.length, node;
      if (j != j0) j0 = j, i0 = 0;
      if (i >= i0) i0 = i + 1;
      while (!(node = group[i0]) && ++i0 < n) ;
      return node;
    };
  }
  d3.select = function(node) {
    var group = [ typeof node === "string" ? d3_select(node, d3_document) : node ];
    group.parentNode = d3_documentElement;
    return d3_selection([ group ]);
  };
  d3.selectAll = function(nodes) {
    var group = d3_array(typeof nodes === "string" ? d3_selectAll(nodes, d3_document) : nodes);
    group.parentNode = d3_documentElement;
    return d3_selection([ group ]);
  };
  var d3_selectionRoot = d3.select(d3_documentElement);
  d3_selectionPrototype.on = function(type, listener, capture) {
    var n = arguments.length;
    if (n < 3) {
      if (typeof type !== "string") {
        if (n < 2) listener = false;
        for (capture in type) this.each(d3_selection_on(capture, type[capture], listener));
        return this;
      }
      if (n < 2) return (n = this.node()["__on" + type]) && n._;
      capture = false;
    }
    return this.each(d3_selection_on(type, listener, capture));
  };
  function d3_selection_on(type, listener, capture) {
    var name = "__on" + type, i = type.indexOf("."), wrap = d3_selection_onListener;
    if (i > 0) type = type.slice(0, i);
    var filter = d3_selection_onFilters.get(type);
    if (filter) type = filter, wrap = d3_selection_onFilter;
    function onRemove() {
      var l = this[name];
      if (l) {
        this.removeEventListener(type, l, l.$);
        delete this[name];
      }
    }
    function onAdd() {
      var l = wrap(listener, d3_array(arguments));
      onRemove.call(this);
      this.addEventListener(type, this[name] = l, l.$ = capture);
      l._ = listener;
    }
    function removeAll() {
      var re = new RegExp("^__on([^.]+)" + d3.requote(type) + "$"), match;
      for (var name in this) {
        if (match = name.match(re)) {
          var l = this[name];
          this.removeEventListener(match[1], l, l.$);
          delete this[name];
        }
      }
    }
    return i ? listener ? onAdd : onRemove : listener ? d3_noop : removeAll;
  }
  var d3_selection_onFilters = d3.map({
    mouseenter: "mouseover",
    mouseleave: "mouseout"
  });
  d3_selection_onFilters.forEach(function(k) {
    if ("on" + k in d3_document) d3_selection_onFilters.remove(k);
  });
  function d3_selection_onListener(listener, argumentz) {
    return function(e) {
      var o = d3.event;
      d3.event = e;
      argumentz[0] = this.__data__;
      try {
        listener.apply(this, argumentz);
      } finally {
        d3.event = o;
      }
    };
  }
  function d3_selection_onFilter(listener, argumentz) {
    var l = d3_selection_onListener(listener, argumentz);
    return function(e) {
      var target = this, related = e.relatedTarget;
      if (!related || related !== target && !(related.compareDocumentPosition(target) & 8)) {
        l.call(target, e);
      }
    };
  }
  var d3_event_dragSelect = "onselectstart" in d3_document ? null : d3_vendorSymbol(d3_documentElement.style, "userSelect"), d3_event_dragId = 0;
  function d3_event_dragSuppress() {
    var name = ".dragsuppress-" + ++d3_event_dragId, click = "click" + name, w = d3.select(d3_window).on("touchmove" + name, d3_eventPreventDefault).on("dragstart" + name, d3_eventPreventDefault).on("selectstart" + name, d3_eventPreventDefault);
    if (d3_event_dragSelect) {
      var style = d3_documentElement.style, select = style[d3_event_dragSelect];
      style[d3_event_dragSelect] = "none";
    }
    return function(suppressClick) {
      w.on(name, null);
      if (d3_event_dragSelect) style[d3_event_dragSelect] = select;
      if (suppressClick) {
        var off = function() {
          w.on(click, null);
        };
        w.on(click, function() {
          d3_eventPreventDefault();
          off();
        }, true);
        setTimeout(off, 0);
      }
    };
  }
  d3.mouse = function(container) {
    return d3_mousePoint(container, d3_eventSource());
  };
  var d3_mouse_bug44083 = /WebKit/.test(d3_window.navigator.userAgent) ? -1 : 0;
  function d3_mousePoint(container, e) {
    if (e.changedTouches) e = e.changedTouches[0];
    var svg = container.ownerSVGElement || container;
    if (svg.createSVGPoint) {
      var point = svg.createSVGPoint();
      if (d3_mouse_bug44083 < 0 && (d3_window.scrollX || d3_window.scrollY)) {
        svg = d3.select("body").append("svg").style({
          position: "absolute",
          top: 0,
          left: 0,
          margin: 0,
          padding: 0,
          border: "none"
        }, "important");
        var ctm = svg[0][0].getScreenCTM();
        d3_mouse_bug44083 = !(ctm.f || ctm.e);
        svg.remove();
      }
      if (d3_mouse_bug44083) point.x = e.pageX, point.y = e.pageY; else point.x = e.clientX, 
      point.y = e.clientY;
      point = point.matrixTransform(container.getScreenCTM().inverse());
      return [ point.x, point.y ];
    }
    var rect = container.getBoundingClientRect();
    return [ e.clientX - rect.left - container.clientLeft, e.clientY - rect.top - container.clientTop ];
  }
  d3.touch = function(container, touches, identifier) {
    if (arguments.length < 3) identifier = touches, touches = d3_eventSource().changedTouches;
    if (touches) for (var i = 0, n = touches.length, touch; i < n; ++i) {
      if ((touch = touches[i]).identifier === identifier) {
        return d3_mousePoint(container, touch);
      }
    }
  };
  d3.behavior.drag = function() {
    var event = d3_eventDispatch(drag, "drag", "dragstart", "dragend"), origin = null, mousedown = dragstart(d3_noop, d3.mouse, d3_behavior_dragMouseSubject, "mousemove", "mouseup"), touchstart = dragstart(d3_behavior_dragTouchId, d3.touch, d3_behavior_dragTouchSubject, "touchmove", "touchend");
    function drag() {
      this.on("mousedown.drag", mousedown).on("touchstart.drag", touchstart);
    }
    function dragstart(id, position, subject, move, end) {
      return function() {
        var that = this, target = d3.event.target, parent = that.parentNode, dispatch = event.of(that, arguments), dragged = 0, dragId = id(), dragName = ".drag" + (dragId == null ? "" : "-" + dragId), dragOffset, dragSubject = d3.select(subject()).on(move + dragName, moved).on(end + dragName, ended), dragRestore = d3_event_dragSuppress(), position0 = position(parent, dragId);
        if (origin) {
          dragOffset = origin.apply(that, arguments);
          dragOffset = [ dragOffset.x - position0[0], dragOffset.y - position0[1] ];
        } else {
          dragOffset = [ 0, 0 ];
        }
        dispatch({
          type: "dragstart"
        });
        function moved() {
          var position1 = position(parent, dragId), dx, dy;
          if (!position1) return;
          dx = position1[0] - position0[0];
          dy = position1[1] - position0[1];
          dragged |= dx | dy;
          position0 = position1;
          dispatch({
            type: "drag",
            x: position1[0] + dragOffset[0],
            y: position1[1] + dragOffset[1],
            dx: dx,
            dy: dy
          });
        }
        function ended() {
          if (!position(parent, dragId)) return;
          dragSubject.on(move + dragName, null).on(end + dragName, null);
          dragRestore(dragged && d3.event.target === target);
          dispatch({
            type: "dragend"
          });
        }
      };
    }
    drag.origin = function(x) {
      if (!arguments.length) return origin;
      origin = x;
      return drag;
    };
    return d3.rebind(drag, event, "on");
  };
  function d3_behavior_dragTouchId() {
    return d3.event.changedTouches[0].identifier;
  }
  function d3_behavior_dragTouchSubject() {
    return d3.event.target;
  }
  function d3_behavior_dragMouseSubject() {
    return d3_window;
  }
  d3.touches = function(container, touches) {
    if (arguments.length < 2) touches = d3_eventSource().touches;
    return touches ? d3_array(touches).map(function(touch) {
      var point = d3_mousePoint(container, touch);
      point.identifier = touch.identifier;
      return point;
    }) : [];
  };
  var ε = 1e-6, ε2 = ε * ε, π = Math.PI, τ = 2 * π, τε = τ - ε, halfπ = π / 2, d3_radians = π / 180, d3_degrees = 180 / π;
  function d3_sgn(x) {
    return x > 0 ? 1 : x < 0 ? -1 : 0;
  }
  function d3_cross2d(a, b, c) {
    return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  }
  function d3_acos(x) {
    return x > 1 ? 0 : x < -1 ? π : Math.acos(x);
  }
  function d3_asin(x) {
    return x > 1 ? halfπ : x < -1 ? -halfπ : Math.asin(x);
  }
  function d3_sinh(x) {
    return ((x = Math.exp(x)) - 1 / x) / 2;
  }
  function d3_cosh(x) {
    return ((x = Math.exp(x)) + 1 / x) / 2;
  }
  function d3_tanh(x) {
    return ((x = Math.exp(2 * x)) - 1) / (x + 1);
  }
  function d3_haversin(x) {
    return (x = Math.sin(x / 2)) * x;
  }
  var ρ = Math.SQRT2, ρ2 = 2, ρ4 = 4;
  d3.interpolateZoom = function(p0, p1) {
    var ux0 = p0[0], uy0 = p0[1], w0 = p0[2], ux1 = p1[0], uy1 = p1[1], w1 = p1[2];
    var dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy, d1 = Math.sqrt(d2), b0 = (w1 * w1 - w0 * w0 + ρ4 * d2) / (2 * w0 * ρ2 * d1), b1 = (w1 * w1 - w0 * w0 - ρ4 * d2) / (2 * w1 * ρ2 * d1), r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1), dr = r1 - r0, S = (dr || Math.log(w1 / w0)) / ρ;
    function interpolate(t) {
      var s = t * S;
      if (dr) {
        var coshr0 = d3_cosh(r0), u = w0 / (ρ2 * d1) * (coshr0 * d3_tanh(ρ * s + r0) - d3_sinh(r0));
        return [ ux0 + u * dx, uy0 + u * dy, w0 * coshr0 / d3_cosh(ρ * s + r0) ];
      }
      return [ ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(ρ * s) ];
    }
    interpolate.duration = S * 1e3;
    return interpolate;
  };
  d3.behavior.zoom = function() {
    var view = {
      x: 0,
      y: 0,
      k: 1
    }, translate0, center0, center, size = [ 960, 500 ], scaleExtent = d3_behavior_zoomInfinity, duration = 250, zooming = 0, mousedown = "mousedown.zoom", mousemove = "mousemove.zoom", mouseup = "mouseup.zoom", mousewheelTimer, touchstart = "touchstart.zoom", touchtime, event = d3_eventDispatch(zoom, "zoomstart", "zoom", "zoomend"), x0, x1, y0, y1;
    function zoom(g) {
      g.on(mousedown, mousedowned).on(d3_behavior_zoomWheel + ".zoom", mousewheeled).on("dblclick.zoom", dblclicked).on(touchstart, touchstarted);
    }
    zoom.event = function(g) {
      g.each(function() {
        var dispatch = event.of(this, arguments), view1 = view;
        if (d3_transitionInheritId) {
          d3.select(this).transition().each("start.zoom", function() {
            view = this.__chart__ || {
              x: 0,
              y: 0,
              k: 1
            };
            zoomstarted(dispatch);
          }).tween("zoom:zoom", function() {
            var dx = size[0], dy = size[1], cx = center0 ? center0[0] : dx / 2, cy = center0 ? center0[1] : dy / 2, i = d3.interpolateZoom([ (cx - view.x) / view.k, (cy - view.y) / view.k, dx / view.k ], [ (cx - view1.x) / view1.k, (cy - view1.y) / view1.k, dx / view1.k ]);
            return function(t) {
              var l = i(t), k = dx / l[2];
              this.__chart__ = view = {
                x: cx - l[0] * k,
                y: cy - l[1] * k,
                k: k
              };
              zoomed(dispatch);
            };
          }).each("interrupt.zoom", function() {
            zoomended(dispatch);
          }).each("end.zoom", function() {
            zoomended(dispatch);
          });
        } else {
          this.__chart__ = view;
          zoomstarted(dispatch);
          zoomed(dispatch);
          zoomended(dispatch);
        }
      });
    };
    zoom.translate = function(_) {
      if (!arguments.length) return [ view.x, view.y ];
      view = {
        x: +_[0],
        y: +_[1],
        k: view.k
      };
      rescale();
      return zoom;
    };
    zoom.scale = function(_) {
      if (!arguments.length) return view.k;
      view = {
        x: view.x,
        y: view.y,
        k: +_
      };
      rescale();
      return zoom;
    };
    zoom.scaleExtent = function(_) {
      if (!arguments.length) return scaleExtent;
      scaleExtent = _ == null ? d3_behavior_zoomInfinity : [ +_[0], +_[1] ];
      return zoom;
    };
    zoom.center = function(_) {
      if (!arguments.length) return center;
      center = _ && [ +_[0], +_[1] ];
      return zoom;
    };
    zoom.size = function(_) {
      if (!arguments.length) return size;
      size = _ && [ +_[0], +_[1] ];
      return zoom;
    };
    zoom.duration = function(_) {
      if (!arguments.length) return duration;
      duration = +_;
      return zoom;
    };
    zoom.x = function(z) {
      if (!arguments.length) return x1;
      x1 = z;
      x0 = z.copy();
      view = {
        x: 0,
        y: 0,
        k: 1
      };
      return zoom;
    };
    zoom.y = function(z) {
      if (!arguments.length) return y1;
      y1 = z;
      y0 = z.copy();
      view = {
        x: 0,
        y: 0,
        k: 1
      };
      return zoom;
    };
    function location(p) {
      return [ (p[0] - view.x) / view.k, (p[1] - view.y) / view.k ];
    }
    function point(l) {
      return [ l[0] * view.k + view.x, l[1] * view.k + view.y ];
    }
    function scaleTo(s) {
      view.k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], s));
    }
    function translateTo(p, l) {
      l = point(l);
      view.x += p[0] - l[0];
      view.y += p[1] - l[1];
    }
    function zoomTo(that, p, l, k) {
      that.__chart__ = {
        x: view.x,
        y: view.y,
        k: view.k
      };
      scaleTo(Math.pow(2, k));
      translateTo(center0 = p, l);
      that = d3.select(that);
      if (duration > 0) that = that.transition().duration(duration);
      that.call(zoom.event);
    }
    function rescale() {
      if (x1) x1.domain(x0.range().map(function(x) {
        return (x - view.x) / view.k;
      }).map(x0.invert));
      if (y1) y1.domain(y0.range().map(function(y) {
        return (y - view.y) / view.k;
      }).map(y0.invert));
    }
    function zoomstarted(dispatch) {
      if (!zooming++) dispatch({
        type: "zoomstart"
      });
    }
    function zoomed(dispatch) {
      rescale();
      dispatch({
        type: "zoom",
        scale: view.k,
        translate: [ view.x, view.y ]
      });
    }
    function zoomended(dispatch) {
      if (!--zooming) dispatch({
        type: "zoomend"
      });
      center0 = null;
    }
    function mousedowned() {
      var that = this, target = d3.event.target, dispatch = event.of(that, arguments), dragged = 0, subject = d3.select(d3_window).on(mousemove, moved).on(mouseup, ended), location0 = location(d3.mouse(that)), dragRestore = d3_event_dragSuppress();
      d3_selection_interrupt.call(that);
      zoomstarted(dispatch);
      function moved() {
        dragged = 1;
        translateTo(d3.mouse(that), location0);
        zoomed(dispatch);
      }
      function ended() {
        subject.on(mousemove, null).on(mouseup, null);
        dragRestore(dragged && d3.event.target === target);
        zoomended(dispatch);
      }
    }
    function touchstarted() {
      var that = this, dispatch = event.of(that, arguments), locations0 = {}, distance0 = 0, scale0, zoomName = ".zoom-" + d3.event.changedTouches[0].identifier, touchmove = "touchmove" + zoomName, touchend = "touchend" + zoomName, targets = [], subject = d3.select(that), dragRestore = d3_event_dragSuppress();
      started();
      zoomstarted(dispatch);
      subject.on(mousedown, null).on(touchstart, started);
      function relocate() {
        var touches = d3.touches(that);
        scale0 = view.k;
        touches.forEach(function(t) {
          if (t.identifier in locations0) locations0[t.identifier] = location(t);
        });
        return touches;
      }
      function started() {
        var target = d3.event.target;
        d3.select(target).on(touchmove, moved).on(touchend, ended);
        targets.push(target);
        var changed = d3.event.changedTouches;
        for (var i = 0, n = changed.length; i < n; ++i) {
          locations0[changed[i].identifier] = null;
        }
        var touches = relocate(), now = Date.now();
        if (touches.length === 1) {
          if (now - touchtime < 500) {
            var p = touches[0];
            zoomTo(that, p, locations0[p.identifier], Math.floor(Math.log(view.k) / Math.LN2) + 1);
            d3_eventPreventDefault();
          }
          touchtime = now;
        } else if (touches.length > 1) {
          var p = touches[0], q = touches[1], dx = p[0] - q[0], dy = p[1] - q[1];
          distance0 = dx * dx + dy * dy;
        }
      }
      function moved() {
        var touches = d3.touches(that), p0, l0, p1, l1;
        d3_selection_interrupt.call(that);
        for (var i = 0, n = touches.length; i < n; ++i, l1 = null) {
          p1 = touches[i];
          if (l1 = locations0[p1.identifier]) {
            if (l0) break;
            p0 = p1, l0 = l1;
          }
        }
        if (l1) {
          var distance1 = (distance1 = p1[0] - p0[0]) * distance1 + (distance1 = p1[1] - p0[1]) * distance1, scale1 = distance0 && Math.sqrt(distance1 / distance0);
          p0 = [ (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 ];
          l0 = [ (l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2 ];
          scaleTo(scale1 * scale0);
        }
        touchtime = null;
        translateTo(p0, l0);
        zoomed(dispatch);
      }
      function ended() {
        if (d3.event.touches.length) {
          var changed = d3.event.changedTouches;
          for (var i = 0, n = changed.length; i < n; ++i) {
            delete locations0[changed[i].identifier];
          }
          for (var identifier in locations0) {
            return void relocate();
          }
        }
        d3.selectAll(targets).on(zoomName, null);
        subject.on(mousedown, mousedowned).on(touchstart, touchstarted);
        dragRestore();
        zoomended(dispatch);
      }
    }
    function mousewheeled() {
      var dispatch = event.of(this, arguments);
      if (mousewheelTimer) clearTimeout(mousewheelTimer); else translate0 = location(center0 = center || d3.mouse(this)), 
      d3_selection_interrupt.call(this), zoomstarted(dispatch);
      mousewheelTimer = setTimeout(function() {
        mousewheelTimer = null;
        zoomended(dispatch);
      }, 50);
      d3_eventPreventDefault();
      scaleTo(Math.pow(2, d3_behavior_zoomDelta() * .002) * view.k);
      translateTo(center0, translate0);
      zoomed(dispatch);
    }
    function dblclicked() {
      var p = d3.mouse(this), k = Math.log(view.k) / Math.LN2;
      zoomTo(this, p, location(p), d3.event.shiftKey ? Math.ceil(k) - 1 : Math.floor(k) + 1);
    }
    return d3.rebind(zoom, event, "on");
  };
  var d3_behavior_zoomInfinity = [ 0, Infinity ];
  var d3_behavior_zoomDelta, d3_behavior_zoomWheel = "onwheel" in d3_document ? (d3_behavior_zoomDelta = function() {
    return -d3.event.deltaY * (d3.event.deltaMode ? 120 : 1);
  }, "wheel") : "onmousewheel" in d3_document ? (d3_behavior_zoomDelta = function() {
    return d3.event.wheelDelta;
  }, "mousewheel") : (d3_behavior_zoomDelta = function() {
    return -d3.event.detail;
  }, "MozMousePixelScroll");
  d3.color = d3_color;
  function d3_color() {}
  d3_color.prototype.toString = function() {
    return this.rgb() + "";
  };
  d3.hsl = d3_hsl;
  function d3_hsl(h, s, l) {
    return this instanceof d3_hsl ? void (this.h = +h, this.s = +s, this.l = +l) : arguments.length < 2 ? h instanceof d3_hsl ? new d3_hsl(h.h, h.s, h.l) : d3_rgb_parse("" + h, d3_rgb_hsl, d3_hsl) : new d3_hsl(h, s, l);
  }
  var d3_hslPrototype = d3_hsl.prototype = new d3_color();
  d3_hslPrototype.brighter = function(k) {
    k = Math.pow(.7, arguments.length ? k : 1);
    return new d3_hsl(this.h, this.s, this.l / k);
  };
  d3_hslPrototype.darker = function(k) {
    k = Math.pow(.7, arguments.length ? k : 1);
    return new d3_hsl(this.h, this.s, k * this.l);
  };
  d3_hslPrototype.rgb = function() {
    return d3_hsl_rgb(this.h, this.s, this.l);
  };
  function d3_hsl_rgb(h, s, l) {
    var m1, m2;
    h = isNaN(h) ? 0 : (h %= 360) < 0 ? h + 360 : h;
    s = isNaN(s) ? 0 : s < 0 ? 0 : s > 1 ? 1 : s;
    l = l < 0 ? 0 : l > 1 ? 1 : l;
    m2 = l <= .5 ? l * (1 + s) : l + s - l * s;
    m1 = 2 * l - m2;
    function v(h) {
      if (h > 360) h -= 360; else if (h < 0) h += 360;
      if (h < 60) return m1 + (m2 - m1) * h / 60;
      if (h < 180) return m2;
      if (h < 240) return m1 + (m2 - m1) * (240 - h) / 60;
      return m1;
    }
    function vv(h) {
      return Math.round(v(h) * 255);
    }
    return new d3_rgb(vv(h + 120), vv(h), vv(h - 120));
  }
  d3.hcl = d3_hcl;
  function d3_hcl(h, c, l) {
    return this instanceof d3_hcl ? void (this.h = +h, this.c = +c, this.l = +l) : arguments.length < 2 ? h instanceof d3_hcl ? new d3_hcl(h.h, h.c, h.l) : h instanceof d3_lab ? d3_lab_hcl(h.l, h.a, h.b) : d3_lab_hcl((h = d3_rgb_lab((h = d3.rgb(h)).r, h.g, h.b)).l, h.a, h.b) : new d3_hcl(h, c, l);
  }
  var d3_hclPrototype = d3_hcl.prototype = new d3_color();
  d3_hclPrototype.brighter = function(k) {
    return new d3_hcl(this.h, this.c, Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)));
  };
  d3_hclPrototype.darker = function(k) {
    return new d3_hcl(this.h, this.c, Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)));
  };
  d3_hclPrototype.rgb = function() {
    return d3_hcl_lab(this.h, this.c, this.l).rgb();
  };
  function d3_hcl_lab(h, c, l) {
    if (isNaN(h)) h = 0;
    if (isNaN(c)) c = 0;
    return new d3_lab(l, Math.cos(h *= d3_radians) * c, Math.sin(h) * c);
  }
  d3.lab = d3_lab;
  function d3_lab(l, a, b) {
    return this instanceof d3_lab ? void (this.l = +l, this.a = +a, this.b = +b) : arguments.length < 2 ? l instanceof d3_lab ? new d3_lab(l.l, l.a, l.b) : l instanceof d3_hcl ? d3_hcl_lab(l.h, l.c, l.l) : d3_rgb_lab((l = d3_rgb(l)).r, l.g, l.b) : new d3_lab(l, a, b);
  }
  var d3_lab_K = 18;
  var d3_lab_X = .95047, d3_lab_Y = 1, d3_lab_Z = 1.08883;
  var d3_labPrototype = d3_lab.prototype = new d3_color();
  d3_labPrototype.brighter = function(k) {
    return new d3_lab(Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)), this.a, this.b);
  };
  d3_labPrototype.darker = function(k) {
    return new d3_lab(Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)), this.a, this.b);
  };
  d3_labPrototype.rgb = function() {
    return d3_lab_rgb(this.l, this.a, this.b);
  };
  function d3_lab_rgb(l, a, b) {
    var y = (l + 16) / 116, x = y + a / 500, z = y - b / 200;
    x = d3_lab_xyz(x) * d3_lab_X;
    y = d3_lab_xyz(y) * d3_lab_Y;
    z = d3_lab_xyz(z) * d3_lab_Z;
    return new d3_rgb(d3_xyz_rgb(3.2404542 * x - 1.5371385 * y - .4985314 * z), d3_xyz_rgb(-.969266 * x + 1.8760108 * y + .041556 * z), d3_xyz_rgb(.0556434 * x - .2040259 * y + 1.0572252 * z));
  }
  function d3_lab_hcl(l, a, b) {
    return l > 0 ? new d3_hcl(Math.atan2(b, a) * d3_degrees, Math.sqrt(a * a + b * b), l) : new d3_hcl(NaN, NaN, l);
  }
  function d3_lab_xyz(x) {
    return x > .206893034 ? x * x * x : (x - 4 / 29) / 7.787037;
  }
  function d3_xyz_lab(x) {
    return x > .008856 ? Math.pow(x, 1 / 3) : 7.787037 * x + 4 / 29;
  }
  function d3_xyz_rgb(r) {
    return Math.round(255 * (r <= .00304 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - .055));
  }
  d3.rgb = d3_rgb;
  function d3_rgb(r, g, b) {
    return this instanceof d3_rgb ? void (this.r = ~~r, this.g = ~~g, this.b = ~~b) : arguments.length < 2 ? r instanceof d3_rgb ? new d3_rgb(r.r, r.g, r.b) : d3_rgb_parse("" + r, d3_rgb, d3_hsl_rgb) : new d3_rgb(r, g, b);
  }
  function d3_rgbNumber(value) {
    return new d3_rgb(value >> 16, value >> 8 & 255, value & 255);
  }
  function d3_rgbString(value) {
    return d3_rgbNumber(value) + "";
  }
  var d3_rgbPrototype = d3_rgb.prototype = new d3_color();
  d3_rgbPrototype.brighter = function(k) {
    k = Math.pow(.7, arguments.length ? k : 1);
    var r = this.r, g = this.g, b = this.b, i = 30;
    if (!r && !g && !b) return new d3_rgb(i, i, i);
    if (r && r < i) r = i;
    if (g && g < i) g = i;
    if (b && b < i) b = i;
    return new d3_rgb(Math.min(255, r / k), Math.min(255, g / k), Math.min(255, b / k));
  };
  d3_rgbPrototype.darker = function(k) {
    k = Math.pow(.7, arguments.length ? k : 1);
    return new d3_rgb(k * this.r, k * this.g, k * this.b);
  };
  d3_rgbPrototype.hsl = function() {
    return d3_rgb_hsl(this.r, this.g, this.b);
  };
  d3_rgbPrototype.toString = function() {
    return "#" + d3_rgb_hex(this.r) + d3_rgb_hex(this.g) + d3_rgb_hex(this.b);
  };
  function d3_rgb_hex(v) {
    return v < 16 ? "0" + Math.max(0, v).toString(16) : Math.min(255, v).toString(16);
  }
  function d3_rgb_parse(format, rgb, hsl) {
    var r = 0, g = 0, b = 0, m1, m2, color;
    m1 = /([a-z]+)\((.*)\)/i.exec(format);
    if (m1) {
      m2 = m1[2].split(",");
      switch (m1[1]) {
       case "hsl":
        {
          return hsl(parseFloat(m2[0]), parseFloat(m2[1]) / 100, parseFloat(m2[2]) / 100);
        }

       case "rgb":
        {
          return rgb(d3_rgb_parseNumber(m2[0]), d3_rgb_parseNumber(m2[1]), d3_rgb_parseNumber(m2[2]));
        }
      }
    }
    if (color = d3_rgb_names.get(format)) return rgb(color.r, color.g, color.b);
    if (format != null && format.charAt(0) === "#" && !isNaN(color = parseInt(format.slice(1), 16))) {
      if (format.length === 4) {
        r = (color & 3840) >> 4;
        r = r >> 4 | r;
        g = color & 240;
        g = g >> 4 | g;
        b = color & 15;
        b = b << 4 | b;
      } else if (format.length === 7) {
        r = (color & 16711680) >> 16;
        g = (color & 65280) >> 8;
        b = color & 255;
      }
    }
    return rgb(r, g, b);
  }
  function d3_rgb_hsl(r, g, b) {
    var min = Math.min(r /= 255, g /= 255, b /= 255), max = Math.max(r, g, b), d = max - min, h, s, l = (max + min) / 2;
    if (d) {
      s = l < .5 ? d / (max + min) : d / (2 - max - min);
      if (r == max) h = (g - b) / d + (g < b ? 6 : 0); else if (g == max) h = (b - r) / d + 2; else h = (r - g) / d + 4;
      h *= 60;
    } else {
      h = NaN;
      s = l > 0 && l < 1 ? 0 : h;
    }
    return new d3_hsl(h, s, l);
  }
  function d3_rgb_lab(r, g, b) {
    r = d3_rgb_xyz(r);
    g = d3_rgb_xyz(g);
    b = d3_rgb_xyz(b);
    var x = d3_xyz_lab((.4124564 * r + .3575761 * g + .1804375 * b) / d3_lab_X), y = d3_xyz_lab((.2126729 * r + .7151522 * g + .072175 * b) / d3_lab_Y), z = d3_xyz_lab((.0193339 * r + .119192 * g + .9503041 * b) / d3_lab_Z);
    return d3_lab(116 * y - 16, 500 * (x - y), 200 * (y - z));
  }
  function d3_rgb_xyz(r) {
    return (r /= 255) <= .04045 ? r / 12.92 : Math.pow((r + .055) / 1.055, 2.4);
  }
  function d3_rgb_parseNumber(c) {
    var f = parseFloat(c);
    return c.charAt(c.length - 1) === "%" ? Math.round(f * 2.55) : f;
  }
  var d3_rgb_names = d3.map({
    aliceblue: 15792383,
    antiquewhite: 16444375,
    aqua: 65535,
    aquamarine: 8388564,
    azure: 15794175,
    beige: 16119260,
    bisque: 16770244,
    black: 0,
    blanchedalmond: 16772045,
    blue: 255,
    blueviolet: 9055202,
    brown: 10824234,
    burlywood: 14596231,
    cadetblue: 6266528,
    chartreuse: 8388352,
    chocolate: 13789470,
    coral: 16744272,
    cornflowerblue: 6591981,
    cornsilk: 16775388,
    crimson: 14423100,
    cyan: 65535,
    darkblue: 139,
    darkcyan: 35723,
    darkgoldenrod: 12092939,
    darkgray: 11119017,
    darkgreen: 25600,
    darkgrey: 11119017,
    darkkhaki: 12433259,
    darkmagenta: 9109643,
    darkolivegreen: 5597999,
    darkorange: 16747520,
    darkorchid: 10040012,
    darkred: 9109504,
    darksalmon: 15308410,
    darkseagreen: 9419919,
    darkslateblue: 4734347,
    darkslategray: 3100495,
    darkslategrey: 3100495,
    darkturquoise: 52945,
    darkviolet: 9699539,
    deeppink: 16716947,
    deepskyblue: 49151,
    dimgray: 6908265,
    dimgrey: 6908265,
    dodgerblue: 2003199,
    firebrick: 11674146,
    floralwhite: 16775920,
    forestgreen: 2263842,
    fuchsia: 16711935,
    gainsboro: 14474460,
    ghostwhite: 16316671,
    gold: 16766720,
    goldenrod: 14329120,
    gray: 8421504,
    green: 32768,
    greenyellow: 11403055,
    grey: 8421504,
    honeydew: 15794160,
    hotpink: 16738740,
    indianred: 13458524,
    indigo: 4915330,
    ivory: 16777200,
    khaki: 15787660,
    lavender: 15132410,
    lavenderblush: 16773365,
    lawngreen: 8190976,
    lemonchiffon: 16775885,
    lightblue: 11393254,
    lightcoral: 15761536,
    lightcyan: 14745599,
    lightgoldenrodyellow: 16448210,
    lightgray: 13882323,
    lightgreen: 9498256,
    lightgrey: 13882323,
    lightpink: 16758465,
    lightsalmon: 16752762,
    lightseagreen: 2142890,
    lightskyblue: 8900346,
    lightslategray: 7833753,
    lightslategrey: 7833753,
    lightsteelblue: 11584734,
    lightyellow: 16777184,
    lime: 65280,
    limegreen: 3329330,
    linen: 16445670,
    magenta: 16711935,
    maroon: 8388608,
    mediumaquamarine: 6737322,
    mediumblue: 205,
    mediumorchid: 12211667,
    mediumpurple: 9662683,
    mediumseagreen: 3978097,
    mediumslateblue: 8087790,
    mediumspringgreen: 64154,
    mediumturquoise: 4772300,
    mediumvioletred: 13047173,
    midnightblue: 1644912,
    mintcream: 16121850,
    mistyrose: 16770273,
    moccasin: 16770229,
    navajowhite: 16768685,
    navy: 128,
    oldlace: 16643558,
    olive: 8421376,
    olivedrab: 7048739,
    orange: 16753920,
    orangered: 16729344,
    orchid: 14315734,
    palegoldenrod: 15657130,
    palegreen: 10025880,
    paleturquoise: 11529966,
    palevioletred: 14381203,
    papayawhip: 16773077,
    peachpuff: 16767673,
    peru: 13468991,
    pink: 16761035,
    plum: 14524637,
    powderblue: 11591910,
    purple: 8388736,
    red: 16711680,
    rosybrown: 12357519,
    royalblue: 4286945,
    saddlebrown: 9127187,
    salmon: 16416882,
    sandybrown: 16032864,
    seagreen: 3050327,
    seashell: 16774638,
    sienna: 10506797,
    silver: 12632256,
    skyblue: 8900331,
    slateblue: 6970061,
    slategray: 7372944,
    slategrey: 7372944,
    snow: 16775930,
    springgreen: 65407,
    steelblue: 4620980,
    tan: 13808780,
    teal: 32896,
    thistle: 14204888,
    tomato: 16737095,
    turquoise: 4251856,
    violet: 15631086,
    wheat: 16113331,
    white: 16777215,
    whitesmoke: 16119285,
    yellow: 16776960,
    yellowgreen: 10145074
  });
  d3_rgb_names.forEach(function(key, value) {
    d3_rgb_names.set(key, d3_rgbNumber(value));
  });
  function d3_functor(v) {
    return typeof v === "function" ? v : function() {
      return v;
    };
  }
  d3.functor = d3_functor;
  function d3_identity(d) {
    return d;
  }
  d3.xhr = d3_xhrType(d3_identity);
  function d3_xhrType(response) {
    return function(url, mimeType, callback) {
      if (arguments.length === 2 && typeof mimeType === "function") callback = mimeType, 
      mimeType = null;
      return d3_xhr(url, mimeType, response, callback);
    };
  }
  function d3_xhr(url, mimeType, response, callback) {
    var xhr = {}, dispatch = d3.dispatch("beforesend", "progress", "load", "error"), headers = {}, request = new XMLHttpRequest(), responseType = null;
    if (d3_window.XDomainRequest && !("withCredentials" in request) && /^(http(s)?:)?\/\//.test(url)) request = new XDomainRequest();
    "onload" in request ? request.onload = request.onerror = respond : request.onreadystatechange = function() {
      request.readyState > 3 && respond();
    };
    function respond() {
      var status = request.status, result;
      if (!status && d3_xhrHasResponse(request) || status >= 200 && status < 300 || status === 304) {
        try {
          result = response.call(xhr, request);
        } catch (e) {
          dispatch.error.call(xhr, e);
          return;
        }
        dispatch.load.call(xhr, result);
      } else {
        dispatch.error.call(xhr, request);
      }
    }
    request.onprogress = function(event) {
      var o = d3.event;
      d3.event = event;
      try {
        dispatch.progress.call(xhr, request);
      } finally {
        d3.event = o;
      }
    };
    xhr.header = function(name, value) {
      name = (name + "").toLowerCase();
      if (arguments.length < 2) return headers[name];
      if (value == null) delete headers[name]; else headers[name] = value + "";
      return xhr;
    };
    xhr.mimeType = function(value) {
      if (!arguments.length) return mimeType;
      mimeType = value == null ? null : value + "";
      return xhr;
    };
    xhr.responseType = function(value) {
      if (!arguments.length) return responseType;
      responseType = value;
      return xhr;
    };
    xhr.response = function(value) {
      response = value;
      return xhr;
    };
    [ "get", "post" ].forEach(function(method) {
      xhr[method] = function() {
        return xhr.send.apply(xhr, [ method ].concat(d3_array(arguments)));
      };
    });
    xhr.send = function(method, data, callback) {
      if (arguments.length === 2 && typeof data === "function") callback = data, data = null;
      request.open(method, url, true);
      if (mimeType != null && !("accept" in headers)) headers["accept"] = mimeType + ",*/*";
      if (request.setRequestHeader) for (var name in headers) request.setRequestHeader(name, headers[name]);
      if (mimeType != null && request.overrideMimeType) request.overrideMimeType(mimeType);
      if (responseType != null) request.responseType = responseType;
      if (callback != null) xhr.on("error", callback).on("load", function(request) {
        callback(null, request);
      });
      dispatch.beforesend.call(xhr, request);
      request.send(data == null ? null : data);
      return xhr;
    };
    xhr.abort = function() {
      request.abort();
      return xhr;
    };
    d3.rebind(xhr, dispatch, "on");
    return callback == null ? xhr : xhr.get(d3_xhr_fixCallback(callback));
  }
  function d3_xhr_fixCallback(callback) {
    return callback.length === 1 ? function(error, request) {
      callback(error == null ? request : null);
    } : callback;
  }
  function d3_xhrHasResponse(request) {
    var type = request.responseType;
    return type && type !== "text" ? request.response : request.responseText;
  }
  d3.dsv = function(delimiter, mimeType) {
    var reFormat = new RegExp('["' + delimiter + "\n]"), delimiterCode = delimiter.charCodeAt(0);
    function dsv(url, row, callback) {
      if (arguments.length < 3) callback = row, row = null;
      var xhr = d3_xhr(url, mimeType, row == null ? response : typedResponse(row), callback);
      xhr.row = function(_) {
        return arguments.length ? xhr.response((row = _) == null ? response : typedResponse(_)) : row;
      };
      return xhr;
    }
    function response(request) {
      return dsv.parse(request.responseText);
    }
    function typedResponse(f) {
      return function(request) {
        return dsv.parse(request.responseText, f);
      };
    }
    dsv.parse = function(text, f) {
      var o;
      return dsv.parseRows(text, function(row, i) {
        if (o) return o(row, i - 1);
        var a = new Function("d", "return {" + row.map(function(name, i) {
          return JSON.stringify(name) + ": d[" + i + "]";
        }).join(",") + "}");
        o = f ? function(row, i) {
          return f(a(row), i);
        } : a;
      });
    };
    dsv.parseRows = function(text, f) {
      var EOL = {}, EOF = {}, rows = [], N = text.length, I = 0, n = 0, t, eol;
      function token() {
        if (I >= N) return EOF;
        if (eol) return eol = false, EOL;
        var j = I;
        if (text.charCodeAt(j) === 34) {
          var i = j;
          while (i++ < N) {
            if (text.charCodeAt(i) === 34) {
              if (text.charCodeAt(i + 1) !== 34) break;
              ++i;
            }
          }
          I = i + 2;
          var c = text.charCodeAt(i + 1);
          if (c === 13) {
            eol = true;
            if (text.charCodeAt(i + 2) === 10) ++I;
          } else if (c === 10) {
            eol = true;
          }
          return text.slice(j + 1, i).replace(/""/g, '"');
        }
        while (I < N) {
          var c = text.charCodeAt(I++), k = 1;
          if (c === 10) eol = true; else if (c === 13) {
            eol = true;
            if (text.charCodeAt(I) === 10) ++I, ++k;
          } else if (c !== delimiterCode) continue;
          return text.slice(j, I - k);
        }
        return text.slice(j);
      }
      while ((t = token()) !== EOF) {
        var a = [];
        while (t !== EOL && t !== EOF) {
          a.push(t);
          t = token();
        }
        if (f && (a = f(a, n++)) == null) continue;
        rows.push(a);
      }
      return rows;
    };
    dsv.format = function(rows) {
      if (Array.isArray(rows[0])) return dsv.formatRows(rows);
      var fieldSet = new d3_Set(), fields = [];
      rows.forEach(function(row) {
        for (var field in row) {
          if (!fieldSet.has(field)) {
            fields.push(fieldSet.add(field));
          }
        }
      });
      return [ fields.map(formatValue).join(delimiter) ].concat(rows.map(function(row) {
        return fields.map(function(field) {
          return formatValue(row[field]);
        }).join(delimiter);
      })).join("\n");
    };
    dsv.formatRows = function(rows) {
      return rows.map(formatRow).join("\n");
    };
    function formatRow(row) {
      return row.map(formatValue).join(delimiter);
    }
    function formatValue(text) {
      return reFormat.test(text) ? '"' + text.replace(/\"/g, '""') + '"' : text;
    }
    return dsv;
  };
  d3.csv = d3.dsv(",", "text/csv");
  d3.tsv = d3.dsv("	", "text/tab-separated-values");
  var d3_timer_queueHead, d3_timer_queueTail, d3_timer_interval, d3_timer_timeout, d3_timer_active, d3_timer_frame = d3_window[d3_vendorSymbol(d3_window, "requestAnimationFrame")] || function(callback) {
    setTimeout(callback, 17);
  };
  d3.timer = function(callback, delay, then) {
    var n = arguments.length;
    if (n < 2) delay = 0;
    if (n < 3) then = Date.now();
    var time = then + delay, timer = {
      c: callback,
      t: time,
      f: false,
      n: null
    };
    if (d3_timer_queueTail) d3_timer_queueTail.n = timer; else d3_timer_queueHead = timer;
    d3_timer_queueTail = timer;
    if (!d3_timer_interval) {
      d3_timer_timeout = clearTimeout(d3_timer_timeout);
      d3_timer_interval = 1;
      d3_timer_frame(d3_timer_step);
    }
  };
  function d3_timer_step() {
    var now = d3_timer_mark(), delay = d3_timer_sweep() - now;
    if (delay > 24) {
      if (isFinite(delay)) {
        clearTimeout(d3_timer_timeout);
        d3_timer_timeout = setTimeout(d3_timer_step, delay);
      }
      d3_timer_interval = 0;
    } else {
      d3_timer_interval = 1;
      d3_timer_frame(d3_timer_step);
    }
  }
  d3.timer.flush = function() {
    d3_timer_mark();
    d3_timer_sweep();
  };
  function d3_timer_mark() {
    var now = Date.now();
    d3_timer_active = d3_timer_queueHead;
    while (d3_timer_active) {
      if (now >= d3_timer_active.t) d3_timer_active.f = d3_timer_active.c(now - d3_timer_active.t);
      d3_timer_active = d3_timer_active.n;
    }
    return now;
  }
  function d3_timer_sweep() {
    var t0, t1 = d3_timer_queueHead, time = Infinity;
    while (t1) {
      if (t1.f) {
        t1 = t0 ? t0.n = t1.n : d3_timer_queueHead = t1.n;
      } else {
        if (t1.t < time) time = t1.t;
        t1 = (t0 = t1).n;
      }
    }
    d3_timer_queueTail = t0;
    return time;
  }
  function d3_format_precision(x, p) {
    return p - (x ? Math.ceil(Math.log(x) / Math.LN10) : 1);
  }
  d3.round = function(x, n) {
    return n ? Math.round(x * (n = Math.pow(10, n))) / n : Math.round(x);
  };
  var d3_formatPrefixes = [ "y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y" ].map(d3_formatPrefix);
  d3.formatPrefix = function(value, precision) {
    var i = 0;
    if (value) {
      if (value < 0) value *= -1;
      if (precision) value = d3.round(value, d3_format_precision(value, precision));
      i = 1 + Math.floor(1e-12 + Math.log(value) / Math.LN10);
      i = Math.max(-24, Math.min(24, Math.floor((i - 1) / 3) * 3));
    }
    return d3_formatPrefixes[8 + i / 3];
  };
  function d3_formatPrefix(d, i) {
    var k = Math.pow(10, abs(8 - i) * 3);
    return {
      scale: i > 8 ? function(d) {
        return d / k;
      } : function(d) {
        return d * k;
      },
      symbol: d
    };
  }
  function d3_locale_numberFormat(locale) {
    var locale_decimal = locale.decimal, locale_thousands = locale.thousands, locale_grouping = locale.grouping, locale_currency = locale.currency, formatGroup = locale_grouping && locale_thousands ? function(value, width) {
      var i = value.length, t = [], j = 0, g = locale_grouping[0], length = 0;
      while (i > 0 && g > 0) {
        if (length + g + 1 > width) g = Math.max(1, width - length);
        t.push(value.substring(i -= g, i + g));
        if ((length += g + 1) > width) break;
        g = locale_grouping[j = (j + 1) % locale_grouping.length];
      }
      return t.reverse().join(locale_thousands);
    } : d3_identity;
    return function(specifier) {
      var match = d3_format_re.exec(specifier), fill = match[1] || " ", align = match[2] || ">", sign = match[3] || "-", symbol = match[4] || "", zfill = match[5], width = +match[6], comma = match[7], precision = match[8], type = match[9], scale = 1, prefix = "", suffix = "", integer = false, exponent = true;
      if (precision) precision = +precision.substring(1);
      if (zfill || fill === "0" && align === "=") {
        zfill = fill = "0";
        align = "=";
      }
      switch (type) {
       case "n":
        comma = true;
        type = "g";
        break;

       case "%":
        scale = 100;
        suffix = "%";
        type = "f";
        break;

       case "p":
        scale = 100;
        suffix = "%";
        type = "r";
        break;

       case "b":
       case "o":
       case "x":
       case "X":
        if (symbol === "#") prefix = "0" + type.toLowerCase();

       case "c":
        exponent = false;

       case "d":
        integer = true;
        precision = 0;
        break;

       case "s":
        scale = -1;
        type = "r";
        break;
      }
      if (symbol === "$") prefix = locale_currency[0], suffix = locale_currency[1];
      if (type == "r" && !precision) type = "g";
      if (precision != null) {
        if (type == "g") precision = Math.max(1, Math.min(21, precision)); else if (type == "e" || type == "f") precision = Math.max(0, Math.min(20, precision));
      }
      type = d3_format_types.get(type) || d3_format_typeDefault;
      var zcomma = zfill && comma;
      return function(value) {
        var fullSuffix = suffix;
        if (integer && value % 1) return "";
        var negative = value < 0 || value === 0 && 1 / value < 0 ? (value = -value, "-") : sign === "-" ? "" : sign;
        if (scale < 0) {
          var unit = d3.formatPrefix(value, precision);
          value = unit.scale(value);
          fullSuffix = unit.symbol + suffix;
        } else {
          value *= scale;
        }
        value = type(value, precision);
        var i = value.lastIndexOf("."), before, after;
        if (i < 0) {
          var j = exponent ? value.lastIndexOf("e") : -1;
          if (j < 0) before = value, after = ""; else before = value.substring(0, j), after = value.substring(j);
        } else {
          before = value.substring(0, i);
          after = locale_decimal + value.substring(i + 1);
        }
        if (!zfill && comma) before = formatGroup(before, Infinity);
        var length = prefix.length + before.length + after.length + (zcomma ? 0 : negative.length), padding = length < width ? new Array(length = width - length + 1).join(fill) : "";
        if (zcomma) before = formatGroup(padding + before, padding.length ? width - after.length : Infinity);
        negative += prefix;
        value = before + after;
        return (align === "<" ? negative + value + padding : align === ">" ? padding + negative + value : align === "^" ? padding.substring(0, length >>= 1) + negative + value + padding.substring(length) : negative + (zcomma ? value : padding + value)) + fullSuffix;
      };
    };
  }
  var d3_format_re = /(?:([^{])?([<>=^]))?([+\- ])?([$#])?(0)?(\d+)?(,)?(\.-?\d+)?([a-z%])?/i;
  var d3_format_types = d3.map({
    b: function(x) {
      return x.toString(2);
    },
    c: function(x) {
      return String.fromCharCode(x);
    },
    o: function(x) {
      return x.toString(8);
    },
    x: function(x) {
      return x.toString(16);
    },
    X: function(x) {
      return x.toString(16).toUpperCase();
    },
    g: function(x, p) {
      return x.toPrecision(p);
    },
    e: function(x, p) {
      return x.toExponential(p);
    },
    f: function(x, p) {
      return x.toFixed(p);
    },
    r: function(x, p) {
      return (x = d3.round(x, d3_format_precision(x, p))).toFixed(Math.max(0, Math.min(20, d3_format_precision(x * (1 + 1e-15), p))));
    }
  });
  function d3_format_typeDefault(x) {
    return x + "";
  }
  var d3_time = d3.time = {}, d3_date = Date;
  function d3_date_utc() {
    this._ = new Date(arguments.length > 1 ? Date.UTC.apply(this, arguments) : arguments[0]);
  }
  d3_date_utc.prototype = {
    getDate: function() {
      return this._.getUTCDate();
    },
    getDay: function() {
      return this._.getUTCDay();
    },
    getFullYear: function() {
      return this._.getUTCFullYear();
    },
    getHours: function() {
      return this._.getUTCHours();
    },
    getMilliseconds: function() {
      return this._.getUTCMilliseconds();
    },
    getMinutes: function() {
      return this._.getUTCMinutes();
    },
    getMonth: function() {
      return this._.getUTCMonth();
    },
    getSeconds: function() {
      return this._.getUTCSeconds();
    },
    getTime: function() {
      return this._.getTime();
    },
    getTimezoneOffset: function() {
      return 0;
    },
    valueOf: function() {
      return this._.valueOf();
    },
    setDate: function() {
      d3_time_prototype.setUTCDate.apply(this._, arguments);
    },
    setDay: function() {
      d3_time_prototype.setUTCDay.apply(this._, arguments);
    },
    setFullYear: function() {
      d3_time_prototype.setUTCFullYear.apply(this._, arguments);
    },
    setHours: function() {
      d3_time_prototype.setUTCHours.apply(this._, arguments);
    },
    setMilliseconds: function() {
      d3_time_prototype.setUTCMilliseconds.apply(this._, arguments);
    },
    setMinutes: function() {
      d3_time_prototype.setUTCMinutes.apply(this._, arguments);
    },
    setMonth: function() {
      d3_time_prototype.setUTCMonth.apply(this._, arguments);
    },
    setSeconds: function() {
      d3_time_prototype.setUTCSeconds.apply(this._, arguments);
    },
    setTime: function() {
      d3_time_prototype.setTime.apply(this._, arguments);
    }
  };
  var d3_time_prototype = Date.prototype;
  function d3_time_interval(local, step, number) {
    function round(date) {
      var d0 = local(date), d1 = offset(d0, 1);
      return date - d0 < d1 - date ? d0 : d1;
    }
    function ceil(date) {
      step(date = local(new d3_date(date - 1)), 1);
      return date;
    }
    function offset(date, k) {
      step(date = new d3_date(+date), k);
      return date;
    }
    function range(t0, t1, dt) {
      var time = ceil(t0), times = [];
      if (dt > 1) {
        while (time < t1) {
          if (!(number(time) % dt)) times.push(new Date(+time));
          step(time, 1);
        }
      } else {
        while (time < t1) times.push(new Date(+time)), step(time, 1);
      }
      return times;
    }
    function range_utc(t0, t1, dt) {
      try {
        d3_date = d3_date_utc;
        var utc = new d3_date_utc();
        utc._ = t0;
        return range(utc, t1, dt);
      } finally {
        d3_date = Date;
      }
    }
    local.floor = local;
    local.round = round;
    local.ceil = ceil;
    local.offset = offset;
    local.range = range;
    var utc = local.utc = d3_time_interval_utc(local);
    utc.floor = utc;
    utc.round = d3_time_interval_utc(round);
    utc.ceil = d3_time_interval_utc(ceil);
    utc.offset = d3_time_interval_utc(offset);
    utc.range = range_utc;
    return local;
  }
  function d3_time_interval_utc(method) {
    return function(date, k) {
      try {
        d3_date = d3_date_utc;
        var utc = new d3_date_utc();
        utc._ = date;
        return method(utc, k)._;
      } finally {
        d3_date = Date;
      }
    };
  }
  d3_time.year = d3_time_interval(function(date) {
    date = d3_time.day(date);
    date.setMonth(0, 1);
    return date;
  }, function(date, offset) {
    date.setFullYear(date.getFullYear() + offset);
  }, function(date) {
    return date.getFullYear();
  });
  d3_time.years = d3_time.year.range;
  d3_time.years.utc = d3_time.year.utc.range;
  d3_time.day = d3_time_interval(function(date) {
    var day = new d3_date(2e3, 0);
    day.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    return day;
  }, function(date, offset) {
    date.setDate(date.getDate() + offset);
  }, function(date) {
    return date.getDate() - 1;
  });
  d3_time.days = d3_time.day.range;
  d3_time.days.utc = d3_time.day.utc.range;
  d3_time.dayOfYear = function(date) {
    var year = d3_time.year(date);
    return Math.floor((date - year - (date.getTimezoneOffset() - year.getTimezoneOffset()) * 6e4) / 864e5);
  };
  [ "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday" ].forEach(function(day, i) {
    i = 7 - i;
    var interval = d3_time[day] = d3_time_interval(function(date) {
      (date = d3_time.day(date)).setDate(date.getDate() - (date.getDay() + i) % 7);
      return date;
    }, function(date, offset) {
      date.setDate(date.getDate() + Math.floor(offset) * 7);
    }, function(date) {
      var day = d3_time.year(date).getDay();
      return Math.floor((d3_time.dayOfYear(date) + (day + i) % 7) / 7) - (day !== i);
    });
    d3_time[day + "s"] = interval.range;
    d3_time[day + "s"].utc = interval.utc.range;
    d3_time[day + "OfYear"] = function(date) {
      var day = d3_time.year(date).getDay();
      return Math.floor((d3_time.dayOfYear(date) + (day + i) % 7) / 7);
    };
  });
  d3_time.week = d3_time.sunday;
  d3_time.weeks = d3_time.sunday.range;
  d3_time.weeks.utc = d3_time.sunday.utc.range;
  d3_time.weekOfYear = d3_time.sundayOfYear;
  function d3_locale_timeFormat(locale) {
    var locale_dateTime = locale.dateTime, locale_date = locale.date, locale_time = locale.time, locale_periods = locale.periods, locale_days = locale.days, locale_shortDays = locale.shortDays, locale_months = locale.months, locale_shortMonths = locale.shortMonths;
    function d3_time_format(template) {
      var n = template.length;
      function format(date) {
        var string = [], i = -1, j = 0, c, p, f;
        while (++i < n) {
          if (template.charCodeAt(i) === 37) {
            string.push(template.slice(j, i));
            if ((p = d3_time_formatPads[c = template.charAt(++i)]) != null) c = template.charAt(++i);
            if (f = d3_time_formats[c]) c = f(date, p == null ? c === "e" ? " " : "0" : p);
            string.push(c);
            j = i + 1;
          }
        }
        string.push(template.slice(j, i));
        return string.join("");
      }
      format.parse = function(string) {
        var d = {
          y: 1900,
          m: 0,
          d: 1,
          H: 0,
          M: 0,
          S: 0,
          L: 0,
          Z: null
        }, i = d3_time_parse(d, template, string, 0);
        if (i != string.length) return null;
        if ("p" in d) d.H = d.H % 12 + d.p * 12;
        var localZ = d.Z != null && d3_date !== d3_date_utc, date = new (localZ ? d3_date_utc : d3_date)();
        if ("j" in d) date.setFullYear(d.y, 0, d.j); else if ("w" in d && ("W" in d || "U" in d)) {
          date.setFullYear(d.y, 0, 1);
          date.setFullYear(d.y, 0, "W" in d ? (d.w + 6) % 7 + d.W * 7 - (date.getDay() + 5) % 7 : d.w + d.U * 7 - (date.getDay() + 6) % 7);
        } else date.setFullYear(d.y, d.m, d.d);
        date.setHours(d.H + (d.Z / 100 | 0), d.M + d.Z % 100, d.S, d.L);
        return localZ ? date._ : date;
      };
      format.toString = function() {
        return template;
      };
      return format;
    }
    function d3_time_parse(date, template, string, j) {
      var c, p, t, i = 0, n = template.length, m = string.length;
      while (i < n) {
        if (j >= m) return -1;
        c = template.charCodeAt(i++);
        if (c === 37) {
          t = template.charAt(i++);
          p = d3_time_parsers[t in d3_time_formatPads ? template.charAt(i++) : t];
          if (!p || (j = p(date, string, j)) < 0) return -1;
        } else if (c != string.charCodeAt(j++)) {
          return -1;
        }
      }
      return j;
    }
    d3_time_format.utc = function(template) {
      var local = d3_time_format(template);
      function format(date) {
        try {
          d3_date = d3_date_utc;
          var utc = new d3_date();
          utc._ = date;
          return local(utc);
        } finally {
          d3_date = Date;
        }
      }
      format.parse = function(string) {
        try {
          d3_date = d3_date_utc;
          var date = local.parse(string);
          return date && date._;
        } finally {
          d3_date = Date;
        }
      };
      format.toString = local.toString;
      return format;
    };
    d3_time_format.multi = d3_time_format.utc.multi = d3_time_formatMulti;
    var d3_time_periodLookup = d3.map(), d3_time_dayRe = d3_time_formatRe(locale_days), d3_time_dayLookup = d3_time_formatLookup(locale_days), d3_time_dayAbbrevRe = d3_time_formatRe(locale_shortDays), d3_time_dayAbbrevLookup = d3_time_formatLookup(locale_shortDays), d3_time_monthRe = d3_time_formatRe(locale_months), d3_time_monthLookup = d3_time_formatLookup(locale_months), d3_time_monthAbbrevRe = d3_time_formatRe(locale_shortMonths), d3_time_monthAbbrevLookup = d3_time_formatLookup(locale_shortMonths);
    locale_periods.forEach(function(p, i) {
      d3_time_periodLookup.set(p.toLowerCase(), i);
    });
    var d3_time_formats = {
      a: function(d) {
        return locale_shortDays[d.getDay()];
      },
      A: function(d) {
        return locale_days[d.getDay()];
      },
      b: function(d) {
        return locale_shortMonths[d.getMonth()];
      },
      B: function(d) {
        return locale_months[d.getMonth()];
      },
      c: d3_time_format(locale_dateTime),
      d: function(d, p) {
        return d3_time_formatPad(d.getDate(), p, 2);
      },
      e: function(d, p) {
        return d3_time_formatPad(d.getDate(), p, 2);
      },
      H: function(d, p) {
        return d3_time_formatPad(d.getHours(), p, 2);
      },
      I: function(d, p) {
        return d3_time_formatPad(d.getHours() % 12 || 12, p, 2);
      },
      j: function(d, p) {
        return d3_time_formatPad(1 + d3_time.dayOfYear(d), p, 3);
      },
      L: function(d, p) {
        return d3_time_formatPad(d.getMilliseconds(), p, 3);
      },
      m: function(d, p) {
        return d3_time_formatPad(d.getMonth() + 1, p, 2);
      },
      M: function(d, p) {
        return d3_time_formatPad(d.getMinutes(), p, 2);
      },
      p: function(d) {
        return locale_periods[+(d.getHours() >= 12)];
      },
      S: function(d, p) {
        return d3_time_formatPad(d.getSeconds(), p, 2);
      },
      U: function(d, p) {
        return d3_time_formatPad(d3_time.sundayOfYear(d), p, 2);
      },
      w: function(d) {
        return d.getDay();
      },
      W: function(d, p) {
        return d3_time_formatPad(d3_time.mondayOfYear(d), p, 2);
      },
      x: d3_time_format(locale_date),
      X: d3_time_format(locale_time),
      y: function(d, p) {
        return d3_time_formatPad(d.getFullYear() % 100, p, 2);
      },
      Y: function(d, p) {
        return d3_time_formatPad(d.getFullYear() % 1e4, p, 4);
      },
      Z: d3_time_zone,
      "%": function() {
        return "%";
      }
    };
    var d3_time_parsers = {
      a: d3_time_parseWeekdayAbbrev,
      A: d3_time_parseWeekday,
      b: d3_time_parseMonthAbbrev,
      B: d3_time_parseMonth,
      c: d3_time_parseLocaleFull,
      d: d3_time_parseDay,
      e: d3_time_parseDay,
      H: d3_time_parseHour24,
      I: d3_time_parseHour24,
      j: d3_time_parseDayOfYear,
      L: d3_time_parseMilliseconds,
      m: d3_time_parseMonthNumber,
      M: d3_time_parseMinutes,
      p: d3_time_parseAmPm,
      S: d3_time_parseSeconds,
      U: d3_time_parseWeekNumberSunday,
      w: d3_time_parseWeekdayNumber,
      W: d3_time_parseWeekNumberMonday,
      x: d3_time_parseLocaleDate,
      X: d3_time_parseLocaleTime,
      y: d3_time_parseYear,
      Y: d3_time_parseFullYear,
      Z: d3_time_parseZone,
      "%": d3_time_parseLiteralPercent
    };
    function d3_time_parseWeekdayAbbrev(date, string, i) {
      d3_time_dayAbbrevRe.lastIndex = 0;
      var n = d3_time_dayAbbrevRe.exec(string.slice(i));
      return n ? (date.w = d3_time_dayAbbrevLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function d3_time_parseWeekday(date, string, i) {
      d3_time_dayRe.lastIndex = 0;
      var n = d3_time_dayRe.exec(string.slice(i));
      return n ? (date.w = d3_time_dayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function d3_time_parseMonthAbbrev(date, string, i) {
      d3_time_monthAbbrevRe.lastIndex = 0;
      var n = d3_time_monthAbbrevRe.exec(string.slice(i));
      return n ? (date.m = d3_time_monthAbbrevLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function d3_time_parseMonth(date, string, i) {
      d3_time_monthRe.lastIndex = 0;
      var n = d3_time_monthRe.exec(string.slice(i));
      return n ? (date.m = d3_time_monthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function d3_time_parseLocaleFull(date, string, i) {
      return d3_time_parse(date, d3_time_formats.c.toString(), string, i);
    }
    function d3_time_parseLocaleDate(date, string, i) {
      return d3_time_parse(date, d3_time_formats.x.toString(), string, i);
    }
    function d3_time_parseLocaleTime(date, string, i) {
      return d3_time_parse(date, d3_time_formats.X.toString(), string, i);
    }
    function d3_time_parseAmPm(date, string, i) {
      var n = d3_time_periodLookup.get(string.slice(i, i += 2).toLowerCase());
      return n == null ? -1 : (date.p = n, i);
    }
    return d3_time_format;
  }
  var d3_time_formatPads = {
    "-": "",
    _: " ",
    "0": "0"
  }, d3_time_numberRe = /^\s*\d+/, d3_time_percentRe = /^%/;
  function d3_time_formatPad(value, fill, width) {
    var sign = value < 0 ? "-" : "", string = (sign ? -value : value) + "", length = string.length;
    return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
  }
  function d3_time_formatRe(names) {
    return new RegExp("^(?:" + names.map(d3.requote).join("|") + ")", "i");
  }
  function d3_time_formatLookup(names) {
    var map = new d3_Map(), i = -1, n = names.length;
    while (++i < n) map.set(names[i].toLowerCase(), i);
    return map;
  }
  function d3_time_parseWeekdayNumber(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i, i + 1));
    return n ? (date.w = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseWeekNumberSunday(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i));
    return n ? (date.U = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseWeekNumberMonday(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i));
    return n ? (date.W = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseFullYear(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i, i + 4));
    return n ? (date.y = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseYear(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
    return n ? (date.y = d3_time_expandYear(+n[0]), i + n[0].length) : -1;
  }
  function d3_time_parseZone(date, string, i) {
    return /^[+-]\d{4}$/.test(string = string.slice(i, i + 5)) ? (date.Z = -string, 
    i + 5) : -1;
  }
  function d3_time_expandYear(d) {
    return d + (d > 68 ? 1900 : 2e3);
  }
  function d3_time_parseMonthNumber(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
    return n ? (date.m = n[0] - 1, i + n[0].length) : -1;
  }
  function d3_time_parseDay(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
    return n ? (date.d = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseDayOfYear(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i, i + 3));
    return n ? (date.j = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseHour24(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
    return n ? (date.H = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseMinutes(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
    return n ? (date.M = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseSeconds(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
    return n ? (date.S = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseMilliseconds(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.slice(i, i + 3));
    return n ? (date.L = +n[0], i + n[0].length) : -1;
  }
  function d3_time_zone(d) {
    var z = d.getTimezoneOffset(), zs = z > 0 ? "-" : "+", zh = abs(z) / 60 | 0, zm = abs(z) % 60;
    return zs + d3_time_formatPad(zh, "0", 2) + d3_time_formatPad(zm, "0", 2);
  }
  function d3_time_parseLiteralPercent(date, string, i) {
    d3_time_percentRe.lastIndex = 0;
    var n = d3_time_percentRe.exec(string.slice(i, i + 1));
    return n ? i + n[0].length : -1;
  }
  function d3_time_formatMulti(formats) {
    var n = formats.length, i = -1;
    while (++i < n) formats[i][0] = this(formats[i][0]);
    return function(date) {
      var i = 0, f = formats[i];
      while (!f[1](date)) f = formats[++i];
      return f[0](date);
    };
  }
  d3.locale = function(locale) {
    return {
      numberFormat: d3_locale_numberFormat(locale),
      timeFormat: d3_locale_timeFormat(locale)
    };
  };
  var d3_locale_enUS = d3.locale({
    decimal: ".",
    thousands: ",",
    grouping: [ 3 ],
    currency: [ "$", "" ],
    dateTime: "%a %b %e %X %Y",
    date: "%m/%d/%Y",
    time: "%H:%M:%S",
    periods: [ "AM", "PM" ],
    days: [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
    shortDays: [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ],
    months: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
    shortMonths: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ]
  });
  d3.format = d3_locale_enUS.numberFormat;
  d3.geo = {};
  function d3_adder() {}
  d3_adder.prototype = {
    s: 0,
    t: 0,
    add: function(y) {
      d3_adderSum(y, this.t, d3_adderTemp);
      d3_adderSum(d3_adderTemp.s, this.s, this);
      if (this.s) this.t += d3_adderTemp.t; else this.s = d3_adderTemp.t;
    },
    reset: function() {
      this.s = this.t = 0;
    },
    valueOf: function() {
      return this.s;
    }
  };
  var d3_adderTemp = new d3_adder();
  function d3_adderSum(a, b, o) {
    var x = o.s = a + b, bv = x - a, av = x - bv;
    o.t = a - av + (b - bv);
  }
  d3.geo.stream = function(object, listener) {
    if (object && d3_geo_streamObjectType.hasOwnProperty(object.type)) {
      d3_geo_streamObjectType[object.type](object, listener);
    } else {
      d3_geo_streamGeometry(object, listener);
    }
  };
  function d3_geo_streamGeometry(geometry, listener) {
    if (geometry && d3_geo_streamGeometryType.hasOwnProperty(geometry.type)) {
      d3_geo_streamGeometryType[geometry.type](geometry, listener);
    }
  }
  var d3_geo_streamObjectType = {
    Feature: function(feature, listener) {
      d3_geo_streamGeometry(feature.geometry, listener);
    },
    FeatureCollection: function(object, listener) {
      var features = object.features, i = -1, n = features.length;
      while (++i < n) d3_geo_streamGeometry(features[i].geometry, listener);
    }
  };
  var d3_geo_streamGeometryType = {
    Sphere: function(object, listener) {
      listener.sphere();
    },
    Point: function(object, listener) {
      object = object.coordinates;
      listener.point(object[0], object[1], object[2]);
    },
    MultiPoint: function(object, listener) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) object = coordinates[i], listener.point(object[0], object[1], object[2]);
    },
    LineString: function(object, listener) {
      d3_geo_streamLine(object.coordinates, listener, 0);
    },
    MultiLineString: function(object, listener) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) d3_geo_streamLine(coordinates[i], listener, 0);
    },
    Polygon: function(object, listener) {
      d3_geo_streamPolygon(object.coordinates, listener);
    },
    MultiPolygon: function(object, listener) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) d3_geo_streamPolygon(coordinates[i], listener);
    },
    GeometryCollection: function(object, listener) {
      var geometries = object.geometries, i = -1, n = geometries.length;
      while (++i < n) d3_geo_streamGeometry(geometries[i], listener);
    }
  };
  function d3_geo_streamLine(coordinates, listener, closed) {
    var i = -1, n = coordinates.length - closed, coordinate;
    listener.lineStart();
    while (++i < n) coordinate = coordinates[i], listener.point(coordinate[0], coordinate[1], coordinate[2]);
    listener.lineEnd();
  }
  function d3_geo_streamPolygon(coordinates, listener) {
    var i = -1, n = coordinates.length;
    listener.polygonStart();
    while (++i < n) d3_geo_streamLine(coordinates[i], listener, 1);
    listener.polygonEnd();
  }
  d3.geo.area = function(object) {
    d3_geo_areaSum = 0;
    d3.geo.stream(object, d3_geo_area);
    return d3_geo_areaSum;
  };
  var d3_geo_areaSum, d3_geo_areaRingSum = new d3_adder();
  var d3_geo_area = {
    sphere: function() {
      d3_geo_areaSum += 4 * π;
    },
    point: d3_noop,
    lineStart: d3_noop,
    lineEnd: d3_noop,
    polygonStart: function() {
      d3_geo_areaRingSum.reset();
      d3_geo_area.lineStart = d3_geo_areaRingStart;
    },
    polygonEnd: function() {
      var area = 2 * d3_geo_areaRingSum;
      d3_geo_areaSum += area < 0 ? 4 * π + area : area;
      d3_geo_area.lineStart = d3_geo_area.lineEnd = d3_geo_area.point = d3_noop;
    }
  };
  function d3_geo_areaRingStart() {
    var λ00, φ00, λ0, cosφ0, sinφ0;
    d3_geo_area.point = function(λ, φ) {
      d3_geo_area.point = nextPoint;
      λ0 = (λ00 = λ) * d3_radians, cosφ0 = Math.cos(φ = (φ00 = φ) * d3_radians / 2 + π / 4), 
      sinφ0 = Math.sin(φ);
    };
    function nextPoint(λ, φ) {
      λ *= d3_radians;
      φ = φ * d3_radians / 2 + π / 4;
      var dλ = λ - λ0, sdλ = dλ >= 0 ? 1 : -1, adλ = sdλ * dλ, cosφ = Math.cos(φ), sinφ = Math.sin(φ), k = sinφ0 * sinφ, u = cosφ0 * cosφ + k * Math.cos(adλ), v = k * sdλ * Math.sin(adλ);
      d3_geo_areaRingSum.add(Math.atan2(v, u));
      λ0 = λ, cosφ0 = cosφ, sinφ0 = sinφ;
    }
    d3_geo_area.lineEnd = function() {
      nextPoint(λ00, φ00);
    };
  }
  function d3_geo_cartesian(spherical) {
    var λ = spherical[0], φ = spherical[1], cosφ = Math.cos(φ);
    return [ cosφ * Math.cos(λ), cosφ * Math.sin(λ), Math.sin(φ) ];
  }
  function d3_geo_cartesianDot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }
  function d3_geo_cartesianCross(a, b) {
    return [ a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0] ];
  }
  function d3_geo_cartesianAdd(a, b) {
    a[0] += b[0];
    a[1] += b[1];
    a[2] += b[2];
  }
  function d3_geo_cartesianScale(vector, k) {
    return [ vector[0] * k, vector[1] * k, vector[2] * k ];
  }
  function d3_geo_cartesianNormalize(d) {
    var l = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
    d[0] /= l;
    d[1] /= l;
    d[2] /= l;
  }
  function d3_geo_spherical(cartesian) {
    return [ Math.atan2(cartesian[1], cartesian[0]), d3_asin(cartesian[2]) ];
  }
  function d3_geo_sphericalEqual(a, b) {
    return abs(a[0] - b[0]) < ε && abs(a[1] - b[1]) < ε;
  }
  d3.geo.bounds = function() {
    var λ0, φ0, λ1, φ1, λ_, λ__, φ__, p0, dλSum, ranges, range;
    var bound = {
      point: point,
      lineStart: lineStart,
      lineEnd: lineEnd,
      polygonStart: function() {
        bound.point = ringPoint;
        bound.lineStart = ringStart;
        bound.lineEnd = ringEnd;
        dλSum = 0;
        d3_geo_area.polygonStart();
      },
      polygonEnd: function() {
        d3_geo_area.polygonEnd();
        bound.point = point;
        bound.lineStart = lineStart;
        bound.lineEnd = lineEnd;
        if (d3_geo_areaRingSum < 0) λ0 = -(λ1 = 180), φ0 = -(φ1 = 90); else if (dλSum > ε) φ1 = 90; else if (dλSum < -ε) φ0 = -90;
        range[0] = λ0, range[1] = λ1;
      }
    };
    function point(λ, φ) {
      ranges.push(range = [ λ0 = λ, λ1 = λ ]);
      if (φ < φ0) φ0 = φ;
      if (φ > φ1) φ1 = φ;
    }
    function linePoint(λ, φ) {
      var p = d3_geo_cartesian([ λ * d3_radians, φ * d3_radians ]);
      if (p0) {
        var normal = d3_geo_cartesianCross(p0, p), equatorial = [ normal[1], -normal[0], 0 ], inflection = d3_geo_cartesianCross(equatorial, normal);
        d3_geo_cartesianNormalize(inflection);
        inflection = d3_geo_spherical(inflection);
        var dλ = λ - λ_, s = dλ > 0 ? 1 : -1, λi = inflection[0] * d3_degrees * s, antimeridian = abs(dλ) > 180;
        if (antimeridian ^ (s * λ_ < λi && λi < s * λ)) {
          var φi = inflection[1] * d3_degrees;
          if (φi > φ1) φ1 = φi;
        } else if (λi = (λi + 360) % 360 - 180, antimeridian ^ (s * λ_ < λi && λi < s * λ)) {
          var φi = -inflection[1] * d3_degrees;
          if (φi < φ0) φ0 = φi;
        } else {
          if (φ < φ0) φ0 = φ;
          if (φ > φ1) φ1 = φ;
        }
        if (antimeridian) {
          if (λ < λ_) {
            if (angle(λ0, λ) > angle(λ0, λ1)) λ1 = λ;
          } else {
            if (angle(λ, λ1) > angle(λ0, λ1)) λ0 = λ;
          }
        } else {
          if (λ1 >= λ0) {
            if (λ < λ0) λ0 = λ;
            if (λ > λ1) λ1 = λ;
          } else {
            if (λ > λ_) {
              if (angle(λ0, λ) > angle(λ0, λ1)) λ1 = λ;
            } else {
              if (angle(λ, λ1) > angle(λ0, λ1)) λ0 = λ;
            }
          }
        }
      } else {
        point(λ, φ);
      }
      p0 = p, λ_ = λ;
    }
    function lineStart() {
      bound.point = linePoint;
    }
    function lineEnd() {
      range[0] = λ0, range[1] = λ1;
      bound.point = point;
      p0 = null;
    }
    function ringPoint(λ, φ) {
      if (p0) {
        var dλ = λ - λ_;
        dλSum += abs(dλ) > 180 ? dλ + (dλ > 0 ? 360 : -360) : dλ;
      } else λ__ = λ, φ__ = φ;
      d3_geo_area.point(λ, φ);
      linePoint(λ, φ);
    }
    function ringStart() {
      d3_geo_area.lineStart();
    }
    function ringEnd() {
      ringPoint(λ__, φ__);
      d3_geo_area.lineEnd();
      if (abs(dλSum) > ε) λ0 = -(λ1 = 180);
      range[0] = λ0, range[1] = λ1;
      p0 = null;
    }
    function angle(λ0, λ1) {
      return (λ1 -= λ0) < 0 ? λ1 + 360 : λ1;
    }
    function compareRanges(a, b) {
      return a[0] - b[0];
    }
    function withinRange(x, range) {
      return range[0] <= range[1] ? range[0] <= x && x <= range[1] : x < range[0] || range[1] < x;
    }
    return function(feature) {
      φ1 = λ1 = -(λ0 = φ0 = Infinity);
      ranges = [];
      d3.geo.stream(feature, bound);
      var n = ranges.length;
      if (n) {
        ranges.sort(compareRanges);
        for (var i = 1, a = ranges[0], b, merged = [ a ]; i < n; ++i) {
          b = ranges[i];
          if (withinRange(b[0], a) || withinRange(b[1], a)) {
            if (angle(a[0], b[1]) > angle(a[0], a[1])) a[1] = b[1];
            if (angle(b[0], a[1]) > angle(a[0], a[1])) a[0] = b[0];
          } else {
            merged.push(a = b);
          }
        }
        var best = -Infinity, dλ;
        for (var n = merged.length - 1, i = 0, a = merged[n], b; i <= n; a = b, ++i) {
          b = merged[i];
          if ((dλ = angle(a[1], b[0])) > best) best = dλ, λ0 = b[0], λ1 = a[1];
        }
      }
      ranges = range = null;
      return λ0 === Infinity || φ0 === Infinity ? [ [ NaN, NaN ], [ NaN, NaN ] ] : [ [ λ0, φ0 ], [ λ1, φ1 ] ];
    };
  }();
  d3.geo.centroid = function(object) {
    d3_geo_centroidW0 = d3_geo_centroidW1 = d3_geo_centroidX0 = d3_geo_centroidY0 = d3_geo_centroidZ0 = d3_geo_centroidX1 = d3_geo_centroidY1 = d3_geo_centroidZ1 = d3_geo_centroidX2 = d3_geo_centroidY2 = d3_geo_centroidZ2 = 0;
    d3.geo.stream(object, d3_geo_centroid);
    var x = d3_geo_centroidX2, y = d3_geo_centroidY2, z = d3_geo_centroidZ2, m = x * x + y * y + z * z;
    if (m < ε2) {
      x = d3_geo_centroidX1, y = d3_geo_centroidY1, z = d3_geo_centroidZ1;
      if (d3_geo_centroidW1 < ε) x = d3_geo_centroidX0, y = d3_geo_centroidY0, z = d3_geo_centroidZ0;
      m = x * x + y * y + z * z;
      if (m < ε2) return [ NaN, NaN ];
    }
    return [ Math.atan2(y, x) * d3_degrees, d3_asin(z / Math.sqrt(m)) * d3_degrees ];
  };
  var d3_geo_centroidW0, d3_geo_centroidW1, d3_geo_centroidX0, d3_geo_centroidY0, d3_geo_centroidZ0, d3_geo_centroidX1, d3_geo_centroidY1, d3_geo_centroidZ1, d3_geo_centroidX2, d3_geo_centroidY2, d3_geo_centroidZ2;
  var d3_geo_centroid = {
    sphere: d3_noop,
    point: d3_geo_centroidPoint,
    lineStart: d3_geo_centroidLineStart,
    lineEnd: d3_geo_centroidLineEnd,
    polygonStart: function() {
      d3_geo_centroid.lineStart = d3_geo_centroidRingStart;
    },
    polygonEnd: function() {
      d3_geo_centroid.lineStart = d3_geo_centroidLineStart;
    }
  };
  function d3_geo_centroidPoint(λ, φ) {
    λ *= d3_radians;
    var cosφ = Math.cos(φ *= d3_radians);
    d3_geo_centroidPointXYZ(cosφ * Math.cos(λ), cosφ * Math.sin(λ), Math.sin(φ));
  }
  function d3_geo_centroidPointXYZ(x, y, z) {
    ++d3_geo_centroidW0;
    d3_geo_centroidX0 += (x - d3_geo_centroidX0) / d3_geo_centroidW0;
    d3_geo_centroidY0 += (y - d3_geo_centroidY0) / d3_geo_centroidW0;
    d3_geo_centroidZ0 += (z - d3_geo_centroidZ0) / d3_geo_centroidW0;
  }
  function d3_geo_centroidLineStart() {
    var x0, y0, z0;
    d3_geo_centroid.point = function(λ, φ) {
      λ *= d3_radians;
      var cosφ = Math.cos(φ *= d3_radians);
      x0 = cosφ * Math.cos(λ);
      y0 = cosφ * Math.sin(λ);
      z0 = Math.sin(φ);
      d3_geo_centroid.point = nextPoint;
      d3_geo_centroidPointXYZ(x0, y0, z0);
    };
    function nextPoint(λ, φ) {
      λ *= d3_radians;
      var cosφ = Math.cos(φ *= d3_radians), x = cosφ * Math.cos(λ), y = cosφ * Math.sin(λ), z = Math.sin(φ), w = Math.atan2(Math.sqrt((w = y0 * z - z0 * y) * w + (w = z0 * x - x0 * z) * w + (w = x0 * y - y0 * x) * w), x0 * x + y0 * y + z0 * z);
      d3_geo_centroidW1 += w;
      d3_geo_centroidX1 += w * (x0 + (x0 = x));
      d3_geo_centroidY1 += w * (y0 + (y0 = y));
      d3_geo_centroidZ1 += w * (z0 + (z0 = z));
      d3_geo_centroidPointXYZ(x0, y0, z0);
    }
  }
  function d3_geo_centroidLineEnd() {
    d3_geo_centroid.point = d3_geo_centroidPoint;
  }
  function d3_geo_centroidRingStart() {
    var λ00, φ00, x0, y0, z0;
    d3_geo_centroid.point = function(λ, φ) {
      λ00 = λ, φ00 = φ;
      d3_geo_centroid.point = nextPoint;
      λ *= d3_radians;
      var cosφ = Math.cos(φ *= d3_radians);
      x0 = cosφ * Math.cos(λ);
      y0 = cosφ * Math.sin(λ);
      z0 = Math.sin(φ);
      d3_geo_centroidPointXYZ(x0, y0, z0);
    };
    d3_geo_centroid.lineEnd = function() {
      nextPoint(λ00, φ00);
      d3_geo_centroid.lineEnd = d3_geo_centroidLineEnd;
      d3_geo_centroid.point = d3_geo_centroidPoint;
    };
    function nextPoint(λ, φ) {
      λ *= d3_radians;
      var cosφ = Math.cos(φ *= d3_radians), x = cosφ * Math.cos(λ), y = cosφ * Math.sin(λ), z = Math.sin(φ), cx = y0 * z - z0 * y, cy = z0 * x - x0 * z, cz = x0 * y - y0 * x, m = Math.sqrt(cx * cx + cy * cy + cz * cz), u = x0 * x + y0 * y + z0 * z, v = m && -d3_acos(u) / m, w = Math.atan2(m, u);
      d3_geo_centroidX2 += v * cx;
      d3_geo_centroidY2 += v * cy;
      d3_geo_centroidZ2 += v * cz;
      d3_geo_centroidW1 += w;
      d3_geo_centroidX1 += w * (x0 + (x0 = x));
      d3_geo_centroidY1 += w * (y0 + (y0 = y));
      d3_geo_centroidZ1 += w * (z0 + (z0 = z));
      d3_geo_centroidPointXYZ(x0, y0, z0);
    }
  }
  function d3_geo_compose(a, b) {
    function compose(x, y) {
      return x = a(x, y), b(x[0], x[1]);
    }
    if (a.invert && b.invert) compose.invert = function(x, y) {
      return x = b.invert(x, y), x && a.invert(x[0], x[1]);
    };
    return compose;
  }
  function d3_true() {
    return true;
  }
  function d3_geo_clipPolygon(segments, compare, clipStartInside, interpolate, listener) {
    var subject = [], clip = [];
    segments.forEach(function(segment) {
      if ((n = segment.length - 1) <= 0) return;
      var n, p0 = segment[0], p1 = segment[n];
      if (d3_geo_sphericalEqual(p0, p1)) {
        listener.lineStart();
        for (var i = 0; i < n; ++i) listener.point((p0 = segment[i])[0], p0[1]);
        listener.lineEnd();
        return;
      }
      var a = new d3_geo_clipPolygonIntersection(p0, segment, null, true), b = new d3_geo_clipPolygonIntersection(p0, null, a, false);
      a.o = b;
      subject.push(a);
      clip.push(b);
      a = new d3_geo_clipPolygonIntersection(p1, segment, null, false);
      b = new d3_geo_clipPolygonIntersection(p1, null, a, true);
      a.o = b;
      subject.push(a);
      clip.push(b);
    });
    clip.sort(compare);
    d3_geo_clipPolygonLinkCircular(subject);
    d3_geo_clipPolygonLinkCircular(clip);
    if (!subject.length) return;
    for (var i = 0, entry = clipStartInside, n = clip.length; i < n; ++i) {
      clip[i].e = entry = !entry;
    }
    var start = subject[0], points, point;
    while (1) {
      var current = start, isSubject = true;
      while (current.v) if ((current = current.n) === start) return;
      points = current.z;
      listener.lineStart();
      do {
        current.v = current.o.v = true;
        if (current.e) {
          if (isSubject) {
            for (var i = 0, n = points.length; i < n; ++i) listener.point((point = points[i])[0], point[1]);
          } else {
            interpolate(current.x, current.n.x, 1, listener);
          }
          current = current.n;
        } else {
          if (isSubject) {
            points = current.p.z;
            for (var i = points.length - 1; i >= 0; --i) listener.point((point = points[i])[0], point[1]);
          } else {
            interpolate(current.x, current.p.x, -1, listener);
          }
          current = current.p;
        }
        current = current.o;
        points = current.z;
        isSubject = !isSubject;
      } while (!current.v);
      listener.lineEnd();
    }
  }
  function d3_geo_clipPolygonLinkCircular(array) {
    if (!(n = array.length)) return;
    var n, i = 0, a = array[0], b;
    while (++i < n) {
      a.n = b = array[i];
      b.p = a;
      a = b;
    }
    a.n = b = array[0];
    b.p = a;
  }
  function d3_geo_clipPolygonIntersection(point, points, other, entry) {
    this.x = point;
    this.z = points;
    this.o = other;
    this.e = entry;
    this.v = false;
    this.n = this.p = null;
  }
  function d3_geo_clip(pointVisible, clipLine, interpolate, clipStart) {
    return function(rotate, listener) {
      var line = clipLine(listener), rotatedClipStart = rotate.invert(clipStart[0], clipStart[1]);
      var clip = {
        point: point,
        lineStart: lineStart,
        lineEnd: lineEnd,
        polygonStart: function() {
          clip.point = pointRing;
          clip.lineStart = ringStart;
          clip.lineEnd = ringEnd;
          segments = [];
          polygon = [];
        },
        polygonEnd: function() {
          clip.point = point;
          clip.lineStart = lineStart;
          clip.lineEnd = lineEnd;
          segments = d3.merge(segments);
          var clipStartInside = d3_geo_pointInPolygon(rotatedClipStart, polygon);
          if (segments.length) {
            if (!polygonStarted) listener.polygonStart(), polygonStarted = true;
            d3_geo_clipPolygon(segments, d3_geo_clipSort, clipStartInside, interpolate, listener);
          } else if (clipStartInside) {
            if (!polygonStarted) listener.polygonStart(), polygonStarted = true;
            listener.lineStart();
            interpolate(null, null, 1, listener);
            listener.lineEnd();
          }
          if (polygonStarted) listener.polygonEnd(), polygonStarted = false;
          segments = polygon = null;
        },
        sphere: function() {
          listener.polygonStart();
          listener.lineStart();
          interpolate(null, null, 1, listener);
          listener.lineEnd();
          listener.polygonEnd();
        }
      };
      function point(λ, φ) {
        var point = rotate(λ, φ);
        if (pointVisible(λ = point[0], φ = point[1])) listener.point(λ, φ);
      }
      function pointLine(λ, φ) {
        var point = rotate(λ, φ);
        line.point(point[0], point[1]);
      }
      function lineStart() {
        clip.point = pointLine;
        line.lineStart();
      }
      function lineEnd() {
        clip.point = point;
        line.lineEnd();
      }
      var segments;
      var buffer = d3_geo_clipBufferListener(), ringListener = clipLine(buffer), polygonStarted = false, polygon, ring;
      function pointRing(λ, φ) {
        ring.push([ λ, φ ]);
        var point = rotate(λ, φ);
        ringListener.point(point[0], point[1]);
      }
      function ringStart() {
        ringListener.lineStart();
        ring = [];
      }
      function ringEnd() {
        pointRing(ring[0][0], ring[0][1]);
        ringListener.lineEnd();
        var clean = ringListener.clean(), ringSegments = buffer.buffer(), segment, n = ringSegments.length;
        ring.pop();
        polygon.push(ring);
        ring = null;
        if (!n) return;
        if (clean & 1) {
          segment = ringSegments[0];
          var n = segment.length - 1, i = -1, point;
          if (n > 0) {
            if (!polygonStarted) listener.polygonStart(), polygonStarted = true;
            listener.lineStart();
            while (++i < n) listener.point((point = segment[i])[0], point[1]);
            listener.lineEnd();
          }
          return;
        }
        if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));
        segments.push(ringSegments.filter(d3_geo_clipSegmentLength1));
      }
      return clip;
    };
  }
  function d3_geo_clipSegmentLength1(segment) {
    return segment.length > 1;
  }
  function d3_geo_clipBufferListener() {
    var lines = [], line;
    return {
      lineStart: function() {
        lines.push(line = []);
      },
      point: function(λ, φ) {
        line.push([ λ, φ ]);
      },
      lineEnd: d3_noop,
      buffer: function() {
        var buffer = lines;
        lines = [];
        line = null;
        return buffer;
      },
      rejoin: function() {
        if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
      }
    };
  }
  function d3_geo_clipSort(a, b) {
    return ((a = a.x)[0] < 0 ? a[1] - halfπ - ε : halfπ - a[1]) - ((b = b.x)[0] < 0 ? b[1] - halfπ - ε : halfπ - b[1]);
  }
  var d3_geo_clipAntimeridian = d3_geo_clip(d3_true, d3_geo_clipAntimeridianLine, d3_geo_clipAntimeridianInterpolate, [ -π, -π / 2 ]);
  function d3_geo_clipAntimeridianLine(listener) {
    var λ0 = NaN, φ0 = NaN, sλ0 = NaN, clean;
    return {
      lineStart: function() {
        listener.lineStart();
        clean = 1;
      },
      point: function(λ1, φ1) {
        var sλ1 = λ1 > 0 ? π : -π, dλ = abs(λ1 - λ0);
        if (abs(dλ - π) < ε) {
          listener.point(λ0, φ0 = (φ0 + φ1) / 2 > 0 ? halfπ : -halfπ);
          listener.point(sλ0, φ0);
          listener.lineEnd();
          listener.lineStart();
          listener.point(sλ1, φ0);
          listener.point(λ1, φ0);
          clean = 0;
        } else if (sλ0 !== sλ1 && dλ >= π) {
          if (abs(λ0 - sλ0) < ε) λ0 -= sλ0 * ε;
          if (abs(λ1 - sλ1) < ε) λ1 -= sλ1 * ε;
          φ0 = d3_geo_clipAntimeridianIntersect(λ0, φ0, λ1, φ1);
          listener.point(sλ0, φ0);
          listener.lineEnd();
          listener.lineStart();
          listener.point(sλ1, φ0);
          clean = 0;
        }
        listener.point(λ0 = λ1, φ0 = φ1);
        sλ0 = sλ1;
      },
      lineEnd: function() {
        listener.lineEnd();
        λ0 = φ0 = NaN;
      },
      clean: function() {
        return 2 - clean;
      }
    };
  }
  function d3_geo_clipAntimeridianIntersect(λ0, φ0, λ1, φ1) {
    var cosφ0, cosφ1, sinλ0_λ1 = Math.sin(λ0 - λ1);
    return abs(sinλ0_λ1) > ε ? Math.atan((Math.sin(φ0) * (cosφ1 = Math.cos(φ1)) * Math.sin(λ1) - Math.sin(φ1) * (cosφ0 = Math.cos(φ0)) * Math.sin(λ0)) / (cosφ0 * cosφ1 * sinλ0_λ1)) : (φ0 + φ1) / 2;
  }
  function d3_geo_clipAntimeridianInterpolate(from, to, direction, listener) {
    var φ;
    if (from == null) {
      φ = direction * halfπ;
      listener.point(-π, φ);
      listener.point(0, φ);
      listener.point(π, φ);
      listener.point(π, 0);
      listener.point(π, -φ);
      listener.point(0, -φ);
      listener.point(-π, -φ);
      listener.point(-π, 0);
      listener.point(-π, φ);
    } else if (abs(from[0] - to[0]) > ε) {
      var s = from[0] < to[0] ? π : -π;
      φ = direction * s / 2;
      listener.point(-s, φ);
      listener.point(0, φ);
      listener.point(s, φ);
    } else {
      listener.point(to[0], to[1]);
    }
  }
  function d3_geo_pointInPolygon(point, polygon) {
    var meridian = point[0], parallel = point[1], meridianNormal = [ Math.sin(meridian), -Math.cos(meridian), 0 ], polarAngle = 0, winding = 0;
    d3_geo_areaRingSum.reset();
    for (var i = 0, n = polygon.length; i < n; ++i) {
      var ring = polygon[i], m = ring.length;
      if (!m) continue;
      var point0 = ring[0], λ0 = point0[0], φ0 = point0[1] / 2 + π / 4, sinφ0 = Math.sin(φ0), cosφ0 = Math.cos(φ0), j = 1;
      while (true) {
        if (j === m) j = 0;
        point = ring[j];
        var λ = point[0], φ = point[1] / 2 + π / 4, sinφ = Math.sin(φ), cosφ = Math.cos(φ), dλ = λ - λ0, sdλ = dλ >= 0 ? 1 : -1, adλ = sdλ * dλ, antimeridian = adλ > π, k = sinφ0 * sinφ;
        d3_geo_areaRingSum.add(Math.atan2(k * sdλ * Math.sin(adλ), cosφ0 * cosφ + k * Math.cos(adλ)));
        polarAngle += antimeridian ? dλ + sdλ * τ : dλ;
        if (antimeridian ^ λ0 >= meridian ^ λ >= meridian) {
          var arc = d3_geo_cartesianCross(d3_geo_cartesian(point0), d3_geo_cartesian(point));
          d3_geo_cartesianNormalize(arc);
          var intersection = d3_geo_cartesianCross(meridianNormal, arc);
          d3_geo_cartesianNormalize(intersection);
          var φarc = (antimeridian ^ dλ >= 0 ? -1 : 1) * d3_asin(intersection[2]);
          if (parallel > φarc || parallel === φarc && (arc[0] || arc[1])) {
            winding += antimeridian ^ dλ >= 0 ? 1 : -1;
          }
        }
        if (!j++) break;
        λ0 = λ, sinφ0 = sinφ, cosφ0 = cosφ, point0 = point;
      }
    }
    return (polarAngle < -ε || polarAngle < ε && d3_geo_areaRingSum < 0) ^ winding & 1;
  }
  function d3_geo_clipCircle(radius) {
    var cr = Math.cos(radius), smallRadius = cr > 0, notHemisphere = abs(cr) > ε, interpolate = d3_geo_circleInterpolate(radius, 6 * d3_radians);
    return d3_geo_clip(visible, clipLine, interpolate, smallRadius ? [ 0, -radius ] : [ -π, radius - π ]);
    function visible(λ, φ) {
      return Math.cos(λ) * Math.cos(φ) > cr;
    }
    function clipLine(listener) {
      var point0, c0, v0, v00, clean;
      return {
        lineStart: function() {
          v00 = v0 = false;
          clean = 1;
        },
        point: function(λ, φ) {
          var point1 = [ λ, φ ], point2, v = visible(λ, φ), c = smallRadius ? v ? 0 : code(λ, φ) : v ? code(λ + (λ < 0 ? π : -π), φ) : 0;
          if (!point0 && (v00 = v0 = v)) listener.lineStart();
          if (v !== v0) {
            point2 = intersect(point0, point1);
            if (d3_geo_sphericalEqual(point0, point2) || d3_geo_sphericalEqual(point1, point2)) {
              point1[0] += ε;
              point1[1] += ε;
              v = visible(point1[0], point1[1]);
            }
          }
          if (v !== v0) {
            clean = 0;
            if (v) {
              listener.lineStart();
              point2 = intersect(point1, point0);
              listener.point(point2[0], point2[1]);
            } else {
              point2 = intersect(point0, point1);
              listener.point(point2[0], point2[1]);
              listener.lineEnd();
            }
            point0 = point2;
          } else if (notHemisphere && point0 && smallRadius ^ v) {
            var t;
            if (!(c & c0) && (t = intersect(point1, point0, true))) {
              clean = 0;
              if (smallRadius) {
                listener.lineStart();
                listener.point(t[0][0], t[0][1]);
                listener.point(t[1][0], t[1][1]);
                listener.lineEnd();
              } else {
                listener.point(t[1][0], t[1][1]);
                listener.lineEnd();
                listener.lineStart();
                listener.point(t[0][0], t[0][1]);
              }
            }
          }
          if (v && (!point0 || !d3_geo_sphericalEqual(point0, point1))) {
            listener.point(point1[0], point1[1]);
          }
          point0 = point1, v0 = v, c0 = c;
        },
        lineEnd: function() {
          if (v0) listener.lineEnd();
          point0 = null;
        },
        clean: function() {
          return clean | (v00 && v0) << 1;
        }
      };
    }
    function intersect(a, b, two) {
      var pa = d3_geo_cartesian(a), pb = d3_geo_cartesian(b);
      var n1 = [ 1, 0, 0 ], n2 = d3_geo_cartesianCross(pa, pb), n2n2 = d3_geo_cartesianDot(n2, n2), n1n2 = n2[0], determinant = n2n2 - n1n2 * n1n2;
      if (!determinant) return !two && a;
      var c1 = cr * n2n2 / determinant, c2 = -cr * n1n2 / determinant, n1xn2 = d3_geo_cartesianCross(n1, n2), A = d3_geo_cartesianScale(n1, c1), B = d3_geo_cartesianScale(n2, c2);
      d3_geo_cartesianAdd(A, B);
      var u = n1xn2, w = d3_geo_cartesianDot(A, u), uu = d3_geo_cartesianDot(u, u), t2 = w * w - uu * (d3_geo_cartesianDot(A, A) - 1);
      if (t2 < 0) return;
      var t = Math.sqrt(t2), q = d3_geo_cartesianScale(u, (-w - t) / uu);
      d3_geo_cartesianAdd(q, A);
      q = d3_geo_spherical(q);
      if (!two) return q;
      var λ0 = a[0], λ1 = b[0], φ0 = a[1], φ1 = b[1], z;
      if (λ1 < λ0) z = λ0, λ0 = λ1, λ1 = z;
      var δλ = λ1 - λ0, polar = abs(δλ - π) < ε, meridian = polar || δλ < ε;
      if (!polar && φ1 < φ0) z = φ0, φ0 = φ1, φ1 = z;
      if (meridian ? polar ? φ0 + φ1 > 0 ^ q[1] < (abs(q[0] - λ0) < ε ? φ0 : φ1) : φ0 <= q[1] && q[1] <= φ1 : δλ > π ^ (λ0 <= q[0] && q[0] <= λ1)) {
        var q1 = d3_geo_cartesianScale(u, (-w + t) / uu);
        d3_geo_cartesianAdd(q1, A);
        return [ q, d3_geo_spherical(q1) ];
      }
    }
    function code(λ, φ) {
      var r = smallRadius ? radius : π - radius, code = 0;
      if (λ < -r) code |= 1; else if (λ > r) code |= 2;
      if (φ < -r) code |= 4; else if (φ > r) code |= 8;
      return code;
    }
  }
  function d3_geom_clipLine(x0, y0, x1, y1) {
    return function(line) {
      var a = line.a, b = line.b, ax = a.x, ay = a.y, bx = b.x, by = b.y, t0 = 0, t1 = 1, dx = bx - ax, dy = by - ay, r;
      r = x0 - ax;
      if (!dx && r > 0) return;
      r /= dx;
      if (dx < 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      } else if (dx > 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      }
      r = x1 - ax;
      if (!dx && r < 0) return;
      r /= dx;
      if (dx < 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      } else if (dx > 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      }
      r = y0 - ay;
      if (!dy && r > 0) return;
      r /= dy;
      if (dy < 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      } else if (dy > 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      }
      r = y1 - ay;
      if (!dy && r < 0) return;
      r /= dy;
      if (dy < 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      } else if (dy > 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      }
      if (t0 > 0) line.a = {
        x: ax + t0 * dx,
        y: ay + t0 * dy
      };
      if (t1 < 1) line.b = {
        x: ax + t1 * dx,
        y: ay + t1 * dy
      };
      return line;
    };
  }
  var d3_geo_clipExtentMAX = 1e9;
  d3.geo.clipExtent = function() {
    var x0, y0, x1, y1, stream, clip, clipExtent = {
      stream: function(output) {
        if (stream) stream.valid = false;
        stream = clip(output);
        stream.valid = true;
        return stream;
      },
      extent: function(_) {
        if (!arguments.length) return [ [ x0, y0 ], [ x1, y1 ] ];
        clip = d3_geo_clipExtent(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]);
        if (stream) stream.valid = false, stream = null;
        return clipExtent;
      }
    };
    return clipExtent.extent([ [ 0, 0 ], [ 960, 500 ] ]);
  };
  function d3_geo_clipExtent(x0, y0, x1, y1) {
    return function(listener) {
      var listener_ = listener, bufferListener = d3_geo_clipBufferListener(), clipLine = d3_geom_clipLine(x0, y0, x1, y1), segments, polygon, ring;
      var clip = {
        point: point,
        lineStart: lineStart,
        lineEnd: lineEnd,
        polygonStart: function() {
          listener = bufferListener;
          segments = [];
          polygon = [];
          clean = true;
        },
        polygonEnd: function() {
          listener = listener_;
          segments = d3.merge(segments);
          var clipStartInside = insidePolygon([ x0, y1 ]), inside = clean && clipStartInside, visible = segments.length;
          if (inside || visible) {
            listener.polygonStart();
            if (inside) {
              listener.lineStart();
              interpolate(null, null, 1, listener);
              listener.lineEnd();
            }
            if (visible) {
              d3_geo_clipPolygon(segments, compare, clipStartInside, interpolate, listener);
            }
            listener.polygonEnd();
          }
          segments = polygon = ring = null;
        }
      };
      function insidePolygon(p) {
        var wn = 0, n = polygon.length, y = p[1];
        for (var i = 0; i < n; ++i) {
          for (var j = 1, v = polygon[i], m = v.length, a = v[0], b; j < m; ++j) {
            b = v[j];
            if (a[1] <= y) {
              if (b[1] > y && d3_cross2d(a, b, p) > 0) ++wn;
            } else {
              if (b[1] <= y && d3_cross2d(a, b, p) < 0) --wn;
            }
            a = b;
          }
        }
        return wn !== 0;
      }
      function interpolate(from, to, direction, listener) {
        var a = 0, a1 = 0;
        if (from == null || (a = corner(from, direction)) !== (a1 = corner(to, direction)) || comparePoints(from, to) < 0 ^ direction > 0) {
          do {
            listener.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0);
          } while ((a = (a + direction + 4) % 4) !== a1);
        } else {
          listener.point(to[0], to[1]);
        }
      }
      function pointVisible(x, y) {
        return x0 <= x && x <= x1 && y0 <= y && y <= y1;
      }
      function point(x, y) {
        if (pointVisible(x, y)) listener.point(x, y);
      }
      var x__, y__, v__, x_, y_, v_, first, clean;
      function lineStart() {
        clip.point = linePoint;
        if (polygon) polygon.push(ring = []);
        first = true;
        v_ = false;
        x_ = y_ = NaN;
      }
      function lineEnd() {
        if (segments) {
          linePoint(x__, y__);
          if (v__ && v_) bufferListener.rejoin();
          segments.push(bufferListener.buffer());
        }
        clip.point = point;
        if (v_) listener.lineEnd();
      }
      function linePoint(x, y) {
        x = Math.max(-d3_geo_clipExtentMAX, Math.min(d3_geo_clipExtentMAX, x));
        y = Math.max(-d3_geo_clipExtentMAX, Math.min(d3_geo_clipExtentMAX, y));
        var v = pointVisible(x, y);
        if (polygon) ring.push([ x, y ]);
        if (first) {
          x__ = x, y__ = y, v__ = v;
          first = false;
          if (v) {
            listener.lineStart();
            listener.point(x, y);
          }
        } else {
          if (v && v_) listener.point(x, y); else {
            var l = {
              a: {
                x: x_,
                y: y_
              },
              b: {
                x: x,
                y: y
              }
            };
            if (clipLine(l)) {
              if (!v_) {
                listener.lineStart();
                listener.point(l.a.x, l.a.y);
              }
              listener.point(l.b.x, l.b.y);
              if (!v) listener.lineEnd();
              clean = false;
            } else if (v) {
              listener.lineStart();
              listener.point(x, y);
              clean = false;
            }
          }
        }
        x_ = x, y_ = y, v_ = v;
      }
      return clip;
    };
    function corner(p, direction) {
      return abs(p[0] - x0) < ε ? direction > 0 ? 0 : 3 : abs(p[0] - x1) < ε ? direction > 0 ? 2 : 1 : abs(p[1] - y0) < ε ? direction > 0 ? 1 : 0 : direction > 0 ? 3 : 2;
    }
    function compare(a, b) {
      return comparePoints(a.x, b.x);
    }
    function comparePoints(a, b) {
      var ca = corner(a, 1), cb = corner(b, 1);
      return ca !== cb ? ca - cb : ca === 0 ? b[1] - a[1] : ca === 1 ? a[0] - b[0] : ca === 2 ? a[1] - b[1] : b[0] - a[0];
    }
  }
  function d3_geo_conic(projectAt) {
    var φ0 = 0, φ1 = π / 3, m = d3_geo_projectionMutator(projectAt), p = m(φ0, φ1);
    p.parallels = function(_) {
      if (!arguments.length) return [ φ0 / π * 180, φ1 / π * 180 ];
      return m(φ0 = _[0] * π / 180, φ1 = _[1] * π / 180);
    };
    return p;
  }
  function d3_geo_conicEqualArea(φ0, φ1) {
    var sinφ0 = Math.sin(φ0), n = (sinφ0 + Math.sin(φ1)) / 2, C = 1 + sinφ0 * (2 * n - sinφ0), ρ0 = Math.sqrt(C) / n;
    function forward(λ, φ) {
      var ρ = Math.sqrt(C - 2 * n * Math.sin(φ)) / n;
      return [ ρ * Math.sin(λ *= n), ρ0 - ρ * Math.cos(λ) ];
    }
    forward.invert = function(x, y) {
      var ρ0_y = ρ0 - y;
      return [ Math.atan2(x, ρ0_y) / n, d3_asin((C - (x * x + ρ0_y * ρ0_y) * n * n) / (2 * n)) ];
    };
    return forward;
  }
  (d3.geo.conicEqualArea = function() {
    return d3_geo_conic(d3_geo_conicEqualArea);
  }).raw = d3_geo_conicEqualArea;
  d3.geo.albers = function() {
    return d3.geo.conicEqualArea().rotate([ 96, 0 ]).center([ -.6, 38.7 ]).parallels([ 29.5, 45.5 ]).scale(1070);
  };
  d3.geo.albersUsa = function() {
    var lower48 = d3.geo.albers();
    var alaska = d3.geo.conicEqualArea().rotate([ 154, 0 ]).center([ -2, 58.5 ]).parallels([ 55, 65 ]);
    var hawaii = d3.geo.conicEqualArea().rotate([ 157, 0 ]).center([ -3, 19.9 ]).parallels([ 8, 18 ]);
    var point, pointStream = {
      point: function(x, y) {
        point = [ x, y ];
      }
    }, lower48Point, alaskaPoint, hawaiiPoint;
    function albersUsa(coordinates) {
      var x = coordinates[0], y = coordinates[1];
      point = null;
      (lower48Point(x, y), point) || (alaskaPoint(x, y), point) || hawaiiPoint(x, y);
      return point;
    }
    albersUsa.invert = function(coordinates) {
      var k = lower48.scale(), t = lower48.translate(), x = (coordinates[0] - t[0]) / k, y = (coordinates[1] - t[1]) / k;
      return (y >= .12 && y < .234 && x >= -.425 && x < -.214 ? alaska : y >= .166 && y < .234 && x >= -.214 && x < -.115 ? hawaii : lower48).invert(coordinates);
    };
    albersUsa.stream = function(stream) {
      var lower48Stream = lower48.stream(stream), alaskaStream = alaska.stream(stream), hawaiiStream = hawaii.stream(stream);
      return {
        point: function(x, y) {
          lower48Stream.point(x, y);
          alaskaStream.point(x, y);
          hawaiiStream.point(x, y);
        },
        sphere: function() {
          lower48Stream.sphere();
          alaskaStream.sphere();
          hawaiiStream.sphere();
        },
        lineStart: function() {
          lower48Stream.lineStart();
          alaskaStream.lineStart();
          hawaiiStream.lineStart();
        },
        lineEnd: function() {
          lower48Stream.lineEnd();
          alaskaStream.lineEnd();
          hawaiiStream.lineEnd();
        },
        polygonStart: function() {
          lower48Stream.polygonStart();
          alaskaStream.polygonStart();
          hawaiiStream.polygonStart();
        },
        polygonEnd: function() {
          lower48Stream.polygonEnd();
          alaskaStream.polygonEnd();
          hawaiiStream.polygonEnd();
        }
      };
    };
    albersUsa.precision = function(_) {
      if (!arguments.length) return lower48.precision();
      lower48.precision(_);
      alaska.precision(_);
      hawaii.precision(_);
      return albersUsa;
    };
    albersUsa.scale = function(_) {
      if (!arguments.length) return lower48.scale();
      lower48.scale(_);
      alaska.scale(_ * .35);
      hawaii.scale(_);
      return albersUsa.translate(lower48.translate());
    };
    albersUsa.translate = function(_) {
      if (!arguments.length) return lower48.translate();
      var k = lower48.scale(), x = +_[0], y = +_[1];
      lower48Point = lower48.translate(_).clipExtent([ [ x - .455 * k, y - .238 * k ], [ x + .455 * k, y + .238 * k ] ]).stream(pointStream).point;
      alaskaPoint = alaska.translate([ x - .307 * k, y + .201 * k ]).clipExtent([ [ x - .425 * k + ε, y + .12 * k + ε ], [ x - .214 * k - ε, y + .234 * k - ε ] ]).stream(pointStream).point;
      hawaiiPoint = hawaii.translate([ x - .205 * k, y + .212 * k ]).clipExtent([ [ x - .214 * k + ε, y + .166 * k + ε ], [ x - .115 * k - ε, y + .234 * k - ε ] ]).stream(pointStream).point;
      return albersUsa;
    };
    return albersUsa.scale(1070);
  };
  var d3_geo_pathAreaSum, d3_geo_pathAreaPolygon, d3_geo_pathArea = {
    point: d3_noop,
    lineStart: d3_noop,
    lineEnd: d3_noop,
    polygonStart: function() {
      d3_geo_pathAreaPolygon = 0;
      d3_geo_pathArea.lineStart = d3_geo_pathAreaRingStart;
    },
    polygonEnd: function() {
      d3_geo_pathArea.lineStart = d3_geo_pathArea.lineEnd = d3_geo_pathArea.point = d3_noop;
      d3_geo_pathAreaSum += abs(d3_geo_pathAreaPolygon / 2);
    }
  };
  function d3_geo_pathAreaRingStart() {
    var x00, y00, x0, y0;
    d3_geo_pathArea.point = function(x, y) {
      d3_geo_pathArea.point = nextPoint;
      x00 = x0 = x, y00 = y0 = y;
    };
    function nextPoint(x, y) {
      d3_geo_pathAreaPolygon += y0 * x - x0 * y;
      x0 = x, y0 = y;
    }
    d3_geo_pathArea.lineEnd = function() {
      nextPoint(x00, y00);
    };
  }
  var d3_geo_pathBoundsX0, d3_geo_pathBoundsY0, d3_geo_pathBoundsX1, d3_geo_pathBoundsY1;
  var d3_geo_pathBounds = {
    point: d3_geo_pathBoundsPoint,
    lineStart: d3_noop,
    lineEnd: d3_noop,
    polygonStart: d3_noop,
    polygonEnd: d3_noop
  };
  function d3_geo_pathBoundsPoint(x, y) {
    if (x < d3_geo_pathBoundsX0) d3_geo_pathBoundsX0 = x;
    if (x > d3_geo_pathBoundsX1) d3_geo_pathBoundsX1 = x;
    if (y < d3_geo_pathBoundsY0) d3_geo_pathBoundsY0 = y;
    if (y > d3_geo_pathBoundsY1) d3_geo_pathBoundsY1 = y;
  }
  function d3_geo_pathBuffer() {
    var pointCircle = d3_geo_pathBufferCircle(4.5), buffer = [];
    var stream = {
      point: point,
      lineStart: function() {
        stream.point = pointLineStart;
      },
      lineEnd: lineEnd,
      polygonStart: function() {
        stream.lineEnd = lineEndPolygon;
      },
      polygonEnd: function() {
        stream.lineEnd = lineEnd;
        stream.point = point;
      },
      pointRadius: function(_) {
        pointCircle = d3_geo_pathBufferCircle(_);
        return stream;
      },
      result: function() {
        if (buffer.length) {
          var result = buffer.join("");
          buffer = [];
          return result;
        }
      }
    };
    function point(x, y) {
      buffer.push("M", x, ",", y, pointCircle);
    }
    function pointLineStart(x, y) {
      buffer.push("M", x, ",", y);
      stream.point = pointLine;
    }
    function pointLine(x, y) {
      buffer.push("L", x, ",", y);
    }
    function lineEnd() {
      stream.point = point;
    }
    function lineEndPolygon() {
      buffer.push("Z");
    }
    return stream;
  }
  function d3_geo_pathBufferCircle(radius) {
    return "m0," + radius + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius + "a" + radius + "," + radius + " 0 1,1 0," + 2 * radius + "z";
  }
  var d3_geo_pathCentroid = {
    point: d3_geo_pathCentroidPoint,
    lineStart: d3_geo_pathCentroidLineStart,
    lineEnd: d3_geo_pathCentroidLineEnd,
    polygonStart: function() {
      d3_geo_pathCentroid.lineStart = d3_geo_pathCentroidRingStart;
    },
    polygonEnd: function() {
      d3_geo_pathCentroid.point = d3_geo_pathCentroidPoint;
      d3_geo_pathCentroid.lineStart = d3_geo_pathCentroidLineStart;
      d3_geo_pathCentroid.lineEnd = d3_geo_pathCentroidLineEnd;
    }
  };
  function d3_geo_pathCentroidPoint(x, y) {
    d3_geo_centroidX0 += x;
    d3_geo_centroidY0 += y;
    ++d3_geo_centroidZ0;
  }
  function d3_geo_pathCentroidLineStart() {
    var x0, y0;
    d3_geo_pathCentroid.point = function(x, y) {
      d3_geo_pathCentroid.point = nextPoint;
      d3_geo_pathCentroidPoint(x0 = x, y0 = y);
    };
    function nextPoint(x, y) {
      var dx = x - x0, dy = y - y0, z = Math.sqrt(dx * dx + dy * dy);
      d3_geo_centroidX1 += z * (x0 + x) / 2;
      d3_geo_centroidY1 += z * (y0 + y) / 2;
      d3_geo_centroidZ1 += z;
      d3_geo_pathCentroidPoint(x0 = x, y0 = y);
    }
  }
  function d3_geo_pathCentroidLineEnd() {
    d3_geo_pathCentroid.point = d3_geo_pathCentroidPoint;
  }
  function d3_geo_pathCentroidRingStart() {
    var x00, y00, x0, y0;
    d3_geo_pathCentroid.point = function(x, y) {
      d3_geo_pathCentroid.point = nextPoint;
      d3_geo_pathCentroidPoint(x00 = x0 = x, y00 = y0 = y);
    };
    function nextPoint(x, y) {
      var dx = x - x0, dy = y - y0, z = Math.sqrt(dx * dx + dy * dy);
      d3_geo_centroidX1 += z * (x0 + x) / 2;
      d3_geo_centroidY1 += z * (y0 + y) / 2;
      d3_geo_centroidZ1 += z;
      z = y0 * x - x0 * y;
      d3_geo_centroidX2 += z * (x0 + x);
      d3_geo_centroidY2 += z * (y0 + y);
      d3_geo_centroidZ2 += z * 3;
      d3_geo_pathCentroidPoint(x0 = x, y0 = y);
    }
    d3_geo_pathCentroid.lineEnd = function() {
      nextPoint(x00, y00);
    };
  }
  function d3_geo_pathContext(context) {
    var pointRadius = 4.5;
    var stream = {
      point: point,
      lineStart: function() {
        stream.point = pointLineStart;
      },
      lineEnd: lineEnd,
      polygonStart: function() {
        stream.lineEnd = lineEndPolygon;
      },
      polygonEnd: function() {
        stream.lineEnd = lineEnd;
        stream.point = point;
      },
      pointRadius: function(_) {
        pointRadius = _;
        return stream;
      },
      result: d3_noop
    };
    function point(x, y) {
      context.moveTo(x + pointRadius, y);
      context.arc(x, y, pointRadius, 0, τ);
    }
    function pointLineStart(x, y) {
      context.moveTo(x, y);
      stream.point = pointLine;
    }
    function pointLine(x, y) {
      context.lineTo(x, y);
    }
    function lineEnd() {
      stream.point = point;
    }
    function lineEndPolygon() {
      context.closePath();
    }
    return stream;
  }
  function d3_geo_resample(project) {
    var δ2 = .5, cosMinDistance = Math.cos(30 * d3_radians), maxDepth = 16;
    function resample(stream) {
      return (maxDepth ? resampleRecursive : resampleNone)(stream);
    }
    function resampleNone(stream) {
      return d3_geo_transformPoint(stream, function(x, y) {
        x = project(x, y);
        stream.point(x[0], x[1]);
      });
    }
    function resampleRecursive(stream) {
      var λ00, φ00, x00, y00, a00, b00, c00, λ0, x0, y0, a0, b0, c0;
      var resample = {
        point: point,
        lineStart: lineStart,
        lineEnd: lineEnd,
        polygonStart: function() {
          stream.polygonStart();
          resample.lineStart = ringStart;
        },
        polygonEnd: function() {
          stream.polygonEnd();
          resample.lineStart = lineStart;
        }
      };
      function point(x, y) {
        x = project(x, y);
        stream.point(x[0], x[1]);
      }
      function lineStart() {
        x0 = NaN;
        resample.point = linePoint;
        stream.lineStart();
      }
      function linePoint(λ, φ) {
        var c = d3_geo_cartesian([ λ, φ ]), p = project(λ, φ);
        resampleLineTo(x0, y0, λ0, a0, b0, c0, x0 = p[0], y0 = p[1], λ0 = λ, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
        stream.point(x0, y0);
      }
      function lineEnd() {
        resample.point = point;
        stream.lineEnd();
      }
      function ringStart() {
        lineStart();
        resample.point = ringPoint;
        resample.lineEnd = ringEnd;
      }
      function ringPoint(λ, φ) {
        linePoint(λ00 = λ, φ00 = φ), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
        resample.point = linePoint;
      }
      function ringEnd() {
        resampleLineTo(x0, y0, λ0, a0, b0, c0, x00, y00, λ00, a00, b00, c00, maxDepth, stream);
        resample.lineEnd = lineEnd;
        lineEnd();
      }
      return resample;
    }
    function resampleLineTo(x0, y0, λ0, a0, b0, c0, x1, y1, λ1, a1, b1, c1, depth, stream) {
      var dx = x1 - x0, dy = y1 - y0, d2 = dx * dx + dy * dy;
      if (d2 > 4 * δ2 && depth--) {
        var a = a0 + a1, b = b0 + b1, c = c0 + c1, m = Math.sqrt(a * a + b * b + c * c), φ2 = Math.asin(c /= m), λ2 = abs(abs(c) - 1) < ε || abs(λ0 - λ1) < ε ? (λ0 + λ1) / 2 : Math.atan2(b, a), p = project(λ2, φ2), x2 = p[0], y2 = p[1], dx2 = x2 - x0, dy2 = y2 - y0, dz = dy * dx2 - dx * dy2;
        if (dz * dz / d2 > δ2 || abs((dx * dx2 + dy * dy2) / d2 - .5) > .3 || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) {
          resampleLineTo(x0, y0, λ0, a0, b0, c0, x2, y2, λ2, a /= m, b /= m, c, depth, stream);
          stream.point(x2, y2);
          resampleLineTo(x2, y2, λ2, a, b, c, x1, y1, λ1, a1, b1, c1, depth, stream);
        }
      }
    }
    resample.precision = function(_) {
      if (!arguments.length) return Math.sqrt(δ2);
      maxDepth = (δ2 = _ * _) > 0 && 16;
      return resample;
    };
    return resample;
  }
  d3.geo.path = function() {
    var pointRadius = 4.5, projection, context, projectStream, contextStream, cacheStream;
    function path(object) {
      if (object) {
        if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
        if (!cacheStream || !cacheStream.valid) cacheStream = projectStream(contextStream);
        d3.geo.stream(object, cacheStream);
      }
      return contextStream.result();
    }
    path.area = function(object) {
      d3_geo_pathAreaSum = 0;
      d3.geo.stream(object, projectStream(d3_geo_pathArea));
      return d3_geo_pathAreaSum;
    };
    path.centroid = function(object) {
      d3_geo_centroidX0 = d3_geo_centroidY0 = d3_geo_centroidZ0 = d3_geo_centroidX1 = d3_geo_centroidY1 = d3_geo_centroidZ1 = d3_geo_centroidX2 = d3_geo_centroidY2 = d3_geo_centroidZ2 = 0;
      d3.geo.stream(object, projectStream(d3_geo_pathCentroid));
      return d3_geo_centroidZ2 ? [ d3_geo_centroidX2 / d3_geo_centroidZ2, d3_geo_centroidY2 / d3_geo_centroidZ2 ] : d3_geo_centroidZ1 ? [ d3_geo_centroidX1 / d3_geo_centroidZ1, d3_geo_centroidY1 / d3_geo_centroidZ1 ] : d3_geo_centroidZ0 ? [ d3_geo_centroidX0 / d3_geo_centroidZ0, d3_geo_centroidY0 / d3_geo_centroidZ0 ] : [ NaN, NaN ];
    };
    path.bounds = function(object) {
      d3_geo_pathBoundsX1 = d3_geo_pathBoundsY1 = -(d3_geo_pathBoundsX0 = d3_geo_pathBoundsY0 = Infinity);
      d3.geo.stream(object, projectStream(d3_geo_pathBounds));
      return [ [ d3_geo_pathBoundsX0, d3_geo_pathBoundsY0 ], [ d3_geo_pathBoundsX1, d3_geo_pathBoundsY1 ] ];
    };
    path.projection = function(_) {
      if (!arguments.length) return projection;
      projectStream = (projection = _) ? _.stream || d3_geo_pathProjectStream(_) : d3_identity;
      return reset();
    };
    path.context = function(_) {
      if (!arguments.length) return context;
      contextStream = (context = _) == null ? new d3_geo_pathBuffer() : new d3_geo_pathContext(_);
      if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
      return reset();
    };
    path.pointRadius = function(_) {
      if (!arguments.length) return pointRadius;
      pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
      return path;
    };
    function reset() {
      cacheStream = null;
      return path;
    }
    return path.projection(d3.geo.albersUsa()).context(null);
  };
  function d3_geo_pathProjectStream(project) {
    var resample = d3_geo_resample(function(x, y) {
      return project([ x * d3_degrees, y * d3_degrees ]);
    });
    return function(stream) {
      return d3_geo_projectionRadians(resample(stream));
    };
  }
  d3.geo.transform = function(methods) {
    return {
      stream: function(stream) {
        var transform = new d3_geo_transform(stream);
        for (var k in methods) transform[k] = methods[k];
        return transform;
      }
    };
  };
  function d3_geo_transform(stream) {
    this.stream = stream;
  }
  d3_geo_transform.prototype = {
    point: function(x, y) {
      this.stream.point(x, y);
    },
    sphere: function() {
      this.stream.sphere();
    },
    lineStart: function() {
      this.stream.lineStart();
    },
    lineEnd: function() {
      this.stream.lineEnd();
    },
    polygonStart: function() {
      this.stream.polygonStart();
    },
    polygonEnd: function() {
      this.stream.polygonEnd();
    }
  };
  function d3_geo_transformPoint(stream, point) {
    return {
      point: point,
      sphere: function() {
        stream.sphere();
      },
      lineStart: function() {
        stream.lineStart();
      },
      lineEnd: function() {
        stream.lineEnd();
      },
      polygonStart: function() {
        stream.polygonStart();
      },
      polygonEnd: function() {
        stream.polygonEnd();
      }
    };
  }
  d3.geo.projection = d3_geo_projection;
  d3.geo.projectionMutator = d3_geo_projectionMutator;
  function d3_geo_projection(project) {
    return d3_geo_projectionMutator(function() {
      return project;
    })();
  }
  function d3_geo_projectionMutator(projectAt) {
    var project, rotate, projectRotate, projectResample = d3_geo_resample(function(x, y) {
      x = project(x, y);
      return [ x[0] * k + δx, δy - x[1] * k ];
    }), k = 150, x = 480, y = 250, λ = 0, φ = 0, δλ = 0, δφ = 0, δγ = 0, δx, δy, preclip = d3_geo_clipAntimeridian, postclip = d3_identity, clipAngle = null, clipExtent = null, stream;
    function projection(point) {
      point = projectRotate(point[0] * d3_radians, point[1] * d3_radians);
      return [ point[0] * k + δx, δy - point[1] * k ];
    }
    function invert(point) {
      point = projectRotate.invert((point[0] - δx) / k, (δy - point[1]) / k);
      return point && [ point[0] * d3_degrees, point[1] * d3_degrees ];
    }
    projection.stream = function(output) {
      if (stream) stream.valid = false;
      stream = d3_geo_projectionRadians(preclip(rotate, projectResample(postclip(output))));
      stream.valid = true;
      return stream;
    };
    projection.clipAngle = function(_) {
      if (!arguments.length) return clipAngle;
      preclip = _ == null ? (clipAngle = _, d3_geo_clipAntimeridian) : d3_geo_clipCircle((clipAngle = +_) * d3_radians);
      return invalidate();
    };
    projection.clipExtent = function(_) {
      if (!arguments.length) return clipExtent;
      clipExtent = _;
      postclip = _ ? d3_geo_clipExtent(_[0][0], _[0][1], _[1][0], _[1][1]) : d3_identity;
      return invalidate();
    };
    projection.scale = function(_) {
      if (!arguments.length) return k;
      k = +_;
      return reset();
    };
    projection.translate = function(_) {
      if (!arguments.length) return [ x, y ];
      x = +_[0];
      y = +_[1];
      return reset();
    };
    projection.center = function(_) {
      if (!arguments.length) return [ λ * d3_degrees, φ * d3_degrees ];
      λ = _[0] % 360 * d3_radians;
      φ = _[1] % 360 * d3_radians;
      return reset();
    };
    projection.rotate = function(_) {
      if (!arguments.length) return [ δλ * d3_degrees, δφ * d3_degrees, δγ * d3_degrees ];
      δλ = _[0] % 360 * d3_radians;
      δφ = _[1] % 360 * d3_radians;
      δγ = _.length > 2 ? _[2] % 360 * d3_radians : 0;
      return reset();
    };
    d3.rebind(projection, projectResample, "precision");
    function reset() {
      projectRotate = d3_geo_compose(rotate = d3_geo_rotation(δλ, δφ, δγ), project);
      var center = project(λ, φ);
      δx = x - center[0] * k;
      δy = y + center[1] * k;
      return invalidate();
    }
    function invalidate() {
      if (stream) stream.valid = false, stream = null;
      return projection;
    }
    return function() {
      project = projectAt.apply(this, arguments);
      projection.invert = project.invert && invert;
      return reset();
    };
  }
  function d3_geo_projectionRadians(stream) {
    return d3_geo_transformPoint(stream, function(x, y) {
      stream.point(x * d3_radians, y * d3_radians);
    });
  }
  function d3_geo_equirectangular(λ, φ) {
    return [ λ, φ ];
  }
  (d3.geo.equirectangular = function() {
    return d3_geo_projection(d3_geo_equirectangular);
  }).raw = d3_geo_equirectangular.invert = d3_geo_equirectangular;
  d3.geo.rotation = function(rotate) {
    rotate = d3_geo_rotation(rotate[0] % 360 * d3_radians, rotate[1] * d3_radians, rotate.length > 2 ? rotate[2] * d3_radians : 0);
    function forward(coordinates) {
      coordinates = rotate(coordinates[0] * d3_radians, coordinates[1] * d3_radians);
      return coordinates[0] *= d3_degrees, coordinates[1] *= d3_degrees, coordinates;
    }
    forward.invert = function(coordinates) {
      coordinates = rotate.invert(coordinates[0] * d3_radians, coordinates[1] * d3_radians);
      return coordinates[0] *= d3_degrees, coordinates[1] *= d3_degrees, coordinates;
    };
    return forward;
  };
  function d3_geo_identityRotation(λ, φ) {
    return [ λ > π ? λ - τ : λ < -π ? λ + τ : λ, φ ];
  }
  d3_geo_identityRotation.invert = d3_geo_equirectangular;
  function d3_geo_rotation(δλ, δφ, δγ) {
    return δλ ? δφ || δγ ? d3_geo_compose(d3_geo_rotationλ(δλ), d3_geo_rotationφγ(δφ, δγ)) : d3_geo_rotationλ(δλ) : δφ || δγ ? d3_geo_rotationφγ(δφ, δγ) : d3_geo_identityRotation;
  }
  function d3_geo_forwardRotationλ(δλ) {
    return function(λ, φ) {
      return λ += δλ, [ λ > π ? λ - τ : λ < -π ? λ + τ : λ, φ ];
    };
  }
  function d3_geo_rotationλ(δλ) {
    var rotation = d3_geo_forwardRotationλ(δλ);
    rotation.invert = d3_geo_forwardRotationλ(-δλ);
    return rotation;
  }
  function d3_geo_rotationφγ(δφ, δγ) {
    var cosδφ = Math.cos(δφ), sinδφ = Math.sin(δφ), cosδγ = Math.cos(δγ), sinδγ = Math.sin(δγ);
    function rotation(λ, φ) {
      var cosφ = Math.cos(φ), x = Math.cos(λ) * cosφ, y = Math.sin(λ) * cosφ, z = Math.sin(φ), k = z * cosδφ + x * sinδφ;
      return [ Math.atan2(y * cosδγ - k * sinδγ, x * cosδφ - z * sinδφ), d3_asin(k * cosδγ + y * sinδγ) ];
    }
    rotation.invert = function(λ, φ) {
      var cosφ = Math.cos(φ), x = Math.cos(λ) * cosφ, y = Math.sin(λ) * cosφ, z = Math.sin(φ), k = z * cosδγ - y * sinδγ;
      return [ Math.atan2(y * cosδγ + z * sinδγ, x * cosδφ + k * sinδφ), d3_asin(k * cosδφ - x * sinδφ) ];
    };
    return rotation;
  }
  d3.geo.circle = function() {
    var origin = [ 0, 0 ], angle, precision = 6, interpolate;
    function circle() {
      var center = typeof origin === "function" ? origin.apply(this, arguments) : origin, rotate = d3_geo_rotation(-center[0] * d3_radians, -center[1] * d3_radians, 0).invert, ring = [];
      interpolate(null, null, 1, {
        point: function(x, y) {
          ring.push(x = rotate(x, y));
          x[0] *= d3_degrees, x[1] *= d3_degrees;
        }
      });
      return {
        type: "Polygon",
        coordinates: [ ring ]
      };
    }
    circle.origin = function(x) {
      if (!arguments.length) return origin;
      origin = x;
      return circle;
    };
    circle.angle = function(x) {
      if (!arguments.length) return angle;
      interpolate = d3_geo_circleInterpolate((angle = +x) * d3_radians, precision * d3_radians);
      return circle;
    };
    circle.precision = function(_) {
      if (!arguments.length) return precision;
      interpolate = d3_geo_circleInterpolate(angle * d3_radians, (precision = +_) * d3_radians);
      return circle;
    };
    return circle.angle(90);
  };
  function d3_geo_circleInterpolate(radius, precision) {
    var cr = Math.cos(radius), sr = Math.sin(radius);
    return function(from, to, direction, listener) {
      var step = direction * precision;
      if (from != null) {
        from = d3_geo_circleAngle(cr, from);
        to = d3_geo_circleAngle(cr, to);
        if (direction > 0 ? from < to : from > to) from += direction * τ;
      } else {
        from = radius + direction * τ;
        to = radius - .5 * step;
      }
      for (var point, t = from; direction > 0 ? t > to : t < to; t -= step) {
        listener.point((point = d3_geo_spherical([ cr, -sr * Math.cos(t), -sr * Math.sin(t) ]))[0], point[1]);
      }
    };
  }
  function d3_geo_circleAngle(cr, point) {
    var a = d3_geo_cartesian(point);
    a[0] -= cr;
    d3_geo_cartesianNormalize(a);
    var angle = d3_acos(-a[1]);
    return ((-a[2] < 0 ? -angle : angle) + 2 * Math.PI - ε) % (2 * Math.PI);
  }
  d3.geo.distance = function(a, b) {
    var Δλ = (b[0] - a[0]) * d3_radians, φ0 = a[1] * d3_radians, φ1 = b[1] * d3_radians, sinΔλ = Math.sin(Δλ), cosΔλ = Math.cos(Δλ), sinφ0 = Math.sin(φ0), cosφ0 = Math.cos(φ0), sinφ1 = Math.sin(φ1), cosφ1 = Math.cos(φ1), t;
    return Math.atan2(Math.sqrt((t = cosφ1 * sinΔλ) * t + (t = cosφ0 * sinφ1 - sinφ0 * cosφ1 * cosΔλ) * t), sinφ0 * sinφ1 + cosφ0 * cosφ1 * cosΔλ);
  };
  d3.geo.graticule = function() {
    var x1, x0, X1, X0, y1, y0, Y1, Y0, dx = 10, dy = dx, DX = 90, DY = 360, x, y, X, Y, precision = 2.5;
    function graticule() {
      return {
        type: "MultiLineString",
        coordinates: lines()
      };
    }
    function lines() {
      return d3.range(Math.ceil(X0 / DX) * DX, X1, DX).map(X).concat(d3.range(Math.ceil(Y0 / DY) * DY, Y1, DY).map(Y)).concat(d3.range(Math.ceil(x0 / dx) * dx, x1, dx).filter(function(x) {
        return abs(x % DX) > ε;
      }).map(x)).concat(d3.range(Math.ceil(y0 / dy) * dy, y1, dy).filter(function(y) {
        return abs(y % DY) > ε;
      }).map(y));
    }
    graticule.lines = function() {
      return lines().map(function(coordinates) {
        return {
          type: "LineString",
          coordinates: coordinates
        };
      });
    };
    graticule.outline = function() {
      return {
        type: "Polygon",
        coordinates: [ X(X0).concat(Y(Y1).slice(1), X(X1).reverse().slice(1), Y(Y0).reverse().slice(1)) ]
      };
    };
    graticule.extent = function(_) {
      if (!arguments.length) return graticule.minorExtent();
      return graticule.majorExtent(_).minorExtent(_);
    };
    graticule.majorExtent = function(_) {
      if (!arguments.length) return [ [ X0, Y0 ], [ X1, Y1 ] ];
      X0 = +_[0][0], X1 = +_[1][0];
      Y0 = +_[0][1], Y1 = +_[1][1];
      if (X0 > X1) _ = X0, X0 = X1, X1 = _;
      if (Y0 > Y1) _ = Y0, Y0 = Y1, Y1 = _;
      return graticule.precision(precision);
    };
    graticule.minorExtent = function(_) {
      if (!arguments.length) return [ [ x0, y0 ], [ x1, y1 ] ];
      x0 = +_[0][0], x1 = +_[1][0];
      y0 = +_[0][1], y1 = +_[1][1];
      if (x0 > x1) _ = x0, x0 = x1, x1 = _;
      if (y0 > y1) _ = y0, y0 = y1, y1 = _;
      return graticule.precision(precision);
    };
    graticule.step = function(_) {
      if (!arguments.length) return graticule.minorStep();
      return graticule.majorStep(_).minorStep(_);
    };
    graticule.majorStep = function(_) {
      if (!arguments.length) return [ DX, DY ];
      DX = +_[0], DY = +_[1];
      return graticule;
    };
    graticule.minorStep = function(_) {
      if (!arguments.length) return [ dx, dy ];
      dx = +_[0], dy = +_[1];
      return graticule;
    };
    graticule.precision = function(_) {
      if (!arguments.length) return precision;
      precision = +_;
      x = d3_geo_graticuleX(y0, y1, 90);
      y = d3_geo_graticuleY(x0, x1, precision);
      X = d3_geo_graticuleX(Y0, Y1, 90);
      Y = d3_geo_graticuleY(X0, X1, precision);
      return graticule;
    };
    return graticule.majorExtent([ [ -180, -90 + ε ], [ 180, 90 - ε ] ]).minorExtent([ [ -180, -80 - ε ], [ 180, 80 + ε ] ]);
  };
  function d3_geo_graticuleX(y0, y1, dy) {
    var y = d3.range(y0, y1 - ε, dy).concat(y1);
    return function(x) {
      return y.map(function(y) {
        return [ x, y ];
      });
    };
  }
  function d3_geo_graticuleY(x0, x1, dx) {
    var x = d3.range(x0, x1 - ε, dx).concat(x1);
    return function(y) {
      return x.map(function(x) {
        return [ x, y ];
      });
    };
  }
  function d3_source(d) {
    return d.source;
  }
  function d3_target(d) {
    return d.target;
  }
  d3.geo.greatArc = function() {
    var source = d3_source, source_, target = d3_target, target_;
    function greatArc() {
      return {
        type: "LineString",
        coordinates: [ source_ || source.apply(this, arguments), target_ || target.apply(this, arguments) ]
      };
    }
    greatArc.distance = function() {
      return d3.geo.distance(source_ || source.apply(this, arguments), target_ || target.apply(this, arguments));
    };
    greatArc.source = function(_) {
      if (!arguments.length) return source;
      source = _, source_ = typeof _ === "function" ? null : _;
      return greatArc;
    };
    greatArc.target = function(_) {
      if (!arguments.length) return target;
      target = _, target_ = typeof _ === "function" ? null : _;
      return greatArc;
    };
    greatArc.precision = function() {
      return arguments.length ? greatArc : 0;
    };
    return greatArc;
  };
  d3.geo.interpolate = function(source, target) {
    return d3_geo_interpolate(source[0] * d3_radians, source[1] * d3_radians, target[0] * d3_radians, target[1] * d3_radians);
  };
  function d3_geo_interpolate(x0, y0, x1, y1) {
    var cy0 = Math.cos(y0), sy0 = Math.sin(y0), cy1 = Math.cos(y1), sy1 = Math.sin(y1), kx0 = cy0 * Math.cos(x0), ky0 = cy0 * Math.sin(x0), kx1 = cy1 * Math.cos(x1), ky1 = cy1 * Math.sin(x1), d = 2 * Math.asin(Math.sqrt(d3_haversin(y1 - y0) + cy0 * cy1 * d3_haversin(x1 - x0))), k = 1 / Math.sin(d);
    var interpolate = d ? function(t) {
      var B = Math.sin(t *= d) * k, A = Math.sin(d - t) * k, x = A * kx0 + B * kx1, y = A * ky0 + B * ky1, z = A * sy0 + B * sy1;
      return [ Math.atan2(y, x) * d3_degrees, Math.atan2(z, Math.sqrt(x * x + y * y)) * d3_degrees ];
    } : function() {
      return [ x0 * d3_degrees, y0 * d3_degrees ];
    };
    interpolate.distance = d;
    return interpolate;
  }
  d3.geo.length = function(object) {
    d3_geo_lengthSum = 0;
    d3.geo.stream(object, d3_geo_length);
    return d3_geo_lengthSum;
  };
  var d3_geo_lengthSum;
  var d3_geo_length = {
    sphere: d3_noop,
    point: d3_noop,
    lineStart: d3_geo_lengthLineStart,
    lineEnd: d3_noop,
    polygonStart: d3_noop,
    polygonEnd: d3_noop
  };
  function d3_geo_lengthLineStart() {
    var λ0, sinφ0, cosφ0;
    d3_geo_length.point = function(λ, φ) {
      λ0 = λ * d3_radians, sinφ0 = Math.sin(φ *= d3_radians), cosφ0 = Math.cos(φ);
      d3_geo_length.point = nextPoint;
    };
    d3_geo_length.lineEnd = function() {
      d3_geo_length.point = d3_geo_length.lineEnd = d3_noop;
    };
    function nextPoint(λ, φ) {
      var sinφ = Math.sin(φ *= d3_radians), cosφ = Math.cos(φ), t = abs((λ *= d3_radians) - λ0), cosΔλ = Math.cos(t);
      d3_geo_lengthSum += Math.atan2(Math.sqrt((t = cosφ * Math.sin(t)) * t + (t = cosφ0 * sinφ - sinφ0 * cosφ * cosΔλ) * t), sinφ0 * sinφ + cosφ0 * cosφ * cosΔλ);
      λ0 = λ, sinφ0 = sinφ, cosφ0 = cosφ;
    }
  }
  function d3_geo_azimuthal(scale, angle) {
    function azimuthal(λ, φ) {
      var cosλ = Math.cos(λ), cosφ = Math.cos(φ), k = scale(cosλ * cosφ);
      return [ k * cosφ * Math.sin(λ), k * Math.sin(φ) ];
    }
    azimuthal.invert = function(x, y) {
      var ρ = Math.sqrt(x * x + y * y), c = angle(ρ), sinc = Math.sin(c), cosc = Math.cos(c);
      return [ Math.atan2(x * sinc, ρ * cosc), Math.asin(ρ && y * sinc / ρ) ];
    };
    return azimuthal;
  }
  var d3_geo_azimuthalEqualArea = d3_geo_azimuthal(function(cosλcosφ) {
    return Math.sqrt(2 / (1 + cosλcosφ));
  }, function(ρ) {
    return 2 * Math.asin(ρ / 2);
  });
  (d3.geo.azimuthalEqualArea = function() {
    return d3_geo_projection(d3_geo_azimuthalEqualArea);
  }).raw = d3_geo_azimuthalEqualArea;
  var d3_geo_azimuthalEquidistant = d3_geo_azimuthal(function(cosλcosφ) {
    var c = Math.acos(cosλcosφ);
    return c && c / Math.sin(c);
  }, d3_identity);
  (d3.geo.azimuthalEquidistant = function() {
    return d3_geo_projection(d3_geo_azimuthalEquidistant);
  }).raw = d3_geo_azimuthalEquidistant;
  function d3_geo_conicConformal(φ0, φ1) {
    var cosφ0 = Math.cos(φ0), t = function(φ) {
      return Math.tan(π / 4 + φ / 2);
    }, n = φ0 === φ1 ? Math.sin(φ0) : Math.log(cosφ0 / Math.cos(φ1)) / Math.log(t(φ1) / t(φ0)), F = cosφ0 * Math.pow(t(φ0), n) / n;
    if (!n) return d3_geo_mercator;
    function forward(λ, φ) {
      if (F > 0) {
        if (φ < -halfπ + ε) φ = -halfπ + ε;
      } else {
        if (φ > halfπ - ε) φ = halfπ - ε;
      }
      var ρ = F / Math.pow(t(φ), n);
      return [ ρ * Math.sin(n * λ), F - ρ * Math.cos(n * λ) ];
    }
    forward.invert = function(x, y) {
      var ρ0_y = F - y, ρ = d3_sgn(n) * Math.sqrt(x * x + ρ0_y * ρ0_y);
      return [ Math.atan2(x, ρ0_y) / n, 2 * Math.atan(Math.pow(F / ρ, 1 / n)) - halfπ ];
    };
    return forward;
  }
  (d3.geo.conicConformal = function() {
    return d3_geo_conic(d3_geo_conicConformal);
  }).raw = d3_geo_conicConformal;
  function d3_geo_conicEquidistant(φ0, φ1) {
    var cosφ0 = Math.cos(φ0), n = φ0 === φ1 ? Math.sin(φ0) : (cosφ0 - Math.cos(φ1)) / (φ1 - φ0), G = cosφ0 / n + φ0;
    if (abs(n) < ε) return d3_geo_equirectangular;
    function forward(λ, φ) {
      var ρ = G - φ;
      return [ ρ * Math.sin(n * λ), G - ρ * Math.cos(n * λ) ];
    }
    forward.invert = function(x, y) {
      var ρ0_y = G - y;
      return [ Math.atan2(x, ρ0_y) / n, G - d3_sgn(n) * Math.sqrt(x * x + ρ0_y * ρ0_y) ];
    };
    return forward;
  }
  (d3.geo.conicEquidistant = function() {
    return d3_geo_conic(d3_geo_conicEquidistant);
  }).raw = d3_geo_conicEquidistant;
  var d3_geo_gnomonic = d3_geo_azimuthal(function(cosλcosφ) {
    return 1 / cosλcosφ;
  }, Math.atan);
  (d3.geo.gnomonic = function() {
    return d3_geo_projection(d3_geo_gnomonic);
  }).raw = d3_geo_gnomonic;
  function d3_geo_mercator(λ, φ) {
    return [ λ, Math.log(Math.tan(π / 4 + φ / 2)) ];
  }
  d3_geo_mercator.invert = function(x, y) {
    return [ x, 2 * Math.atan(Math.exp(y)) - halfπ ];
  };
  function d3_geo_mercatorProjection(project) {
    var m = d3_geo_projection(project), scale = m.scale, translate = m.translate, clipExtent = m.clipExtent, clipAuto;
    m.scale = function() {
      var v = scale.apply(m, arguments);
      return v === m ? clipAuto ? m.clipExtent(null) : m : v;
    };
    m.translate = function() {
      var v = translate.apply(m, arguments);
      return v === m ? clipAuto ? m.clipExtent(null) : m : v;
    };
    m.clipExtent = function(_) {
      var v = clipExtent.apply(m, arguments);
      if (v === m) {
        if (clipAuto = _ == null) {
          var k = π * scale(), t = translate();
          clipExtent([ [ t[0] - k, t[1] - k ], [ t[0] + k, t[1] + k ] ]);
        }
      } else if (clipAuto) {
        v = null;
      }
      return v;
    };
    return m.clipExtent(null);
  }
  (d3.geo.mercator = function() {
    return d3_geo_mercatorProjection(d3_geo_mercator);
  }).raw = d3_geo_mercator;
  var d3_geo_orthographic = d3_geo_azimuthal(function() {
    return 1;
  }, Math.asin);
  (d3.geo.orthographic = function() {
    return d3_geo_projection(d3_geo_orthographic);
  }).raw = d3_geo_orthographic;
  var d3_geo_stereographic = d3_geo_azimuthal(function(cosλcosφ) {
    return 1 / (1 + cosλcosφ);
  }, function(ρ) {
    return 2 * Math.atan(ρ);
  });
  (d3.geo.stereographic = function() {
    return d3_geo_projection(d3_geo_stereographic);
  }).raw = d3_geo_stereographic;
  function d3_geo_transverseMercator(λ, φ) {
    return [ Math.log(Math.tan(π / 4 + φ / 2)), -λ ];
  }
  d3_geo_transverseMercator.invert = function(x, y) {
    return [ -y, 2 * Math.atan(Math.exp(x)) - halfπ ];
  };
  (d3.geo.transverseMercator = function() {
    var projection = d3_geo_mercatorProjection(d3_geo_transverseMercator), center = projection.center, rotate = projection.rotate;
    projection.center = function(_) {
      return _ ? center([ -_[1], _[0] ]) : (_ = center(), [ _[1], -_[0] ]);
    };
    projection.rotate = function(_) {
      return _ ? rotate([ _[0], _[1], _.length > 2 ? _[2] + 90 : 90 ]) : (_ = rotate(), 
      [ _[0], _[1], _[2] - 90 ]);
    };
    return rotate([ 0, 0, 90 ]);
  }).raw = d3_geo_transverseMercator;
  d3.geom = {};
  function d3_geom_pointX(d) {
    return d[0];
  }
  function d3_geom_pointY(d) {
    return d[1];
  }
  d3.geom.hull = function(vertices) {
    var x = d3_geom_pointX, y = d3_geom_pointY;
    if (arguments.length) return hull(vertices);
    function hull(data) {
      if (data.length < 3) return [];
      var fx = d3_functor(x), fy = d3_functor(y), i, n = data.length, points = [], flippedPoints = [];
      for (i = 0; i < n; i++) {
        points.push([ +fx.call(this, data[i], i), +fy.call(this, data[i], i), i ]);
      }
      points.sort(d3_geom_hullOrder);
      for (i = 0; i < n; i++) flippedPoints.push([ points[i][0], -points[i][1] ]);
      var upper = d3_geom_hullUpper(points), lower = d3_geom_hullUpper(flippedPoints);
      var skipLeft = lower[0] === upper[0], skipRight = lower[lower.length - 1] === upper[upper.length - 1], polygon = [];
      for (i = upper.length - 1; i >= 0; --i) polygon.push(data[points[upper[i]][2]]);
      for (i = +skipLeft; i < lower.length - skipRight; ++i) polygon.push(data[points[lower[i]][2]]);
      return polygon;
    }
    hull.x = function(_) {
      return arguments.length ? (x = _, hull) : x;
    };
    hull.y = function(_) {
      return arguments.length ? (y = _, hull) : y;
    };
    return hull;
  };
  function d3_geom_hullUpper(points) {
    var n = points.length, hull = [ 0, 1 ], hs = 2;
    for (var i = 2; i < n; i++) {
      while (hs > 1 && d3_cross2d(points[hull[hs - 2]], points[hull[hs - 1]], points[i]) <= 0) --hs;
      hull[hs++] = i;
    }
    return hull.slice(0, hs);
  }
  function d3_geom_hullOrder(a, b) {
    return a[0] - b[0] || a[1] - b[1];
  }
  d3.geom.polygon = function(coordinates) {
    d3_subclass(coordinates, d3_geom_polygonPrototype);
    return coordinates;
  };
  var d3_geom_polygonPrototype = d3.geom.polygon.prototype = [];
  d3_geom_polygonPrototype.area = function() {
    var i = -1, n = this.length, a, b = this[n - 1], area = 0;
    while (++i < n) {
      a = b;
      b = this[i];
      area += a[1] * b[0] - a[0] * b[1];
    }
    return area * .5;
  };
  d3_geom_polygonPrototype.centroid = function(k) {
    var i = -1, n = this.length, x = 0, y = 0, a, b = this[n - 1], c;
    if (!arguments.length) k = -1 / (6 * this.area());
    while (++i < n) {
      a = b;
      b = this[i];
      c = a[0] * b[1] - b[0] * a[1];
      x += (a[0] + b[0]) * c;
      y += (a[1] + b[1]) * c;
    }
    return [ x * k, y * k ];
  };
  d3_geom_polygonPrototype.clip = function(subject) {
    var input, closed = d3_geom_polygonClosed(subject), i = -1, n = this.length - d3_geom_polygonClosed(this), j, m, a = this[n - 1], b, c, d;
    while (++i < n) {
      input = subject.slice();
      subject.length = 0;
      b = this[i];
      c = input[(m = input.length - closed) - 1];
      j = -1;
      while (++j < m) {
        d = input[j];
        if (d3_geom_polygonInside(d, a, b)) {
          if (!d3_geom_polygonInside(c, a, b)) {
            subject.push(d3_geom_polygonIntersect(c, d, a, b));
          }
          subject.push(d);
        } else if (d3_geom_polygonInside(c, a, b)) {
          subject.push(d3_geom_polygonIntersect(c, d, a, b));
        }
        c = d;
      }
      if (closed) subject.push(subject[0]);
      a = b;
    }
    return subject;
  };
  function d3_geom_polygonInside(p, a, b) {
    return (b[0] - a[0]) * (p[1] - a[1]) < (b[1] - a[1]) * (p[0] - a[0]);
  }
  function d3_geom_polygonIntersect(c, d, a, b) {
    var x1 = c[0], x3 = a[0], x21 = d[0] - x1, x43 = b[0] - x3, y1 = c[1], y3 = a[1], y21 = d[1] - y1, y43 = b[1] - y3, ua = (x43 * (y1 - y3) - y43 * (x1 - x3)) / (y43 * x21 - x43 * y21);
    return [ x1 + ua * x21, y1 + ua * y21 ];
  }
  function d3_geom_polygonClosed(coordinates) {
    var a = coordinates[0], b = coordinates[coordinates.length - 1];
    return !(a[0] - b[0] || a[1] - b[1]);
  }
  var d3_geom_voronoiEdges, d3_geom_voronoiCells, d3_geom_voronoiBeaches, d3_geom_voronoiBeachPool = [], d3_geom_voronoiFirstCircle, d3_geom_voronoiCircles, d3_geom_voronoiCirclePool = [];
  function d3_geom_voronoiBeach() {
    d3_geom_voronoiRedBlackNode(this);
    this.edge = this.site = this.circle = null;
  }
  function d3_geom_voronoiCreateBeach(site) {
    var beach = d3_geom_voronoiBeachPool.pop() || new d3_geom_voronoiBeach();
    beach.site = site;
    return beach;
  }
  function d3_geom_voronoiDetachBeach(beach) {
    d3_geom_voronoiDetachCircle(beach);
    d3_geom_voronoiBeaches.remove(beach);
    d3_geom_voronoiBeachPool.push(beach);
    d3_geom_voronoiRedBlackNode(beach);
  }
  function d3_geom_voronoiRemoveBeach(beach) {
    var circle = beach.circle, x = circle.x, y = circle.cy, vertex = {
      x: x,
      y: y
    }, previous = beach.P, next = beach.N, disappearing = [ beach ];
    d3_geom_voronoiDetachBeach(beach);
    var lArc = previous;
    while (lArc.circle && abs(x - lArc.circle.x) < ε && abs(y - lArc.circle.cy) < ε) {
      previous = lArc.P;
      disappearing.unshift(lArc);
      d3_geom_voronoiDetachBeach(lArc);
      lArc = previous;
    }
    disappearing.unshift(lArc);
    d3_geom_voronoiDetachCircle(lArc);
    var rArc = next;
    while (rArc.circle && abs(x - rArc.circle.x) < ε && abs(y - rArc.circle.cy) < ε) {
      next = rArc.N;
      disappearing.push(rArc);
      d3_geom_voronoiDetachBeach(rArc);
      rArc = next;
    }
    disappearing.push(rArc);
    d3_geom_voronoiDetachCircle(rArc);
    var nArcs = disappearing.length, iArc;
    for (iArc = 1; iArc < nArcs; ++iArc) {
      rArc = disappearing[iArc];
      lArc = disappearing[iArc - 1];
      d3_geom_voronoiSetEdgeEnd(rArc.edge, lArc.site, rArc.site, vertex);
    }
    lArc = disappearing[0];
    rArc = disappearing[nArcs - 1];
    rArc.edge = d3_geom_voronoiCreateEdge(lArc.site, rArc.site, null, vertex);
    d3_geom_voronoiAttachCircle(lArc);
    d3_geom_voronoiAttachCircle(rArc);
  }
  function d3_geom_voronoiAddBeach(site) {
    var x = site.x, directrix = site.y, lArc, rArc, dxl, dxr, node = d3_geom_voronoiBeaches._;
    while (node) {
      dxl = d3_geom_voronoiLeftBreakPoint(node, directrix) - x;
      if (dxl > ε) node = node.L; else {
        dxr = x - d3_geom_voronoiRightBreakPoint(node, directrix);
        if (dxr > ε) {
          if (!node.R) {
            lArc = node;
            break;
          }
          node = node.R;
        } else {
          if (dxl > -ε) {
            lArc = node.P;
            rArc = node;
          } else if (dxr > -ε) {
            lArc = node;
            rArc = node.N;
          } else {
            lArc = rArc = node;
          }
          break;
        }
      }
    }
    var newArc = d3_geom_voronoiCreateBeach(site);
    d3_geom_voronoiBeaches.insert(lArc, newArc);
    if (!lArc && !rArc) return;
    if (lArc === rArc) {
      d3_geom_voronoiDetachCircle(lArc);
      rArc = d3_geom_voronoiCreateBeach(lArc.site);
      d3_geom_voronoiBeaches.insert(newArc, rArc);
      newArc.edge = rArc.edge = d3_geom_voronoiCreateEdge(lArc.site, newArc.site);
      d3_geom_voronoiAttachCircle(lArc);
      d3_geom_voronoiAttachCircle(rArc);
      return;
    }
    if (!rArc) {
      newArc.edge = d3_geom_voronoiCreateEdge(lArc.site, newArc.site);
      return;
    }
    d3_geom_voronoiDetachCircle(lArc);
    d3_geom_voronoiDetachCircle(rArc);
    var lSite = lArc.site, ax = lSite.x, ay = lSite.y, bx = site.x - ax, by = site.y - ay, rSite = rArc.site, cx = rSite.x - ax, cy = rSite.y - ay, d = 2 * (bx * cy - by * cx), hb = bx * bx + by * by, hc = cx * cx + cy * cy, vertex = {
      x: (cy * hb - by * hc) / d + ax,
      y: (bx * hc - cx * hb) / d + ay
    };
    d3_geom_voronoiSetEdgeEnd(rArc.edge, lSite, rSite, vertex);
    newArc.edge = d3_geom_voronoiCreateEdge(lSite, site, null, vertex);
    rArc.edge = d3_geom_voronoiCreateEdge(site, rSite, null, vertex);
    d3_geom_voronoiAttachCircle(lArc);
    d3_geom_voronoiAttachCircle(rArc);
  }
  function d3_geom_voronoiLeftBreakPoint(arc, directrix) {
    var site = arc.site, rfocx = site.x, rfocy = site.y, pby2 = rfocy - directrix;
    if (!pby2) return rfocx;
    var lArc = arc.P;
    if (!lArc) return -Infinity;
    site = lArc.site;
    var lfocx = site.x, lfocy = site.y, plby2 = lfocy - directrix;
    if (!plby2) return lfocx;
    var hl = lfocx - rfocx, aby2 = 1 / pby2 - 1 / plby2, b = hl / plby2;
    if (aby2) return (-b + Math.sqrt(b * b - 2 * aby2 * (hl * hl / (-2 * plby2) - lfocy + plby2 / 2 + rfocy - pby2 / 2))) / aby2 + rfocx;
    return (rfocx + lfocx) / 2;
  }
  function d3_geom_voronoiRightBreakPoint(arc, directrix) {
    var rArc = arc.N;
    if (rArc) return d3_geom_voronoiLeftBreakPoint(rArc, directrix);
    var site = arc.site;
    return site.y === directrix ? site.x : Infinity;
  }
  function d3_geom_voronoiCell(site) {
    this.site = site;
    this.edges = [];
  }
  d3_geom_voronoiCell.prototype.prepare = function() {
    var halfEdges = this.edges, iHalfEdge = halfEdges.length, edge;
    while (iHalfEdge--) {
      edge = halfEdges[iHalfEdge].edge;
      if (!edge.b || !edge.a) halfEdges.splice(iHalfEdge, 1);
    }
    halfEdges.sort(d3_geom_voronoiHalfEdgeOrder);
    return halfEdges.length;
  };
  function d3_geom_voronoiCloseCells(extent) {
    var x0 = extent[0][0], x1 = extent[1][0], y0 = extent[0][1], y1 = extent[1][1], x2, y2, x3, y3, cells = d3_geom_voronoiCells, iCell = cells.length, cell, iHalfEdge, halfEdges, nHalfEdges, start, end;
    while (iCell--) {
      cell = cells[iCell];
      if (!cell || !cell.prepare()) continue;
      halfEdges = cell.edges;
      nHalfEdges = halfEdges.length;
      iHalfEdge = 0;
      while (iHalfEdge < nHalfEdges) {
        end = halfEdges[iHalfEdge].end(), x3 = end.x, y3 = end.y;
        start = halfEdges[++iHalfEdge % nHalfEdges].start(), x2 = start.x, y2 = start.y;
        if (abs(x3 - x2) > ε || abs(y3 - y2) > ε) {
          halfEdges.splice(iHalfEdge, 0, new d3_geom_voronoiHalfEdge(d3_geom_voronoiCreateBorderEdge(cell.site, end, abs(x3 - x0) < ε && y1 - y3 > ε ? {
            x: x0,
            y: abs(x2 - x0) < ε ? y2 : y1
          } : abs(y3 - y1) < ε && x1 - x3 > ε ? {
            x: abs(y2 - y1) < ε ? x2 : x1,
            y: y1
          } : abs(x3 - x1) < ε && y3 - y0 > ε ? {
            x: x1,
            y: abs(x2 - x1) < ε ? y2 : y0
          } : abs(y3 - y0) < ε && x3 - x0 > ε ? {
            x: abs(y2 - y0) < ε ? x2 : x0,
            y: y0
          } : null), cell.site, null));
          ++nHalfEdges;
        }
      }
    }
  }
  function d3_geom_voronoiHalfEdgeOrder(a, b) {
    return b.angle - a.angle;
  }
  function d3_geom_voronoiCircle() {
    d3_geom_voronoiRedBlackNode(this);
    this.x = this.y = this.arc = this.site = this.cy = null;
  }
  function d3_geom_voronoiAttachCircle(arc) {
    var lArc = arc.P, rArc = arc.N;
    if (!lArc || !rArc) return;
    var lSite = lArc.site, cSite = arc.site, rSite = rArc.site;
    if (lSite === rSite) return;
    var bx = cSite.x, by = cSite.y, ax = lSite.x - bx, ay = lSite.y - by, cx = rSite.x - bx, cy = rSite.y - by;
    var d = 2 * (ax * cy - ay * cx);
    if (d >= -ε2) return;
    var ha = ax * ax + ay * ay, hc = cx * cx + cy * cy, x = (cy * ha - ay * hc) / d, y = (ax * hc - cx * ha) / d, cy = y + by;
    var circle = d3_geom_voronoiCirclePool.pop() || new d3_geom_voronoiCircle();
    circle.arc = arc;
    circle.site = cSite;
    circle.x = x + bx;
    circle.y = cy + Math.sqrt(x * x + y * y);
    circle.cy = cy;
    arc.circle = circle;
    var before = null, node = d3_geom_voronoiCircles._;
    while (node) {
      if (circle.y < node.y || circle.y === node.y && circle.x <= node.x) {
        if (node.L) node = node.L; else {
          before = node.P;
          break;
        }
      } else {
        if (node.R) node = node.R; else {
          before = node;
          break;
        }
      }
    }
    d3_geom_voronoiCircles.insert(before, circle);
    if (!before) d3_geom_voronoiFirstCircle = circle;
  }
  function d3_geom_voronoiDetachCircle(arc) {
    var circle = arc.circle;
    if (circle) {
      if (!circle.P) d3_geom_voronoiFirstCircle = circle.N;
      d3_geom_voronoiCircles.remove(circle);
      d3_geom_voronoiCirclePool.push(circle);
      d3_geom_voronoiRedBlackNode(circle);
      arc.circle = null;
    }
  }
  function d3_geom_voronoiClipEdges(extent) {
    var edges = d3_geom_voronoiEdges, clip = d3_geom_clipLine(extent[0][0], extent[0][1], extent[1][0], extent[1][1]), i = edges.length, e;
    while (i--) {
      e = edges[i];
      if (!d3_geom_voronoiConnectEdge(e, extent) || !clip(e) || abs(e.a.x - e.b.x) < ε && abs(e.a.y - e.b.y) < ε) {
        e.a = e.b = null;
        edges.splice(i, 1);
      }
    }
  }
  function d3_geom_voronoiConnectEdge(edge, extent) {
    var vb = edge.b;
    if (vb) return true;
    var va = edge.a, x0 = extent[0][0], x1 = extent[1][0], y0 = extent[0][1], y1 = extent[1][1], lSite = edge.l, rSite = edge.r, lx = lSite.x, ly = lSite.y, rx = rSite.x, ry = rSite.y, fx = (lx + rx) / 2, fy = (ly + ry) / 2, fm, fb;
    if (ry === ly) {
      if (fx < x0 || fx >= x1) return;
      if (lx > rx) {
        if (!va) va = {
          x: fx,
          y: y0
        }; else if (va.y >= y1) return;
        vb = {
          x: fx,
          y: y1
        };
      } else {
        if (!va) va = {
          x: fx,
          y: y1
        }; else if (va.y < y0) return;
        vb = {
          x: fx,
          y: y0
        };
      }
    } else {
      fm = (lx - rx) / (ry - ly);
      fb = fy - fm * fx;
      if (fm < -1 || fm > 1) {
        if (lx > rx) {
          if (!va) va = {
            x: (y0 - fb) / fm,
            y: y0
          }; else if (va.y >= y1) return;
          vb = {
            x: (y1 - fb) / fm,
            y: y1
          };
        } else {
          if (!va) va = {
            x: (y1 - fb) / fm,
            y: y1
          }; else if (va.y < y0) return;
          vb = {
            x: (y0 - fb) / fm,
            y: y0
          };
        }
      } else {
        if (ly < ry) {
          if (!va) va = {
            x: x0,
            y: fm * x0 + fb
          }; else if (va.x >= x1) return;
          vb = {
            x: x1,
            y: fm * x1 + fb
          };
        } else {
          if (!va) va = {
            x: x1,
            y: fm * x1 + fb
          }; else if (va.x < x0) return;
          vb = {
            x: x0,
            y: fm * x0 + fb
          };
        }
      }
    }
    edge.a = va;
    edge.b = vb;
    return true;
  }
  function d3_geom_voronoiEdge(lSite, rSite) {
    this.l = lSite;
    this.r = rSite;
    this.a = this.b = null;
  }
  function d3_geom_voronoiCreateEdge(lSite, rSite, va, vb) {
    var edge = new d3_geom_voronoiEdge(lSite, rSite);
    d3_geom_voronoiEdges.push(edge);
    if (va) d3_geom_voronoiSetEdgeEnd(edge, lSite, rSite, va);
    if (vb) d3_geom_voronoiSetEdgeEnd(edge, rSite, lSite, vb);
    d3_geom_voronoiCells[lSite.i].edges.push(new d3_geom_voronoiHalfEdge(edge, lSite, rSite));
    d3_geom_voronoiCells[rSite.i].edges.push(new d3_geom_voronoiHalfEdge(edge, rSite, lSite));
    return edge;
  }
  function d3_geom_voronoiCreateBorderEdge(lSite, va, vb) {
    var edge = new d3_geom_voronoiEdge(lSite, null);
    edge.a = va;
    edge.b = vb;
    d3_geom_voronoiEdges.push(edge);
    return edge;
  }
  function d3_geom_voronoiSetEdgeEnd(edge, lSite, rSite, vertex) {
    if (!edge.a && !edge.b) {
      edge.a = vertex;
      edge.l = lSite;
      edge.r = rSite;
    } else if (edge.l === rSite) {
      edge.b = vertex;
    } else {
      edge.a = vertex;
    }
  }
  function d3_geom_voronoiHalfEdge(edge, lSite, rSite) {
    var va = edge.a, vb = edge.b;
    this.edge = edge;
    this.site = lSite;
    this.angle = rSite ? Math.atan2(rSite.y - lSite.y, rSite.x - lSite.x) : edge.l === lSite ? Math.atan2(vb.x - va.x, va.y - vb.y) : Math.atan2(va.x - vb.x, vb.y - va.y);
  }
  d3_geom_voronoiHalfEdge.prototype = {
    start: function() {
      return this.edge.l === this.site ? this.edge.a : this.edge.b;
    },
    end: function() {
      return this.edge.l === this.site ? this.edge.b : this.edge.a;
    }
  };
  function d3_geom_voronoiRedBlackTree() {
    this._ = null;
  }
  function d3_geom_voronoiRedBlackNode(node) {
    node.U = node.C = node.L = node.R = node.P = node.N = null;
  }
  d3_geom_voronoiRedBlackTree.prototype = {
    insert: function(after, node) {
      var parent, grandpa, uncle;
      if (after) {
        node.P = after;
        node.N = after.N;
        if (after.N) after.N.P = node;
        after.N = node;
        if (after.R) {
          after = after.R;
          while (after.L) after = after.L;
          after.L = node;
        } else {
          after.R = node;
        }
        parent = after;
      } else if (this._) {
        after = d3_geom_voronoiRedBlackFirst(this._);
        node.P = null;
        node.N = after;
        after.P = after.L = node;
        parent = after;
      } else {
        node.P = node.N = null;
        this._ = node;
        parent = null;
      }
      node.L = node.R = null;
      node.U = parent;
      node.C = true;
      after = node;
      while (parent && parent.C) {
        grandpa = parent.U;
        if (parent === grandpa.L) {
          uncle = grandpa.R;
          if (uncle && uncle.C) {
            parent.C = uncle.C = false;
            grandpa.C = true;
            after = grandpa;
          } else {
            if (after === parent.R) {
              d3_geom_voronoiRedBlackRotateLeft(this, parent);
              after = parent;
              parent = after.U;
            }
            parent.C = false;
            grandpa.C = true;
            d3_geom_voronoiRedBlackRotateRight(this, grandpa);
          }
        } else {
          uncle = grandpa.L;
          if (uncle && uncle.C) {
            parent.C = uncle.C = false;
            grandpa.C = true;
            after = grandpa;
          } else {
            if (after === parent.L) {
              d3_geom_voronoiRedBlackRotateRight(this, parent);
              after = parent;
              parent = after.U;
            }
            parent.C = false;
            grandpa.C = true;
            d3_geom_voronoiRedBlackRotateLeft(this, grandpa);
          }
        }
        parent = after.U;
      }
      this._.C = false;
    },
    remove: function(node) {
      if (node.N) node.N.P = node.P;
      if (node.P) node.P.N = node.N;
      node.N = node.P = null;
      var parent = node.U, sibling, left = node.L, right = node.R, next, red;
      if (!left) next = right; else if (!right) next = left; else next = d3_geom_voronoiRedBlackFirst(right);
      if (parent) {
        if (parent.L === node) parent.L = next; else parent.R = next;
      } else {
        this._ = next;
      }
      if (left && right) {
        red = next.C;
        next.C = node.C;
        next.L = left;
        left.U = next;
        if (next !== right) {
          parent = next.U;
          next.U = node.U;
          node = next.R;
          parent.L = node;
          next.R = right;
          right.U = next;
        } else {
          next.U = parent;
          parent = next;
          node = next.R;
        }
      } else {
        red = node.C;
        node = next;
      }
      if (node) node.U = parent;
      if (red) return;
      if (node && node.C) {
        node.C = false;
        return;
      }
      do {
        if (node === this._) break;
        if (node === parent.L) {
          sibling = parent.R;
          if (sibling.C) {
            sibling.C = false;
            parent.C = true;
            d3_geom_voronoiRedBlackRotateLeft(this, parent);
            sibling = parent.R;
          }
          if (sibling.L && sibling.L.C || sibling.R && sibling.R.C) {
            if (!sibling.R || !sibling.R.C) {
              sibling.L.C = false;
              sibling.C = true;
              d3_geom_voronoiRedBlackRotateRight(this, sibling);
              sibling = parent.R;
            }
            sibling.C = parent.C;
            parent.C = sibling.R.C = false;
            d3_geom_voronoiRedBlackRotateLeft(this, parent);
            node = this._;
            break;
          }
        } else {
          sibling = parent.L;
          if (sibling.C) {
            sibling.C = false;
            parent.C = true;
            d3_geom_voronoiRedBlackRotateRight(this, parent);
            sibling = parent.L;
          }
          if (sibling.L && sibling.L.C || sibling.R && sibling.R.C) {
            if (!sibling.L || !sibling.L.C) {
              sibling.R.C = false;
              sibling.C = true;
              d3_geom_voronoiRedBlackRotateLeft(this, sibling);
              sibling = parent.L;
            }
            sibling.C = parent.C;
            parent.C = sibling.L.C = false;
            d3_geom_voronoiRedBlackRotateRight(this, parent);
            node = this._;
            break;
          }
        }
        sibling.C = true;
        node = parent;
        parent = parent.U;
      } while (!node.C);
      if (node) node.C = false;
    }
  };
  function d3_geom_voronoiRedBlackRotateLeft(tree, node) {
    var p = node, q = node.R, parent = p.U;
    if (parent) {
      if (parent.L === p) parent.L = q; else parent.R = q;
    } else {
      tree._ = q;
    }
    q.U = parent;
    p.U = q;
    p.R = q.L;
    if (p.R) p.R.U = p;
    q.L = p;
  }
  function d3_geom_voronoiRedBlackRotateRight(tree, node) {
    var p = node, q = node.L, parent = p.U;
    if (parent) {
      if (parent.L === p) parent.L = q; else parent.R = q;
    } else {
      tree._ = q;
    }
    q.U = parent;
    p.U = q;
    p.L = q.R;
    if (p.L) p.L.U = p;
    q.R = p;
  }
  function d3_geom_voronoiRedBlackFirst(node) {
    while (node.L) node = node.L;
    return node;
  }
  function d3_geom_voronoi(sites, bbox) {
    var site = sites.sort(d3_geom_voronoiVertexOrder).pop(), x0, y0, circle;
    d3_geom_voronoiEdges = [];
    d3_geom_voronoiCells = new Array(sites.length);
    d3_geom_voronoiBeaches = new d3_geom_voronoiRedBlackTree();
    d3_geom_voronoiCircles = new d3_geom_voronoiRedBlackTree();
    while (true) {
      circle = d3_geom_voronoiFirstCircle;
      if (site && (!circle || site.y < circle.y || site.y === circle.y && site.x < circle.x)) {
        if (site.x !== x0 || site.y !== y0) {
          d3_geom_voronoiCells[site.i] = new d3_geom_voronoiCell(site);
          d3_geom_voronoiAddBeach(site);
          x0 = site.x, y0 = site.y;
        }
        site = sites.pop();
      } else if (circle) {
        d3_geom_voronoiRemoveBeach(circle.arc);
      } else {
        break;
      }
    }
    if (bbox) d3_geom_voronoiClipEdges(bbox), d3_geom_voronoiCloseCells(bbox);
    var diagram = {
      cells: d3_geom_voronoiCells,
      edges: d3_geom_voronoiEdges
    };
    d3_geom_voronoiBeaches = d3_geom_voronoiCircles = d3_geom_voronoiEdges = d3_geom_voronoiCells = null;
    return diagram;
  }
  function d3_geom_voronoiVertexOrder(a, b) {
    return b.y - a.y || b.x - a.x;
  }
  d3.geom.voronoi = function(points) {
    var x = d3_geom_pointX, y = d3_geom_pointY, fx = x, fy = y, clipExtent = d3_geom_voronoiClipExtent;
    if (points) return voronoi(points);
    function voronoi(data) {
      var polygons = new Array(data.length), x0 = clipExtent[0][0], y0 = clipExtent[0][1], x1 = clipExtent[1][0], y1 = clipExtent[1][1];
      d3_geom_voronoi(sites(data), clipExtent).cells.forEach(function(cell, i) {
        var edges = cell.edges, site = cell.site, polygon = polygons[i] = edges.length ? edges.map(function(e) {
          var s = e.start();
          return [ s.x, s.y ];
        }) : site.x >= x0 && site.x <= x1 && site.y >= y0 && site.y <= y1 ? [ [ x0, y1 ], [ x1, y1 ], [ x1, y0 ], [ x0, y0 ] ] : [];
        polygon.point = data[i];
      });
      return polygons;
    }
    function sites(data) {
      return data.map(function(d, i) {
        return {
          x: Math.round(fx(d, i) / ε) * ε,
          y: Math.round(fy(d, i) / ε) * ε,
          i: i
        };
      });
    }
    voronoi.links = function(data) {
      return d3_geom_voronoi(sites(data)).edges.filter(function(edge) {
        return edge.l && edge.r;
      }).map(function(edge) {
        return {
          source: data[edge.l.i],
          target: data[edge.r.i]
        };
      });
    };
    voronoi.triangles = function(data) {
      var triangles = [];
      d3_geom_voronoi(sites(data)).cells.forEach(function(cell, i) {
        var site = cell.site, edges = cell.edges.sort(d3_geom_voronoiHalfEdgeOrder), j = -1, m = edges.length, e0, s0, e1 = edges[m - 1].edge, s1 = e1.l === site ? e1.r : e1.l;
        while (++j < m) {
          e0 = e1;
          s0 = s1;
          e1 = edges[j].edge;
          s1 = e1.l === site ? e1.r : e1.l;
          if (i < s0.i && i < s1.i && d3_geom_voronoiTriangleArea(site, s0, s1) < 0) {
            triangles.push([ data[i], data[s0.i], data[s1.i] ]);
          }
        }
      });
      return triangles;
    };
    voronoi.x = function(_) {
      return arguments.length ? (fx = d3_functor(x = _), voronoi) : x;
    };
    voronoi.y = function(_) {
      return arguments.length ? (fy = d3_functor(y = _), voronoi) : y;
    };
    voronoi.clipExtent = function(_) {
      if (!arguments.length) return clipExtent === d3_geom_voronoiClipExtent ? null : clipExtent;
      clipExtent = _ == null ? d3_geom_voronoiClipExtent : _;
      return voronoi;
    };
    voronoi.size = function(_) {
      if (!arguments.length) return clipExtent === d3_geom_voronoiClipExtent ? null : clipExtent && clipExtent[1];
      return voronoi.clipExtent(_ && [ [ 0, 0 ], _ ]);
    };
    return voronoi;
  };
  var d3_geom_voronoiClipExtent = [ [ -1e6, -1e6 ], [ 1e6, 1e6 ] ];
  function d3_geom_voronoiTriangleArea(a, b, c) {
    return (a.x - c.x) * (b.y - a.y) - (a.x - b.x) * (c.y - a.y);
  }
  d3.geom.delaunay = function(vertices) {
    return d3.geom.voronoi().triangles(vertices);
  };
  d3.geom.quadtree = function(points, x1, y1, x2, y2) {
    var x = d3_geom_pointX, y = d3_geom_pointY, compat;
    if (compat = arguments.length) {
      x = d3_geom_quadtreeCompatX;
      y = d3_geom_quadtreeCompatY;
      if (compat === 3) {
        y2 = y1;
        x2 = x1;
        y1 = x1 = 0;
      }
      return quadtree(points);
    }
    function quadtree(data) {
      var d, fx = d3_functor(x), fy = d3_functor(y), xs, ys, i, n, x1_, y1_, x2_, y2_;
      if (x1 != null) {
        x1_ = x1, y1_ = y1, x2_ = x2, y2_ = y2;
      } else {
        x2_ = y2_ = -(x1_ = y1_ = Infinity);
        xs = [], ys = [];
        n = data.length;
        if (compat) for (i = 0; i < n; ++i) {
          d = data[i];
          if (d.x < x1_) x1_ = d.x;
          if (d.y < y1_) y1_ = d.y;
          if (d.x > x2_) x2_ = d.x;
          if (d.y > y2_) y2_ = d.y;
          xs.push(d.x);
          ys.push(d.y);
        } else for (i = 0; i < n; ++i) {
          var x_ = +fx(d = data[i], i), y_ = +fy(d, i);
          if (x_ < x1_) x1_ = x_;
          if (y_ < y1_) y1_ = y_;
          if (x_ > x2_) x2_ = x_;
          if (y_ > y2_) y2_ = y_;
          xs.push(x_);
          ys.push(y_);
        }
      }
      var dx = x2_ - x1_, dy = y2_ - y1_;
      if (dx > dy) y2_ = y1_ + dx; else x2_ = x1_ + dy;
      function insert(n, d, x, y, x1, y1, x2, y2) {
        if (isNaN(x) || isNaN(y)) return;
        if (n.leaf) {
          var nx = n.x, ny = n.y;
          if (nx != null) {
            if (abs(nx - x) + abs(ny - y) < .01) {
              insertChild(n, d, x, y, x1, y1, x2, y2);
            } else {
              var nPoint = n.point;
              n.x = n.y = n.point = null;
              insertChild(n, nPoint, nx, ny, x1, y1, x2, y2);
              insertChild(n, d, x, y, x1, y1, x2, y2);
            }
          } else {
            n.x = x, n.y = y, n.point = d;
          }
        } else {
          insertChild(n, d, x, y, x1, y1, x2, y2);
        }
      }
      function insertChild(n, d, x, y, x1, y1, x2, y2) {
        var xm = (x1 + x2) * .5, ym = (y1 + y2) * .5, right = x >= xm, below = y >= ym, i = below << 1 | right;
        n.leaf = false;
        n = n.nodes[i] || (n.nodes[i] = d3_geom_quadtreeNode());
        if (right) x1 = xm; else x2 = xm;
        if (below) y1 = ym; else y2 = ym;
        insert(n, d, x, y, x1, y1, x2, y2);
      }
      var root = d3_geom_quadtreeNode();
      root.add = function(d) {
        insert(root, d, +fx(d, ++i), +fy(d, i), x1_, y1_, x2_, y2_);
      };
      root.visit = function(f) {
        d3_geom_quadtreeVisit(f, root, x1_, y1_, x2_, y2_);
      };
      root.find = function(point) {
        return d3_geom_quadtreeFind(root, point[0], point[1], x1_, y1_, x2_, y2_);
      };
      i = -1;
      if (x1 == null) {
        while (++i < n) {
          insert(root, data[i], xs[i], ys[i], x1_, y1_, x2_, y2_);
        }
        --i;
      } else data.forEach(root.add);
      xs = ys = data = d = null;
      return root;
    }
    quadtree.x = function(_) {
      return arguments.length ? (x = _, quadtree) : x;
    };
    quadtree.y = function(_) {
      return arguments.length ? (y = _, quadtree) : y;
    };
    quadtree.extent = function(_) {
      if (!arguments.length) return x1 == null ? null : [ [ x1, y1 ], [ x2, y2 ] ];
      if (_ == null) x1 = y1 = x2 = y2 = null; else x1 = +_[0][0], y1 = +_[0][1], x2 = +_[1][0], 
      y2 = +_[1][1];
      return quadtree;
    };
    quadtree.size = function(_) {
      if (!arguments.length) return x1 == null ? null : [ x2 - x1, y2 - y1 ];
      if (_ == null) x1 = y1 = x2 = y2 = null; else x1 = y1 = 0, x2 = +_[0], y2 = +_[1];
      return quadtree;
    };
    return quadtree;
  };
  function d3_geom_quadtreeCompatX(d) {
    return d.x;
  }
  function d3_geom_quadtreeCompatY(d) {
    return d.y;
  }
  function d3_geom_quadtreeNode() {
    return {
      leaf: true,
      nodes: [],
      point: null,
      x: null,
      y: null
    };
  }
  function d3_geom_quadtreeVisit(f, node, x1, y1, x2, y2) {
    if (!f(node, x1, y1, x2, y2)) {
      var sx = (x1 + x2) * .5, sy = (y1 + y2) * .5, children = node.nodes;
      if (children[0]) d3_geom_quadtreeVisit(f, children[0], x1, y1, sx, sy);
      if (children[1]) d3_geom_quadtreeVisit(f, children[1], sx, y1, x2, sy);
      if (children[2]) d3_geom_quadtreeVisit(f, children[2], x1, sy, sx, y2);
      if (children[3]) d3_geom_quadtreeVisit(f, children[3], sx, sy, x2, y2);
    }
  }
  function d3_geom_quadtreeFind(root, x, y, x0, y0, x3, y3) {
    var minDistance2 = Infinity, closestPoint;
    (function find(node, x1, y1, x2, y2) {
      if (x1 > x3 || y1 > y3 || x2 < x0 || y2 < y0) return;
      if (point = node.point) {
        var point, dx = x - point[0], dy = y - point[1], distance2 = dx * dx + dy * dy;
        if (distance2 < minDistance2) {
          var distance = Math.sqrt(minDistance2 = distance2);
          x0 = x - distance, y0 = y - distance;
          x3 = x + distance, y3 = y + distance;
          closestPoint = point;
        }
      }
      var children = node.nodes, xm = (x1 + x2) * .5, ym = (y1 + y2) * .5, right = x >= xm, below = y >= ym;
      for (var i = below << 1 | right, j = i + 4; i < j; ++i) {
        if (node = children[i & 3]) switch (i & 3) {
         case 0:
          find(node, x1, y1, xm, ym);
          break;

         case 1:
          find(node, xm, y1, x2, ym);
          break;

         case 2:
          find(node, x1, ym, xm, y2);
          break;

         case 3:
          find(node, xm, ym, x2, y2);
          break;
        }
      }
    })(root, x0, y0, x3, y3);
    return closestPoint;
  }
  d3.interpolateRgb = d3_interpolateRgb;
  function d3_interpolateRgb(a, b) {
    a = d3.rgb(a);
    b = d3.rgb(b);
    var ar = a.r, ag = a.g, ab = a.b, br = b.r - ar, bg = b.g - ag, bb = b.b - ab;
    return function(t) {
      return "#" + d3_rgb_hex(Math.round(ar + br * t)) + d3_rgb_hex(Math.round(ag + bg * t)) + d3_rgb_hex(Math.round(ab + bb * t));
    };
  }
  d3.interpolateObject = d3_interpolateObject;
  function d3_interpolateObject(a, b) {
    var i = {}, c = {}, k;
    for (k in a) {
      if (k in b) {
        i[k] = d3_interpolate(a[k], b[k]);
      } else {
        c[k] = a[k];
      }
    }
    for (k in b) {
      if (!(k in a)) {
        c[k] = b[k];
      }
    }
    return function(t) {
      for (k in i) c[k] = i[k](t);
      return c;
    };
  }
  d3.interpolateNumber = d3_interpolateNumber;
  function d3_interpolateNumber(a, b) {
    a = +a, b = +b;
    return function(t) {
      return a * (1 - t) + b * t;
    };
  }
  d3.interpolateString = d3_interpolateString;
  function d3_interpolateString(a, b) {
    var bi = d3_interpolate_numberA.lastIndex = d3_interpolate_numberB.lastIndex = 0, am, bm, bs, i = -1, s = [], q = [];
    a = a + "", b = b + "";
    while ((am = d3_interpolate_numberA.exec(a)) && (bm = d3_interpolate_numberB.exec(b))) {
      if ((bs = bm.index) > bi) {
        bs = b.slice(bi, bs);
        if (s[i]) s[i] += bs; else s[++i] = bs;
      }
      if ((am = am[0]) === (bm = bm[0])) {
        if (s[i]) s[i] += bm; else s[++i] = bm;
      } else {
        s[++i] = null;
        q.push({
          i: i,
          x: d3_interpolateNumber(am, bm)
        });
      }
      bi = d3_interpolate_numberB.lastIndex;
    }
    if (bi < b.length) {
      bs = b.slice(bi);
      if (s[i]) s[i] += bs; else s[++i] = bs;
    }
    return s.length < 2 ? q[0] ? (b = q[0].x, function(t) {
      return b(t) + "";
    }) : function() {
      return b;
    } : (b = q.length, function(t) {
      for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
      return s.join("");
    });
  }
  var d3_interpolate_numberA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, d3_interpolate_numberB = new RegExp(d3_interpolate_numberA.source, "g");
  d3.interpolate = d3_interpolate;
  function d3_interpolate(a, b) {
    var i = d3.interpolators.length, f;
    while (--i >= 0 && !(f = d3.interpolators[i](a, b))) ;
    return f;
  }
  d3.interpolators = [ function(a, b) {
    var t = typeof b;
    return (t === "string" ? d3_rgb_names.has(b) || /^(#|rgb\(|hsl\()/.test(b) ? d3_interpolateRgb : d3_interpolateString : b instanceof d3_color ? d3_interpolateRgb : Array.isArray(b) ? d3_interpolateArray : t === "object" && isNaN(b) ? d3_interpolateObject : d3_interpolateNumber)(a, b);
  } ];
  d3.interpolateArray = d3_interpolateArray;
  function d3_interpolateArray(a, b) {
    var x = [], c = [], na = a.length, nb = b.length, n0 = Math.min(a.length, b.length), i;
    for (i = 0; i < n0; ++i) x.push(d3_interpolate(a[i], b[i]));
    for (;i < na; ++i) c[i] = a[i];
    for (;i < nb; ++i) c[i] = b[i];
    return function(t) {
      for (i = 0; i < n0; ++i) c[i] = x[i](t);
      return c;
    };
  }
  var d3_ease_default = function() {
    return d3_identity;
  };
  var d3_ease = d3.map({
    linear: d3_ease_default,
    poly: d3_ease_poly,
    quad: function() {
      return d3_ease_quad;
    },
    cubic: function() {
      return d3_ease_cubic;
    },
    sin: function() {
      return d3_ease_sin;
    },
    exp: function() {
      return d3_ease_exp;
    },
    circle: function() {
      return d3_ease_circle;
    },
    elastic: d3_ease_elastic,
    back: d3_ease_back,
    bounce: function() {
      return d3_ease_bounce;
    }
  });
  var d3_ease_mode = d3.map({
    "in": d3_identity,
    out: d3_ease_reverse,
    "in-out": d3_ease_reflect,
    "out-in": function(f) {
      return d3_ease_reflect(d3_ease_reverse(f));
    }
  });
  d3.ease = function(name) {
    var i = name.indexOf("-"), t = i >= 0 ? name.slice(0, i) : name, m = i >= 0 ? name.slice(i + 1) : "in";
    t = d3_ease.get(t) || d3_ease_default;
    m = d3_ease_mode.get(m) || d3_identity;
    return d3_ease_clamp(m(t.apply(null, d3_arraySlice.call(arguments, 1))));
  };
  function d3_ease_clamp(f) {
    return function(t) {
      return t <= 0 ? 0 : t >= 1 ? 1 : f(t);
    };
  }
  function d3_ease_reverse(f) {
    return function(t) {
      return 1 - f(1 - t);
    };
  }
  function d3_ease_reflect(f) {
    return function(t) {
      return .5 * (t < .5 ? f(2 * t) : 2 - f(2 - 2 * t));
    };
  }
  function d3_ease_quad(t) {
    return t * t;
  }
  function d3_ease_cubic(t) {
    return t * t * t;
  }
  function d3_ease_cubicInOut(t) {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    var t2 = t * t, t3 = t2 * t;
    return 4 * (t < .5 ? t3 : 3 * (t - t2) + t3 - .75);
  }
  function d3_ease_poly(e) {
    return function(t) {
      return Math.pow(t, e);
    };
  }
  function d3_ease_sin(t) {
    return 1 - Math.cos(t * halfπ);
  }
  function d3_ease_exp(t) {
    return Math.pow(2, 10 * (t - 1));
  }
  function d3_ease_circle(t) {
    return 1 - Math.sqrt(1 - t * t);
  }
  function d3_ease_elastic(a, p) {
    var s;
    if (arguments.length < 2) p = .45;
    if (arguments.length) s = p / τ * Math.asin(1 / a); else a = 1, s = p / 4;
    return function(t) {
      return 1 + a * Math.pow(2, -10 * t) * Math.sin((t - s) * τ / p);
    };
  }
  function d3_ease_back(s) {
    if (!s) s = 1.70158;
    return function(t) {
      return t * t * ((s + 1) * t - s);
    };
  }
  function d3_ease_bounce(t) {
    return t < 1 / 2.75 ? 7.5625 * t * t : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + .75 : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375 : 7.5625 * (t -= 2.625 / 2.75) * t + .984375;
  }
  d3.interpolateHcl = d3_interpolateHcl;
  function d3_interpolateHcl(a, b) {
    a = d3.hcl(a);
    b = d3.hcl(b);
    var ah = a.h, ac = a.c, al = a.l, bh = b.h - ah, bc = b.c - ac, bl = b.l - al;
    if (isNaN(bc)) bc = 0, ac = isNaN(ac) ? b.c : ac;
    if (isNaN(bh)) bh = 0, ah = isNaN(ah) ? b.h : ah; else if (bh > 180) bh -= 360; else if (bh < -180) bh += 360;
    return function(t) {
      return d3_hcl_lab(ah + bh * t, ac + bc * t, al + bl * t) + "";
    };
  }
  d3.interpolateHsl = d3_interpolateHsl;
  function d3_interpolateHsl(a, b) {
    a = d3.hsl(a);
    b = d3.hsl(b);
    var ah = a.h, as = a.s, al = a.l, bh = b.h - ah, bs = b.s - as, bl = b.l - al;
    if (isNaN(bs)) bs = 0, as = isNaN(as) ? b.s : as;
    if (isNaN(bh)) bh = 0, ah = isNaN(ah) ? b.h : ah; else if (bh > 180) bh -= 360; else if (bh < -180) bh += 360;
    return function(t) {
      return d3_hsl_rgb(ah + bh * t, as + bs * t, al + bl * t) + "";
    };
  }
  d3.interpolateLab = d3_interpolateLab;
  function d3_interpolateLab(a, b) {
    a = d3.lab(a);
    b = d3.lab(b);
    var al = a.l, aa = a.a, ab = a.b, bl = b.l - al, ba = b.a - aa, bb = b.b - ab;
    return function(t) {
      return d3_lab_rgb(al + bl * t, aa + ba * t, ab + bb * t) + "";
    };
  }
  d3.interpolateRound = d3_interpolateRound;
  function d3_interpolateRound(a, b) {
    b -= a;
    return function(t) {
      return Math.round(a + b * t);
    };
  }
  d3.transform = function(string) {
    var g = d3_document.createElementNS(d3.ns.prefix.svg, "g");
    return (d3.transform = function(string) {
      if (string != null) {
        g.setAttribute("transform", string);
        var t = g.transform.baseVal.consolidate();
      }
      return new d3_transform(t ? t.matrix : d3_transformIdentity);
    })(string);
  };
  function d3_transform(m) {
    var r0 = [ m.a, m.b ], r1 = [ m.c, m.d ], kx = d3_transformNormalize(r0), kz = d3_transformDot(r0, r1), ky = d3_transformNormalize(d3_transformCombine(r1, r0, -kz)) || 0;
    if (r0[0] * r1[1] < r1[0] * r0[1]) {
      r0[0] *= -1;
      r0[1] *= -1;
      kx *= -1;
      kz *= -1;
    }
    this.rotate = (kx ? Math.atan2(r0[1], r0[0]) : Math.atan2(-r1[0], r1[1])) * d3_degrees;
    this.translate = [ m.e, m.f ];
    this.scale = [ kx, ky ];
    this.skew = ky ? Math.atan2(kz, ky) * d3_degrees : 0;
  }
  d3_transform.prototype.toString = function() {
    return "translate(" + this.translate + ")rotate(" + this.rotate + ")skewX(" + this.skew + ")scale(" + this.scale + ")";
  };
  function d3_transformDot(a, b) {
    return a[0] * b[0] + a[1] * b[1];
  }
  function d3_transformNormalize(a) {
    var k = Math.sqrt(d3_transformDot(a, a));
    if (k) {
      a[0] /= k;
      a[1] /= k;
    }
    return k;
  }
  function d3_transformCombine(a, b, k) {
    a[0] += k * b[0];
    a[1] += k * b[1];
    return a;
  }
  var d3_transformIdentity = {
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    e: 0,
    f: 0
  };
  d3.interpolateTransform = d3_interpolateTransform;
  function d3_interpolateTransform(a, b) {
    var s = [], q = [], n, A = d3.transform(a), B = d3.transform(b), ta = A.translate, tb = B.translate, ra = A.rotate, rb = B.rotate, wa = A.skew, wb = B.skew, ka = A.scale, kb = B.scale;
    if (ta[0] != tb[0] || ta[1] != tb[1]) {
      s.push("translate(", null, ",", null, ")");
      q.push({
        i: 1,
        x: d3_interpolateNumber(ta[0], tb[0])
      }, {
        i: 3,
        x: d3_interpolateNumber(ta[1], tb[1])
      });
    } else if (tb[0] || tb[1]) {
      s.push("translate(" + tb + ")");
    } else {
      s.push("");
    }
    if (ra != rb) {
      if (ra - rb > 180) rb += 360; else if (rb - ra > 180) ra += 360;
      q.push({
        i: s.push(s.pop() + "rotate(", null, ")") - 2,
        x: d3_interpolateNumber(ra, rb)
      });
    } else if (rb) {
      s.push(s.pop() + "rotate(" + rb + ")");
    }
    if (wa != wb) {
      q.push({
        i: s.push(s.pop() + "skewX(", null, ")") - 2,
        x: d3_interpolateNumber(wa, wb)
      });
    } else if (wb) {
      s.push(s.pop() + "skewX(" + wb + ")");
    }
    if (ka[0] != kb[0] || ka[1] != kb[1]) {
      n = s.push(s.pop() + "scale(", null, ",", null, ")");
      q.push({
        i: n - 4,
        x: d3_interpolateNumber(ka[0], kb[0])
      }, {
        i: n - 2,
        x: d3_interpolateNumber(ka[1], kb[1])
      });
    } else if (kb[0] != 1 || kb[1] != 1) {
      s.push(s.pop() + "scale(" + kb + ")");
    }
    n = q.length;
    return function(t) {
      var i = -1, o;
      while (++i < n) s[(o = q[i]).i] = o.x(t);
      return s.join("");
    };
  }
  function d3_uninterpolateNumber(a, b) {
    b = (b -= a = +a) || 1 / b;
    return function(x) {
      return (x - a) / b;
    };
  }
  function d3_uninterpolateClamp(a, b) {
    b = (b -= a = +a) || 1 / b;
    return function(x) {
      return Math.max(0, Math.min(1, (x - a) / b));
    };
  }
  d3.layout = {};
  d3.layout.bundle = function() {
    return function(links) {
      var paths = [], i = -1, n = links.length;
      while (++i < n) paths.push(d3_layout_bundlePath(links[i]));
      return paths;
    };
  };
  function d3_layout_bundlePath(link) {
    var start = link.source, end = link.target, lca = d3_layout_bundleLeastCommonAncestor(start, end), points = [ start ];
    while (start !== lca) {
      start = start.parent;
      points.push(start);
    }
    var k = points.length;
    while (end !== lca) {
      points.splice(k, 0, end);
      end = end.parent;
    }
    return points;
  }
  function d3_layout_bundleAncestors(node) {
    var ancestors = [], parent = node.parent;
    while (parent != null) {
      ancestors.push(node);
      node = parent;
      parent = parent.parent;
    }
    ancestors.push(node);
    return ancestors;
  }
  function d3_layout_bundleLeastCommonAncestor(a, b) {
    if (a === b) return a;
    var aNodes = d3_layout_bundleAncestors(a), bNodes = d3_layout_bundleAncestors(b), aNode = aNodes.pop(), bNode = bNodes.pop(), sharedNode = null;
    while (aNode === bNode) {
      sharedNode = aNode;
      aNode = aNodes.pop();
      bNode = bNodes.pop();
    }
    return sharedNode;
  }
  d3.layout.chord = function() {
    var chord = {}, chords, groups, matrix, n, padding = 0, sortGroups, sortSubgroups, sortChords;
    function relayout() {
      var subgroups = {}, groupSums = [], groupIndex = d3.range(n), subgroupIndex = [], k, x, x0, i, j;
      chords = [];
      groups = [];
      k = 0, i = -1;
      while (++i < n) {
        x = 0, j = -1;
        while (++j < n) {
          x += matrix[i][j];
        }
        groupSums.push(x);
        subgroupIndex.push(d3.range(n));
        k += x;
      }
      if (sortGroups) {
        groupIndex.sort(function(a, b) {
          return sortGroups(groupSums[a], groupSums[b]);
        });
      }
      if (sortSubgroups) {
        subgroupIndex.forEach(function(d, i) {
          d.sort(function(a, b) {
            return sortSubgroups(matrix[i][a], matrix[i][b]);
          });
        });
      }
      k = (τ - padding * n) / k;
      x = 0, i = -1;
      while (++i < n) {
        x0 = x, j = -1;
        while (++j < n) {
          var di = groupIndex[i], dj = subgroupIndex[di][j], v = matrix[di][dj], a0 = x, a1 = x += v * k;
          subgroups[di + "-" + dj] = {
            index: di,
            subindex: dj,
            startAngle: a0,
            endAngle: a1,
            value: v
          };
        }
        groups[di] = {
          index: di,
          startAngle: x0,
          endAngle: x,
          value: (x - x0) / k
        };
        x += padding;
      }
      i = -1;
      while (++i < n) {
        j = i - 1;
        while (++j < n) {
          var source = subgroups[i + "-" + j], target = subgroups[j + "-" + i];
          if (source.value || target.value) {
            chords.push(source.value < target.value ? {
              source: target,
              target: source
            } : {
              source: source,
              target: target
            });
          }
        }
      }
      if (sortChords) resort();
    }
    function resort() {
      chords.sort(function(a, b) {
        return sortChords((a.source.value + a.target.value) / 2, (b.source.value + b.target.value) / 2);
      });
    }
    chord.matrix = function(x) {
      if (!arguments.length) return matrix;
      n = (matrix = x) && matrix.length;
      chords = groups = null;
      return chord;
    };
    chord.padding = function(x) {
      if (!arguments.length) return padding;
      padding = x;
      chords = groups = null;
      return chord;
    };
    chord.sortGroups = function(x) {
      if (!arguments.length) return sortGroups;
      sortGroups = x;
      chords = groups = null;
      return chord;
    };
    chord.sortSubgroups = function(x) {
      if (!arguments.length) return sortSubgroups;
      sortSubgroups = x;
      chords = null;
      return chord;
    };
    chord.sortChords = function(x) {
      if (!arguments.length) return sortChords;
      sortChords = x;
      if (chords) resort();
      return chord;
    };
    chord.chords = function() {
      if (!chords) relayout();
      return chords;
    };
    chord.groups = function() {
      if (!groups) relayout();
      return groups;
    };
    return chord;
  };
  d3.layout.force = function() {
    var force = {}, event = d3.dispatch("start", "tick", "end"), size = [ 1, 1 ], drag, alpha, friction = .9, linkDistance = d3_layout_forceLinkDistance, linkStrength = d3_layout_forceLinkStrength, charge = -30, chargeDistance2 = d3_layout_forceChargeDistance2, gravity = .1, theta2 = .64, nodes = [], links = [], distances, strengths, charges;
    function repulse(node) {
      return function(quad, x1, _, x2) {
        if (quad.point !== node) {
          var dx = quad.cx - node.x, dy = quad.cy - node.y, dw = x2 - x1, dn = dx * dx + dy * dy;
          if (dw * dw / theta2 < dn) {
            if (dn < chargeDistance2) {
              var k = quad.charge / dn;
              node.px -= dx * k;
              node.py -= dy * k;
            }
            return true;
          }
          if (quad.point && dn && dn < chargeDistance2) {
            var k = quad.pointCharge / dn;
            node.px -= dx * k;
            node.py -= dy * k;
          }
        }
        return !quad.charge;
      };
    }
    force.tick = function() {
      if ((alpha *= .99) < .005) {
        event.end({
          type: "end",
          alpha: alpha = 0
        });
        return true;
      }
      var n = nodes.length, m = links.length, q, i, o, s, t, l, k, x, y;
      for (i = 0; i < m; ++i) {
        o = links[i];
        s = o.source;
        t = o.target;
        x = t.x - s.x;
        y = t.y - s.y;
        if (l = x * x + y * y) {
          l = alpha * strengths[i] * ((l = Math.sqrt(l)) - distances[i]) / l;
          x *= l;
          y *= l;
          t.x -= x * (k = s.weight / (t.weight + s.weight));
          t.y -= y * k;
          s.x += x * (k = 1 - k);
          s.y += y * k;
        }
      }
      if (k = alpha * gravity) {
        x = size[0] / 2;
        y = size[1] / 2;
        i = -1;
        if (k) while (++i < n) {
          o = nodes[i];
          o.x += (x - o.x) * k;
          o.y += (y - o.y) * k;
        }
      }
      if (charge) {
        d3_layout_forceAccumulate(q = d3.geom.quadtree(nodes), alpha, charges);
        i = -1;
        while (++i < n) {
          if (!(o = nodes[i]).fixed) {
            q.visit(repulse(o));
          }
        }
      }
      i = -1;
      while (++i < n) {
        o = nodes[i];
        if (o.fixed) {
          o.x = o.px;
          o.y = o.py;
        } else {
          o.x -= (o.px - (o.px = o.x)) * friction;
          o.y -= (o.py - (o.py = o.y)) * friction;
        }
      }
      event.tick({
        type: "tick",
        alpha: alpha
      });
    };
    force.nodes = function(x) {
      if (!arguments.length) return nodes;
      nodes = x;
      return force;
    };
    force.links = function(x) {
      if (!arguments.length) return links;
      links = x;
      return force;
    };
    force.size = function(x) {
      if (!arguments.length) return size;
      size = x;
      return force;
    };
    force.linkDistance = function(x) {
      if (!arguments.length) return linkDistance;
      linkDistance = typeof x === "function" ? x : +x;
      return force;
    };
    force.distance = force.linkDistance;
    force.linkStrength = function(x) {
      if (!arguments.length) return linkStrength;
      linkStrength = typeof x === "function" ? x : +x;
      return force;
    };
    force.friction = function(x) {
      if (!arguments.length) return friction;
      friction = +x;
      return force;
    };
    force.charge = function(x) {
      if (!arguments.length) return charge;
      charge = typeof x === "function" ? x : +x;
      return force;
    };
    force.chargeDistance = function(x) {
      if (!arguments.length) return Math.sqrt(chargeDistance2);
      chargeDistance2 = x * x;
      return force;
    };
    force.gravity = function(x) {
      if (!arguments.length) return gravity;
      gravity = +x;
      return force;
    };
    force.theta = function(x) {
      if (!arguments.length) return Math.sqrt(theta2);
      theta2 = x * x;
      return force;
    };
    force.alpha = function(x) {
      if (!arguments.length) return alpha;
      x = +x;
      if (alpha) {
        if (x > 0) alpha = x; else alpha = 0;
      } else if (x > 0) {
        event.start({
          type: "start",
          alpha: alpha = x
        });
        d3.timer(force.tick);
      }
      return force;
    };
    force.start = function() {
      var i, n = nodes.length, m = links.length, w = size[0], h = size[1], neighbors, o;
      for (i = 0; i < n; ++i) {
        (o = nodes[i]).index = i;
        o.weight = 0;
      }
      for (i = 0; i < m; ++i) {
        o = links[i];
        if (typeof o.source == "number") o.source = nodes[o.source];
        if (typeof o.target == "number") o.target = nodes[o.target];
        ++o.source.weight;
        ++o.target.weight;
      }
      for (i = 0; i < n; ++i) {
        o = nodes[i];
        if (isNaN(o.x)) o.x = position("x", w);
        if (isNaN(o.y)) o.y = position("y", h);
        if (isNaN(o.px)) o.px = o.x;
        if (isNaN(o.py)) o.py = o.y;
      }
      distances = [];
      if (typeof linkDistance === "function") for (i = 0; i < m; ++i) distances[i] = +linkDistance.call(this, links[i], i); else for (i = 0; i < m; ++i) distances[i] = linkDistance;
      strengths = [];
      if (typeof linkStrength === "function") for (i = 0; i < m; ++i) strengths[i] = +linkStrength.call(this, links[i], i); else for (i = 0; i < m; ++i) strengths[i] = linkStrength;
      charges = [];
      if (typeof charge === "function") for (i = 0; i < n; ++i) charges[i] = +charge.call(this, nodes[i], i); else for (i = 0; i < n; ++i) charges[i] = charge;
      function position(dimension, size) {
        if (!neighbors) {
          neighbors = new Array(n);
          for (j = 0; j < n; ++j) {
            neighbors[j] = [];
          }
          for (j = 0; j < m; ++j) {
            var o = links[j];
            neighbors[o.source.index].push(o.target);
            neighbors[o.target.index].push(o.source);
          }
        }
        var candidates = neighbors[i], j = -1, m = candidates.length, x;
        while (++j < m) if (!isNaN(x = candidates[j][dimension])) return x;
        return Math.random() * size;
      }
      return force.resume();
    };
    force.resume = function() {
      return force.alpha(.1);
    };
    force.stop = function() {
      return force.alpha(0);
    };
    force.drag = function() {
      if (!drag) drag = d3.behavior.drag().origin(d3_identity).on("dragstart.force", d3_layout_forceDragstart).on("drag.force", dragmove).on("dragend.force", d3_layout_forceDragend);
      if (!arguments.length) return drag;
      this.on("mouseover.force", d3_layout_forceMouseover).on("mouseout.force", d3_layout_forceMouseout).call(drag);
    };
    function dragmove(d) {
      d.px = d3.event.x, d.py = d3.event.y;
      force.resume();
    }
    return d3.rebind(force, event, "on");
  };
  function d3_layout_forceDragstart(d) {
    d.fixed |= 2;
  }
  function d3_layout_forceDragend(d) {
    d.fixed &= ~6;
  }
  function d3_layout_forceMouseover(d) {
    d.fixed |= 4;
    d.px = d.x, d.py = d.y;
  }
  function d3_layout_forceMouseout(d) {
    d.fixed &= ~4;
  }
  function d3_layout_forceAccumulate(quad, alpha, charges) {
    var cx = 0, cy = 0;
    quad.charge = 0;
    if (!quad.leaf) {
      var nodes = quad.nodes, n = nodes.length, i = -1, c;
      while (++i < n) {
        c = nodes[i];
        if (c == null) continue;
        d3_layout_forceAccumulate(c, alpha, charges);
        quad.charge += c.charge;
        cx += c.charge * c.cx;
        cy += c.charge * c.cy;
      }
    }
    if (quad.point) {
      if (!quad.leaf) {
        quad.point.x += Math.random() - .5;
        quad.point.y += Math.random() - .5;
      }
      var k = alpha * charges[quad.point.index];
      quad.charge += quad.pointCharge = k;
      cx += k * quad.point.x;
      cy += k * quad.point.y;
    }
    quad.cx = cx / quad.charge;
    quad.cy = cy / quad.charge;
  }
  var d3_layout_forceLinkDistance = 20, d3_layout_forceLinkStrength = 1, d3_layout_forceChargeDistance2 = Infinity;
  d3.layout.hierarchy = function() {
    var sort = d3_layout_hierarchySort, children = d3_layout_hierarchyChildren, value = d3_layout_hierarchyValue;
    function hierarchy(root) {
      var stack = [ root ], nodes = [], node;
      root.depth = 0;
      while ((node = stack.pop()) != null) {
        nodes.push(node);
        if ((childs = children.call(hierarchy, node, node.depth)) && (n = childs.length)) {
          var n, childs, child;
          while (--n >= 0) {
            stack.push(child = childs[n]);
            child.parent = node;
            child.depth = node.depth + 1;
          }
          if (value) node.value = 0;
          node.children = childs;
        } else {
          if (value) node.value = +value.call(hierarchy, node, node.depth) || 0;
          delete node.children;
        }
      }
      d3_layout_hierarchyVisitAfter(root, function(node) {
        var childs, parent;
        if (sort && (childs = node.children)) childs.sort(sort);
        if (value && (parent = node.parent)) parent.value += node.value;
      });
      return nodes;
    }
    hierarchy.sort = function(x) {
      if (!arguments.length) return sort;
      sort = x;
      return hierarchy;
    };
    hierarchy.children = function(x) {
      if (!arguments.length) return children;
      children = x;
      return hierarchy;
    };
    hierarchy.value = function(x) {
      if (!arguments.length) return value;
      value = x;
      return hierarchy;
    };
    hierarchy.revalue = function(root) {
      if (value) {
        d3_layout_hierarchyVisitBefore(root, function(node) {
          if (node.children) node.value = 0;
        });
        d3_layout_hierarchyVisitAfter(root, function(node) {
          var parent;
          if (!node.children) node.value = +value.call(hierarchy, node, node.depth) || 0;
          if (parent = node.parent) parent.value += node.value;
        });
      }
      return root;
    };
    return hierarchy;
  };
  function d3_layout_hierarchyRebind(object, hierarchy) {
    d3.rebind(object, hierarchy, "sort", "children", "value");
    object.nodes = object;
    object.links = d3_layout_hierarchyLinks;
    return object;
  }
  function d3_layout_hierarchyVisitBefore(node, callback) {
    var nodes = [ node ];
    while ((node = nodes.pop()) != null) {
      callback(node);
      if ((children = node.children) && (n = children.length)) {
        var n, children;
        while (--n >= 0) nodes.push(children[n]);
      }
    }
  }
  function d3_layout_hierarchyVisitAfter(node, callback) {
    var nodes = [ node ], nodes2 = [];
    while ((node = nodes.pop()) != null) {
      nodes2.push(node);
      if ((children = node.children) && (n = children.length)) {
        var i = -1, n, children;
        while (++i < n) nodes.push(children[i]);
      }
    }
    while ((node = nodes2.pop()) != null) {
      callback(node);
    }
  }
  function d3_layout_hierarchyChildren(d) {
    return d.children;
  }
  function d3_layout_hierarchyValue(d) {
    return d.value;
  }
  function d3_layout_hierarchySort(a, b) {
    return b.value - a.value;
  }
  function d3_layout_hierarchyLinks(nodes) {
    return d3.merge(nodes.map(function(parent) {
      return (parent.children || []).map(function(child) {
        return {
          source: parent,
          target: child
        };
      });
    }));
  }
  d3.layout.partition = function() {
    var hierarchy = d3.layout.hierarchy(), size = [ 1, 1 ];
    function position(node, x, dx, dy) {
      var children = node.children;
      node.x = x;
      node.y = node.depth * dy;
      node.dx = dx;
      node.dy = dy;
      if (children && (n = children.length)) {
        var i = -1, n, c, d;
        dx = node.value ? dx / node.value : 0;
        while (++i < n) {
          position(c = children[i], x, d = c.value * dx, dy);
          x += d;
        }
      }
    }
    function depth(node) {
      var children = node.children, d = 0;
      if (children && (n = children.length)) {
        var i = -1, n;
        while (++i < n) d = Math.max(d, depth(children[i]));
      }
      return 1 + d;
    }
    function partition(d, i) {
      var nodes = hierarchy.call(this, d, i);
      position(nodes[0], 0, size[0], size[1] / depth(nodes[0]));
      return nodes;
    }
    partition.size = function(x) {
      if (!arguments.length) return size;
      size = x;
      return partition;
    };
    return d3_layout_hierarchyRebind(partition, hierarchy);
  };
  d3.layout.pie = function() {
    var value = Number, sort = d3_layout_pieSortByValue, startAngle = 0, endAngle = τ, padAngle = 0;
    function pie(data) {
      var n = data.length, values = data.map(function(d, i) {
        return +value.call(pie, d, i);
      }), a = +(typeof startAngle === "function" ? startAngle.apply(this, arguments) : startAngle), da = (typeof endAngle === "function" ? endAngle.apply(this, arguments) : endAngle) - a, p = Math.min(Math.abs(da) / n, +(typeof padAngle === "function" ? padAngle.apply(this, arguments) : padAngle)), pa = p * (da < 0 ? -1 : 1), k = (da - n * pa) / d3.sum(values), index = d3.range(n), arcs = [], v;
      if (sort != null) index.sort(sort === d3_layout_pieSortByValue ? function(i, j) {
        return values[j] - values[i];
      } : function(i, j) {
        return sort(data[i], data[j]);
      });
      index.forEach(function(i) {
        arcs[i] = {
          data: data[i],
          value: v = values[i],
          startAngle: a,
          endAngle: a += v * k + pa,
          padAngle: p
        };
      });
      return arcs;
    }
    pie.value = function(_) {
      if (!arguments.length) return value;
      value = _;
      return pie;
    };
    pie.sort = function(_) {
      if (!arguments.length) return sort;
      sort = _;
      return pie;
    };
    pie.startAngle = function(_) {
      if (!arguments.length) return startAngle;
      startAngle = _;
      return pie;
    };
    pie.endAngle = function(_) {
      if (!arguments.length) return endAngle;
      endAngle = _;
      return pie;
    };
    pie.padAngle = function(_) {
      if (!arguments.length) return padAngle;
      padAngle = _;
      return pie;
    };
    return pie;
  };
  var d3_layout_pieSortByValue = {};
  d3.layout.stack = function() {
    var values = d3_identity, order = d3_layout_stackOrderDefault, offset = d3_layout_stackOffsetZero, out = d3_layout_stackOut, x = d3_layout_stackX, y = d3_layout_stackY;
    function stack(data, index) {
      if (!(n = data.length)) return data;
      var series = data.map(function(d, i) {
        return values.call(stack, d, i);
      });
      var points = series.map(function(d) {
        return d.map(function(v, i) {
          return [ x.call(stack, v, i), y.call(stack, v, i) ];
        });
      });
      var orders = order.call(stack, points, index);
      series = d3.permute(series, orders);
      points = d3.permute(points, orders);
      var offsets = offset.call(stack, points, index);
      var m = series[0].length, n, i, j, o;
      for (j = 0; j < m; ++j) {
        out.call(stack, series[0][j], o = offsets[j], points[0][j][1]);
        for (i = 1; i < n; ++i) {
          out.call(stack, series[i][j], o += points[i - 1][j][1], points[i][j][1]);
        }
      }
      return data;
    }
    stack.values = function(x) {
      if (!arguments.length) return values;
      values = x;
      return stack;
    };
    stack.order = function(x) {
      if (!arguments.length) return order;
      order = typeof x === "function" ? x : d3_layout_stackOrders.get(x) || d3_layout_stackOrderDefault;
      return stack;
    };
    stack.offset = function(x) {
      if (!arguments.length) return offset;
      offset = typeof x === "function" ? x : d3_layout_stackOffsets.get(x) || d3_layout_stackOffsetZero;
      return stack;
    };
    stack.x = function(z) {
      if (!arguments.length) return x;
      x = z;
      return stack;
    };
    stack.y = function(z) {
      if (!arguments.length) return y;
      y = z;
      return stack;
    };
    stack.out = function(z) {
      if (!arguments.length) return out;
      out = z;
      return stack;
    };
    return stack;
  };
  function d3_layout_stackX(d) {
    return d.x;
  }
  function d3_layout_stackY(d) {
    return d.y;
  }
  function d3_layout_stackOut(d, y0, y) {
    d.y0 = y0;
    d.y = y;
  }
  var d3_layout_stackOrders = d3.map({
    "inside-out": function(data) {
      var n = data.length, i, j, max = data.map(d3_layout_stackMaxIndex), sums = data.map(d3_layout_stackReduceSum), index = d3.range(n).sort(function(a, b) {
        return max[a] - max[b];
      }), top = 0, bottom = 0, tops = [], bottoms = [];
      for (i = 0; i < n; ++i) {
        j = index[i];
        if (top < bottom) {
          top += sums[j];
          tops.push(j);
        } else {
          bottom += sums[j];
          bottoms.push(j);
        }
      }
      return bottoms.reverse().concat(tops);
    },
    reverse: function(data) {
      return d3.range(data.length).reverse();
    },
    "default": d3_layout_stackOrderDefault
  });
  var d3_layout_stackOffsets = d3.map({
    silhouette: function(data) {
      var n = data.length, m = data[0].length, sums = [], max = 0, i, j, o, y0 = [];
      for (j = 0; j < m; ++j) {
        for (i = 0, o = 0; i < n; i++) o += data[i][j][1];
        if (o > max) max = o;
        sums.push(o);
      }
      for (j = 0; j < m; ++j) {
        y0[j] = (max - sums[j]) / 2;
      }
      return y0;
    },
    wiggle: function(data) {
      var n = data.length, x = data[0], m = x.length, i, j, k, s1, s2, s3, dx, o, o0, y0 = [];
      y0[0] = o = o0 = 0;
      for (j = 1; j < m; ++j) {
        for (i = 0, s1 = 0; i < n; ++i) s1 += data[i][j][1];
        for (i = 0, s2 = 0, dx = x[j][0] - x[j - 1][0]; i < n; ++i) {
          for (k = 0, s3 = (data[i][j][1] - data[i][j - 1][1]) / (2 * dx); k < i; ++k) {
            s3 += (data[k][j][1] - data[k][j - 1][1]) / dx;
          }
          s2 += s3 * data[i][j][1];
        }
        y0[j] = o -= s1 ? s2 / s1 * dx : 0;
        if (o < o0) o0 = o;
      }
      for (j = 0; j < m; ++j) y0[j] -= o0;
      return y0;
    },
    expand: function(data) {
      var n = data.length, m = data[0].length, k = 1 / n, i, j, o, y0 = [];
      for (j = 0; j < m; ++j) {
        for (i = 0, o = 0; i < n; i++) o += data[i][j][1];
        if (o) for (i = 0; i < n; i++) data[i][j][1] /= o; else for (i = 0; i < n; i++) data[i][j][1] = k;
      }
      for (j = 0; j < m; ++j) y0[j] = 0;
      return y0;
    },
    zero: d3_layout_stackOffsetZero
  });
  function d3_layout_stackOrderDefault(data) {
    return d3.range(data.length);
  }
  function d3_layout_stackOffsetZero(data) {
    var j = -1, m = data[0].length, y0 = [];
    while (++j < m) y0[j] = 0;
    return y0;
  }
  function d3_layout_stackMaxIndex(array) {
    var i = 1, j = 0, v = array[0][1], k, n = array.length;
    for (;i < n; ++i) {
      if ((k = array[i][1]) > v) {
        j = i;
        v = k;
      }
    }
    return j;
  }
  function d3_layout_stackReduceSum(d) {
    return d.reduce(d3_layout_stackSum, 0);
  }
  function d3_layout_stackSum(p, d) {
    return p + d[1];
  }
  d3.layout.histogram = function() {
    var frequency = true, valuer = Number, ranger = d3_layout_histogramRange, binner = d3_layout_histogramBinSturges;
    function histogram(data, i) {
      var bins = [], values = data.map(valuer, this), range = ranger.call(this, values, i), thresholds = binner.call(this, range, values, i), bin, i = -1, n = values.length, m = thresholds.length - 1, k = frequency ? 1 : 1 / n, x;
      while (++i < m) {
        bin = bins[i] = [];
        bin.dx = thresholds[i + 1] - (bin.x = thresholds[i]);
        bin.y = 0;
      }
      if (m > 0) {
        i = -1;
        while (++i < n) {
          x = values[i];
          if (x >= range[0] && x <= range[1]) {
            bin = bins[d3.bisect(thresholds, x, 1, m) - 1];
            bin.y += k;
            bin.push(data[i]);
          }
        }
      }
      return bins;
    }
    histogram.value = function(x) {
      if (!arguments.length) return valuer;
      valuer = x;
      return histogram;
    };
    histogram.range = function(x) {
      if (!arguments.length) return ranger;
      ranger = d3_functor(x);
      return histogram;
    };
    histogram.bins = function(x) {
      if (!arguments.length) return binner;
      binner = typeof x === "number" ? function(range) {
        return d3_layout_histogramBinFixed(range, x);
      } : d3_functor(x);
      return histogram;
    };
    histogram.frequency = function(x) {
      if (!arguments.length) return frequency;
      frequency = !!x;
      return histogram;
    };
    return histogram;
  };
  function d3_layout_histogramBinSturges(range, values) {
    return d3_layout_histogramBinFixed(range, Math.ceil(Math.log(values.length) / Math.LN2 + 1));
  }
  function d3_layout_histogramBinFixed(range, n) {
    var x = -1, b = +range[0], m = (range[1] - b) / n, f = [];
    while (++x <= n) f[x] = m * x + b;
    return f;
  }
  function d3_layout_histogramRange(values) {
    return [ d3.min(values), d3.max(values) ];
  }
  d3.layout.pack = function() {
    var hierarchy = d3.layout.hierarchy().sort(d3_layout_packSort), padding = 0, size = [ 1, 1 ], radius;
    function pack(d, i) {
      var nodes = hierarchy.call(this, d, i), root = nodes[0], w = size[0], h = size[1], r = radius == null ? Math.sqrt : typeof radius === "function" ? radius : function() {
        return radius;
      };
      root.x = root.y = 0;
      d3_layout_hierarchyVisitAfter(root, function(d) {
        d.r = +r(d.value);
      });
      d3_layout_hierarchyVisitAfter(root, d3_layout_packSiblings);
      if (padding) {
        var dr = padding * (radius ? 1 : Math.max(2 * root.r / w, 2 * root.r / h)) / 2;
        d3_layout_hierarchyVisitAfter(root, function(d) {
          d.r += dr;
        });
        d3_layout_hierarchyVisitAfter(root, d3_layout_packSiblings);
        d3_layout_hierarchyVisitAfter(root, function(d) {
          d.r -= dr;
        });
      }
      d3_layout_packTransform(root, w / 2, h / 2, radius ? 1 : 1 / Math.max(2 * root.r / w, 2 * root.r / h));
      return nodes;
    }
    pack.size = function(_) {
      if (!arguments.length) return size;
      size = _;
      return pack;
    };
    pack.radius = function(_) {
      if (!arguments.length) return radius;
      radius = _ == null || typeof _ === "function" ? _ : +_;
      return pack;
    };
    pack.padding = function(_) {
      if (!arguments.length) return padding;
      padding = +_;
      return pack;
    };
    return d3_layout_hierarchyRebind(pack, hierarchy);
  };
  function d3_layout_packSort(a, b) {
    return a.value - b.value;
  }
  function d3_layout_packInsert(a, b) {
    var c = a._pack_next;
    a._pack_next = b;
    b._pack_prev = a;
    b._pack_next = c;
    c._pack_prev = b;
  }
  function d3_layout_packSplice(a, b) {
    a._pack_next = b;
    b._pack_prev = a;
  }
  function d3_layout_packIntersects(a, b) {
    var dx = b.x - a.x, dy = b.y - a.y, dr = a.r + b.r;
    return .999 * dr * dr > dx * dx + dy * dy;
  }
  function d3_layout_packSiblings(node) {
    if (!(nodes = node.children) || !(n = nodes.length)) return;
    var nodes, xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity, a, b, c, i, j, k, n;
    function bound(node) {
      xMin = Math.min(node.x - node.r, xMin);
      xMax = Math.max(node.x + node.r, xMax);
      yMin = Math.min(node.y - node.r, yMin);
      yMax = Math.max(node.y + node.r, yMax);
    }
    nodes.forEach(d3_layout_packLink);
    a = nodes[0];
    a.x = -a.r;
    a.y = 0;
    bound(a);
    if (n > 1) {
      b = nodes[1];
      b.x = b.r;
      b.y = 0;
      bound(b);
      if (n > 2) {
        c = nodes[2];
        d3_layout_packPlace(a, b, c);
        bound(c);
        d3_layout_packInsert(a, c);
        a._pack_prev = c;
        d3_layout_packInsert(c, b);
        b = a._pack_next;
        for (i = 3; i < n; i++) {
          d3_layout_packPlace(a, b, c = nodes[i]);
          var isect = 0, s1 = 1, s2 = 1;
          for (j = b._pack_next; j !== b; j = j._pack_next, s1++) {
            if (d3_layout_packIntersects(j, c)) {
              isect = 1;
              break;
            }
          }
          if (isect == 1) {
            for (k = a._pack_prev; k !== j._pack_prev; k = k._pack_prev, s2++) {
              if (d3_layout_packIntersects(k, c)) {
                break;
              }
            }
          }
          if (isect) {
            if (s1 < s2 || s1 == s2 && b.r < a.r) d3_layout_packSplice(a, b = j); else d3_layout_packSplice(a = k, b);
            i--;
          } else {
            d3_layout_packInsert(a, c);
            b = c;
            bound(c);
          }
        }
      }
    }
    var cx = (xMin + xMax) / 2, cy = (yMin + yMax) / 2, cr = 0;
    for (i = 0; i < n; i++) {
      c = nodes[i];
      c.x -= cx;
      c.y -= cy;
      cr = Math.max(cr, c.r + Math.sqrt(c.x * c.x + c.y * c.y));
    }
    node.r = cr;
    nodes.forEach(d3_layout_packUnlink);
  }
  function d3_layout_packLink(node) {
    node._pack_next = node._pack_prev = node;
  }
  function d3_layout_packUnlink(node) {
    delete node._pack_next;
    delete node._pack_prev;
  }
  function d3_layout_packTransform(node, x, y, k) {
    var children = node.children;
    node.x = x += k * node.x;
    node.y = y += k * node.y;
    node.r *= k;
    if (children) {
      var i = -1, n = children.length;
      while (++i < n) d3_layout_packTransform(children[i], x, y, k);
    }
  }
  function d3_layout_packPlace(a, b, c) {
    var db = a.r + c.r, dx = b.x - a.x, dy = b.y - a.y;
    if (db && (dx || dy)) {
      var da = b.r + c.r, dc = dx * dx + dy * dy;
      da *= da;
      db *= db;
      var x = .5 + (db - da) / (2 * dc), y = Math.sqrt(Math.max(0, 2 * da * (db + dc) - (db -= dc) * db - da * da)) / (2 * dc);
      c.x = a.x + x * dx + y * dy;
      c.y = a.y + x * dy - y * dx;
    } else {
      c.x = a.x + db;
      c.y = a.y;
    }
  }
  d3.layout.tree = function() {
    var hierarchy = d3.layout.hierarchy().sort(null).value(null), separation = d3_layout_treeSeparation, size = [ 1, 1 ], nodeSize = null;
    function tree(d, i) {
      var nodes = hierarchy.call(this, d, i), root0 = nodes[0], root1 = wrapTree(root0);
      d3_layout_hierarchyVisitAfter(root1, firstWalk), root1.parent.m = -root1.z;
      d3_layout_hierarchyVisitBefore(root1, secondWalk);
      if (nodeSize) d3_layout_hierarchyVisitBefore(root0, sizeNode); else {
        var left = root0, right = root0, bottom = root0;
        d3_layout_hierarchyVisitBefore(root0, function(node) {
          if (node.x < left.x) left = node;
          if (node.x > right.x) right = node;
          if (node.depth > bottom.depth) bottom = node;
        });
        var tx = separation(left, right) / 2 - left.x, kx = size[0] / (right.x + separation(right, left) / 2 + tx), ky = size[1] / (bottom.depth || 1);
        d3_layout_hierarchyVisitBefore(root0, function(node) {
          node.x = (node.x + tx) * kx;
          node.y = node.depth * ky;
        });
      }
      return nodes;
    }
    function wrapTree(root0) {
      var root1 = {
        A: null,
        children: [ root0 ]
      }, queue = [ root1 ], node1;
      while ((node1 = queue.pop()) != null) {
        for (var children = node1.children, child, i = 0, n = children.length; i < n; ++i) {
          queue.push((children[i] = child = {
            _: children[i],
            parent: node1,
            children: (child = children[i].children) && child.slice() || [],
            A: null,
            a: null,
            z: 0,
            m: 0,
            c: 0,
            s: 0,
            t: null,
            i: i
          }).a = child);
        }
      }
      return root1.children[0];
    }
    function firstWalk(v) {
      var children = v.children, siblings = v.parent.children, w = v.i ? siblings[v.i - 1] : null;
      if (children.length) {
        d3_layout_treeShift(v);
        var midpoint = (children[0].z + children[children.length - 1].z) / 2;
        if (w) {
          v.z = w.z + separation(v._, w._);
          v.m = v.z - midpoint;
        } else {
          v.z = midpoint;
        }
      } else if (w) {
        v.z = w.z + separation(v._, w._);
      }
      v.parent.A = apportion(v, w, v.parent.A || siblings[0]);
    }
    function secondWalk(v) {
      v._.x = v.z + v.parent.m;
      v.m += v.parent.m;
    }
    function apportion(v, w, ancestor) {
      if (w) {
        var vip = v, vop = v, vim = w, vom = vip.parent.children[0], sip = vip.m, sop = vop.m, sim = vim.m, som = vom.m, shift;
        while (vim = d3_layout_treeRight(vim), vip = d3_layout_treeLeft(vip), vim && vip) {
          vom = d3_layout_treeLeft(vom);
          vop = d3_layout_treeRight(vop);
          vop.a = v;
          shift = vim.z + sim - vip.z - sip + separation(vim._, vip._);
          if (shift > 0) {
            d3_layout_treeMove(d3_layout_treeAncestor(vim, v, ancestor), v, shift);
            sip += shift;
            sop += shift;
          }
          sim += vim.m;
          sip += vip.m;
          som += vom.m;
          sop += vop.m;
        }
        if (vim && !d3_layout_treeRight(vop)) {
          vop.t = vim;
          vop.m += sim - sop;
        }
        if (vip && !d3_layout_treeLeft(vom)) {
          vom.t = vip;
          vom.m += sip - som;
          ancestor = v;
        }
      }
      return ancestor;
    }
    function sizeNode(node) {
      node.x *= size[0];
      node.y = node.depth * size[1];
    }
    tree.separation = function(x) {
      if (!arguments.length) return separation;
      separation = x;
      return tree;
    };
    tree.size = function(x) {
      if (!arguments.length) return nodeSize ? null : size;
      nodeSize = (size = x) == null ? sizeNode : null;
      return tree;
    };
    tree.nodeSize = function(x) {
      if (!arguments.length) return nodeSize ? size : null;
      nodeSize = (size = x) == null ? null : sizeNode;
      return tree;
    };
    return d3_layout_hierarchyRebind(tree, hierarchy);
  };
  function d3_layout_treeSeparation(a, b) {
    return a.parent == b.parent ? 1 : 2;
  }
  function d3_layout_treeLeft(v) {
    var children = v.children;
    return children.length ? children[0] : v.t;
  }
  function d3_layout_treeRight(v) {
    var children = v.children, n;
    return (n = children.length) ? children[n - 1] : v.t;
  }
  function d3_layout_treeMove(wm, wp, shift) {
    var change = shift / (wp.i - wm.i);
    wp.c -= change;
    wp.s += shift;
    wm.c += change;
    wp.z += shift;
    wp.m += shift;
  }
  function d3_layout_treeShift(v) {
    var shift = 0, change = 0, children = v.children, i = children.length, w;
    while (--i >= 0) {
      w = children[i];
      w.z += shift;
      w.m += shift;
      shift += w.s + (change += w.c);
    }
  }
  function d3_layout_treeAncestor(vim, v, ancestor) {
    return vim.a.parent === v.parent ? vim.a : ancestor;
  }
  d3.layout.cluster = function() {
    var hierarchy = d3.layout.hierarchy().sort(null).value(null), separation = d3_layout_treeSeparation, size = [ 1, 1 ], nodeSize = false;
    function cluster(d, i) {
      var nodes = hierarchy.call(this, d, i), root = nodes[0], previousNode, x = 0;
      d3_layout_hierarchyVisitAfter(root, function(node) {
        var children = node.children;
        if (children && children.length) {
          node.x = d3_layout_clusterX(children);
          node.y = d3_layout_clusterY(children);
        } else {
          node.x = previousNode ? x += separation(node, previousNode) : 0;
          node.y = 0;
          previousNode = node;
        }
      });
      var left = d3_layout_clusterLeft(root), right = d3_layout_clusterRight(root), x0 = left.x - separation(left, right) / 2, x1 = right.x + separation(right, left) / 2;
      d3_layout_hierarchyVisitAfter(root, nodeSize ? function(node) {
        node.x = (node.x - root.x) * size[0];
        node.y = (root.y - node.y) * size[1];
      } : function(node) {
        node.x = (node.x - x0) / (x1 - x0) * size[0];
        node.y = (1 - (root.y ? node.y / root.y : 1)) * size[1];
      });
      return nodes;
    }
    cluster.separation = function(x) {
      if (!arguments.length) return separation;
      separation = x;
      return cluster;
    };
    cluster.size = function(x) {
      if (!arguments.length) return nodeSize ? null : size;
      nodeSize = (size = x) == null;
      return cluster;
    };
    cluster.nodeSize = function(x) {
      if (!arguments.length) return nodeSize ? size : null;
      nodeSize = (size = x) != null;
      return cluster;
    };
    return d3_layout_hierarchyRebind(cluster, hierarchy);
  };
  function d3_layout_clusterY(children) {
    return 1 + d3.max(children, function(child) {
      return child.y;
    });
  }
  function d3_layout_clusterX(children) {
    return children.reduce(function(x, child) {
      return x + child.x;
    }, 0) / children.length;
  }
  function d3_layout_clusterLeft(node) {
    var children = node.children;
    return children && children.length ? d3_layout_clusterLeft(children[0]) : node;
  }
  function d3_layout_clusterRight(node) {
    var children = node.children, n;
    return children && (n = children.length) ? d3_layout_clusterRight(children[n - 1]) : node;
  }
  d3.layout.treemap = function() {
    var hierarchy = d3.layout.hierarchy(), round = Math.round, size = [ 1, 1 ], padding = null, pad = d3_layout_treemapPadNull, sticky = false, stickies, mode = "squarify", ratio = .5 * (1 + Math.sqrt(5));
    function scale(children, k) {
      var i = -1, n = children.length, child, area;
      while (++i < n) {
        area = (child = children[i]).value * (k < 0 ? 0 : k);
        child.area = isNaN(area) || area <= 0 ? 0 : area;
      }
    }
    function squarify(node) {
      var children = node.children;
      if (children && children.length) {
        var rect = pad(node), row = [], remaining = children.slice(), child, best = Infinity, score, u = mode === "slice" ? rect.dx : mode === "dice" ? rect.dy : mode === "slice-dice" ? node.depth & 1 ? rect.dy : rect.dx : Math.min(rect.dx, rect.dy), n;
        scale(remaining, rect.dx * rect.dy / node.value);
        row.area = 0;
        while ((n = remaining.length) > 0) {
          row.push(child = remaining[n - 1]);
          row.area += child.area;
          if (mode !== "squarify" || (score = worst(row, u)) <= best) {
            remaining.pop();
            best = score;
          } else {
            row.area -= row.pop().area;
            position(row, u, rect, false);
            u = Math.min(rect.dx, rect.dy);
            row.length = row.area = 0;
            best = Infinity;
          }
        }
        if (row.length) {
          position(row, u, rect, true);
          row.length = row.area = 0;
        }
        children.forEach(squarify);
      }
    }
    function stickify(node) {
      var children = node.children;
      if (children && children.length) {
        var rect = pad(node), remaining = children.slice(), child, row = [];
        scale(remaining, rect.dx * rect.dy / node.value);
        row.area = 0;
        while (child = remaining.pop()) {
          row.push(child);
          row.area += child.area;
          if (child.z != null) {
            position(row, child.z ? rect.dx : rect.dy, rect, !remaining.length);
            row.length = row.area = 0;
          }
        }
        children.forEach(stickify);
      }
    }
    function worst(row, u) {
      var s = row.area, r, rmax = 0, rmin = Infinity, i = -1, n = row.length;
      while (++i < n) {
        if (!(r = row[i].area)) continue;
        if (r < rmin) rmin = r;
        if (r > rmax) rmax = r;
      }
      s *= s;
      u *= u;
      return s ? Math.max(u * rmax * ratio / s, s / (u * rmin * ratio)) : Infinity;
    }
    function position(row, u, rect, flush) {
      var i = -1, n = row.length, x = rect.x, y = rect.y, v = u ? round(row.area / u) : 0, o;
      if (u == rect.dx) {
        if (flush || v > rect.dy) v = rect.dy;
        while (++i < n) {
          o = row[i];
          o.x = x;
          o.y = y;
          o.dy = v;
          x += o.dx = Math.min(rect.x + rect.dx - x, v ? round(o.area / v) : 0);
        }
        o.z = true;
        o.dx += rect.x + rect.dx - x;
        rect.y += v;
        rect.dy -= v;
      } else {
        if (flush || v > rect.dx) v = rect.dx;
        while (++i < n) {
          o = row[i];
          o.x = x;
          o.y = y;
          o.dx = v;
          y += o.dy = Math.min(rect.y + rect.dy - y, v ? round(o.area / v) : 0);
        }
        o.z = false;
        o.dy += rect.y + rect.dy - y;
        rect.x += v;
        rect.dx -= v;
      }
    }
    function treemap(d) {
      var nodes = stickies || hierarchy(d), root = nodes[0];
      root.x = 0;
      root.y = 0;
      root.dx = size[0];
      root.dy = size[1];
      if (stickies) hierarchy.revalue(root);
      scale([ root ], root.dx * root.dy / root.value);
      (stickies ? stickify : squarify)(root);
      if (sticky) stickies = nodes;
      return nodes;
    }
    treemap.size = function(x) {
      if (!arguments.length) return size;
      size = x;
      return treemap;
    };
    treemap.padding = function(x) {
      if (!arguments.length) return padding;
      function padFunction(node) {
        var p = x.call(treemap, node, node.depth);
        return p == null ? d3_layout_treemapPadNull(node) : d3_layout_treemapPad(node, typeof p === "number" ? [ p, p, p, p ] : p);
      }
      function padConstant(node) {
        return d3_layout_treemapPad(node, x);
      }
      var type;
      pad = (padding = x) == null ? d3_layout_treemapPadNull : (type = typeof x) === "function" ? padFunction : type === "number" ? (x = [ x, x, x, x ], 
      padConstant) : padConstant;
      return treemap;
    };
    treemap.round = function(x) {
      if (!arguments.length) return round != Number;
      round = x ? Math.round : Number;
      return treemap;
    };
    treemap.sticky = function(x) {
      if (!arguments.length) return sticky;
      sticky = x;
      stickies = null;
      return treemap;
    };
    treemap.ratio = function(x) {
      if (!arguments.length) return ratio;
      ratio = x;
      return treemap;
    };
    treemap.mode = function(x) {
      if (!arguments.length) return mode;
      mode = x + "";
      return treemap;
    };
    return d3_layout_hierarchyRebind(treemap, hierarchy);
  };
  function d3_layout_treemapPadNull(node) {
    return {
      x: node.x,
      y: node.y,
      dx: node.dx,
      dy: node.dy
    };
  }
  function d3_layout_treemapPad(node, padding) {
    var x = node.x + padding[3], y = node.y + padding[0], dx = node.dx - padding[1] - padding[3], dy = node.dy - padding[0] - padding[2];
    if (dx < 0) {
      x += dx / 2;
      dx = 0;
    }
    if (dy < 0) {
      y += dy / 2;
      dy = 0;
    }
    return {
      x: x,
      y: y,
      dx: dx,
      dy: dy
    };
  }
  d3.random = {
    normal: function(µ, σ) {
      var n = arguments.length;
      if (n < 2) σ = 1;
      if (n < 1) µ = 0;
      return function() {
        var x, y, r;
        do {
          x = Math.random() * 2 - 1;
          y = Math.random() * 2 - 1;
          r = x * x + y * y;
        } while (!r || r > 1);
        return µ + σ * x * Math.sqrt(-2 * Math.log(r) / r);
      };
    },
    logNormal: function() {
      var random = d3.random.normal.apply(d3, arguments);
      return function() {
        return Math.exp(random());
      };
    },
    bates: function(m) {
      var random = d3.random.irwinHall(m);
      return function() {
        return random() / m;
      };
    },
    irwinHall: function(m) {
      return function() {
        for (var s = 0, j = 0; j < m; j++) s += Math.random();
        return s;
      };
    }
  };
  d3.scale = {};
  function d3_scaleExtent(domain) {
    var start = domain[0], stop = domain[domain.length - 1];
    return start < stop ? [ start, stop ] : [ stop, start ];
  }
  function d3_scaleRange(scale) {
    return scale.rangeExtent ? scale.rangeExtent() : d3_scaleExtent(scale.range());
  }
  function d3_scale_bilinear(domain, range, uninterpolate, interpolate) {
    var u = uninterpolate(domain[0], domain[1]), i = interpolate(range[0], range[1]);
    return function(x) {
      return i(u(x));
    };
  }
  function d3_scale_nice(domain, nice) {
    var i0 = 0, i1 = domain.length - 1, x0 = domain[i0], x1 = domain[i1], dx;
    if (x1 < x0) {
      dx = i0, i0 = i1, i1 = dx;
      dx = x0, x0 = x1, x1 = dx;
    }
    domain[i0] = nice.floor(x0);
    domain[i1] = nice.ceil(x1);
    return domain;
  }
  function d3_scale_niceStep(step) {
    return step ? {
      floor: function(x) {
        return Math.floor(x / step) * step;
      },
      ceil: function(x) {
        return Math.ceil(x / step) * step;
      }
    } : d3_scale_niceIdentity;
  }
  var d3_scale_niceIdentity = {
    floor: d3_identity,
    ceil: d3_identity
  };
  function d3_scale_polylinear(domain, range, uninterpolate, interpolate) {
    var u = [], i = [], j = 0, k = Math.min(domain.length, range.length) - 1;
    if (domain[k] < domain[0]) {
      domain = domain.slice().reverse();
      range = range.slice().reverse();
    }
    while (++j <= k) {
      u.push(uninterpolate(domain[j - 1], domain[j]));
      i.push(interpolate(range[j - 1], range[j]));
    }
    return function(x) {
      var j = d3.bisect(domain, x, 1, k) - 1;
      return i[j](u[j](x));
    };
  }
  d3.scale.linear = function() {
    return d3_scale_linear([ 0, 1 ], [ 0, 1 ], d3_interpolate, false);
  };
  function d3_scale_linear(domain, range, interpolate, clamp) {
    var output, input;
    function rescale() {
      var linear = Math.min(domain.length, range.length) > 2 ? d3_scale_polylinear : d3_scale_bilinear, uninterpolate = clamp ? d3_uninterpolateClamp : d3_uninterpolateNumber;
      output = linear(domain, range, uninterpolate, interpolate);
      input = linear(range, domain, uninterpolate, d3_interpolate);
      return scale;
    }
    function scale(x) {
      return output(x);
    }
    scale.invert = function(y) {
      return input(y);
    };
    scale.domain = function(x) {
      if (!arguments.length) return domain;
      domain = x.map(Number);
      return rescale();
    };
    scale.range = function(x) {
      if (!arguments.length) return range;
      range = x;
      return rescale();
    };
    scale.rangeRound = function(x) {
      return scale.range(x).interpolate(d3_interpolateRound);
    };
    scale.clamp = function(x) {
      if (!arguments.length) return clamp;
      clamp = x;
      return rescale();
    };
    scale.interpolate = function(x) {
      if (!arguments.length) return interpolate;
      interpolate = x;
      return rescale();
    };
    scale.ticks = function(m) {
      return d3_scale_linearTicks(domain, m);
    };
    scale.tickFormat = function(m, format) {
      return d3_scale_linearTickFormat(domain, m, format);
    };
    scale.nice = function(m) {
      d3_scale_linearNice(domain, m);
      return rescale();
    };
    scale.copy = function() {
      return d3_scale_linear(domain, range, interpolate, clamp);
    };
    return rescale();
  }
  function d3_scale_linearRebind(scale, linear) {
    return d3.rebind(scale, linear, "range", "rangeRound", "interpolate", "clamp");
  }
  function d3_scale_linearNice(domain, m) {
    return d3_scale_nice(domain, d3_scale_niceStep(d3_scale_linearTickRange(domain, m)[2]));
  }
  function d3_scale_linearTickRange(domain, m) {
    if (m == null) m = 10;
    var extent = d3_scaleExtent(domain), span = extent[1] - extent[0], step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10)), err = m / span * step;
    if (err <= .15) step *= 10; else if (err <= .35) step *= 5; else if (err <= .75) step *= 2;
    extent[0] = Math.ceil(extent[0] / step) * step;
    extent[1] = Math.floor(extent[1] / step) * step + step * .5;
    extent[2] = step;
    return extent;
  }
  function d3_scale_linearTicks(domain, m) {
    return d3.range.apply(d3, d3_scale_linearTickRange(domain, m));
  }
  function d3_scale_linearTickFormat(domain, m, format) {
    var range = d3_scale_linearTickRange(domain, m);
    if (format) {
      var match = d3_format_re.exec(format);
      match.shift();
      if (match[8] === "s") {
        var prefix = d3.formatPrefix(Math.max(abs(range[0]), abs(range[1])));
        if (!match[7]) match[7] = "." + d3_scale_linearPrecision(prefix.scale(range[2]));
        match[8] = "f";
        format = d3.format(match.join(""));
        return function(d) {
          return format(prefix.scale(d)) + prefix.symbol;
        };
      }
      if (!match[7]) match[7] = "." + d3_scale_linearFormatPrecision(match[8], range);
      format = match.join("");
    } else {
      format = ",." + d3_scale_linearPrecision(range[2]) + "f";
    }
    return d3.format(format);
  }
  var d3_scale_linearFormatSignificant = {
    s: 1,
    g: 1,
    p: 1,
    r: 1,
    e: 1
  };
  function d3_scale_linearPrecision(value) {
    return -Math.floor(Math.log(value) / Math.LN10 + .01);
  }
  function d3_scale_linearFormatPrecision(type, range) {
    var p = d3_scale_linearPrecision(range[2]);
    return type in d3_scale_linearFormatSignificant ? Math.abs(p - d3_scale_linearPrecision(Math.max(abs(range[0]), abs(range[1])))) + +(type !== "e") : p - (type === "%") * 2;
  }
  d3.scale.log = function() {
    return d3_scale_log(d3.scale.linear().domain([ 0, 1 ]), 10, true, [ 1, 10 ]);
  };
  function d3_scale_log(linear, base, positive, domain) {
    function log(x) {
      return (positive ? Math.log(x < 0 ? 0 : x) : -Math.log(x > 0 ? 0 : -x)) / Math.log(base);
    }
    function pow(x) {
      return positive ? Math.pow(base, x) : -Math.pow(base, -x);
    }
    function scale(x) {
      return linear(log(x));
    }
    scale.invert = function(x) {
      return pow(linear.invert(x));
    };
    scale.domain = function(x) {
      if (!arguments.length) return domain;
      positive = x[0] >= 0;
      linear.domain((domain = x.map(Number)).map(log));
      return scale;
    };
    scale.base = function(_) {
      if (!arguments.length) return base;
      base = +_;
      linear.domain(domain.map(log));
      return scale;
    };
    scale.nice = function() {
      var niced = d3_scale_nice(domain.map(log), positive ? Math : d3_scale_logNiceNegative);
      linear.domain(niced);
      domain = niced.map(pow);
      return scale;
    };
    scale.ticks = function() {
      var extent = d3_scaleExtent(domain), ticks = [], u = extent[0], v = extent[1], i = Math.floor(log(u)), j = Math.ceil(log(v)), n = base % 1 ? 2 : base;
      if (isFinite(j - i)) {
        if (positive) {
          for (;i < j; i++) for (var k = 1; k < n; k++) ticks.push(pow(i) * k);
          ticks.push(pow(i));
        } else {
          ticks.push(pow(i));
          for (;i++ < j; ) for (var k = n - 1; k > 0; k--) ticks.push(pow(i) * k);
        }
        for (i = 0; ticks[i] < u; i++) {}
        for (j = ticks.length; ticks[j - 1] > v; j--) {}
        ticks = ticks.slice(i, j);
      }
      return ticks;
    };
    scale.tickFormat = function(n, format) {
      if (!arguments.length) return d3_scale_logFormat;
      if (arguments.length < 2) format = d3_scale_logFormat; else if (typeof format !== "function") format = d3.format(format);
      var k = Math.max(.1, n / scale.ticks().length), f = positive ? (e = 1e-12, Math.ceil) : (e = -1e-12, 
      Math.floor), e;
      return function(d) {
        return d / pow(f(log(d) + e)) <= k ? format(d) : "";
      };
    };
    scale.copy = function() {
      return d3_scale_log(linear.copy(), base, positive, domain);
    };
    return d3_scale_linearRebind(scale, linear);
  }
  var d3_scale_logFormat = d3.format(".0e"), d3_scale_logNiceNegative = {
    floor: function(x) {
      return -Math.ceil(-x);
    },
    ceil: function(x) {
      return -Math.floor(-x);
    }
  };
  d3.scale.pow = function() {
    return d3_scale_pow(d3.scale.linear(), 1, [ 0, 1 ]);
  };
  function d3_scale_pow(linear, exponent, domain) {
    var powp = d3_scale_powPow(exponent), powb = d3_scale_powPow(1 / exponent);
    function scale(x) {
      return linear(powp(x));
    }
    scale.invert = function(x) {
      return powb(linear.invert(x));
    };
    scale.domain = function(x) {
      if (!arguments.length) return domain;
      linear.domain((domain = x.map(Number)).map(powp));
      return scale;
    };
    scale.ticks = function(m) {
      return d3_scale_linearTicks(domain, m);
    };
    scale.tickFormat = function(m, format) {
      return d3_scale_linearTickFormat(domain, m, format);
    };
    scale.nice = function(m) {
      return scale.domain(d3_scale_linearNice(domain, m));
    };
    scale.exponent = function(x) {
      if (!arguments.length) return exponent;
      powp = d3_scale_powPow(exponent = x);
      powb = d3_scale_powPow(1 / exponent);
      linear.domain(domain.map(powp));
      return scale;
    };
    scale.copy = function() {
      return d3_scale_pow(linear.copy(), exponent, domain);
    };
    return d3_scale_linearRebind(scale, linear);
  }
  function d3_scale_powPow(e) {
    return function(x) {
      return x < 0 ? -Math.pow(-x, e) : Math.pow(x, e);
    };
  }
  d3.scale.sqrt = function() {
    return d3.scale.pow().exponent(.5);
  };
  d3.scale.ordinal = function() {
    return d3_scale_ordinal([], {
      t: "range",
      a: [ [] ]
    });
  };
  function d3_scale_ordinal(domain, ranger) {
    var index, range, rangeBand;
    function scale(x) {
      return range[((index.get(x) || (ranger.t === "range" ? index.set(x, domain.push(x)) : NaN)) - 1) % range.length];
    }
    function steps(start, step) {
      return d3.range(domain.length).map(function(i) {
        return start + step * i;
      });
    }
    scale.domain = function(x) {
      if (!arguments.length) return domain;
      domain = [];
      index = new d3_Map();
      var i = -1, n = x.length, xi;
      while (++i < n) if (!index.has(xi = x[i])) index.set(xi, domain.push(xi));
      return scale[ranger.t].apply(scale, ranger.a);
    };
    scale.range = function(x) {
      if (!arguments.length) return range;
      range = x;
      rangeBand = 0;
      ranger = {
        t: "range",
        a: arguments
      };
      return scale;
    };
    scale.rangePoints = function(x, padding) {
      if (arguments.length < 2) padding = 0;
      var start = x[0], stop = x[1], step = domain.length < 2 ? (start = (start + stop) / 2, 
      0) : (stop - start) / (domain.length - 1 + padding);
      range = steps(start + step * padding / 2, step);
      rangeBand = 0;
      ranger = {
        t: "rangePoints",
        a: arguments
      };
      return scale;
    };
    scale.rangeRoundPoints = function(x, padding) {
      if (arguments.length < 2) padding = 0;
      var start = x[0], stop = x[1], step = domain.length < 2 ? (start = stop = Math.round((start + stop) / 2), 
      0) : (stop - start) / (domain.length - 1 + padding) | 0;
      range = steps(start + Math.round(step * padding / 2 + (stop - start - (domain.length - 1 + padding) * step) / 2), step);
      rangeBand = 0;
      ranger = {
        t: "rangeRoundPoints",
        a: arguments
      };
      return scale;
    };
    scale.rangeBands = function(x, padding, outerPadding) {
      if (arguments.length < 2) padding = 0;
      if (arguments.length < 3) outerPadding = padding;
      var reverse = x[1] < x[0], start = x[reverse - 0], stop = x[1 - reverse], step = (stop - start) / (domain.length - padding + 2 * outerPadding);
      range = steps(start + step * outerPadding, step);
      if (reverse) range.reverse();
      rangeBand = step * (1 - padding);
      ranger = {
        t: "rangeBands",
        a: arguments
      };
      return scale;
    };
    scale.rangeRoundBands = function(x, padding, outerPadding) {
      if (arguments.length < 2) padding = 0;
      if (arguments.length < 3) outerPadding = padding;
      var reverse = x[1] < x[0], start = x[reverse - 0], stop = x[1 - reverse], step = Math.floor((stop - start) / (domain.length - padding + 2 * outerPadding));
      range = steps(start + Math.round((stop - start - (domain.length - padding) * step) / 2), step);
      if (reverse) range.reverse();
      rangeBand = Math.round(step * (1 - padding));
      ranger = {
        t: "rangeRoundBands",
        a: arguments
      };
      return scale;
    };
    scale.rangeBand = function() {
      return rangeBand;
    };
    scale.rangeExtent = function() {
      return d3_scaleExtent(ranger.a[0]);
    };
    scale.copy = function() {
      return d3_scale_ordinal(domain, ranger);
    };
    return scale.domain(domain);
  }
  d3.scale.category10 = function() {
    return d3.scale.ordinal().range(d3_category10);
  };
  d3.scale.category20 = function() {
    return d3.scale.ordinal().range(d3_category20);
  };
  d3.scale.category20b = function() {
    return d3.scale.ordinal().range(d3_category20b);
  };
  d3.scale.category20c = function() {
    return d3.scale.ordinal().range(d3_category20c);
  };
  var d3_category10 = [ 2062260, 16744206, 2924588, 14034728, 9725885, 9197131, 14907330, 8355711, 12369186, 1556175 ].map(d3_rgbString);
  var d3_category20 = [ 2062260, 11454440, 16744206, 16759672, 2924588, 10018698, 14034728, 16750742, 9725885, 12955861, 9197131, 12885140, 14907330, 16234194, 8355711, 13092807, 12369186, 14408589, 1556175, 10410725 ].map(d3_rgbString);
  var d3_category20b = [ 3750777, 5395619, 7040719, 10264286, 6519097, 9216594, 11915115, 13556636, 9202993, 12426809, 15186514, 15190932, 8666169, 11356490, 14049643, 15177372, 8077683, 10834324, 13528509, 14589654 ].map(d3_rgbString);
  var d3_category20c = [ 3244733, 7057110, 10406625, 13032431, 15095053, 16616764, 16625259, 16634018, 3253076, 7652470, 10607003, 13101504, 7695281, 10394312, 12369372, 14342891, 6513507, 9868950, 12434877, 14277081 ].map(d3_rgbString);
  d3.scale.quantile = function() {
    return d3_scale_quantile([], []);
  };
  function d3_scale_quantile(domain, range) {
    var thresholds;
    function rescale() {
      var k = 0, q = range.length;
      thresholds = [];
      while (++k < q) thresholds[k - 1] = d3.quantile(domain, k / q);
      return scale;
    }
    function scale(x) {
      if (!isNaN(x = +x)) return range[d3.bisect(thresholds, x)];
    }
    scale.domain = function(x) {
      if (!arguments.length) return domain;
      domain = x.map(d3_number).filter(d3_numeric).sort(d3_ascending);
      return rescale();
    };
    scale.range = function(x) {
      if (!arguments.length) return range;
      range = x;
      return rescale();
    };
    scale.quantiles = function() {
      return thresholds;
    };
    scale.invertExtent = function(y) {
      y = range.indexOf(y);
      return y < 0 ? [ NaN, NaN ] : [ y > 0 ? thresholds[y - 1] : domain[0], y < thresholds.length ? thresholds[y] : domain[domain.length - 1] ];
    };
    scale.copy = function() {
      return d3_scale_quantile(domain, range);
    };
    return rescale();
  }
  d3.scale.quantize = function() {
    return d3_scale_quantize(0, 1, [ 0, 1 ]);
  };
  function d3_scale_quantize(x0, x1, range) {
    var kx, i;
    function scale(x) {
      return range[Math.max(0, Math.min(i, Math.floor(kx * (x - x0))))];
    }
    function rescale() {
      kx = range.length / (x1 - x0);
      i = range.length - 1;
      return scale;
    }
    scale.domain = function(x) {
      if (!arguments.length) return [ x0, x1 ];
      x0 = +x[0];
      x1 = +x[x.length - 1];
      return rescale();
    };
    scale.range = function(x) {
      if (!arguments.length) return range;
      range = x;
      return rescale();
    };
    scale.invertExtent = function(y) {
      y = range.indexOf(y);
      y = y < 0 ? NaN : y / kx + x0;
      return [ y, y + 1 / kx ];
    };
    scale.copy = function() {
      return d3_scale_quantize(x0, x1, range);
    };
    return rescale();
  }
  d3.scale.threshold = function() {
    return d3_scale_threshold([ .5 ], [ 0, 1 ]);
  };
  function d3_scale_threshold(domain, range) {
    function scale(x) {
      if (x <= x) return range[d3.bisect(domain, x)];
    }
    scale.domain = function(_) {
      if (!arguments.length) return domain;
      domain = _;
      return scale;
    };
    scale.range = function(_) {
      if (!arguments.length) return range;
      range = _;
      return scale;
    };
    scale.invertExtent = function(y) {
      y = range.indexOf(y);
      return [ domain[y - 1], domain[y] ];
    };
    scale.copy = function() {
      return d3_scale_threshold(domain, range);
    };
    return scale;
  }
  d3.scale.identity = function() {
    return d3_scale_identity([ 0, 1 ]);
  };
  function d3_scale_identity(domain) {
    function identity(x) {
      return +x;
    }
    identity.invert = identity;
    identity.domain = identity.range = function(x) {
      if (!arguments.length) return domain;
      domain = x.map(identity);
      return identity;
    };
    identity.ticks = function(m) {
      return d3_scale_linearTicks(domain, m);
    };
    identity.tickFormat = function(m, format) {
      return d3_scale_linearTickFormat(domain, m, format);
    };
    identity.copy = function() {
      return d3_scale_identity(domain);
    };
    return identity;
  }
  d3.svg = {};
  function d3_zero() {
    return 0;
  }
  d3.svg.arc = function() {
    var innerRadius = d3_svg_arcInnerRadius, outerRadius = d3_svg_arcOuterRadius, cornerRadius = d3_zero, padRadius = d3_svg_arcAuto, startAngle = d3_svg_arcStartAngle, endAngle = d3_svg_arcEndAngle, padAngle = d3_svg_arcPadAngle;
    function arc() {
      var r0 = Math.max(0, +innerRadius.apply(this, arguments)), r1 = Math.max(0, +outerRadius.apply(this, arguments)), a0 = startAngle.apply(this, arguments) - halfπ, a1 = endAngle.apply(this, arguments) - halfπ, da = Math.abs(a1 - a0), cw = a0 > a1 ? 0 : 1;
      if (r1 < r0) rc = r1, r1 = r0, r0 = rc;
      if (da >= τε) return circleSegment(r1, cw) + (r0 ? circleSegment(r0, 1 - cw) : "") + "Z";
      var rc, cr, rp, ap, p0 = 0, p1 = 0, x0, y0, x1, y1, x2, y2, x3, y3, path = [];
      if (ap = (+padAngle.apply(this, arguments) || 0) / 2) {
        rp = padRadius === d3_svg_arcAuto ? Math.sqrt(r0 * r0 + r1 * r1) : +padRadius.apply(this, arguments);
        if (!cw) p1 *= -1;
        if (r1) p1 = d3_asin(rp / r1 * Math.sin(ap));
        if (r0) p0 = d3_asin(rp / r0 * Math.sin(ap));
      }
      if (r1) {
        x0 = r1 * Math.cos(a0 + p1);
        y0 = r1 * Math.sin(a0 + p1);
        x1 = r1 * Math.cos(a1 - p1);
        y1 = r1 * Math.sin(a1 - p1);
        var l1 = Math.abs(a1 - a0 - 2 * p1) <= π ? 0 : 1;
        if (p1 && d3_svg_arcSweep(x0, y0, x1, y1) === cw ^ l1) {
          var h1 = (a0 + a1) / 2;
          x0 = r1 * Math.cos(h1);
          y0 = r1 * Math.sin(h1);
          x1 = y1 = null;
        }
      } else {
        x0 = y0 = 0;
      }
      if (r0) {
        x2 = r0 * Math.cos(a1 - p0);
        y2 = r0 * Math.sin(a1 - p0);
        x3 = r0 * Math.cos(a0 + p0);
        y3 = r0 * Math.sin(a0 + p0);
        var l0 = Math.abs(a0 - a1 + 2 * p0) <= π ? 0 : 1;
        if (p0 && d3_svg_arcSweep(x2, y2, x3, y3) === 1 - cw ^ l0) {
          var h0 = (a0 + a1) / 2;
          x2 = r0 * Math.cos(h0);
          y2 = r0 * Math.sin(h0);
          x3 = y3 = null;
        }
      } else {
        x2 = y2 = 0;
      }
      if ((rc = Math.min(Math.abs(r1 - r0) / 2, +cornerRadius.apply(this, arguments))) > .001) {
        cr = r0 < r1 ^ cw ? 0 : 1;
        var oc = x3 == null ? [ x2, y2 ] : x1 == null ? [ x0, y0 ] : d3_geom_polygonIntersect([ x0, y0 ], [ x3, y3 ], [ x1, y1 ], [ x2, y2 ]), ax = x0 - oc[0], ay = y0 - oc[1], bx = x1 - oc[0], by = y1 - oc[1], kc = 1 / Math.sin(Math.acos((ax * bx + ay * by) / (Math.sqrt(ax * ax + ay * ay) * Math.sqrt(bx * bx + by * by))) / 2), lc = Math.sqrt(oc[0] * oc[0] + oc[1] * oc[1]);
        if (x1 != null) {
          var rc1 = Math.min(rc, (r1 - lc) / (kc + 1)), t30 = d3_svg_arcCornerTangents(x3 == null ? [ x2, y2 ] : [ x3, y3 ], [ x0, y0 ], r1, rc1, cw), t12 = d3_svg_arcCornerTangents([ x1, y1 ], [ x2, y2 ], r1, rc1, cw);
          if (rc === rc1) {
            path.push("M", t30[0], "A", rc1, ",", rc1, " 0 0,", cr, " ", t30[1], "A", r1, ",", r1, " 0 ", 1 - cw ^ d3_svg_arcSweep(t30[1][0], t30[1][1], t12[1][0], t12[1][1]), ",", cw, " ", t12[1], "A", rc1, ",", rc1, " 0 0,", cr, " ", t12[0]);
          } else {
            path.push("M", t30[0], "A", rc1, ",", rc1, " 0 1,", cr, " ", t12[0]);
          }
        } else {
          path.push("M", x0, ",", y0);
        }
        if (x3 != null) {
          var rc0 = Math.min(rc, (r0 - lc) / (kc - 1)), t03 = d3_svg_arcCornerTangents([ x0, y0 ], [ x3, y3 ], r0, -rc0, cw), t21 = d3_svg_arcCornerTangents([ x2, y2 ], x1 == null ? [ x0, y0 ] : [ x1, y1 ], r0, -rc0, cw);
          if (rc === rc0) {
            path.push("L", t21[0], "A", rc0, ",", rc0, " 0 0,", cr, " ", t21[1], "A", r0, ",", r0, " 0 ", cw ^ d3_svg_arcSweep(t21[1][0], t21[1][1], t03[1][0], t03[1][1]), ",", 1 - cw, " ", t03[1], "A", rc0, ",", rc0, " 0 0,", cr, " ", t03[0]);
          } else {
            path.push("L", t21[0], "A", rc0, ",", rc0, " 0 0,", cr, " ", t03[0]);
          }
        } else {
          path.push("L", x2, ",", y2);
        }
      } else {
        path.push("M", x0, ",", y0);
        if (x1 != null) path.push("A", r1, ",", r1, " 0 ", l1, ",", cw, " ", x1, ",", y1);
        path.push("L", x2, ",", y2);
        if (x3 != null) path.push("A", r0, ",", r0, " 0 ", l0, ",", 1 - cw, " ", x3, ",", y3);
      }
      path.push("Z");
      return path.join("");
    }
    function circleSegment(r1, cw) {
      return "M0," + r1 + "A" + r1 + "," + r1 + " 0 1," + cw + " 0," + -r1 + "A" + r1 + "," + r1 + " 0 1," + cw + " 0," + r1;
    }
    arc.innerRadius = function(v) {
      if (!arguments.length) return innerRadius;
      innerRadius = d3_functor(v);
      return arc;
    };
    arc.outerRadius = function(v) {
      if (!arguments.length) return outerRadius;
      outerRadius = d3_functor(v);
      return arc;
    };
    arc.cornerRadius = function(v) {
      if (!arguments.length) return cornerRadius;
      cornerRadius = d3_functor(v);
      return arc;
    };
    arc.padRadius = function(v) {
      if (!arguments.length) return padRadius;
      padRadius = v == d3_svg_arcAuto ? d3_svg_arcAuto : d3_functor(v);
      return arc;
    };
    arc.startAngle = function(v) {
      if (!arguments.length) return startAngle;
      startAngle = d3_functor(v);
      return arc;
    };
    arc.endAngle = function(v) {
      if (!arguments.length) return endAngle;
      endAngle = d3_functor(v);
      return arc;
    };
    arc.padAngle = function(v) {
      if (!arguments.length) return padAngle;
      padAngle = d3_functor(v);
      return arc;
    };
    arc.centroid = function() {
      var r = (+innerRadius.apply(this, arguments) + +outerRadius.apply(this, arguments)) / 2, a = (+startAngle.apply(this, arguments) + +endAngle.apply(this, arguments)) / 2 - halfπ;
      return [ Math.cos(a) * r, Math.sin(a) * r ];
    };
    return arc;
  };
  var d3_svg_arcAuto = "auto";
  function d3_svg_arcInnerRadius(d) {
    return d.innerRadius;
  }
  function d3_svg_arcOuterRadius(d) {
    return d.outerRadius;
  }
  function d3_svg_arcStartAngle(d) {
    return d.startAngle;
  }
  function d3_svg_arcEndAngle(d) {
    return d.endAngle;
  }
  function d3_svg_arcPadAngle(d) {
    return d && d.padAngle;
  }
  function d3_svg_arcSweep(x0, y0, x1, y1) {
    return (x0 - x1) * y0 - (y0 - y1) * x0 > 0 ? 0 : 1;
  }
  function d3_svg_arcCornerTangents(p0, p1, r1, rc, cw) {
    var x01 = p0[0] - p1[0], y01 = p0[1] - p1[1], lo = (cw ? rc : -rc) / Math.sqrt(x01 * x01 + y01 * y01), ox = lo * y01, oy = -lo * x01, x1 = p0[0] + ox, y1 = p0[1] + oy, x2 = p1[0] + ox, y2 = p1[1] + oy, x3 = (x1 + x2) / 2, y3 = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, d2 = dx * dx + dy * dy, r = r1 - rc, D = x1 * y2 - x2 * y1, d = (dy < 0 ? -1 : 1) * Math.sqrt(r * r * d2 - D * D), cx0 = (D * dy - dx * d) / d2, cy0 = (-D * dx - dy * d) / d2, cx1 = (D * dy + dx * d) / d2, cy1 = (-D * dx + dy * d) / d2, dx0 = cx0 - x3, dy0 = cy0 - y3, dx1 = cx1 - x3, dy1 = cy1 - y3;
    if (dx0 * dx0 + dy0 * dy0 > dx1 * dx1 + dy1 * dy1) cx0 = cx1, cy0 = cy1;
    return [ [ cx0 - ox, cy0 - oy ], [ cx0 * r1 / r, cy0 * r1 / r ] ];
  }
  function d3_svg_line(projection) {
    var x = d3_geom_pointX, y = d3_geom_pointY, defined = d3_true, interpolate = d3_svg_lineLinear, interpolateKey = interpolate.key, tension = .7;
    function line(data) {
      var segments = [], points = [], i = -1, n = data.length, d, fx = d3_functor(x), fy = d3_functor(y);
      function segment() {
        segments.push("M", interpolate(projection(points), tension));
      }
      while (++i < n) {
        if (defined.call(this, d = data[i], i)) {
          points.push([ +fx.call(this, d, i), +fy.call(this, d, i) ]);
        } else if (points.length) {
          segment();
          points = [];
        }
      }
      if (points.length) segment();
      return segments.length ? segments.join("") : null;
    }
    line.x = function(_) {
      if (!arguments.length) return x;
      x = _;
      return line;
    };
    line.y = function(_) {
      if (!arguments.length) return y;
      y = _;
      return line;
    };
    line.defined = function(_) {
      if (!arguments.length) return defined;
      defined = _;
      return line;
    };
    line.interpolate = function(_) {
      if (!arguments.length) return interpolateKey;
      if (typeof _ === "function") interpolateKey = interpolate = _; else interpolateKey = (interpolate = d3_svg_lineInterpolators.get(_) || d3_svg_lineLinear).key;
      return line;
    };
    line.tension = function(_) {
      if (!arguments.length) return tension;
      tension = _;
      return line;
    };
    return line;
  }
  d3.svg.line = function() {
    return d3_svg_line(d3_identity);
  };
  var d3_svg_lineInterpolators = d3.map({
    linear: d3_svg_lineLinear,
    "linear-closed": d3_svg_lineLinearClosed,
    step: d3_svg_lineStep,
    "step-before": d3_svg_lineStepBefore,
    "step-after": d3_svg_lineStepAfter,
    basis: d3_svg_lineBasis,
    "basis-open": d3_svg_lineBasisOpen,
    "basis-closed": d3_svg_lineBasisClosed,
    bundle: d3_svg_lineBundle,
    cardinal: d3_svg_lineCardinal,
    "cardinal-open": d3_svg_lineCardinalOpen,
    "cardinal-closed": d3_svg_lineCardinalClosed,
    monotone: d3_svg_lineMonotone
  });
  d3_svg_lineInterpolators.forEach(function(key, value) {
    value.key = key;
    value.closed = /-closed$/.test(key);
  });
  function d3_svg_lineLinear(points) {
    return points.join("L");
  }
  function d3_svg_lineLinearClosed(points) {
    return d3_svg_lineLinear(points) + "Z";
  }
  function d3_svg_lineStep(points) {
    var i = 0, n = points.length, p = points[0], path = [ p[0], ",", p[1] ];
    while (++i < n) path.push("H", (p[0] + (p = points[i])[0]) / 2, "V", p[1]);
    if (n > 1) path.push("H", p[0]);
    return path.join("");
  }
  function d3_svg_lineStepBefore(points) {
    var i = 0, n = points.length, p = points[0], path = [ p[0], ",", p[1] ];
    while (++i < n) path.push("V", (p = points[i])[1], "H", p[0]);
    return path.join("");
  }
  function d3_svg_lineStepAfter(points) {
    var i = 0, n = points.length, p = points[0], path = [ p[0], ",", p[1] ];
    while (++i < n) path.push("H", (p = points[i])[0], "V", p[1]);
    return path.join("");
  }
  function d3_svg_lineCardinalOpen(points, tension) {
    return points.length < 4 ? d3_svg_lineLinear(points) : points[1] + d3_svg_lineHermite(points.slice(1, -1), d3_svg_lineCardinalTangents(points, tension));
  }
  function d3_svg_lineCardinalClosed(points, tension) {
    return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite((points.push(points[0]), 
    points), d3_svg_lineCardinalTangents([ points[points.length - 2] ].concat(points, [ points[1] ]), tension));
  }
  function d3_svg_lineCardinal(points, tension) {
    return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite(points, d3_svg_lineCardinalTangents(points, tension));
  }
  function d3_svg_lineHermite(points, tangents) {
    if (tangents.length < 1 || points.length != tangents.length && points.length != tangents.length + 2) {
      return d3_svg_lineLinear(points);
    }
    var quad = points.length != tangents.length, path = "", p0 = points[0], p = points[1], t0 = tangents[0], t = t0, pi = 1;
    if (quad) {
      path += "Q" + (p[0] - t0[0] * 2 / 3) + "," + (p[1] - t0[1] * 2 / 3) + "," + p[0] + "," + p[1];
      p0 = points[1];
      pi = 2;
    }
    if (tangents.length > 1) {
      t = tangents[1];
      p = points[pi];
      pi++;
      path += "C" + (p0[0] + t0[0]) + "," + (p0[1] + t0[1]) + "," + (p[0] - t[0]) + "," + (p[1] - t[1]) + "," + p[0] + "," + p[1];
      for (var i = 2; i < tangents.length; i++, pi++) {
        p = points[pi];
        t = tangents[i];
        path += "S" + (p[0] - t[0]) + "," + (p[1] - t[1]) + "," + p[0] + "," + p[1];
      }
    }
    if (quad) {
      var lp = points[pi];
      path += "Q" + (p[0] + t[0] * 2 / 3) + "," + (p[1] + t[1] * 2 / 3) + "," + lp[0] + "," + lp[1];
    }
    return path;
  }
  function d3_svg_lineCardinalTangents(points, tension) {
    var tangents = [], a = (1 - tension) / 2, p0, p1 = points[0], p2 = points[1], i = 1, n = points.length;
    while (++i < n) {
      p0 = p1;
      p1 = p2;
      p2 = points[i];
      tangents.push([ a * (p2[0] - p0[0]), a * (p2[1] - p0[1]) ]);
    }
    return tangents;
  }
  function d3_svg_lineBasis(points) {
    if (points.length < 3) return d3_svg_lineLinear(points);
    var i = 1, n = points.length, pi = points[0], x0 = pi[0], y0 = pi[1], px = [ x0, x0, x0, (pi = points[1])[0] ], py = [ y0, y0, y0, pi[1] ], path = [ x0, ",", y0, "L", d3_svg_lineDot4(d3_svg_lineBasisBezier3, px), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, py) ];
    points.push(points[n - 1]);
    while (++i <= n) {
      pi = points[i];
      px.shift();
      px.push(pi[0]);
      py.shift();
      py.push(pi[1]);
      d3_svg_lineBasisBezier(path, px, py);
    }
    points.pop();
    path.push("L", pi);
    return path.join("");
  }
  function d3_svg_lineBasisOpen(points) {
    if (points.length < 4) return d3_svg_lineLinear(points);
    var path = [], i = -1, n = points.length, pi, px = [ 0 ], py = [ 0 ];
    while (++i < 3) {
      pi = points[i];
      px.push(pi[0]);
      py.push(pi[1]);
    }
    path.push(d3_svg_lineDot4(d3_svg_lineBasisBezier3, px) + "," + d3_svg_lineDot4(d3_svg_lineBasisBezier3, py));
    --i;
    while (++i < n) {
      pi = points[i];
      px.shift();
      px.push(pi[0]);
      py.shift();
      py.push(pi[1]);
      d3_svg_lineBasisBezier(path, px, py);
    }
    return path.join("");
  }
  function d3_svg_lineBasisClosed(points) {
    var path, i = -1, n = points.length, m = n + 4, pi, px = [], py = [];
    while (++i < 4) {
      pi = points[i % n];
      px.push(pi[0]);
      py.push(pi[1]);
    }
    path = [ d3_svg_lineDot4(d3_svg_lineBasisBezier3, px), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, py) ];
    --i;
    while (++i < m) {
      pi = points[i % n];
      px.shift();
      px.push(pi[0]);
      py.shift();
      py.push(pi[1]);
      d3_svg_lineBasisBezier(path, px, py);
    }
    return path.join("");
  }
  function d3_svg_lineBundle(points, tension) {
    var n = points.length - 1;
    if (n) {
      var x0 = points[0][0], y0 = points[0][1], dx = points[n][0] - x0, dy = points[n][1] - y0, i = -1, p, t;
      while (++i <= n) {
        p = points[i];
        t = i / n;
        p[0] = tension * p[0] + (1 - tension) * (x0 + t * dx);
        p[1] = tension * p[1] + (1 - tension) * (y0 + t * dy);
      }
    }
    return d3_svg_lineBasis(points);
  }
  function d3_svg_lineDot4(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  }
  var d3_svg_lineBasisBezier1 = [ 0, 2 / 3, 1 / 3, 0 ], d3_svg_lineBasisBezier2 = [ 0, 1 / 3, 2 / 3, 0 ], d3_svg_lineBasisBezier3 = [ 0, 1 / 6, 2 / 3, 1 / 6 ];
  function d3_svg_lineBasisBezier(path, x, y) {
    path.push("C", d3_svg_lineDot4(d3_svg_lineBasisBezier1, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier1, y), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier2, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier2, y), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, y));
  }
  function d3_svg_lineSlope(p0, p1) {
    return (p1[1] - p0[1]) / (p1[0] - p0[0]);
  }
  function d3_svg_lineFiniteDifferences(points) {
    var i = 0, j = points.length - 1, m = [], p0 = points[0], p1 = points[1], d = m[0] = d3_svg_lineSlope(p0, p1);
    while (++i < j) {
      m[i] = (d + (d = d3_svg_lineSlope(p0 = p1, p1 = points[i + 1]))) / 2;
    }
    m[i] = d;
    return m;
  }
  function d3_svg_lineMonotoneTangents(points) {
    var tangents = [], d, a, b, s, m = d3_svg_lineFiniteDifferences(points), i = -1, j = points.length - 1;
    while (++i < j) {
      d = d3_svg_lineSlope(points[i], points[i + 1]);
      if (abs(d) < ε) {
        m[i] = m[i + 1] = 0;
      } else {
        a = m[i] / d;
        b = m[i + 1] / d;
        s = a * a + b * b;
        if (s > 9) {
          s = d * 3 / Math.sqrt(s);
          m[i] = s * a;
          m[i + 1] = s * b;
        }
      }
    }
    i = -1;
    while (++i <= j) {
      s = (points[Math.min(j, i + 1)][0] - points[Math.max(0, i - 1)][0]) / (6 * (1 + m[i] * m[i]));
      tangents.push([ s || 0, m[i] * s || 0 ]);
    }
    return tangents;
  }
  function d3_svg_lineMonotone(points) {
    return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite(points, d3_svg_lineMonotoneTangents(points));
  }
  d3.svg.line.radial = function() {
    var line = d3_svg_line(d3_svg_lineRadial);
    line.radius = line.x, delete line.x;
    line.angle = line.y, delete line.y;
    return line;
  };
  function d3_svg_lineRadial(points) {
    var point, i = -1, n = points.length, r, a;
    while (++i < n) {
      point = points[i];
      r = point[0];
      a = point[1] - halfπ;
      point[0] = r * Math.cos(a);
      point[1] = r * Math.sin(a);
    }
    return points;
  }
  function d3_svg_area(projection) {
    var x0 = d3_geom_pointX, x1 = d3_geom_pointX, y0 = 0, y1 = d3_geom_pointY, defined = d3_true, interpolate = d3_svg_lineLinear, interpolateKey = interpolate.key, interpolateReverse = interpolate, L = "L", tension = .7;
    function area(data) {
      var segments = [], points0 = [], points1 = [], i = -1, n = data.length, d, fx0 = d3_functor(x0), fy0 = d3_functor(y0), fx1 = x0 === x1 ? function() {
        return x;
      } : d3_functor(x1), fy1 = y0 === y1 ? function() {
        return y;
      } : d3_functor(y1), x, y;
      function segment() {
        segments.push("M", interpolate(projection(points1), tension), L, interpolateReverse(projection(points0.reverse()), tension), "Z");
      }
      while (++i < n) {
        if (defined.call(this, d = data[i], i)) {
          points0.push([ x = +fx0.call(this, d, i), y = +fy0.call(this, d, i) ]);
          points1.push([ +fx1.call(this, d, i), +fy1.call(this, d, i) ]);
        } else if (points0.length) {
          segment();
          points0 = [];
          points1 = [];
        }
      }
      if (points0.length) segment();
      return segments.length ? segments.join("") : null;
    }
    area.x = function(_) {
      if (!arguments.length) return x1;
      x0 = x1 = _;
      return area;
    };
    area.x0 = function(_) {
      if (!arguments.length) return x0;
      x0 = _;
      return area;
    };
    area.x1 = function(_) {
      if (!arguments.length) return x1;
      x1 = _;
      return area;
    };
    area.y = function(_) {
      if (!arguments.length) return y1;
      y0 = y1 = _;
      return area;
    };
    area.y0 = function(_) {
      if (!arguments.length) return y0;
      y0 = _;
      return area;
    };
    area.y1 = function(_) {
      if (!arguments.length) return y1;
      y1 = _;
      return area;
    };
    area.defined = function(_) {
      if (!arguments.length) return defined;
      defined = _;
      return area;
    };
    area.interpolate = function(_) {
      if (!arguments.length) return interpolateKey;
      if (typeof _ === "function") interpolateKey = interpolate = _; else interpolateKey = (interpolate = d3_svg_lineInterpolators.get(_) || d3_svg_lineLinear).key;
      interpolateReverse = interpolate.reverse || interpolate;
      L = interpolate.closed ? "M" : "L";
      return area;
    };
    area.tension = function(_) {
      if (!arguments.length) return tension;
      tension = _;
      return area;
    };
    return area;
  }
  d3_svg_lineStepBefore.reverse = d3_svg_lineStepAfter;
  d3_svg_lineStepAfter.reverse = d3_svg_lineStepBefore;
  d3.svg.area = function() {
    return d3_svg_area(d3_identity);
  };
  d3.svg.area.radial = function() {
    var area = d3_svg_area(d3_svg_lineRadial);
    area.radius = area.x, delete area.x;
    area.innerRadius = area.x0, delete area.x0;
    area.outerRadius = area.x1, delete area.x1;
    area.angle = area.y, delete area.y;
    area.startAngle = area.y0, delete area.y0;
    area.endAngle = area.y1, delete area.y1;
    return area;
  };
  d3.svg.chord = function() {
    var source = d3_source, target = d3_target, radius = d3_svg_chordRadius, startAngle = d3_svg_arcStartAngle, endAngle = d3_svg_arcEndAngle;
    function chord(d, i) {
      var s = subgroup(this, source, d, i), t = subgroup(this, target, d, i);
      return "M" + s.p0 + arc(s.r, s.p1, s.a1 - s.a0) + (equals(s, t) ? curve(s.r, s.p1, s.r, s.p0) : curve(s.r, s.p1, t.r, t.p0) + arc(t.r, t.p1, t.a1 - t.a0) + curve(t.r, t.p1, s.r, s.p0)) + "Z";
    }
    function subgroup(self, f, d, i) {
      var subgroup = f.call(self, d, i), r = radius.call(self, subgroup, i), a0 = startAngle.call(self, subgroup, i) - halfπ, a1 = endAngle.call(self, subgroup, i) - halfπ;
      return {
        r: r,
        a0: a0,
        a1: a1,
        p0: [ r * Math.cos(a0), r * Math.sin(a0) ],
        p1: [ r * Math.cos(a1), r * Math.sin(a1) ]
      };
    }
    function equals(a, b) {
      return a.a0 == b.a0 && a.a1 == b.a1;
    }
    function arc(r, p, a) {
      return "A" + r + "," + r + " 0 " + +(a > π) + ",1 " + p;
    }
    function curve(r0, p0, r1, p1) {
      return "Q 0,0 " + p1;
    }
    chord.radius = function(v) {
      if (!arguments.length) return radius;
      radius = d3_functor(v);
      return chord;
    };
    chord.source = function(v) {
      if (!arguments.length) return source;
      source = d3_functor(v);
      return chord;
    };
    chord.target = function(v) {
      if (!arguments.length) return target;
      target = d3_functor(v);
      return chord;
    };
    chord.startAngle = function(v) {
      if (!arguments.length) return startAngle;
      startAngle = d3_functor(v);
      return chord;
    };
    chord.endAngle = function(v) {
      if (!arguments.length) return endAngle;
      endAngle = d3_functor(v);
      return chord;
    };
    return chord;
  };
  function d3_svg_chordRadius(d) {
    return d.radius;
  }
  d3.svg.diagonal = function() {
    var source = d3_source, target = d3_target, projection = d3_svg_diagonalProjection;
    function diagonal(d, i) {
      var p0 = source.call(this, d, i), p3 = target.call(this, d, i), m = (p0.y + p3.y) / 2, p = [ p0, {
        x: p0.x,
        y: m
      }, {
        x: p3.x,
        y: m
      }, p3 ];
      p = p.map(projection);
      return "M" + p[0] + "C" + p[1] + " " + p[2] + " " + p[3];
    }
    diagonal.source = function(x) {
      if (!arguments.length) return source;
      source = d3_functor(x);
      return diagonal;
    };
    diagonal.target = function(x) {
      if (!arguments.length) return target;
      target = d3_functor(x);
      return diagonal;
    };
    diagonal.projection = function(x) {
      if (!arguments.length) return projection;
      projection = x;
      return diagonal;
    };
    return diagonal;
  };
  function d3_svg_diagonalProjection(d) {
    return [ d.x, d.y ];
  }
  d3.svg.diagonal.radial = function() {
    var diagonal = d3.svg.diagonal(), projection = d3_svg_diagonalProjection, projection_ = diagonal.projection;
    diagonal.projection = function(x) {
      return arguments.length ? projection_(d3_svg_diagonalRadialProjection(projection = x)) : projection;
    };
    return diagonal;
  };
  function d3_svg_diagonalRadialProjection(projection) {
    return function() {
      var d = projection.apply(this, arguments), r = d[0], a = d[1] - halfπ;
      return [ r * Math.cos(a), r * Math.sin(a) ];
    };
  }
  d3.svg.symbol = function() {
    var type = d3_svg_symbolType, size = d3_svg_symbolSize;
    function symbol(d, i) {
      return (d3_svg_symbols.get(type.call(this, d, i)) || d3_svg_symbolCircle)(size.call(this, d, i));
    }
    symbol.type = function(x) {
      if (!arguments.length) return type;
      type = d3_functor(x);
      return symbol;
    };
    symbol.size = function(x) {
      if (!arguments.length) return size;
      size = d3_functor(x);
      return symbol;
    };
    return symbol;
  };
  function d3_svg_symbolSize() {
    return 64;
  }
  function d3_svg_symbolType() {
    return "circle";
  }
  function d3_svg_symbolCircle(size) {
    var r = Math.sqrt(size / π);
    return "M0," + r + "A" + r + "," + r + " 0 1,1 0," + -r + "A" + r + "," + r + " 0 1,1 0," + r + "Z";
  }
  var d3_svg_symbols = d3.map({
    circle: d3_svg_symbolCircle,
    cross: function(size) {
      var r = Math.sqrt(size / 5) / 2;
      return "M" + -3 * r + "," + -r + "H" + -r + "V" + -3 * r + "H" + r + "V" + -r + "H" + 3 * r + "V" + r + "H" + r + "V" + 3 * r + "H" + -r + "V" + r + "H" + -3 * r + "Z";
    },
    diamond: function(size) {
      var ry = Math.sqrt(size / (2 * d3_svg_symbolTan30)), rx = ry * d3_svg_symbolTan30;
      return "M0," + -ry + "L" + rx + ",0" + " 0," + ry + " " + -rx + ",0" + "Z";
    },
    square: function(size) {
      var r = Math.sqrt(size) / 2;
      return "M" + -r + "," + -r + "L" + r + "," + -r + " " + r + "," + r + " " + -r + "," + r + "Z";
    },
    "triangle-down": function(size) {
      var rx = Math.sqrt(size / d3_svg_symbolSqrt3), ry = rx * d3_svg_symbolSqrt3 / 2;
      return "M0," + ry + "L" + rx + "," + -ry + " " + -rx + "," + -ry + "Z";
    },
    "triangle-up": function(size) {
      var rx = Math.sqrt(size / d3_svg_symbolSqrt3), ry = rx * d3_svg_symbolSqrt3 / 2;
      return "M0," + -ry + "L" + rx + "," + ry + " " + -rx + "," + ry + "Z";
    }
  });
  d3.svg.symbolTypes = d3_svg_symbols.keys();
  var d3_svg_symbolSqrt3 = Math.sqrt(3), d3_svg_symbolTan30 = Math.tan(30 * d3_radians);
  d3_selectionPrototype.transition = function(name) {
    var id = d3_transitionInheritId || ++d3_transitionId, ns = d3_transitionNamespace(name), subgroups = [], subgroup, node, transition = d3_transitionInherit || {
      time: Date.now(),
      ease: d3_ease_cubicInOut,
      delay: 0,
      duration: 250
    };
    for (var j = -1, m = this.length; ++j < m; ) {
      subgroups.push(subgroup = []);
      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
        if (node = group[i]) d3_transitionNode(node, i, ns, id, transition);
        subgroup.push(node);
      }
    }
    return d3_transition(subgroups, ns, id);
  };
  d3_selectionPrototype.interrupt = function(name) {
    return this.each(name == null ? d3_selection_interrupt : d3_selection_interruptNS(d3_transitionNamespace(name)));
  };
  var d3_selection_interrupt = d3_selection_interruptNS(d3_transitionNamespace());
  function d3_selection_interruptNS(ns) {
    return function() {
      var lock, active;
      if ((lock = this[ns]) && (active = lock[lock.active])) {
        if (--lock.count) {
          delete lock[lock.active];
          lock.active += .5;
        } else {
          delete this[ns];
        }
        active.event && active.event.interrupt.call(this, this.__data__, active.index);
      }
    };
  }
  function d3_transition(groups, ns, id) {
    d3_subclass(groups, d3_transitionPrototype);
    groups.namespace = ns;
    groups.id = id;
    return groups;
  }
  var d3_transitionPrototype = [], d3_transitionId = 0, d3_transitionInheritId, d3_transitionInherit;
  d3_transitionPrototype.call = d3_selectionPrototype.call;
  d3_transitionPrototype.empty = d3_selectionPrototype.empty;
  d3_transitionPrototype.node = d3_selectionPrototype.node;
  d3_transitionPrototype.size = d3_selectionPrototype.size;
  d3.transition = function(selection, name) {
    return selection && selection.transition ? d3_transitionInheritId ? selection.transition(name) : selection : d3_selectionRoot.transition(selection);
  };
  d3.transition.prototype = d3_transitionPrototype;
  d3_transitionPrototype.select = function(selector) {
    var id = this.id, ns = this.namespace, subgroups = [], subgroup, subnode, node;
    selector = d3_selection_selector(selector);
    for (var j = -1, m = this.length; ++j < m; ) {
      subgroups.push(subgroup = []);
      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
        if ((node = group[i]) && (subnode = selector.call(node, node.__data__, i, j))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          d3_transitionNode(subnode, i, ns, id, node[ns][id]);
          subgroup.push(subnode);
        } else {
          subgroup.push(null);
        }
      }
    }
    return d3_transition(subgroups, ns, id);
  };
  d3_transitionPrototype.selectAll = function(selector) {
    var id = this.id, ns = this.namespace, subgroups = [], subgroup, subnodes, node, subnode, transition;
    selector = d3_selection_selectorAll(selector);
    for (var j = -1, m = this.length; ++j < m; ) {
      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
        if (node = group[i]) {
          transition = node[ns][id];
          subnodes = selector.call(node, node.__data__, i, j);
          subgroups.push(subgroup = []);
          for (var k = -1, o = subnodes.length; ++k < o; ) {
            if (subnode = subnodes[k]) d3_transitionNode(subnode, k, ns, id, transition);
            subgroup.push(subnode);
          }
        }
      }
    }
    return d3_transition(subgroups, ns, id);
  };
  d3_transitionPrototype.filter = function(filter) {
    var subgroups = [], subgroup, group, node;
    if (typeof filter !== "function") filter = d3_selection_filter(filter);
    for (var j = 0, m = this.length; j < m; j++) {
      subgroups.push(subgroup = []);
      for (var group = this[j], i = 0, n = group.length; i < n; i++) {
        if ((node = group[i]) && filter.call(node, node.__data__, i, j)) {
          subgroup.push(node);
        }
      }
    }
    return d3_transition(subgroups, this.namespace, this.id);
  };
  d3_transitionPrototype.tween = function(name, tween) {
    var id = this.id, ns = this.namespace;
    if (arguments.length < 2) return this.node()[ns][id].tween.get(name);
    return d3_selection_each(this, tween == null ? function(node) {
      node[ns][id].tween.remove(name);
    } : function(node) {
      node[ns][id].tween.set(name, tween);
    });
  };
  function d3_transition_tween(groups, name, value, tween) {
    var id = groups.id, ns = groups.namespace;
    return d3_selection_each(groups, typeof value === "function" ? function(node, i, j) {
      node[ns][id].tween.set(name, tween(value.call(node, node.__data__, i, j)));
    } : (value = tween(value), function(node) {
      node[ns][id].tween.set(name, value);
    }));
  }
  d3_transitionPrototype.attr = function(nameNS, value) {
    if (arguments.length < 2) {
      for (value in nameNS) this.attr(value, nameNS[value]);
      return this;
    }
    var interpolate = nameNS == "transform" ? d3_interpolateTransform : d3_interpolate, name = d3.ns.qualify(nameNS);
    function attrNull() {
      this.removeAttribute(name);
    }
    function attrNullNS() {
      this.removeAttributeNS(name.space, name.local);
    }
    function attrTween(b) {
      return b == null ? attrNull : (b += "", function() {
        var a = this.getAttribute(name), i;
        return a !== b && (i = interpolate(a, b), function(t) {
          this.setAttribute(name, i(t));
        });
      });
    }
    function attrTweenNS(b) {
      return b == null ? attrNullNS : (b += "", function() {
        var a = this.getAttributeNS(name.space, name.local), i;
        return a !== b && (i = interpolate(a, b), function(t) {
          this.setAttributeNS(name.space, name.local, i(t));
        });
      });
    }
    return d3_transition_tween(this, "attr." + nameNS, value, name.local ? attrTweenNS : attrTween);
  };
  d3_transitionPrototype.attrTween = function(nameNS, tween) {
    var name = d3.ns.qualify(nameNS);
    function attrTween(d, i) {
      var f = tween.call(this, d, i, this.getAttribute(name));
      return f && function(t) {
        this.setAttribute(name, f(t));
      };
    }
    function attrTweenNS(d, i) {
      var f = tween.call(this, d, i, this.getAttributeNS(name.space, name.local));
      return f && function(t) {
        this.setAttributeNS(name.space, name.local, f(t));
      };
    }
    return this.tween("attr." + nameNS, name.local ? attrTweenNS : attrTween);
  };
  d3_transitionPrototype.style = function(name, value, priority) {
    var n = arguments.length;
    if (n < 3) {
      if (typeof name !== "string") {
        if (n < 2) value = "";
        for (priority in name) this.style(priority, name[priority], value);
        return this;
      }
      priority = "";
    }
    function styleNull() {
      this.style.removeProperty(name);
    }
    function styleString(b) {
      return b == null ? styleNull : (b += "", function() {
        var a = d3_window.getComputedStyle(this, null).getPropertyValue(name), i;
        return a !== b && (i = d3_interpolate(a, b), function(t) {
          this.style.setProperty(name, i(t), priority);
        });
      });
    }
    return d3_transition_tween(this, "style." + name, value, styleString);
  };
  d3_transitionPrototype.styleTween = function(name, tween, priority) {
    if (arguments.length < 3) priority = "";
    function styleTween(d, i) {
      var f = tween.call(this, d, i, d3_window.getComputedStyle(this, null).getPropertyValue(name));
      return f && function(t) {
        this.style.setProperty(name, f(t), priority);
      };
    }
    return this.tween("style." + name, styleTween);
  };
  d3_transitionPrototype.text = function(value) {
    return d3_transition_tween(this, "text", value, d3_transition_text);
  };
  function d3_transition_text(b) {
    if (b == null) b = "";
    return function() {
      this.textContent = b;
    };
  }
  d3_transitionPrototype.remove = function() {
    var ns = this.namespace;
    return this.each("end.transition", function() {
      var p;
      if (this[ns].count < 2 && (p = this.parentNode)) p.removeChild(this);
    });
  };
  d3_transitionPrototype.ease = function(value) {
    var id = this.id, ns = this.namespace;
    if (arguments.length < 1) return this.node()[ns][id].ease;
    if (typeof value !== "function") value = d3.ease.apply(d3, arguments);
    return d3_selection_each(this, function(node) {
      node[ns][id].ease = value;
    });
  };
  d3_transitionPrototype.delay = function(value) {
    var id = this.id, ns = this.namespace;
    if (arguments.length < 1) return this.node()[ns][id].delay;
    return d3_selection_each(this, typeof value === "function" ? function(node, i, j) {
      node[ns][id].delay = +value.call(node, node.__data__, i, j);
    } : (value = +value, function(node) {
      node[ns][id].delay = value;
    }));
  };
  d3_transitionPrototype.duration = function(value) {
    var id = this.id, ns = this.namespace;
    if (arguments.length < 1) return this.node()[ns][id].duration;
    return d3_selection_each(this, typeof value === "function" ? function(node, i, j) {
      node[ns][id].duration = Math.max(1, value.call(node, node.__data__, i, j));
    } : (value = Math.max(1, value), function(node) {
      node[ns][id].duration = value;
    }));
  };
  d3_transitionPrototype.each = function(type, listener) {
    var id = this.id, ns = this.namespace;
    if (arguments.length < 2) {
      var inherit = d3_transitionInherit, inheritId = d3_transitionInheritId;
      try {
        d3_transitionInheritId = id;
        d3_selection_each(this, function(node, i, j) {
          d3_transitionInherit = node[ns][id];
          type.call(node, node.__data__, i, j);
        });
      } finally {
        d3_transitionInherit = inherit;
        d3_transitionInheritId = inheritId;
      }
    } else {
      d3_selection_each(this, function(node) {
        var transition = node[ns][id];
        (transition.event || (transition.event = d3.dispatch("start", "end", "interrupt"))).on(type, listener);
      });
    }
    return this;
  };
  d3_transitionPrototype.transition = function() {
    var id0 = this.id, id1 = ++d3_transitionId, ns = this.namespace, subgroups = [], subgroup, group, node, transition;
    for (var j = 0, m = this.length; j < m; j++) {
      subgroups.push(subgroup = []);
      for (var group = this[j], i = 0, n = group.length; i < n; i++) {
        if (node = group[i]) {
          transition = node[ns][id0];
          d3_transitionNode(node, i, ns, id1, {
            time: transition.time,
            ease: transition.ease,
            delay: transition.delay + transition.duration,
            duration: transition.duration
          });
        }
        subgroup.push(node);
      }
    }
    return d3_transition(subgroups, ns, id1);
  };
  function d3_transitionNamespace(name) {
    return name == null ? "__transition__" : "__transition_" + name + "__";
  }
  function d3_transitionNode(node, i, ns, id, inherit) {
    var lock = node[ns] || (node[ns] = {
      active: 0,
      count: 0
    }), transition = lock[id];
    if (!transition) {
      var time = inherit.time;
      transition = lock[id] = {
        tween: new d3_Map(),
        time: time,
        delay: inherit.delay,
        duration: inherit.duration,
        ease: inherit.ease,
        index: i
      };
      inherit = null;
      ++lock.count;
      d3.timer(function(elapsed) {
        var delay = transition.delay, duration, ease, timer = d3_timer_active, tweened = [];
        timer.t = delay + time;
        if (delay <= elapsed) return start(elapsed - delay);
        timer.c = start;
        function start(elapsed) {
          if (lock.active > id) return stop();
          var active = lock[lock.active];
          if (active) {
            --lock.count;
            delete lock[lock.active];
            active.event && active.event.interrupt.call(node, node.__data__, active.index);
          }
          lock.active = id;
          transition.event && transition.event.start.call(node, node.__data__, i);
          transition.tween.forEach(function(key, value) {
            if (value = value.call(node, node.__data__, i)) {
              tweened.push(value);
            }
          });
          ease = transition.ease;
          duration = transition.duration;
          d3.timer(function() {
            timer.c = tick(elapsed || 1) ? d3_true : tick;
            return 1;
          }, 0, time);
        }
        function tick(elapsed) {
          if (lock.active !== id) return 1;
          var t = elapsed / duration, e = ease(t), n = tweened.length;
          while (n > 0) {
            tweened[--n].call(node, e);
          }
          if (t >= 1) {
            transition.event && transition.event.end.call(node, node.__data__, i);
            return stop();
          }
        }
        function stop() {
          if (--lock.count) delete lock[id]; else delete node[ns];
          return 1;
        }
      }, 0, time);
    }
  }
  d3.svg.axis = function() {
    var scale = d3.scale.linear(), orient = d3_svg_axisDefaultOrient, innerTickSize = 6, outerTickSize = 6, tickPadding = 3, tickArguments_ = [ 10 ], tickValues = null, tickFormat_;
    function axis(g) {
      g.each(function() {
        var g = d3.select(this);
        var scale0 = this.__chart__ || scale, scale1 = this.__chart__ = scale.copy();
        var ticks = tickValues == null ? scale1.ticks ? scale1.ticks.apply(scale1, tickArguments_) : scale1.domain() : tickValues, tickFormat = tickFormat_ == null ? scale1.tickFormat ? scale1.tickFormat.apply(scale1, tickArguments_) : d3_identity : tickFormat_, tick = g.selectAll(".tick").data(ticks, scale1), tickEnter = tick.enter().insert("g", ".domain").attr("class", "tick").style("opacity", ε), tickExit = d3.transition(tick.exit()).style("opacity", ε).remove(), tickUpdate = d3.transition(tick.order()).style("opacity", 1), tickSpacing = Math.max(innerTickSize, 0) + tickPadding, tickTransform;
        var range = d3_scaleRange(scale1), path = g.selectAll(".domain").data([ 0 ]), pathUpdate = (path.enter().append("path").attr("class", "domain"), 
        d3.transition(path));
        tickEnter.append("line");
        tickEnter.append("text");
        var lineEnter = tickEnter.select("line"), lineUpdate = tickUpdate.select("line"), text = tick.select("text").text(tickFormat), textEnter = tickEnter.select("text"), textUpdate = tickUpdate.select("text"), sign = orient === "top" || orient === "left" ? -1 : 1, x1, x2, y1, y2;
        if (orient === "bottom" || orient === "top") {
          tickTransform = d3_svg_axisX, x1 = "x", y1 = "y", x2 = "x2", y2 = "y2";
          text.attr("dy", sign < 0 ? "0em" : ".71em").style("text-anchor", "middle");
          pathUpdate.attr("d", "M" + range[0] + "," + sign * outerTickSize + "V0H" + range[1] + "V" + sign * outerTickSize);
        } else {
          tickTransform = d3_svg_axisY, x1 = "y", y1 = "x", x2 = "y2", y2 = "x2";
          text.attr("dy", ".32em").style("text-anchor", sign < 0 ? "end" : "start");
          pathUpdate.attr("d", "M" + sign * outerTickSize + "," + range[0] + "H0V" + range[1] + "H" + sign * outerTickSize);
        }
        lineEnter.attr(y2, sign * innerTickSize);
        textEnter.attr(y1, sign * tickSpacing);
        lineUpdate.attr(x2, 0).attr(y2, sign * innerTickSize);
        textUpdate.attr(x1, 0).attr(y1, sign * tickSpacing);
        if (scale1.rangeBand) {
          var x = scale1, dx = x.rangeBand() / 2;
          scale0 = scale1 = function(d) {
            return x(d) + dx;
          };
        } else if (scale0.rangeBand) {
          scale0 = scale1;
        } else {
          tickExit.call(tickTransform, scale1, scale0);
        }
        tickEnter.call(tickTransform, scale0, scale1);
        tickUpdate.call(tickTransform, scale1, scale1);
      });
    }
    axis.scale = function(x) {
      if (!arguments.length) return scale;
      scale = x;
      return axis;
    };
    axis.orient = function(x) {
      if (!arguments.length) return orient;
      orient = x in d3_svg_axisOrients ? x + "" : d3_svg_axisDefaultOrient;
      return axis;
    };
    axis.ticks = function() {
      if (!arguments.length) return tickArguments_;
      tickArguments_ = arguments;
      return axis;
    };
    axis.tickValues = function(x) {
      if (!arguments.length) return tickValues;
      tickValues = x;
      return axis;
    };
    axis.tickFormat = function(x) {
      if (!arguments.length) return tickFormat_;
      tickFormat_ = x;
      return axis;
    };
    axis.tickSize = function(x) {
      var n = arguments.length;
      if (!n) return innerTickSize;
      innerTickSize = +x;
      outerTickSize = +arguments[n - 1];
      return axis;
    };
    axis.innerTickSize = function(x) {
      if (!arguments.length) return innerTickSize;
      innerTickSize = +x;
      return axis;
    };
    axis.outerTickSize = function(x) {
      if (!arguments.length) return outerTickSize;
      outerTickSize = +x;
      return axis;
    };
    axis.tickPadding = function(x) {
      if (!arguments.length) return tickPadding;
      tickPadding = +x;
      return axis;
    };
    axis.tickSubdivide = function() {
      return arguments.length && axis;
    };
    return axis;
  };
  var d3_svg_axisDefaultOrient = "bottom", d3_svg_axisOrients = {
    top: 1,
    right: 1,
    bottom: 1,
    left: 1
  };
  function d3_svg_axisX(selection, x0, x1) {
    selection.attr("transform", function(d) {
      var v0 = x0(d);
      return "translate(" + (isFinite(v0) ? v0 : x1(d)) + ",0)";
    });
  }
  function d3_svg_axisY(selection, y0, y1) {
    selection.attr("transform", function(d) {
      var v0 = y0(d);
      return "translate(0," + (isFinite(v0) ? v0 : y1(d)) + ")";
    });
  }
  d3.svg.brush = function() {
    var event = d3_eventDispatch(brush, "brushstart", "brush", "brushend"), x = null, y = null, xExtent = [ 0, 0 ], yExtent = [ 0, 0 ], xExtentDomain, yExtentDomain, xClamp = true, yClamp = true, resizes = d3_svg_brushResizes[0];
    function brush(g) {
      g.each(function() {
        var g = d3.select(this).style("pointer-events", "all").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)").on("mousedown.brush", brushstart).on("touchstart.brush", brushstart);
        var background = g.selectAll(".background").data([ 0 ]);
        background.enter().append("rect").attr("class", "background").style("visibility", "hidden").style("cursor", "crosshair");
        g.selectAll(".extent").data([ 0 ]).enter().append("rect").attr("class", "extent").style("cursor", "move");
        var resize = g.selectAll(".resize").data(resizes, d3_identity);
        resize.exit().remove();
        resize.enter().append("g").attr("class", function(d) {
          return "resize " + d;
        }).style("cursor", function(d) {
          return d3_svg_brushCursor[d];
        }).append("rect").attr("x", function(d) {
          return /[ew]$/.test(d) ? -3 : null;
        }).attr("y", function(d) {
          return /^[ns]/.test(d) ? -3 : null;
        }).attr("width", 6).attr("height", 6).style("visibility", "hidden");
        resize.style("display", brush.empty() ? "none" : null);
        var gUpdate = d3.transition(g), backgroundUpdate = d3.transition(background), range;
        if (x) {
          range = d3_scaleRange(x);
          backgroundUpdate.attr("x", range[0]).attr("width", range[1] - range[0]);
          redrawX(gUpdate);
        }
        if (y) {
          range = d3_scaleRange(y);
          backgroundUpdate.attr("y", range[0]).attr("height", range[1] - range[0]);
          redrawY(gUpdate);
        }
        redraw(gUpdate);
      });
    }
    brush.event = function(g) {
      g.each(function() {
        var event_ = event.of(this, arguments), extent1 = {
          x: xExtent,
          y: yExtent,
          i: xExtentDomain,
          j: yExtentDomain
        }, extent0 = this.__chart__ || extent1;
        this.__chart__ = extent1;
        if (d3_transitionInheritId) {
          d3.select(this).transition().each("start.brush", function() {
            xExtentDomain = extent0.i;
            yExtentDomain = extent0.j;
            xExtent = extent0.x;
            yExtent = extent0.y;
            event_({
              type: "brushstart"
            });
          }).tween("brush:brush", function() {
            var xi = d3_interpolateArray(xExtent, extent1.x), yi = d3_interpolateArray(yExtent, extent1.y);
            xExtentDomain = yExtentDomain = null;
            return function(t) {
              xExtent = extent1.x = xi(t);
              yExtent = extent1.y = yi(t);
              event_({
                type: "brush",
                mode: "resize"
              });
            };
          }).each("end.brush", function() {
            xExtentDomain = extent1.i;
            yExtentDomain = extent1.j;
            event_({
              type: "brush",
              mode: "resize"
            });
            event_({
              type: "brushend"
            });
          });
        } else {
          event_({
            type: "brushstart"
          });
          event_({
            type: "brush",
            mode: "resize"
          });
          event_({
            type: "brushend"
          });
        }
      });
    };
    function redraw(g) {
      g.selectAll(".resize").attr("transform", function(d) {
        return "translate(" + xExtent[+/e$/.test(d)] + "," + yExtent[+/^s/.test(d)] + ")";
      });
    }
    function redrawX(g) {
      g.select(".extent").attr("x", xExtent[0]);
      g.selectAll(".extent,.n>rect,.s>rect").attr("width", xExtent[1] - xExtent[0]);
    }
    function redrawY(g) {
      g.select(".extent").attr("y", yExtent[0]);
      g.selectAll(".extent,.e>rect,.w>rect").attr("height", yExtent[1] - yExtent[0]);
    }
    function brushstart() {
      var target = this, eventTarget = d3.select(d3.event.target), event_ = event.of(target, arguments), g = d3.select(target), resizing = eventTarget.datum(), resizingX = !/^(n|s)$/.test(resizing) && x, resizingY = !/^(e|w)$/.test(resizing) && y, dragging = eventTarget.classed("extent"), dragRestore = d3_event_dragSuppress(), center, origin = d3.mouse(target), offset;
      var w = d3.select(d3_window).on("keydown.brush", keydown).on("keyup.brush", keyup);
      if (d3.event.changedTouches) {
        w.on("touchmove.brush", brushmove).on("touchend.brush", brushend);
      } else {
        w.on("mousemove.brush", brushmove).on("mouseup.brush", brushend);
      }
      g.interrupt().selectAll("*").interrupt();
      if (dragging) {
        origin[0] = xExtent[0] - origin[0];
        origin[1] = yExtent[0] - origin[1];
      } else if (resizing) {
        var ex = +/w$/.test(resizing), ey = +/^n/.test(resizing);
        offset = [ xExtent[1 - ex] - origin[0], yExtent[1 - ey] - origin[1] ];
        origin[0] = xExtent[ex];
        origin[1] = yExtent[ey];
      } else if (d3.event.altKey) center = origin.slice();
      g.style("pointer-events", "none").selectAll(".resize").style("display", null);
      d3.select("body").style("cursor", eventTarget.style("cursor"));
      event_({
        type: "brushstart"
      });
      brushmove();
      function keydown() {
        if (d3.event.keyCode == 32) {
          if (!dragging) {
            center = null;
            origin[0] -= xExtent[1];
            origin[1] -= yExtent[1];
            dragging = 2;
          }
          d3_eventPreventDefault();
        }
      }
      function keyup() {
        if (d3.event.keyCode == 32 && dragging == 2) {
          origin[0] += xExtent[1];
          origin[1] += yExtent[1];
          dragging = 0;
          d3_eventPreventDefault();
        }
      }
      function brushmove() {
        var point = d3.mouse(target), moved = false;
        if (offset) {
          point[0] += offset[0];
          point[1] += offset[1];
        }
        if (!dragging) {
          if (d3.event.altKey) {
            if (!center) center = [ (xExtent[0] + xExtent[1]) / 2, (yExtent[0] + yExtent[1]) / 2 ];
            origin[0] = xExtent[+(point[0] < center[0])];
            origin[1] = yExtent[+(point[1] < center[1])];
          } else center = null;
        }
        if (resizingX && move1(point, x, 0)) {
          redrawX(g);
          moved = true;
        }
        if (resizingY && move1(point, y, 1)) {
          redrawY(g);
          moved = true;
        }
        if (moved) {
          redraw(g);
          event_({
            type: "brush",
            mode: dragging ? "move" : "resize"
          });
        }
      }
      function move1(point, scale, i) {
        var range = d3_scaleRange(scale), r0 = range[0], r1 = range[1], position = origin[i], extent = i ? yExtent : xExtent, size = extent[1] - extent[0], min, max;
        if (dragging) {
          r0 -= position;
          r1 -= size + position;
        }
        min = (i ? yClamp : xClamp) ? Math.max(r0, Math.min(r1, point[i])) : point[i];
        if (dragging) {
          max = (min += position) + size;
        } else {
          if (center) position = Math.max(r0, Math.min(r1, 2 * center[i] - min));
          if (position < min) {
            max = min;
            min = position;
          } else {
            max = position;
          }
        }
        if (extent[0] != min || extent[1] != max) {
          if (i) yExtentDomain = null; else xExtentDomain = null;
          extent[0] = min;
          extent[1] = max;
          return true;
        }
      }
      function brushend() {
        brushmove();
        g.style("pointer-events", "all").selectAll(".resize").style("display", brush.empty() ? "none" : null);
        d3.select("body").style("cursor", null);
        w.on("mousemove.brush", null).on("mouseup.brush", null).on("touchmove.brush", null).on("touchend.brush", null).on("keydown.brush", null).on("keyup.brush", null);
        dragRestore();
        event_({
          type: "brushend"
        });
      }
    }
    brush.x = function(z) {
      if (!arguments.length) return x;
      x = z;
      resizes = d3_svg_brushResizes[!x << 1 | !y];
      return brush;
    };
    brush.y = function(z) {
      if (!arguments.length) return y;
      y = z;
      resizes = d3_svg_brushResizes[!x << 1 | !y];
      return brush;
    };
    brush.clamp = function(z) {
      if (!arguments.length) return x && y ? [ xClamp, yClamp ] : x ? xClamp : y ? yClamp : null;
      if (x && y) xClamp = !!z[0], yClamp = !!z[1]; else if (x) xClamp = !!z; else if (y) yClamp = !!z;
      return brush;
    };
    brush.extent = function(z) {
      var x0, x1, y0, y1, t;
      if (!arguments.length) {
        if (x) {
          if (xExtentDomain) {
            x0 = xExtentDomain[0], x1 = xExtentDomain[1];
          } else {
            x0 = xExtent[0], x1 = xExtent[1];
            if (x.invert) x0 = x.invert(x0), x1 = x.invert(x1);
            if (x1 < x0) t = x0, x0 = x1, x1 = t;
          }
        }
        if (y) {
          if (yExtentDomain) {
            y0 = yExtentDomain[0], y1 = yExtentDomain[1];
          } else {
            y0 = yExtent[0], y1 = yExtent[1];
            if (y.invert) y0 = y.invert(y0), y1 = y.invert(y1);
            if (y1 < y0) t = y0, y0 = y1, y1 = t;
          }
        }
        return x && y ? [ [ x0, y0 ], [ x1, y1 ] ] : x ? [ x0, x1 ] : y && [ y0, y1 ];
      }
      if (x) {
        x0 = z[0], x1 = z[1];
        if (y) x0 = x0[0], x1 = x1[0];
        xExtentDomain = [ x0, x1 ];
        if (x.invert) x0 = x(x0), x1 = x(x1);
        if (x1 < x0) t = x0, x0 = x1, x1 = t;
        if (x0 != xExtent[0] || x1 != xExtent[1]) xExtent = [ x0, x1 ];
      }
      if (y) {
        y0 = z[0], y1 = z[1];
        if (x) y0 = y0[1], y1 = y1[1];
        yExtentDomain = [ y0, y1 ];
        if (y.invert) y0 = y(y0), y1 = y(y1);
        if (y1 < y0) t = y0, y0 = y1, y1 = t;
        if (y0 != yExtent[0] || y1 != yExtent[1]) yExtent = [ y0, y1 ];
      }
      return brush;
    };
    brush.clear = function() {
      if (!brush.empty()) {
        xExtent = [ 0, 0 ], yExtent = [ 0, 0 ];
        xExtentDomain = yExtentDomain = null;
      }
      return brush;
    };
    brush.empty = function() {
      return !!x && xExtent[0] == xExtent[1] || !!y && yExtent[0] == yExtent[1];
    };
    return d3.rebind(brush, event, "on");
  };
  var d3_svg_brushCursor = {
    n: "ns-resize",
    e: "ew-resize",
    s: "ns-resize",
    w: "ew-resize",
    nw: "nwse-resize",
    ne: "nesw-resize",
    se: "nwse-resize",
    sw: "nesw-resize"
  };
  var d3_svg_brushResizes = [ [ "n", "e", "s", "w", "nw", "ne", "se", "sw" ], [ "e", "w" ], [ "n", "s" ], [] ];
  var d3_time_format = d3_time.format = d3_locale_enUS.timeFormat;
  var d3_time_formatUtc = d3_time_format.utc;
  var d3_time_formatIso = d3_time_formatUtc("%Y-%m-%dT%H:%M:%S.%LZ");
  d3_time_format.iso = Date.prototype.toISOString && +new Date("2000-01-01T00:00:00.000Z") ? d3_time_formatIsoNative : d3_time_formatIso;
  function d3_time_formatIsoNative(date) {
    return date.toISOString();
  }
  d3_time_formatIsoNative.parse = function(string) {
    var date = new Date(string);
    return isNaN(date) ? null : date;
  };
  d3_time_formatIsoNative.toString = d3_time_formatIso.toString;
  d3_time.second = d3_time_interval(function(date) {
    return new d3_date(Math.floor(date / 1e3) * 1e3);
  }, function(date, offset) {
    date.setTime(date.getTime() + Math.floor(offset) * 1e3);
  }, function(date) {
    return date.getSeconds();
  });
  d3_time.seconds = d3_time.second.range;
  d3_time.seconds.utc = d3_time.second.utc.range;
  d3_time.minute = d3_time_interval(function(date) {
    return new d3_date(Math.floor(date / 6e4) * 6e4);
  }, function(date, offset) {
    date.setTime(date.getTime() + Math.floor(offset) * 6e4);
  }, function(date) {
    return date.getMinutes();
  });
  d3_time.minutes = d3_time.minute.range;
  d3_time.minutes.utc = d3_time.minute.utc.range;
  d3_time.hour = d3_time_interval(function(date) {
    var timezone = date.getTimezoneOffset() / 60;
    return new d3_date((Math.floor(date / 36e5 - timezone) + timezone) * 36e5);
  }, function(date, offset) {
    date.setTime(date.getTime() + Math.floor(offset) * 36e5);
  }, function(date) {
    return date.getHours();
  });
  d3_time.hours = d3_time.hour.range;
  d3_time.hours.utc = d3_time.hour.utc.range;
  d3_time.month = d3_time_interval(function(date) {
    date = d3_time.day(date);
    date.setDate(1);
    return date;
  }, function(date, offset) {
    date.setMonth(date.getMonth() + offset);
  }, function(date) {
    return date.getMonth();
  });
  d3_time.months = d3_time.month.range;
  d3_time.months.utc = d3_time.month.utc.range;
  function d3_time_scale(linear, methods, format) {
    function scale(x) {
      return linear(x);
    }
    scale.invert = function(x) {
      return d3_time_scaleDate(linear.invert(x));
    };
    scale.domain = function(x) {
      if (!arguments.length) return linear.domain().map(d3_time_scaleDate);
      linear.domain(x);
      return scale;
    };
    function tickMethod(extent, count) {
      var span = extent[1] - extent[0], target = span / count, i = d3.bisect(d3_time_scaleSteps, target);
      return i == d3_time_scaleSteps.length ? [ methods.year, d3_scale_linearTickRange(extent.map(function(d) {
        return d / 31536e6;
      }), count)[2] ] : !i ? [ d3_time_scaleMilliseconds, d3_scale_linearTickRange(extent, count)[2] ] : methods[target / d3_time_scaleSteps[i - 1] < d3_time_scaleSteps[i] / target ? i - 1 : i];
    }
    scale.nice = function(interval, skip) {
      var domain = scale.domain(), extent = d3_scaleExtent(domain), method = interval == null ? tickMethod(extent, 10) : typeof interval === "number" && tickMethod(extent, interval);
      if (method) interval = method[0], skip = method[1];
      function skipped(date) {
        return !isNaN(date) && !interval.range(date, d3_time_scaleDate(+date + 1), skip).length;
      }
      return scale.domain(d3_scale_nice(domain, skip > 1 ? {
        floor: function(date) {
          while (skipped(date = interval.floor(date))) date = d3_time_scaleDate(date - 1);
          return date;
        },
        ceil: function(date) {
          while (skipped(date = interval.ceil(date))) date = d3_time_scaleDate(+date + 1);
          return date;
        }
      } : interval));
    };
    scale.ticks = function(interval, skip) {
      var extent = d3_scaleExtent(scale.domain()), method = interval == null ? tickMethod(extent, 10) : typeof interval === "number" ? tickMethod(extent, interval) : !interval.range && [ {
        range: interval
      }, skip ];
      if (method) interval = method[0], skip = method[1];
      return interval.range(extent[0], d3_time_scaleDate(+extent[1] + 1), skip < 1 ? 1 : skip);
    };
    scale.tickFormat = function() {
      return format;
    };
    scale.copy = function() {
      return d3_time_scale(linear.copy(), methods, format);
    };
    return d3_scale_linearRebind(scale, linear);
  }
  function d3_time_scaleDate(t) {
    return new Date(t);
  }
  var d3_time_scaleSteps = [ 1e3, 5e3, 15e3, 3e4, 6e4, 3e5, 9e5, 18e5, 36e5, 108e5, 216e5, 432e5, 864e5, 1728e5, 6048e5, 2592e6, 7776e6, 31536e6 ];
  var d3_time_scaleLocalMethods = [ [ d3_time.second, 1 ], [ d3_time.second, 5 ], [ d3_time.second, 15 ], [ d3_time.second, 30 ], [ d3_time.minute, 1 ], [ d3_time.minute, 5 ], [ d3_time.minute, 15 ], [ d3_time.minute, 30 ], [ d3_time.hour, 1 ], [ d3_time.hour, 3 ], [ d3_time.hour, 6 ], [ d3_time.hour, 12 ], [ d3_time.day, 1 ], [ d3_time.day, 2 ], [ d3_time.week, 1 ], [ d3_time.month, 1 ], [ d3_time.month, 3 ], [ d3_time.year, 1 ] ];
  var d3_time_scaleLocalFormat = d3_time_format.multi([ [ ".%L", function(d) {
    return d.getMilliseconds();
  } ], [ ":%S", function(d) {
    return d.getSeconds();
  } ], [ "%I:%M", function(d) {
    return d.getMinutes();
  } ], [ "%I %p", function(d) {
    return d.getHours();
  } ], [ "%a %d", function(d) {
    return d.getDay() && d.getDate() != 1;
  } ], [ "%b %d", function(d) {
    return d.getDate() != 1;
  } ], [ "%B", function(d) {
    return d.getMonth();
  } ], [ "%Y", d3_true ] ]);
  var d3_time_scaleMilliseconds = {
    range: function(start, stop, step) {
      return d3.range(Math.ceil(start / step) * step, +stop, step).map(d3_time_scaleDate);
    },
    floor: d3_identity,
    ceil: d3_identity
  };
  d3_time_scaleLocalMethods.year = d3_time.year;
  d3_time.scale = function() {
    return d3_time_scale(d3.scale.linear(), d3_time_scaleLocalMethods, d3_time_scaleLocalFormat);
  };
  var d3_time_scaleUtcMethods = d3_time_scaleLocalMethods.map(function(m) {
    return [ m[0].utc, m[1] ];
  });
  var d3_time_scaleUtcFormat = d3_time_formatUtc.multi([ [ ".%L", function(d) {
    return d.getUTCMilliseconds();
  } ], [ ":%S", function(d) {
    return d.getUTCSeconds();
  } ], [ "%I:%M", function(d) {
    return d.getUTCMinutes();
  } ], [ "%I %p", function(d) {
    return d.getUTCHours();
  } ], [ "%a %d", function(d) {
    return d.getUTCDay() && d.getUTCDate() != 1;
  } ], [ "%b %d", function(d) {
    return d.getUTCDate() != 1;
  } ], [ "%B", function(d) {
    return d.getUTCMonth();
  } ], [ "%Y", d3_true ] ]);
  d3_time_scaleUtcMethods.year = d3_time.year.utc;
  d3_time.scale.utc = function() {
    return d3_time_scale(d3.scale.linear(), d3_time_scaleUtcMethods, d3_time_scaleUtcFormat);
  };
  d3.text = d3_xhrType(function(request) {
    return request.responseText;
  });
  d3.json = function(url, callback) {
    return d3_xhr(url, "application/json", d3_json, callback);
  };
  function d3_json(request) {
    return JSON.parse(request.responseText);
  }
  d3.html = function(url, callback) {
    return d3_xhr(url, "text/html", d3_html, callback);
  };
  function d3_html(request) {
    var range = d3_document.createRange();
    range.selectNode(d3_document.body);
    return range.createContextualFragment(request.responseText);
  }
  d3.xml = d3_xhrType(function(request) {
    return request.responseXML;
  });
  if (typeof define === "function" && define.amd) define(d3); else if (typeof module === "object" && module.exports) module.exports = d3;
  this.d3 = d3;
}();
},{}]},{},["./app/src/app.ts"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvc3JjL2FwcC50cyIsImFwcC9zcmMvYmVlcGVyLnRzIiwiYXBwL3NyYy9ncmFwaC50cyIsImFwcC9zcmMvdGltZXBpZS50cyIsImFwcC9zcmMvdXRpbC50cyIsIm5vZGVfbW9kdWxlcy9kMy9kMy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLHlDQUF5QztBQUV6QyxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFFdEMsSUFBSSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUM7SUFDckIsS0FBSyxFQUFJLEdBQUcsR0FBRyxJQUFJO0lBQ25CLE9BQU8sRUFBRSxHQUFHLEdBQUcsSUFBSTtDQUN0QixDQUFDLENBQUM7QUFFSCxRQUFRLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDM0QsUUFBUSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3hELFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsVUFBUyxDQUFDO0lBQzNDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ2hCLEtBQUssRUFBRTtZQUFFLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUFDLEtBQUssQ0FBQztRQUM1QixLQUFLLEVBQUU7WUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFBQyxLQUFLLENBQUM7UUFDdEMsS0FBSyxFQUFFO1lBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQUMsS0FBSyxDQUFDO1FBQ3RDLEtBQUssRUFBRTtZQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUFDLEtBQUssQ0FBQztRQUN0QyxLQUFLLEVBQUU7WUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFBQyxLQUFLLENBQUM7SUFDMUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUViLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDeEIsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDOzs7QUN0QlosbURBQW1EO0FBRW5ELElBQU0sTUFBTTtJQUtSLFNBTEUsTUFBTTtRQU1KLE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FDbEIsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUV2QyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUNoRCxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNwRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN0QixDQUFDO0lBRU8seUJBQVEsR0FBaEIsVUFBaUIsTUFBVSxFQUFFLEtBQVM7UUFBckIsc0JBQVUsR0FBVixVQUFVO1FBQUUscUJBQVMsR0FBVCxTQUFTO1FBQ2xDLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNmLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQztRQUNyQixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQztRQUUxQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQzlDLEtBQUssR0FBRyxNQUFNLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUMsRUFDL0IsS0FBSyxHQUFHLE1BQU0sR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEQsQ0FBQztJQUNMLENBQUM7SUFFTyxxQkFBSSxHQUFaLFVBQWEsU0FBUztRQUNsQixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLEdBQUcsR0FBRyxDQUFDO0lBQzFELENBQUM7SUFFRCwwQkFBUyxHQUFUO1FBQ0ksRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUNyQixNQUFNLENBQUM7UUFDWCxDQUFDO1FBRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDcEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDcEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUVMLGFBQUM7QUFBRCxDQTNDQSxBQTJDQyxJQUFBO0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7OztBQy9DeEIseUNBQXlDO0FBSXpDLElBQUksRUFBRSxHQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFFN0IsU0FBUyxjQUFjLENBQUMsWUFBb0I7SUFDeEMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNoRCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUMsQ0FBQztJQUNwQyxJQUFJLElBQUksR0FBRyxPQUFPLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUUvQixNQUFNLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDN0QsQ0FBQztBQUVELFNBQWdCLEtBQUs7SUFDakIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUMxQixFQUFFLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3hDLENBQUM7QUFIZSxhQUFLLEdBQUwsS0FHZixDQUFBO0FBRUQsU0FBZ0IsTUFBTSxDQUFDLEdBQWM7SUFDakMsSUFBSSxLQUFLLEdBQUksR0FBRyxDQUFDLEtBQUssQ0FBQztJQUN2QixJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO0lBQ3hCLElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7SUFFeEIsSUFBSSxJQUFJLEdBQUc7UUFDUCxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU87UUFDcEIsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPO0tBQzVDLENBQUM7SUFFRixJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUNqQixXQUFXLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUMxQixXQUFXLENBQUMsTUFBTSxDQUFDLEVBQUUsb0JBQW9CO0lBRTlDLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQ3RCLFdBQVcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUM5QixXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRTdCLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUVoQixJQUFJLEtBQUssR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBRWxDLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQ3RCLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FDYixJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUNwQixJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUNwQixJQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBRTVCLElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUN4RSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FDaEMsSUFBSSxDQUFDLGVBQWUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUN2QyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUNoQixJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUNoQixJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUNoQixJQUFJLENBQUMsSUFBSSxFQUFFLFVBQVMsQ0FBQyxFQUFFLENBQUM7UUFBSSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUFDLENBQUMsQ0FBQyxDQUFDO0lBRXZELEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3RFLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLFVBQVMsQ0FBQyxFQUFFLENBQUM7UUFDekUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwQixDQUFDLENBQUMsQ0FBQztJQUVILElBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQzVCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FDbEIsS0FBSyxFQUFFLENBQ1AsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUNYLElBQUksQ0FBQyxXQUFXLEVBQUUsWUFBWSxHQUFHLEtBQUssR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFFMUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FDZCxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUNuQixJQUFJLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBRXpCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQ2QsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FDbkIsSUFBSSxDQUFDLFVBQVMsQ0FBQztRQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO0lBQUMsQ0FBQyxDQUFDLENBQ3hDLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBUyxDQUFDLEVBQUUsQ0FBQztRQUFJLE1BQU0sQ0FBQyxXQUFXLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztJQUFDLENBQUMsQ0FBQyxDQUM5RCxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRXBCLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUNyQyxJQUFJLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUM3QixJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUVoRCxNQUFNLENBQXlCO1FBQzNCLEtBQUssRUFBRSxLQUFLO1FBQ1osR0FBRyxFQUFFLEdBQUc7UUFDUixNQUFNLEVBQUUsTUFBTTtRQUNkLElBQUksRUFBRSxJQUFJO0tBQ2IsQ0FBQTtBQUNMLENBQUM7QUFwRWUsY0FBTSxHQUFOLE1Bb0VmLENBQUE7QUFFRCxTQUFnQixNQUFNLENBQUMsR0FBYyxFQUFFLE1BQThCLEVBQUUsT0FBWTtJQUMvRSxPQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQztJQUV4QixJQUFJLElBQUksR0FBRztRQUNQLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTztRQUNwQixHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU87S0FDNUMsQ0FBQztJQUVGLFNBQVMsUUFBUSxDQUFDLENBQUM7UUFDZixJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsTUFBTSxDQUFDLFVBQVMsQ0FBQztZQUNiLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVCLENBQUMsQ0FBQztJQUNOLENBQUM7SUFFRCxVQUFVLENBQUM7UUFDUCxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQzNELENBQUMsRUFBRSxPQUFPLENBQUMsU0FBUyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztJQUVoQyxFQUFFLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUNsQixJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FDckIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FDekIsVUFBVSxFQUFFLENBQ1IsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUNiLFNBQVMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDdEMsQ0FBQztBQTFCZSxjQUFNLEdBQU4sTUEwQmYsQ0FBQTs7O0FDcEhELHlDQUF5QztBQUN6Qyx1Q0FBdUM7QUFJdkMsSUFBSSxFQUFFLEdBQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNCLElBQUksS0FBSyxHQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNoQyxJQUFJLElBQUksR0FBSyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDL0IsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBRWpDLElBQU0sT0FBTztJQVVULFNBVkUsT0FBTyxDQVVHLFFBQXdCO1FBQ2hDLElBQUksQ0FBQyxHQUFHLEdBQWEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsTUFBTSxHQUFVLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO1FBQzFCLElBQUksQ0FBQyxVQUFVLEdBQU0sSUFBSSxDQUFDO1FBQzFCLElBQUksQ0FBQyxNQUFNLEdBQVUsSUFBSSxDQUFDO1FBQzFCLElBQUksQ0FBQyxNQUFNLEdBQVUsSUFBSSxNQUFNLEVBQUUsQ0FBQztRQUVsQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDNUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxvRUFBb0UsQ0FBQyxDQUFDO0lBQzdGLENBQUM7SUFFTywyQkFBUyxHQUFqQixVQUFrQixRQUF3QjtRQUN0QyxNQUFNLENBQVk7WUFDZCxLQUFLLEVBQUUsTUFBTSxDQUFDLFVBQVU7WUFDeEIsTUFBTSxFQUFFLE1BQU0sQ0FBQyxXQUFXLEdBQUcsRUFBRTtZQUMvQixNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDbEUsUUFBUSxFQUFFLFFBQVE7U0FDckIsQ0FBQztJQUNOLENBQUM7SUFFTywwQkFBUSxHQUFoQjtRQUNJLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNkLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzdDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVPLCtCQUFhLEdBQXJCLFVBQXNCLE1BQWM7UUFDaEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVPLCtCQUFhLEdBQXJCLFVBQXNCLE1BQWM7UUFDaEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNmLE1BQU0sQ0FBQztRQUNYLENBQUM7UUFFRCxJQUFJLElBQUksR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDN0UsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQztRQUVwRCxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFTyxzQkFBSSxHQUFaLFVBQWEsU0FBaUI7UUFBOUIsaUJBMkJDO1FBMUJHLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ2QsTUFBTSxDQUFDO1FBQ1gsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFDdEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUM7UUFDbkMsQ0FBQztRQUVELElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3pGLElBQUksQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDO1FBRS9CLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pGLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNqRSxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQyxNQUFNLENBQUMsVUFBVSxDQUFDO2dCQUNkLEtBQUksQ0FBQyxhQUFhLENBQUMseUNBQXlDLENBQUMsQ0FBQztnQkFDOUQsS0FBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUM1QixDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFFUixNQUFNLENBQUM7UUFDWCxDQUFDO1FBRUQsTUFBTSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRUQsK0JBQWEsR0FBYixVQUFjLElBQVk7UUFDdEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQzlCLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FDNUIsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUNiLElBQUksQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUNELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFRCx1QkFBSyxHQUFMO1FBQ0ksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDM0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFFMUIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDZCxJQUFJLENBQUMsYUFBYSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsVUFBVTtRQUN0RCxDQUFDLEdBRDBDO1FBQ3pDLElBQUksQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsRUFBVyxTQUFTO1FBQ3JELENBQUMsR0FEaUM7UUFHbEMsQUFDQSxRQURRO1FBQ1IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2IsTUFBTSxDQUFDO1FBQ1gsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDZixNQUFNLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVDLENBQUM7SUFDTCxDQUFDO0lBRUQsdUJBQUssR0FBTDtRQUNJLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFDcEQsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3BCLENBQUM7SUFFRCx1QkFBSyxHQUFMO1FBQ0ksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqQyxNQUFNLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFTCxjQUFDO0FBQUQsQ0ExSEEsQUEwSEMsSUFBQTtBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDOzs7QUN0SXpCLHlDQUF5QztBQUV6QyxTQUFnQixjQUFjLENBQUMsWUFBb0I7SUFDL0MsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQzFDLENBQUM7QUFGZSxzQkFBYyxHQUFkLGNBRWYsQ0FBQTs7O0FDSkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLy88cmVmZXJlbmNlIHBhdGg9Jy4vdHlwZXMvbm9kZS5kLnRzJyAvPlxuXG52YXIgVGltZXBpZUFwcCA9IHJlcXVpcmUoXCIuL3RpbWVwaWVcIik7XG5cbnZhciBhcHAgPSBuZXcgVGltZXBpZUFwcCh7XG4gICAgdG90YWw6ICAgMTk0ICogMTAwMCxcbiAgICBjdXJyZW50OiAxOTQgKiAxMDAwXG59KTtcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNoZW5kXCIsIGFwcC5wYXVzZS5iaW5kKGFwcCkpO1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFwcC5wYXVzZS5iaW5kKGFwcCkpO1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgZnVuY3Rpb24oZSkge1xuICAgIHN3aXRjaCAoZS5rZXlDb2RlKSB7XG4gICAgICAgIGNhc2UgMzI6IGFwcC5wYXVzZSgpOyBicmVhaztcbiAgICAgICAgY2FzZSAzODogYXBwLmFkanVzdE1pbnV0ZXMoKzEpOyBicmVhazsgLy8gdXBcbiAgICAgICAgY2FzZSA0MDogYXBwLmFkanVzdE1pbnV0ZXMoLTEpOyBicmVhazsgLy8gZG93blxuICAgICAgICBjYXNlIDM3OiBhcHAuYWRqdXN0U2Vjb25kcygtMSk7IGJyZWFrOyAvLyBsZWZ0XG4gICAgICAgIGNhc2UgMzk6IGFwcC5hZGp1c3RTZWNvbmRzKCsxKTsgYnJlYWs7IC8vIHJpZ2h0XG4gICAgfVxufS5iaW5kKGFwcCkpO1xuXG53aW5kb3dbJ3RpbWVwaWUnXSA9IGFwcDtcbmFwcC5zdGFydCgpO1xuIiwiLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi90eXBlcy93ZWJhdWRpb2FwaS93YWEuZC50c1wiLz5cblxuY2xhc3MgQmVlcGVyIHtcblxuICAgIHByaXZhdGUgYXVkaW9Db250ZXh0OiBBdWRpb0NvbnRleHQ7XG4gICAgcHJpdmF0ZSBvc2M6IGFueTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB3aW5kb3dbXCJBdWRpb0NvbnRleHRcIl0gPVxuICAgICAgICAgICAgd2luZG93W1wiQXVkaW9Db250ZXh0XCJdIHx8IHdpbmRvd1tcIndlYmtpdEF1ZGlvQ29udGV4dFwiXTtcbiAgICAgICAgdGhpcy5hdWRpb0NvbnRleHQgPSBuZXcgQXVkaW9Db250ZXh0KCk7XG5cbiAgICAgICAgdGhpcy5vc2MgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVPc2NpbGxhdG9yKCk7XG4gICAgICAgIHRoaXMub3NjLmNvbm5lY3QodGhpcy5hdWRpb0NvbnRleHQuZGVzdGluYXRpb24pO1xuICAgICAgICB0aGlzLm9zYy5mcmVxdWVuY3kuc2V0VmFsdWVBdFRpbWUoMCwgdGhpcy5hdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLm9zYy5zdGFydCgwKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGJlYmViZWVwKG9mZnNldCA9IDAsIGNvdW50ID0gMykge1xuICAgICAgICB2YXIgcGl0Y2ggPSAzNTtcbiAgICAgICAgdmFyIGluY3JlbWVudCA9IDAuMDU7XG4gICAgICAgIHZhciBzdGFydCA9IHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5vc2MuZnJlcXVlbmN5LnNldFZhbHVlQXRUaW1lKHRoaXMuZnJlcShwaXRjaCksXG4gICAgICAgICAgICAgICAgc3RhcnQgKyBvZmZzZXQgKyBpbmNyZW1lbnQgKiAoaSAqIDIpKTtcbiAgICAgICAgICAgIHRoaXMub3NjLmZyZXF1ZW5jeS5zZXRWYWx1ZUF0VGltZSgwLFxuICAgICAgICAgICAgICAgIHN0YXJ0ICsgb2Zmc2V0ICsgaW5jcmVtZW50ICogKGkgKiAyICsgMSkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmcmVxKGhhbGZTdGVwcykge1xuICAgICAgICByZXR1cm4gTWF0aC5wb3coTWF0aC5wb3coMiwgMSAvIDEyKSwgaGFsZlN0ZXBzKSAqIDIyMDtcbiAgICB9XG5cbiAgICBtYWtlTm9pc2UoKSB7XG4gICAgICAgIGlmICghdGhpcy5hdWRpb0NvbnRleHQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYmViZWJlZXAoMCwgMyk7XG4gICAgICAgIHRoaXMuYmViZWJlZXAoMSwgMyk7XG4gICAgICAgIHRoaXMuYmViZWJlZXAoMiwgMyk7XG4gICAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQmVlcGVyO1xuIiwiLy8vPHJlZmVyZW5jZSBwYXRoPScuL3R5cGVzL25vZGUuZC50cycgLz5cblxuaW1wb3J0IHR5cGVzID0gcmVxdWlyZShcIi4vdHlwZXNcIik7XG5cbnZhciBkMyAgID0gcmVxdWlyZShcImQzXCIpO1xudmFyIHV0aWwgPSByZXF1aXJlKFwiLi91dGlsXCIpO1xuXG5mdW5jdGlvbiBmb3JtYXREdXJhdGlvbihtaWxsaXNlY29uZHM6IG51bWJlcikge1xuICAgIHZhciBzZWNvbmRzID0gdXRpbC5taWxsaXMyc2Vjb25kcyhtaWxsaXNlY29uZHMpO1xuICAgIHZhciBtaW5zID0gTWF0aC5mbG9vcihzZWNvbmRzIC8gNjApO1xuICAgIHZhciBzZWNzID0gc2Vjb25kcyAtIG1pbnMgKiA2MDtcblxuICAgIHJldHVybiBtaW5zICsgXCI6XCIgKyAoc2VjcyA8IDEwID8gXCIwXCIgKyBzZWNzIDogXCJcIiArIHNlY3MpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXIoKSB7XG4gICAgZDMuc2VsZWN0KFwic3ZnXCIpLnJlbW92ZSgpO1xuICAgIGQzLnNlbGVjdChcIi50aW1lLWNvdW50ZXJcIikucmVtb3ZlKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUocGllOiB0eXBlcy5QaWUpIHtcbiAgICB2YXIgd2lkdGggID0gcGllLndpZHRoO1xuICAgIHZhciBoZWlnaHQgPSBwaWUuaGVpZ2h0O1xuICAgIHZhciByYWRpdXMgPSBwaWUucmFkaXVzO1xuXG4gICAgdmFyIGRhdGEgPSBbXG4gICAgICAgIHBpZS5kdXJhdGlvbi5jdXJyZW50LFxuICAgICAgICBwaWUuZHVyYXRpb24udG90YWwgLSBwaWUuZHVyYXRpb24uY3VycmVudFxuICAgIF07XG5cbiAgICB2YXIgYXJjID0gZDMuc3ZnLmFyYygpXG4gICAgICAgIC5pbm5lclJhZGl1cyhyYWRpdXMgKiAwLjc0KVxuICAgICAgICAub3V0ZXJSYWRpdXMocmFkaXVzKTsgLy8gLmNvcm5lclJhZGl1cyg1KTtcblxuICAgIHZhciBvdXRlckFyYyA9IGQzLnN2Zy5hcmMoKVxuICAgICAgICAuaW5uZXJSYWRpdXMocmFkaXVzICogMC43NCAtIDMpXG4gICAgICAgIC5vdXRlclJhZGl1cyhyYWRpdXMgKyAzKTtcblxuICAgIHZhciBsYXlvdXQgPSBkMy5sYXlvdXQucGllKCkgLy8gLnBhZEFuZ2xlKC4wMSlcbiAgICAgICAgLnNvcnQobnVsbCk7XG5cbiAgICB2YXIgY29sb3IgPSBkMy5zY2FsZS5jYXRlZ29yeTIwKCk7XG5cbiAgICB2YXIgc3ZnID0gZDMuc2VsZWN0KFwiYm9keVwiKVxuICAgICAgICAuYXBwZW5kKFwic3ZnXCIpXG4gICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJwaWVcIilcbiAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aClcbiAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KTtcblxuICAgIHZhciBncmFkcyA9IHN2Zy5hcHBlbmQoXCJkZWZzXCIpLnNlbGVjdEFsbChcInJhZGlhbEdyYWRpZW50XCIpLmRhdGEobGF5b3V0KGRhdGEpKVxuICAgICAgICAuZW50ZXIoKS5hcHBlbmQoXCJyYWRpYWxHcmFkaWVudFwiKVxuICAgICAgICAuYXR0cihcImdyYWRpZW50VW5pdHNcIiwgXCJ1c2VyU3BhY2VPblVzZVwiKVxuICAgICAgICAuYXR0cihcImN4XCIsIFwiNSVcIilcbiAgICAgICAgLmF0dHIoXCJjeVwiLCBcIjUlXCIpXG4gICAgICAgIC5hdHRyKFwiclwiLCBcIjgwJVwiKVxuICAgICAgICAuYXR0cihcImlkXCIsIGZ1bmN0aW9uKGQsIGkpIHsgcmV0dXJuIFwiZ3JhZFwiICsgaTsgfSk7XG5cbiAgICBncmFkcy5hcHBlbmQoXCJzdG9wXCIpLmF0dHIoXCJvZmZzZXRcIiwgXCIwJVwiKS5zdHlsZShcInN0b3AtY29sb3JcIiwgXCIjOTk5XCIpO1xuICAgIGdyYWRzLmFwcGVuZChcInN0b3BcIikuYXR0cihcIm9mZnNldFwiLCBcIjEwMCVcIikuc3R5bGUoXCJzdG9wLWNvbG9yXCIsIGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgcmV0dXJuIGNvbG9yKGkpO1xuICAgIH0pO1xuXG4gICAgdmFyIGFyY3MgPSBzdmcuc2VsZWN0QWxsKFwiZy5hcmNcIilcbiAgICAgICAgLmRhdGEobGF5b3V0KGRhdGEpKVxuICAgICAgICAuZW50ZXIoKVxuICAgICAgICAuYXBwZW5kKFwiZ1wiKVxuICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIHdpZHRoIC8gMiArIFwiLFwiICsgaGVpZ2h0IC8gMiArIFwiKVwiKTtcblxuICAgIGFyY3MuYXBwZW5kKFwicGF0aFwiKVxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiYmdcIilcbiAgICAgICAgLmF0dHIoXCJkXCIsIG91dGVyQXJjKTtcblxuICAgIGFyY3MuYXBwZW5kKFwicGF0aFwiKVxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiZmdcIilcbiAgICAgICAgLmVhY2goZnVuY3Rpb24oZCkgeyB0aGlzLl9jdXJyZW50ID0gZDsgfSlcbiAgICAgICAgLmF0dHIoXCJmaWxsXCIsIGZ1bmN0aW9uKGQsIGkpIHsgcmV0dXJuIFwidXJsKCNncmFkXCIgKyBpICsgXCIpXCI7IH0pXG4gICAgICAgIC5hdHRyKFwiZFwiLCBhcmMpO1xuXG4gICAgdmFyIHRpbWUgPSBkMy5zZWxlY3QoXCJib2R5XCIpLmFwcGVuZChcImRpdlwiKVxuICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwidGltZS1jb3VudGVyXCIpXG4gICAgICAgIC50ZXh0KGZvcm1hdER1cmF0aW9uKHBpZS5kdXJhdGlvbi5jdXJyZW50KSk7XG5cbiAgICByZXR1cm4gPHR5cGVzLlBpZVZpc3VhbGl6YXRpb24+e1xuICAgICAgICBjb2xvcjogY29sb3IsXG4gICAgICAgIGFyYzogYXJjLFxuICAgICAgICBsYXlvdXQ6IGxheW91dCxcbiAgICAgICAgdGltZTogdGltZVxuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZShwaWU6IHR5cGVzLlBpZSwgcGllVmlzOiB0eXBlcy5QaWVWaXN1YWxpemF0aW9uLCBvcHRpb25zOiBhbnkpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgXG4gICAgdmFyIGRhdGEgPSBbXG4gICAgICAgIHBpZS5kdXJhdGlvbi5jdXJyZW50LFxuICAgICAgICBwaWUuZHVyYXRpb24udG90YWwgLSBwaWUuZHVyYXRpb24uY3VycmVudFxuICAgIF07XG5cbiAgICBmdW5jdGlvbiBhcmNUd2VlbihhKSB7XG4gICAgICAgIHZhciBpID0gZDMuaW50ZXJwb2xhdGUodGhpcy5fY3VycmVudCwgYSk7XG4gICAgICAgIHRoaXMuX2N1cnJlbnQgPSBpKDApO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgICAgICAgICAgcmV0dXJuIHBpZVZpcy5hcmMoaSh0KSk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgcGllVmlzLnRpbWUudGV4dChmb3JtYXREdXJhdGlvbihwaWUuZHVyYXRpb24uY3VycmVudCkpO1xuICAgIH0sIG9wdGlvbnMuaW1tZWRpYXRlID8gMCA6IDI1MCk7XG5cbiAgICBkMy5zZWxlY3RBbGwoXCJwYXRoLmZnXCIpXG4gICAgICAgIC5hdHRyKFwiZFwiLCBwaWVWaXMuYXJjKVxuICAgICAgICAuZGF0YShwaWVWaXMubGF5b3V0KGRhdGEpKVxuICAgICAgICAudHJhbnNpdGlvbigpXG4gICAgICAgICAgICAuZHVyYXRpb24oNTAwKVxuICAgICAgICAgICAgLmF0dHJUd2VlbihcImRcIiwgYXJjVHdlZW4pO1xufVxuIiwiLy8vPHJlZmVyZW5jZSBwYXRoPScuL3R5cGVzL25vZGUuZC50cycgLz5cbi8vLzxyZWZlcmVuY2UgcGF0aD0nLi90eXBlcy9kMy5kLnRzJyAvPlxuXG5pbXBvcnQgdHlwZXMgID0gcmVxdWlyZShcIi4vdHlwZXNcIik7XG5cbnZhciBkMyAgICAgPSByZXF1aXJlKFwiZDNcIik7XG52YXIgZ3JhcGggID0gcmVxdWlyZShcIi4vZ3JhcGhcIik7XG52YXIgdXRpbCAgID0gcmVxdWlyZShcIi4vdXRpbFwiKTtcbnZhciBCZWVwZXIgPSByZXF1aXJlKFwiLi9iZWVwZXJcIik7XG5cbmNsYXNzIFRpbWVwaWUge1xuXG4gICAgcHJpdmF0ZSBwaWU6ICAgICAgICAgICAgdHlwZXMuUGllO1xuICAgIHByaXZhdGUgcGllVmlzOiAgICAgICAgIHR5cGVzLlBpZVZpc3VhbGl6YXRpb247XG4gICAgcHJpdmF0ZSBsYXN0VGltZXN0YW1wOiAgbnVtYmVyO1xuICAgIHByaXZhdGUgbGFzdFVwZGF0ZTogICAgIG51bWJlcjtcbiAgICBwcml2YXRlIHBhdXNlZDogICAgICAgICBib29sZWFuO1xuICAgIHByaXZhdGUgc3RhdHVzRWw6ICAgICAgIEQzLlNlbGVjdGlvbjtcbiAgICBwcml2YXRlIGJlZXBlcjogICAgICAgICBhbnk7IC8vIFRPRE86IEJlZXBlclxuXG4gICAgY29uc3RydWN0b3IoZHVyYXRpb246IHR5cGVzLkR1cmF0aW9uKSB7XG4gICAgICAgIHRoaXMucGllICAgICAgICAgICA9IHRoaXMuY3JlYXRlUGllKGR1cmF0aW9uKTtcbiAgICAgICAgdGhpcy5waWVWaXMgICAgICAgID0gZ3JhcGguY3JlYXRlKHRoaXMucGllKTtcbiAgICAgICAgdGhpcy5sYXN0VGltZXN0YW1wID0gbnVsbDtcbiAgICAgICAgdGhpcy5sYXN0VXBkYXRlICAgID0gbnVsbDtcbiAgICAgICAgdGhpcy5wYXVzZWQgICAgICAgID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5iZWVwZXIgICAgICAgID0gbmV3IEJlZXBlcigpO1xuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMucmVjcmVhdGUuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuZGlzcGxheVN0YXR1cyhcIjxlbT5zcGFjZTwvZW0+IHBsYXlzIC8gcGF1c2VzPGJyIC8+PGVtPmFycm93IGtleXM8L2VtPiBhZGp1c3QgdGltZVwiKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZVBpZShkdXJhdGlvbjogdHlwZXMuRHVyYXRpb24pOiB0eXBlcy5QaWUge1xuICAgICAgICByZXR1cm4gPHR5cGVzLlBpZT57XG4gICAgICAgICAgICB3aWR0aDogd2luZG93LmlubmVyV2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IHdpbmRvdy5pbm5lckhlaWdodCAtIDMwLFxuICAgICAgICAgICAgcmFkaXVzOiAoTWF0aC5taW4od2luZG93LmlubmVySGVpZ2h0LCB3aW5kb3cuaW5uZXJXaWR0aCkgLSA1MCkgLyAyLFxuICAgICAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZWNyZWF0ZSgpIHtcbiAgICAgICAgZ3JhcGguY2xlYXIoKTtcbiAgICAgICAgdGhpcy5waWUgPSB0aGlzLmNyZWF0ZVBpZSh0aGlzLnBpZS5kdXJhdGlvbik7XG4gICAgICAgIHRoaXMucGllVmlzID0gZ3JhcGguY3JlYXRlKHRoaXMucGllKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFkanVzdE1pbnV0ZXMoYW1vdW50OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5hZGp1c3RTZWNvbmRzKGFtb3VudCAqIDYwKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFkanVzdFNlY29uZHMoYW1vdW50OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKCF0aGlzLnBhdXNlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRpZmYgPSBhbW91bnQgKiAxMDAwO1xuICAgICAgICB0aGlzLnBpZS5kdXJhdGlvbi5jdXJyZW50ID0gTWF0aC5tYXgoMTAwMCwgdGhpcy5waWUuZHVyYXRpb24uY3VycmVudCArIGRpZmYpO1xuICAgICAgICB0aGlzLnBpZS5kdXJhdGlvbi50b3RhbCA9IHRoaXMucGllLmR1cmF0aW9uLmN1cnJlbnQ7XG5cbiAgICAgICAgZ3JhcGgudXBkYXRlKHRoaXMucGllLCB0aGlzLnBpZVZpcywgeyBpbW1lZGlhdGU6IHRydWUgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB0aWNrKHRpbWVzdGFtcDogbnVtYmVyKSB7XG4gICAgICAgIGlmICh0aGlzLnBhdXNlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmxhc3RUaW1lc3RhbXApIHtcbiAgICAgICAgICAgIHRoaXMubGFzdFRpbWVzdGFtcCA9IHRpbWVzdGFtcDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucGllLmR1cmF0aW9uLmN1cnJlbnQgPSB0aGlzLnBpZS5kdXJhdGlvbi5jdXJyZW50IC0gKHRpbWVzdGFtcCAtIHRoaXMubGFzdFRpbWVzdGFtcCk7XG4gICAgICAgIHRoaXMubGFzdFRpbWVzdGFtcCA9IHRpbWVzdGFtcDtcblxuICAgICAgICBpZiAoIXRoaXMubGFzdFVwZGF0ZSB8fCB0aGlzLmxhc3RVcGRhdGUgIT09IHV0aWwubWlsbGlzMnNlY29uZHModGhpcy5waWUuZHVyYXRpb24uY3VycmVudCkpIHtcbiAgICAgICAgICAgIHRoaXMubGFzdFVwZGF0ZSA9IHV0aWwubWlsbGlzMnNlY29uZHModGhpcy5waWUuZHVyYXRpb24uY3VycmVudCk7XG4gICAgICAgICAgICBncmFwaC51cGRhdGUodGhpcy5waWUsIHRoaXMucGllVmlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnBpZS5kdXJhdGlvbi5jdXJyZW50IDw9IDApIHtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXlTdGF0dXMoXCJ0aW1lJ3MgdXAhIGhpdCA8ZW0+c3BhY2U8L2VtPiB0byByZXNldC5cIik7XG4gICAgICAgICAgICAgICAgdGhpcy5iZWVwZXIubWFrZU5vaXNlKCk7XG4gICAgICAgICAgICB9LCAyNTApO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMudGljayk7XG4gICAgfVxuXG4gICAgZGlzcGxheVN0YXR1cyh0ZXh0OiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdHVzRWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5zdGF0dXNFbCA9IGQzLnNlbGVjdChcImJvZHlcIilcbiAgICAgICAgICAgICAgICAuYXBwZW5kKFwiZGl2XCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInN0YXR1cy10ZXh0XCIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3RhdHVzRWwuaHRtbCh0ZXh0KTtcbiAgICB9XG5cbiAgICBwYXVzZSgpIHtcbiAgICAgICAgdGhpcy5wYXVzZWQgPSAhdGhpcy5wYXVzZWQ7XG4gICAgICAgIHRoaXMubGFzdFRpbWVzdGFtcCA9IG51bGw7XG5cbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKSB7XG4gICAgICAgICAgICB0aGlzLmRpc3BsYXlTdGF0dXMoXCImIzEwMDczOyYjMTAwNzM7XCIpOyAvLyBcInBhdXNlXCJcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheVN0YXR1cyhcIiYjOTY1ODtcIik7ICAgICAgICAgIC8vIFwicGxheVwiXG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXNldFxuICAgICAgICBpZiAodGhpcy5waWUuZHVyYXRpb24uY3VycmVudCA8PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMucGF1c2VkKSB7XG4gICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMudGljayk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXNldCgpIHtcbiAgICAgICAgdGhpcy5waWUuZHVyYXRpb24uY3VycmVudCA9IHRoaXMucGllLmR1cmF0aW9uLnRvdGFsO1xuICAgICAgICB0aGlzLnJlY3JlYXRlKCk7XG4gICAgfVxuXG4gICAgc3RhcnQoKSB7XG4gICAgICAgIHRoaXMudGljayA9IHRoaXMudGljay5iaW5kKHRoaXMpO1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMudGljayk7XG4gICAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gVGltZXBpZTtcbiIsIi8vLzxyZWZlcmVuY2UgcGF0aD0nLi90eXBlcy9ub2RlLmQudHMnIC8+XG5cbmV4cG9ydCBmdW5jdGlvbiBtaWxsaXMyc2Vjb25kcyhtaWxsaXNlY29uZHM6IG51bWJlcikge1xuICAgIHJldHVybiBNYXRoLmNlaWwobWlsbGlzZWNvbmRzIC8gMTAwMCk7XG59XG4iLCIhZnVuY3Rpb24oKSB7XG4gIHZhciBkMyA9IHtcbiAgICB2ZXJzaW9uOiBcIjMuNS4yXCJcbiAgfTtcbiAgaWYgKCFEYXRlLm5vdykgRGF0ZS5ub3cgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gK25ldyBEYXRlKCk7XG4gIH07XG4gIHZhciBkM19hcnJheVNsaWNlID0gW10uc2xpY2UsIGQzX2FycmF5ID0gZnVuY3Rpb24obGlzdCkge1xuICAgIHJldHVybiBkM19hcnJheVNsaWNlLmNhbGwobGlzdCk7XG4gIH07XG4gIHZhciBkM19kb2N1bWVudCA9IGRvY3VtZW50LCBkM19kb2N1bWVudEVsZW1lbnQgPSBkM19kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIGQzX3dpbmRvdyA9IHdpbmRvdztcbiAgdHJ5IHtcbiAgICBkM19hcnJheShkM19kb2N1bWVudEVsZW1lbnQuY2hpbGROb2RlcylbMF0ubm9kZVR5cGU7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBkM19hcnJheSA9IGZ1bmN0aW9uKGxpc3QpIHtcbiAgICAgIHZhciBpID0gbGlzdC5sZW5ndGgsIGFycmF5ID0gbmV3IEFycmF5KGkpO1xuICAgICAgd2hpbGUgKGktLSkgYXJyYXlbaV0gPSBsaXN0W2ldO1xuICAgICAgcmV0dXJuIGFycmF5O1xuICAgIH07XG4gIH1cbiAgdHJ5IHtcbiAgICBkM19kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLnN0eWxlLnNldFByb3BlcnR5KFwib3BhY2l0eVwiLCAwLCBcIlwiKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICB2YXIgZDNfZWxlbWVudF9wcm90b3R5cGUgPSBkM193aW5kb3cuRWxlbWVudC5wcm90b3R5cGUsIGQzX2VsZW1lbnRfc2V0QXR0cmlidXRlID0gZDNfZWxlbWVudF9wcm90b3R5cGUuc2V0QXR0cmlidXRlLCBkM19lbGVtZW50X3NldEF0dHJpYnV0ZU5TID0gZDNfZWxlbWVudF9wcm90b3R5cGUuc2V0QXR0cmlidXRlTlMsIGQzX3N0eWxlX3Byb3RvdHlwZSA9IGQzX3dpbmRvdy5DU1NTdHlsZURlY2xhcmF0aW9uLnByb3RvdHlwZSwgZDNfc3R5bGVfc2V0UHJvcGVydHkgPSBkM19zdHlsZV9wcm90b3R5cGUuc2V0UHJvcGVydHk7XG4gICAgZDNfZWxlbWVudF9wcm90b3R5cGUuc2V0QXR0cmlidXRlID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICAgIGQzX2VsZW1lbnRfc2V0QXR0cmlidXRlLmNhbGwodGhpcywgbmFtZSwgdmFsdWUgKyBcIlwiKTtcbiAgICB9O1xuICAgIGQzX2VsZW1lbnRfcHJvdG90eXBlLnNldEF0dHJpYnV0ZU5TID0gZnVuY3Rpb24oc3BhY2UsIGxvY2FsLCB2YWx1ZSkge1xuICAgICAgZDNfZWxlbWVudF9zZXRBdHRyaWJ1dGVOUy5jYWxsKHRoaXMsIHNwYWNlLCBsb2NhbCwgdmFsdWUgKyBcIlwiKTtcbiAgICB9O1xuICAgIGQzX3N0eWxlX3Byb3RvdHlwZS5zZXRQcm9wZXJ0eSA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICAgICAgZDNfc3R5bGVfc2V0UHJvcGVydHkuY2FsbCh0aGlzLCBuYW1lLCB2YWx1ZSArIFwiXCIsIHByaW9yaXR5KTtcbiAgICB9O1xuICB9XG4gIGQzLmFzY2VuZGluZyA9IGQzX2FzY2VuZGluZztcbiAgZnVuY3Rpb24gZDNfYXNjZW5kaW5nKGEsIGIpIHtcbiAgICByZXR1cm4gYSA8IGIgPyAtMSA6IGEgPiBiID8gMSA6IGEgPj0gYiA/IDAgOiBOYU47XG4gIH1cbiAgZDMuZGVzY2VuZGluZyA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gYiA8IGEgPyAtMSA6IGIgPiBhID8gMSA6IGIgPj0gYSA/IDAgOiBOYU47XG4gIH07XG4gIGQzLm1pbiA9IGZ1bmN0aW9uKGFycmF5LCBmKSB7XG4gICAgdmFyIGkgPSAtMSwgbiA9IGFycmF5Lmxlbmd0aCwgYSwgYjtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgd2hpbGUgKCsraSA8IG4pIGlmICgoYiA9IGFycmF5W2ldKSAhPSBudWxsICYmIGIgPj0gYikge1xuICAgICAgICBhID0gYjtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICB3aGlsZSAoKytpIDwgbikgaWYgKChiID0gYXJyYXlbaV0pICE9IG51bGwgJiYgYSA+IGIpIGEgPSBiO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aGlsZSAoKytpIDwgbikgaWYgKChiID0gZi5jYWxsKGFycmF5LCBhcnJheVtpXSwgaSkpICE9IG51bGwgJiYgYiA+PSBiKSB7XG4gICAgICAgIGEgPSBiO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIHdoaWxlICgrK2kgPCBuKSBpZiAoKGIgPSBmLmNhbGwoYXJyYXksIGFycmF5W2ldLCBpKSkgIT0gbnVsbCAmJiBhID4gYikgYSA9IGI7XG4gICAgfVxuICAgIHJldHVybiBhO1xuICB9O1xuICBkMy5tYXggPSBmdW5jdGlvbihhcnJheSwgZikge1xuICAgIHZhciBpID0gLTEsIG4gPSBhcnJheS5sZW5ndGgsIGEsIGI7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSBpZiAoKGIgPSBhcnJheVtpXSkgIT0gbnVsbCAmJiBiID49IGIpIHtcbiAgICAgICAgYSA9IGI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgd2hpbGUgKCsraSA8IG4pIGlmICgoYiA9IGFycmF5W2ldKSAhPSBudWxsICYmIGIgPiBhKSBhID0gYjtcbiAgICB9IGVsc2Uge1xuICAgICAgd2hpbGUgKCsraSA8IG4pIGlmICgoYiA9IGYuY2FsbChhcnJheSwgYXJyYXlbaV0sIGkpKSAhPSBudWxsICYmIGIgPj0gYikge1xuICAgICAgICBhID0gYjtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICB3aGlsZSAoKytpIDwgbikgaWYgKChiID0gZi5jYWxsKGFycmF5LCBhcnJheVtpXSwgaSkpICE9IG51bGwgJiYgYiA+IGEpIGEgPSBiO1xuICAgIH1cbiAgICByZXR1cm4gYTtcbiAgfTtcbiAgZDMuZXh0ZW50ID0gZnVuY3Rpb24oYXJyYXksIGYpIHtcbiAgICB2YXIgaSA9IC0xLCBuID0gYXJyYXkubGVuZ3RoLCBhLCBiLCBjO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICB3aGlsZSAoKytpIDwgbikgaWYgKChiID0gYXJyYXlbaV0pICE9IG51bGwgJiYgYiA+PSBiKSB7XG4gICAgICAgIGEgPSBjID0gYjtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICB3aGlsZSAoKytpIDwgbikgaWYgKChiID0gYXJyYXlbaV0pICE9IG51bGwpIHtcbiAgICAgICAgaWYgKGEgPiBiKSBhID0gYjtcbiAgICAgICAgaWYgKGMgPCBiKSBjID0gYjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgd2hpbGUgKCsraSA8IG4pIGlmICgoYiA9IGYuY2FsbChhcnJheSwgYXJyYXlbaV0sIGkpKSAhPSBudWxsICYmIGIgPj0gYikge1xuICAgICAgICBhID0gYyA9IGI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgd2hpbGUgKCsraSA8IG4pIGlmICgoYiA9IGYuY2FsbChhcnJheSwgYXJyYXlbaV0sIGkpKSAhPSBudWxsKSB7XG4gICAgICAgIGlmIChhID4gYikgYSA9IGI7XG4gICAgICAgIGlmIChjIDwgYikgYyA9IGI7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBbIGEsIGMgXTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfbnVtYmVyKHgpIHtcbiAgICByZXR1cm4geCA9PT0gbnVsbCA/IE5hTiA6ICt4O1xuICB9XG4gIGZ1bmN0aW9uIGQzX251bWVyaWMoeCkge1xuICAgIHJldHVybiAhaXNOYU4oeCk7XG4gIH1cbiAgZDMuc3VtID0gZnVuY3Rpb24oYXJyYXksIGYpIHtcbiAgICB2YXIgcyA9IDAsIG4gPSBhcnJheS5sZW5ndGgsIGEsIGkgPSAtMTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgd2hpbGUgKCsraSA8IG4pIGlmIChkM19udW1lcmljKGEgPSArYXJyYXlbaV0pKSBzICs9IGE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSBpZiAoZDNfbnVtZXJpYyhhID0gK2YuY2FsbChhcnJheSwgYXJyYXlbaV0sIGkpKSkgcyArPSBhO1xuICAgIH1cbiAgICByZXR1cm4gcztcbiAgfTtcbiAgZDMubWVhbiA9IGZ1bmN0aW9uKGFycmF5LCBmKSB7XG4gICAgdmFyIHMgPSAwLCBuID0gYXJyYXkubGVuZ3RoLCBhLCBpID0gLTEsIGogPSBuO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICB3aGlsZSAoKytpIDwgbikgaWYgKGQzX251bWVyaWMoYSA9IGQzX251bWJlcihhcnJheVtpXSkpKSBzICs9IGE7IGVsc2UgLS1qO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aGlsZSAoKytpIDwgbikgaWYgKGQzX251bWVyaWMoYSA9IGQzX251bWJlcihmLmNhbGwoYXJyYXksIGFycmF5W2ldLCBpKSkpKSBzICs9IGE7IGVsc2UgLS1qO1xuICAgIH1cbiAgICBpZiAoaikgcmV0dXJuIHMgLyBqO1xuICB9O1xuICBkMy5xdWFudGlsZSA9IGZ1bmN0aW9uKHZhbHVlcywgcCkge1xuICAgIHZhciBIID0gKHZhbHVlcy5sZW5ndGggLSAxKSAqIHAgKyAxLCBoID0gTWF0aC5mbG9vcihIKSwgdiA9ICt2YWx1ZXNbaCAtIDFdLCBlID0gSCAtIGg7XG4gICAgcmV0dXJuIGUgPyB2ICsgZSAqICh2YWx1ZXNbaF0gLSB2KSA6IHY7XG4gIH07XG4gIGQzLm1lZGlhbiA9IGZ1bmN0aW9uKGFycmF5LCBmKSB7XG4gICAgdmFyIG51bWJlcnMgPSBbXSwgbiA9IGFycmF5Lmxlbmd0aCwgYSwgaSA9IC0xO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICB3aGlsZSAoKytpIDwgbikgaWYgKGQzX251bWVyaWMoYSA9IGQzX251bWJlcihhcnJheVtpXSkpKSBudW1iZXJzLnB1c2goYSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSBpZiAoZDNfbnVtZXJpYyhhID0gZDNfbnVtYmVyKGYuY2FsbChhcnJheSwgYXJyYXlbaV0sIGkpKSkpIG51bWJlcnMucHVzaChhKTtcbiAgICB9XG4gICAgaWYgKG51bWJlcnMubGVuZ3RoKSByZXR1cm4gZDMucXVhbnRpbGUobnVtYmVycy5zb3J0KGQzX2FzY2VuZGluZyksIC41KTtcbiAgfTtcbiAgZDMudmFyaWFuY2UgPSBmdW5jdGlvbihhcnJheSwgZikge1xuICAgIHZhciBuID0gYXJyYXkubGVuZ3RoLCBtID0gMCwgYSwgZCwgcyA9IDAsIGkgPSAtMSwgaiA9IDA7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgIGlmIChkM19udW1lcmljKGEgPSBkM19udW1iZXIoYXJyYXlbaV0pKSkge1xuICAgICAgICAgIGQgPSBhIC0gbTtcbiAgICAgICAgICBtICs9IGQgLyArK2o7XG4gICAgICAgICAgcyArPSBkICogKGEgLSBtKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgICBpZiAoZDNfbnVtZXJpYyhhID0gZDNfbnVtYmVyKGYuY2FsbChhcnJheSwgYXJyYXlbaV0sIGkpKSkpIHtcbiAgICAgICAgICBkID0gYSAtIG07XG4gICAgICAgICAgbSArPSBkIC8gKytqO1xuICAgICAgICAgIHMgKz0gZCAqIChhIC0gbSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGogPiAxKSByZXR1cm4gcyAvIChqIC0gMSk7XG4gIH07XG4gIGQzLmRldmlhdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ID0gZDMudmFyaWFuY2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdiA/IE1hdGguc3FydCh2KSA6IHY7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX2Jpc2VjdG9yKGNvbXBhcmUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGVmdDogZnVuY3Rpb24oYSwgeCwgbG8sIGhpKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMykgbG8gPSAwO1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDQpIGhpID0gYS5sZW5ndGg7XG4gICAgICAgIHdoaWxlIChsbyA8IGhpKSB7XG4gICAgICAgICAgdmFyIG1pZCA9IGxvICsgaGkgPj4+IDE7XG4gICAgICAgICAgaWYgKGNvbXBhcmUoYVttaWRdLCB4KSA8IDApIGxvID0gbWlkICsgMTsgZWxzZSBoaSA9IG1pZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbG87XG4gICAgICB9LFxuICAgICAgcmlnaHQ6IGZ1bmN0aW9uKGEsIHgsIGxvLCBoaSkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIGxvID0gMDtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCA0KSBoaSA9IGEubGVuZ3RoO1xuICAgICAgICB3aGlsZSAobG8gPCBoaSkge1xuICAgICAgICAgIHZhciBtaWQgPSBsbyArIGhpID4+PiAxO1xuICAgICAgICAgIGlmIChjb21wYXJlKGFbbWlkXSwgeCkgPiAwKSBoaSA9IG1pZDsgZWxzZSBsbyA9IG1pZCArIDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxvO1xuICAgICAgfVxuICAgIH07XG4gIH1cbiAgdmFyIGQzX2Jpc2VjdCA9IGQzX2Jpc2VjdG9yKGQzX2FzY2VuZGluZyk7XG4gIGQzLmJpc2VjdExlZnQgPSBkM19iaXNlY3QubGVmdDtcbiAgZDMuYmlzZWN0ID0gZDMuYmlzZWN0UmlnaHQgPSBkM19iaXNlY3QucmlnaHQ7XG4gIGQzLmJpc2VjdG9yID0gZnVuY3Rpb24oZikge1xuICAgIHJldHVybiBkM19iaXNlY3RvcihmLmxlbmd0aCA9PT0gMSA/IGZ1bmN0aW9uKGQsIHgpIHtcbiAgICAgIHJldHVybiBkM19hc2NlbmRpbmcoZihkKSwgeCk7XG4gICAgfSA6IGYpO1xuICB9O1xuICBkMy5zaHVmZmxlID0gZnVuY3Rpb24oYXJyYXksIGkwLCBpMSkge1xuICAgIGlmICgobSA9IGFyZ3VtZW50cy5sZW5ndGgpIDwgMykge1xuICAgICAgaTEgPSBhcnJheS5sZW5ndGg7XG4gICAgICBpZiAobSA8IDIpIGkwID0gMDtcbiAgICB9XG4gICAgdmFyIG0gPSBpMSAtIGkwLCB0LCBpO1xuICAgIHdoaWxlIChtKSB7XG4gICAgICBpID0gTWF0aC5yYW5kb20oKSAqIG0tLSB8IDA7XG4gICAgICB0ID0gYXJyYXlbbSArIGkwXSwgYXJyYXlbbSArIGkwXSA9IGFycmF5W2kgKyBpMF0sIGFycmF5W2kgKyBpMF0gPSB0O1xuICAgIH1cbiAgICByZXR1cm4gYXJyYXk7XG4gIH07XG4gIGQzLnBlcm11dGUgPSBmdW5jdGlvbihhcnJheSwgaW5kZXhlcykge1xuICAgIHZhciBpID0gaW5kZXhlcy5sZW5ndGgsIHBlcm11dGVzID0gbmV3IEFycmF5KGkpO1xuICAgIHdoaWxlIChpLS0pIHBlcm11dGVzW2ldID0gYXJyYXlbaW5kZXhlc1tpXV07XG4gICAgcmV0dXJuIHBlcm11dGVzO1xuICB9O1xuICBkMy5wYWlycyA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgdmFyIGkgPSAwLCBuID0gYXJyYXkubGVuZ3RoIC0gMSwgcDAsIHAxID0gYXJyYXlbMF0sIHBhaXJzID0gbmV3IEFycmF5KG4gPCAwID8gMCA6IG4pO1xuICAgIHdoaWxlIChpIDwgbikgcGFpcnNbaV0gPSBbIHAwID0gcDEsIHAxID0gYXJyYXlbKytpXSBdO1xuICAgIHJldHVybiBwYWlycztcbiAgfTtcbiAgZDMuemlwID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCEobiA9IGFyZ3VtZW50cy5sZW5ndGgpKSByZXR1cm4gW107XG4gICAgZm9yICh2YXIgaSA9IC0xLCBtID0gZDMubWluKGFyZ3VtZW50cywgZDNfemlwTGVuZ3RoKSwgemlwcyA9IG5ldyBBcnJheShtKTsgKytpIDwgbTsgKSB7XG4gICAgICBmb3IgKHZhciBqID0gLTEsIG4sIHppcCA9IHppcHNbaV0gPSBuZXcgQXJyYXkobik7ICsraiA8IG47ICkge1xuICAgICAgICB6aXBbal0gPSBhcmd1bWVudHNbal1baV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB6aXBzO1xuICB9O1xuICBmdW5jdGlvbiBkM196aXBMZW5ndGgoZCkge1xuICAgIHJldHVybiBkLmxlbmd0aDtcbiAgfVxuICBkMy50cmFuc3Bvc2UgPSBmdW5jdGlvbihtYXRyaXgpIHtcbiAgICByZXR1cm4gZDMuemlwLmFwcGx5KGQzLCBtYXRyaXgpO1xuICB9O1xuICBkMy5rZXlzID0gZnVuY3Rpb24obWFwKSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gbWFwKSBrZXlzLnB1c2goa2V5KTtcbiAgICByZXR1cm4ga2V5cztcbiAgfTtcbiAgZDMudmFsdWVzID0gZnVuY3Rpb24obWFwKSB7XG4gICAgdmFyIHZhbHVlcyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBtYXApIHZhbHVlcy5wdXNoKG1hcFtrZXldKTtcbiAgICByZXR1cm4gdmFsdWVzO1xuICB9O1xuICBkMy5lbnRyaWVzID0gZnVuY3Rpb24obWFwKSB7XG4gICAgdmFyIGVudHJpZXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gbWFwKSBlbnRyaWVzLnB1c2goe1xuICAgICAga2V5OiBrZXksXG4gICAgICB2YWx1ZTogbWFwW2tleV1cbiAgICB9KTtcbiAgICByZXR1cm4gZW50cmllcztcbiAgfTtcbiAgZDMubWVyZ2UgPSBmdW5jdGlvbihhcnJheXMpIHtcbiAgICB2YXIgbiA9IGFycmF5cy5sZW5ndGgsIG0sIGkgPSAtMSwgaiA9IDAsIG1lcmdlZCwgYXJyYXk7XG4gICAgd2hpbGUgKCsraSA8IG4pIGogKz0gYXJyYXlzW2ldLmxlbmd0aDtcbiAgICBtZXJnZWQgPSBuZXcgQXJyYXkoaik7XG4gICAgd2hpbGUgKC0tbiA+PSAwKSB7XG4gICAgICBhcnJheSA9IGFycmF5c1tuXTtcbiAgICAgIG0gPSBhcnJheS5sZW5ndGg7XG4gICAgICB3aGlsZSAoLS1tID49IDApIHtcbiAgICAgICAgbWVyZ2VkWy0tal0gPSBhcnJheVttXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1lcmdlZDtcbiAgfTtcbiAgdmFyIGFicyA9IE1hdGguYWJzO1xuICBkMy5yYW5nZSA9IGZ1bmN0aW9uKHN0YXJ0LCBzdG9wLCBzdGVwKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzKSB7XG4gICAgICBzdGVwID0gMTtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgICAgICBzdG9wID0gc3RhcnQ7XG4gICAgICAgIHN0YXJ0ID0gMDtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKChzdG9wIC0gc3RhcnQpIC8gc3RlcCA9PT0gSW5maW5pdHkpIHRocm93IG5ldyBFcnJvcihcImluZmluaXRlIHJhbmdlXCIpO1xuICAgIHZhciByYW5nZSA9IFtdLCBrID0gZDNfcmFuZ2VfaW50ZWdlclNjYWxlKGFicyhzdGVwKSksIGkgPSAtMSwgajtcbiAgICBzdGFydCAqPSBrLCBzdG9wICo9IGssIHN0ZXAgKj0gaztcbiAgICBpZiAoc3RlcCA8IDApIHdoaWxlICgoaiA9IHN0YXJ0ICsgc3RlcCAqICsraSkgPiBzdG9wKSByYW5nZS5wdXNoKGogLyBrKTsgZWxzZSB3aGlsZSAoKGogPSBzdGFydCArIHN0ZXAgKiArK2kpIDwgc3RvcCkgcmFuZ2UucHVzaChqIC8gayk7XG4gICAgcmV0dXJuIHJhbmdlO1xuICB9O1xuICBmdW5jdGlvbiBkM19yYW5nZV9pbnRlZ2VyU2NhbGUoeCkge1xuICAgIHZhciBrID0gMTtcbiAgICB3aGlsZSAoeCAqIGsgJSAxKSBrICo9IDEwO1xuICAgIHJldHVybiBrO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2NsYXNzKGN0b3IsIHByb3BlcnRpZXMpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gcHJvcGVydGllcykge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGN0b3IucHJvdG90eXBlLCBrZXksIHtcbiAgICAgICAgdmFsdWU6IHByb3BlcnRpZXNba2V5XSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICBkMy5tYXAgPSBmdW5jdGlvbihvYmplY3QsIGYpIHtcbiAgICB2YXIgbWFwID0gbmV3IGQzX01hcCgpO1xuICAgIGlmIChvYmplY3QgaW5zdGFuY2VvZiBkM19NYXApIHtcbiAgICAgIG9iamVjdC5mb3JFYWNoKGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgICAgbWFwLnNldChrZXksIHZhbHVlKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShvYmplY3QpKSB7XG4gICAgICB2YXIgaSA9IC0xLCBuID0gb2JqZWN0Lmxlbmd0aCwgbztcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB3aGlsZSAoKytpIDwgbikgbWFwLnNldChpLCBvYmplY3RbaV0pOyBlbHNlIHdoaWxlICgrK2kgPCBuKSBtYXAuc2V0KGYuY2FsbChvYmplY3QsIG8gPSBvYmplY3RbaV0sIGkpLCBvKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkgbWFwLnNldChrZXksIG9iamVjdFtrZXldKTtcbiAgICB9XG4gICAgcmV0dXJuIG1hcDtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfTWFwKCkge1xuICAgIHRoaXMuXyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIH1cbiAgdmFyIGQzX21hcF9wcm90byA9IFwiX19wcm90b19fXCIsIGQzX21hcF96ZXJvID0gXCJcXHgwMFwiO1xuICBkM19jbGFzcyhkM19NYXAsIHtcbiAgICBoYXM6IGQzX21hcF9oYXMsXG4gICAgZ2V0OiBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9bZDNfbWFwX2VzY2FwZShrZXkpXTtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX1tkM19tYXBfZXNjYXBlKGtleSldID0gdmFsdWU7XG4gICAgfSxcbiAgICByZW1vdmU6IGQzX21hcF9yZW1vdmUsXG4gICAga2V5czogZDNfbWFwX2tleXMsXG4gICAgdmFsdWVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB2YWx1ZXMgPSBbXTtcbiAgICAgIGZvciAodmFyIGtleSBpbiB0aGlzLl8pIHZhbHVlcy5wdXNoKHRoaXMuX1trZXldKTtcbiAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgfSxcbiAgICBlbnRyaWVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBlbnRyaWVzID0gW107XG4gICAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5fKSBlbnRyaWVzLnB1c2goe1xuICAgICAgICBrZXk6IGQzX21hcF91bmVzY2FwZShrZXkpLFxuICAgICAgICB2YWx1ZTogdGhpcy5fW2tleV1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGVudHJpZXM7XG4gICAgfSxcbiAgICBzaXplOiBkM19tYXBfc2l6ZSxcbiAgICBlbXB0eTogZDNfbWFwX2VtcHR5LFxuICAgIGZvckVhY2g6IGZ1bmN0aW9uKGYpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiB0aGlzLl8pIGYuY2FsbCh0aGlzLCBkM19tYXBfdW5lc2NhcGUoa2V5KSwgdGhpcy5fW2tleV0pO1xuICAgIH1cbiAgfSk7XG4gIGZ1bmN0aW9uIGQzX21hcF9lc2NhcGUoa2V5KSB7XG4gICAgcmV0dXJuIChrZXkgKz0gXCJcIikgPT09IGQzX21hcF9wcm90byB8fCBrZXlbMF0gPT09IGQzX21hcF96ZXJvID8gZDNfbWFwX3plcm8gKyBrZXkgOiBrZXk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfbWFwX3VuZXNjYXBlKGtleSkge1xuICAgIHJldHVybiAoa2V5ICs9IFwiXCIpWzBdID09PSBkM19tYXBfemVybyA/IGtleS5zbGljZSgxKSA6IGtleTtcbiAgfVxuICBmdW5jdGlvbiBkM19tYXBfaGFzKGtleSkge1xuICAgIHJldHVybiBkM19tYXBfZXNjYXBlKGtleSkgaW4gdGhpcy5fO1xuICB9XG4gIGZ1bmN0aW9uIGQzX21hcF9yZW1vdmUoa2V5KSB7XG4gICAgcmV0dXJuIChrZXkgPSBkM19tYXBfZXNjYXBlKGtleSkpIGluIHRoaXMuXyAmJiBkZWxldGUgdGhpcy5fW2tleV07XG4gIH1cbiAgZnVuY3Rpb24gZDNfbWFwX2tleXMoKSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5fKSBrZXlzLnB1c2goZDNfbWFwX3VuZXNjYXBlKGtleSkpO1xuICAgIHJldHVybiBrZXlzO1xuICB9XG4gIGZ1bmN0aW9uIGQzX21hcF9zaXplKCkge1xuICAgIHZhciBzaXplID0gMDtcbiAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5fKSArK3NpemU7XG4gICAgcmV0dXJuIHNpemU7XG4gIH1cbiAgZnVuY3Rpb24gZDNfbWFwX2VtcHR5KCkge1xuICAgIGZvciAodmFyIGtleSBpbiB0aGlzLl8pIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBkMy5uZXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG5lc3QgPSB7fSwga2V5cyA9IFtdLCBzb3J0S2V5cyA9IFtdLCBzb3J0VmFsdWVzLCByb2xsdXA7XG4gICAgZnVuY3Rpb24gbWFwKG1hcFR5cGUsIGFycmF5LCBkZXB0aCkge1xuICAgICAgaWYgKGRlcHRoID49IGtleXMubGVuZ3RoKSByZXR1cm4gcm9sbHVwID8gcm9sbHVwLmNhbGwobmVzdCwgYXJyYXkpIDogc29ydFZhbHVlcyA/IGFycmF5LnNvcnQoc29ydFZhbHVlcykgOiBhcnJheTtcbiAgICAgIHZhciBpID0gLTEsIG4gPSBhcnJheS5sZW5ndGgsIGtleSA9IGtleXNbZGVwdGgrK10sIGtleVZhbHVlLCBvYmplY3QsIHNldHRlciwgdmFsdWVzQnlLZXkgPSBuZXcgZDNfTWFwKCksIHZhbHVlcztcbiAgICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgIGlmICh2YWx1ZXMgPSB2YWx1ZXNCeUtleS5nZXQoa2V5VmFsdWUgPSBrZXkob2JqZWN0ID0gYXJyYXlbaV0pKSkge1xuICAgICAgICAgIHZhbHVlcy5wdXNoKG9iamVjdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsdWVzQnlLZXkuc2V0KGtleVZhbHVlLCBbIG9iamVjdCBdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG1hcFR5cGUpIHtcbiAgICAgICAgb2JqZWN0ID0gbWFwVHlwZSgpO1xuICAgICAgICBzZXR0ZXIgPSBmdW5jdGlvbihrZXlWYWx1ZSwgdmFsdWVzKSB7XG4gICAgICAgICAgb2JqZWN0LnNldChrZXlWYWx1ZSwgbWFwKG1hcFR5cGUsIHZhbHVlcywgZGVwdGgpKTtcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9iamVjdCA9IHt9O1xuICAgICAgICBzZXR0ZXIgPSBmdW5jdGlvbihrZXlWYWx1ZSwgdmFsdWVzKSB7XG4gICAgICAgICAgb2JqZWN0W2tleVZhbHVlXSA9IG1hcChtYXBUeXBlLCB2YWx1ZXMsIGRlcHRoKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHZhbHVlc0J5S2V5LmZvckVhY2goc2V0dGVyKTtcbiAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGVudHJpZXMobWFwLCBkZXB0aCkge1xuICAgICAgaWYgKGRlcHRoID49IGtleXMubGVuZ3RoKSByZXR1cm4gbWFwO1xuICAgICAgdmFyIGFycmF5ID0gW10sIHNvcnRLZXkgPSBzb3J0S2V5c1tkZXB0aCsrXTtcbiAgICAgIG1hcC5mb3JFYWNoKGZ1bmN0aW9uKGtleSwga2V5TWFwKSB7XG4gICAgICAgIGFycmF5LnB1c2goe1xuICAgICAgICAgIGtleToga2V5LFxuICAgICAgICAgIHZhbHVlczogZW50cmllcyhrZXlNYXAsIGRlcHRoKVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHNvcnRLZXkgPyBhcnJheS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIHNvcnRLZXkoYS5rZXksIGIua2V5KTtcbiAgICAgIH0pIDogYXJyYXk7XG4gICAgfVxuICAgIG5lc3QubWFwID0gZnVuY3Rpb24oYXJyYXksIG1hcFR5cGUpIHtcbiAgICAgIHJldHVybiBtYXAobWFwVHlwZSwgYXJyYXksIDApO1xuICAgIH07XG4gICAgbmVzdC5lbnRyaWVzID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICAgIHJldHVybiBlbnRyaWVzKG1hcChkMy5tYXAsIGFycmF5LCAwKSwgMCk7XG4gICAgfTtcbiAgICBuZXN0LmtleSA9IGZ1bmN0aW9uKGQpIHtcbiAgICAgIGtleXMucHVzaChkKTtcbiAgICAgIHJldHVybiBuZXN0O1xuICAgIH07XG4gICAgbmVzdC5zb3J0S2V5cyA9IGZ1bmN0aW9uKG9yZGVyKSB7XG4gICAgICBzb3J0S2V5c1trZXlzLmxlbmd0aCAtIDFdID0gb3JkZXI7XG4gICAgICByZXR1cm4gbmVzdDtcbiAgICB9O1xuICAgIG5lc3Quc29ydFZhbHVlcyA9IGZ1bmN0aW9uKG9yZGVyKSB7XG4gICAgICBzb3J0VmFsdWVzID0gb3JkZXI7XG4gICAgICByZXR1cm4gbmVzdDtcbiAgICB9O1xuICAgIG5lc3Qucm9sbHVwID0gZnVuY3Rpb24oZikge1xuICAgICAgcm9sbHVwID0gZjtcbiAgICAgIHJldHVybiBuZXN0O1xuICAgIH07XG4gICAgcmV0dXJuIG5lc3Q7XG4gIH07XG4gIGQzLnNldCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgdmFyIHNldCA9IG5ldyBkM19TZXQoKTtcbiAgICBpZiAoYXJyYXkpIGZvciAodmFyIGkgPSAwLCBuID0gYXJyYXkubGVuZ3RoOyBpIDwgbjsgKytpKSBzZXQuYWRkKGFycmF5W2ldKTtcbiAgICByZXR1cm4gc2V0O1xuICB9O1xuICBmdW5jdGlvbiBkM19TZXQoKSB7XG4gICAgdGhpcy5fID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgfVxuICBkM19jbGFzcyhkM19TZXQsIHtcbiAgICBoYXM6IGQzX21hcF9oYXMsXG4gICAgYWRkOiBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHRoaXMuX1tkM19tYXBfZXNjYXBlKGtleSArPSBcIlwiKV0gPSB0cnVlO1xuICAgICAgcmV0dXJuIGtleTtcbiAgICB9LFxuICAgIHJlbW92ZTogZDNfbWFwX3JlbW92ZSxcbiAgICB2YWx1ZXM6IGQzX21hcF9rZXlzLFxuICAgIHNpemU6IGQzX21hcF9zaXplLFxuICAgIGVtcHR5OiBkM19tYXBfZW1wdHksXG4gICAgZm9yRWFjaDogZnVuY3Rpb24oZikge1xuICAgICAgZm9yICh2YXIga2V5IGluIHRoaXMuXykgZi5jYWxsKHRoaXMsIGQzX21hcF91bmVzY2FwZShrZXkpKTtcbiAgICB9XG4gIH0pO1xuICBkMy5iZWhhdmlvciA9IHt9O1xuICBkMy5yZWJpbmQgPSBmdW5jdGlvbih0YXJnZXQsIHNvdXJjZSkge1xuICAgIHZhciBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGgsIG1ldGhvZDtcbiAgICB3aGlsZSAoKytpIDwgbikgdGFyZ2V0W21ldGhvZCA9IGFyZ3VtZW50c1tpXV0gPSBkM19yZWJpbmQodGFyZ2V0LCBzb3VyY2UsIHNvdXJjZVttZXRob2RdKTtcbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9O1xuICBmdW5jdGlvbiBkM19yZWJpbmQodGFyZ2V0LCBzb3VyY2UsIG1ldGhvZCkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB2YWx1ZSA9IG1ldGhvZC5hcHBseShzb3VyY2UsIGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gdmFsdWUgPT09IHNvdXJjZSA/IHRhcmdldCA6IHZhbHVlO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZDNfdmVuZG9yU3ltYm9sKG9iamVjdCwgbmFtZSkge1xuICAgIGlmIChuYW1lIGluIG9iamVjdCkgcmV0dXJuIG5hbWU7XG4gICAgbmFtZSA9IG5hbWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBuYW1lLnNsaWNlKDEpO1xuICAgIGZvciAodmFyIGkgPSAwLCBuID0gZDNfdmVuZG9yUHJlZml4ZXMubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgICB2YXIgcHJlZml4TmFtZSA9IGQzX3ZlbmRvclByZWZpeGVzW2ldICsgbmFtZTtcbiAgICAgIGlmIChwcmVmaXhOYW1lIGluIG9iamVjdCkgcmV0dXJuIHByZWZpeE5hbWU7XG4gICAgfVxuICB9XG4gIHZhciBkM192ZW5kb3JQcmVmaXhlcyA9IFsgXCJ3ZWJraXRcIiwgXCJtc1wiLCBcIm1velwiLCBcIk1velwiLCBcIm9cIiwgXCJPXCIgXTtcbiAgZnVuY3Rpb24gZDNfbm9vcCgpIHt9XG4gIGQzLmRpc3BhdGNoID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRpc3BhdGNoID0gbmV3IGQzX2Rpc3BhdGNoKCksIGkgPSAtMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgd2hpbGUgKCsraSA8IG4pIGRpc3BhdGNoW2FyZ3VtZW50c1tpXV0gPSBkM19kaXNwYXRjaF9ldmVudChkaXNwYXRjaCk7XG4gICAgcmV0dXJuIGRpc3BhdGNoO1xuICB9O1xuICBmdW5jdGlvbiBkM19kaXNwYXRjaCgpIHt9XG4gIGQzX2Rpc3BhdGNoLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgdmFyIGkgPSB0eXBlLmluZGV4T2YoXCIuXCIpLCBuYW1lID0gXCJcIjtcbiAgICBpZiAoaSA+PSAwKSB7XG4gICAgICBuYW1lID0gdHlwZS5zbGljZShpICsgMSk7XG4gICAgICB0eXBlID0gdHlwZS5zbGljZSgwLCBpKTtcbiAgICB9XG4gICAgaWYgKHR5cGUpIHJldHVybiBhcmd1bWVudHMubGVuZ3RoIDwgMiA/IHRoaXNbdHlwZV0ub24obmFtZSkgOiB0aGlzW3R5cGVdLm9uKG5hbWUsIGxpc3RlbmVyKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgaWYgKGxpc3RlbmVyID09IG51bGwpIGZvciAodHlwZSBpbiB0aGlzKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc093blByb3BlcnR5KHR5cGUpKSB0aGlzW3R5cGVdLm9uKG5hbWUsIG51bGwpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9O1xuICBmdW5jdGlvbiBkM19kaXNwYXRjaF9ldmVudChkaXNwYXRjaCkge1xuICAgIHZhciBsaXN0ZW5lcnMgPSBbXSwgbGlzdGVuZXJCeU5hbWUgPSBuZXcgZDNfTWFwKCk7XG4gICAgZnVuY3Rpb24gZXZlbnQoKSB7XG4gICAgICB2YXIgeiA9IGxpc3RlbmVycywgaSA9IC0xLCBuID0gei5sZW5ndGgsIGw7XG4gICAgICB3aGlsZSAoKytpIDwgbikgaWYgKGwgPSB6W2ldLm9uKSBsLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gZGlzcGF0Y2g7XG4gICAgfVxuICAgIGV2ZW50Lm9uID0gZnVuY3Rpb24obmFtZSwgbGlzdGVuZXIpIHtcbiAgICAgIHZhciBsID0gbGlzdGVuZXJCeU5hbWUuZ2V0KG5hbWUpLCBpO1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSByZXR1cm4gbCAmJiBsLm9uO1xuICAgICAgaWYgKGwpIHtcbiAgICAgICAgbC5vbiA9IG51bGw7XG4gICAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5zbGljZSgwLCBpID0gbGlzdGVuZXJzLmluZGV4T2YobCkpLmNvbmNhdChsaXN0ZW5lcnMuc2xpY2UoaSArIDEpKTtcbiAgICAgICAgbGlzdGVuZXJCeU5hbWUucmVtb3ZlKG5hbWUpO1xuICAgICAgfVxuICAgICAgaWYgKGxpc3RlbmVyKSBsaXN0ZW5lcnMucHVzaChsaXN0ZW5lckJ5TmFtZS5zZXQobmFtZSwge1xuICAgICAgICBvbjogbGlzdGVuZXJcbiAgICAgIH0pKTtcbiAgICAgIHJldHVybiBkaXNwYXRjaDtcbiAgICB9O1xuICAgIHJldHVybiBldmVudDtcbiAgfVxuICBkMy5ldmVudCA9IG51bGw7XG4gIGZ1bmN0aW9uIGQzX2V2ZW50UHJldmVudERlZmF1bHQoKSB7XG4gICAgZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgfVxuICBmdW5jdGlvbiBkM19ldmVudFNvdXJjZSgpIHtcbiAgICB2YXIgZSA9IGQzLmV2ZW50LCBzO1xuICAgIHdoaWxlIChzID0gZS5zb3VyY2VFdmVudCkgZSA9IHM7XG4gICAgcmV0dXJuIGU7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZXZlbnREaXNwYXRjaCh0YXJnZXQpIHtcbiAgICB2YXIgZGlzcGF0Y2ggPSBuZXcgZDNfZGlzcGF0Y2goKSwgaSA9IDAsIG4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIHdoaWxlICgrK2kgPCBuKSBkaXNwYXRjaFthcmd1bWVudHNbaV1dID0gZDNfZGlzcGF0Y2hfZXZlbnQoZGlzcGF0Y2gpO1xuICAgIGRpc3BhdGNoLm9mID0gZnVuY3Rpb24odGhpeiwgYXJndW1lbnR6KSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZTEpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2YXIgZTAgPSBlMS5zb3VyY2VFdmVudCA9IGQzLmV2ZW50O1xuICAgICAgICAgIGUxLnRhcmdldCA9IHRhcmdldDtcbiAgICAgICAgICBkMy5ldmVudCA9IGUxO1xuICAgICAgICAgIGRpc3BhdGNoW2UxLnR5cGVdLmFwcGx5KHRoaXosIGFyZ3VtZW50eik7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgZDMuZXZlbnQgPSBlMDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuICAgIHJldHVybiBkaXNwYXRjaDtcbiAgfVxuICBkMy5yZXF1b3RlID0gZnVuY3Rpb24ocykge1xuICAgIHJldHVybiBzLnJlcGxhY2UoZDNfcmVxdW90ZV9yZSwgXCJcXFxcJCZcIik7XG4gIH07XG4gIHZhciBkM19yZXF1b3RlX3JlID0gL1tcXFxcXFxeXFwkXFwqXFwrXFw/XFx8XFxbXFxdXFwoXFwpXFwuXFx7XFx9XS9nO1xuICB2YXIgZDNfc3ViY2xhc3MgPSB7fS5fX3Byb3RvX18gPyBmdW5jdGlvbihvYmplY3QsIHByb3RvdHlwZSkge1xuICAgIG9iamVjdC5fX3Byb3RvX18gPSBwcm90b3R5cGU7XG4gIH0gOiBmdW5jdGlvbihvYmplY3QsIHByb3RvdHlwZSkge1xuICAgIGZvciAodmFyIHByb3BlcnR5IGluIHByb3RvdHlwZSkgb2JqZWN0W3Byb3BlcnR5XSA9IHByb3RvdHlwZVtwcm9wZXJ0eV07XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3NlbGVjdGlvbihncm91cHMpIHtcbiAgICBkM19zdWJjbGFzcyhncm91cHMsIGQzX3NlbGVjdGlvblByb3RvdHlwZSk7XG4gICAgcmV0dXJuIGdyb3VwcztcbiAgfVxuICB2YXIgZDNfc2VsZWN0ID0gZnVuY3Rpb24ocywgbikge1xuICAgIHJldHVybiBuLnF1ZXJ5U2VsZWN0b3Iocyk7XG4gIH0sIGQzX3NlbGVjdEFsbCA9IGZ1bmN0aW9uKHMsIG4pIHtcbiAgICByZXR1cm4gbi5xdWVyeVNlbGVjdG9yQWxsKHMpO1xuICB9LCBkM19zZWxlY3RNYXRjaGVyID0gZDNfZG9jdW1lbnRFbGVtZW50Lm1hdGNoZXMgfHwgZDNfZG9jdW1lbnRFbGVtZW50W2QzX3ZlbmRvclN5bWJvbChkM19kb2N1bWVudEVsZW1lbnQsIFwibWF0Y2hlc1NlbGVjdG9yXCIpXSwgZDNfc2VsZWN0TWF0Y2hlcyA9IGZ1bmN0aW9uKG4sIHMpIHtcbiAgICByZXR1cm4gZDNfc2VsZWN0TWF0Y2hlci5jYWxsKG4sIHMpO1xuICB9O1xuICBpZiAodHlwZW9mIFNpenpsZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgZDNfc2VsZWN0ID0gZnVuY3Rpb24ocywgbikge1xuICAgICAgcmV0dXJuIFNpenpsZShzLCBuKVswXSB8fCBudWxsO1xuICAgIH07XG4gICAgZDNfc2VsZWN0QWxsID0gU2l6emxlO1xuICAgIGQzX3NlbGVjdE1hdGNoZXMgPSBTaXp6bGUubWF0Y2hlc1NlbGVjdG9yO1xuICB9XG4gIGQzLnNlbGVjdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkM19zZWxlY3Rpb25Sb290O1xuICB9O1xuICB2YXIgZDNfc2VsZWN0aW9uUHJvdG90eXBlID0gZDMuc2VsZWN0aW9uLnByb3RvdHlwZSA9IFtdO1xuICBkM19zZWxlY3Rpb25Qcm90b3R5cGUuc2VsZWN0ID0gZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgICB2YXIgc3ViZ3JvdXBzID0gW10sIHN1Ymdyb3VwLCBzdWJub2RlLCBncm91cCwgbm9kZTtcbiAgICBzZWxlY3RvciA9IGQzX3NlbGVjdGlvbl9zZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgZm9yICh2YXIgaiA9IC0xLCBtID0gdGhpcy5sZW5ndGg7ICsraiA8IG07ICkge1xuICAgICAgc3ViZ3JvdXBzLnB1c2goc3ViZ3JvdXAgPSBbXSk7XG4gICAgICBzdWJncm91cC5wYXJlbnROb2RlID0gKGdyb3VwID0gdGhpc1tqXSkucGFyZW50Tm9kZTtcbiAgICAgIGZvciAodmFyIGkgPSAtMSwgbiA9IGdyb3VwLmxlbmd0aDsgKytpIDwgbjsgKSB7XG4gICAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgICBzdWJncm91cC5wdXNoKHN1Ym5vZGUgPSBzZWxlY3Rvci5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGopKTtcbiAgICAgICAgICBpZiAoc3Vibm9kZSAmJiBcIl9fZGF0YV9fXCIgaW4gbm9kZSkgc3Vibm9kZS5fX2RhdGFfXyA9IG5vZGUuX19kYXRhX187XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3ViZ3JvdXAucHVzaChudWxsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZDNfc2VsZWN0aW9uKHN1Ymdyb3Vwcyk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3NlbGVjdGlvbl9zZWxlY3RvcihzZWxlY3Rvcikge1xuICAgIHJldHVybiB0eXBlb2Ygc2VsZWN0b3IgPT09IFwiZnVuY3Rpb25cIiA/IHNlbGVjdG9yIDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZDNfc2VsZWN0KHNlbGVjdG9yLCB0aGlzKTtcbiAgICB9O1xuICB9XG4gIGQzX3NlbGVjdGlvblByb3RvdHlwZS5zZWxlY3RBbGwgPSBmdW5jdGlvbihzZWxlY3Rvcikge1xuICAgIHZhciBzdWJncm91cHMgPSBbXSwgc3ViZ3JvdXAsIG5vZGU7XG4gICAgc2VsZWN0b3IgPSBkM19zZWxlY3Rpb25fc2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgIGZvciAodmFyIGogPSAtMSwgbSA9IHRoaXMubGVuZ3RoOyArK2ogPCBtOyApIHtcbiAgICAgIGZvciAodmFyIGdyb3VwID0gdGhpc1tqXSwgaSA9IC0xLCBuID0gZ3JvdXAubGVuZ3RoOyArK2kgPCBuOyApIHtcbiAgICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgICAgIHN1Ymdyb3Vwcy5wdXNoKHN1Ymdyb3VwID0gZDNfYXJyYXkoc2VsZWN0b3IuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBqKSkpO1xuICAgICAgICAgIHN1Ymdyb3VwLnBhcmVudE5vZGUgPSBub2RlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkM19zZWxlY3Rpb24oc3ViZ3JvdXBzKTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfc2VsZWN0aW9uX3NlbGVjdG9yQWxsKHNlbGVjdG9yKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBzZWxlY3RvciA9PT0gXCJmdW5jdGlvblwiID8gc2VsZWN0b3IgOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBkM19zZWxlY3RBbGwoc2VsZWN0b3IsIHRoaXMpO1xuICAgIH07XG4gIH1cbiAgdmFyIGQzX25zUHJlZml4ID0ge1xuICAgIHN2ZzogXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLFxuICAgIHhodG1sOiBcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIixcbiAgICB4bGluazogXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIsXG4gICAgeG1sOiBcImh0dHA6Ly93d3cudzMub3JnL1hNTC8xOTk4L25hbWVzcGFjZVwiLFxuICAgIHhtbG5zOiBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAveG1sbnMvXCJcbiAgfTtcbiAgZDMubnMgPSB7XG4gICAgcHJlZml4OiBkM19uc1ByZWZpeCxcbiAgICBxdWFsaWZ5OiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICB2YXIgaSA9IG5hbWUuaW5kZXhPZihcIjpcIiksIHByZWZpeCA9IG5hbWU7XG4gICAgICBpZiAoaSA+PSAwKSB7XG4gICAgICAgIHByZWZpeCA9IG5hbWUuc2xpY2UoMCwgaSk7XG4gICAgICAgIG5hbWUgPSBuYW1lLnNsaWNlKGkgKyAxKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkM19uc1ByZWZpeC5oYXNPd25Qcm9wZXJ0eShwcmVmaXgpID8ge1xuICAgICAgICBzcGFjZTogZDNfbnNQcmVmaXhbcHJlZml4XSxcbiAgICAgICAgbG9jYWw6IG5hbWVcbiAgICAgIH0gOiBuYW1lO1xuICAgIH1cbiAgfTtcbiAgZDNfc2VsZWN0aW9uUHJvdG90eXBlLmF0dHIgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgICAgaWYgKHR5cGVvZiBuYW1lID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHZhciBub2RlID0gdGhpcy5ub2RlKCk7XG4gICAgICAgIG5hbWUgPSBkMy5ucy5xdWFsaWZ5KG5hbWUpO1xuICAgICAgICByZXR1cm4gbmFtZS5sb2NhbCA/IG5vZGUuZ2V0QXR0cmlidXRlTlMobmFtZS5zcGFjZSwgbmFtZS5sb2NhbCkgOiBub2RlLmdldEF0dHJpYnV0ZShuYW1lKTtcbiAgICAgIH1cbiAgICAgIGZvciAodmFsdWUgaW4gbmFtZSkgdGhpcy5lYWNoKGQzX3NlbGVjdGlvbl9hdHRyKHZhbHVlLCBuYW1lW3ZhbHVlXSkpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmVhY2goZDNfc2VsZWN0aW9uX2F0dHIobmFtZSwgdmFsdWUpKTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfc2VsZWN0aW9uX2F0dHIobmFtZSwgdmFsdWUpIHtcbiAgICBuYW1lID0gZDMubnMucXVhbGlmeShuYW1lKTtcbiAgICBmdW5jdGlvbiBhdHRyTnVsbCgpIHtcbiAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBhdHRyTnVsbE5TKCkge1xuICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGVOUyhuYW1lLnNwYWNlLCBuYW1lLmxvY2FsKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gYXR0ckNvbnN0YW50KCkge1xuICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBhdHRyQ29uc3RhbnROUygpIHtcbiAgICAgIHRoaXMuc2V0QXR0cmlidXRlTlMobmFtZS5zcGFjZSwgbmFtZS5sb2NhbCwgdmFsdWUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBhdHRyRnVuY3Rpb24oKSB7XG4gICAgICB2YXIgeCA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBpZiAoeCA9PSBudWxsKSB0aGlzLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTsgZWxzZSB0aGlzLnNldEF0dHJpYnV0ZShuYW1lLCB4KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gYXR0ckZ1bmN0aW9uTlMoKSB7XG4gICAgICB2YXIgeCA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBpZiAoeCA9PSBudWxsKSB0aGlzLnJlbW92ZUF0dHJpYnV0ZU5TKG5hbWUuc3BhY2UsIG5hbWUubG9jYWwpOyBlbHNlIHRoaXMuc2V0QXR0cmlidXRlTlMobmFtZS5zcGFjZSwgbmFtZS5sb2NhbCwgeCk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZSA9PSBudWxsID8gbmFtZS5sb2NhbCA/IGF0dHJOdWxsTlMgOiBhdHRyTnVsbCA6IHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gbmFtZS5sb2NhbCA/IGF0dHJGdW5jdGlvbk5TIDogYXR0ckZ1bmN0aW9uIDogbmFtZS5sb2NhbCA/IGF0dHJDb25zdGFudE5TIDogYXR0ckNvbnN0YW50O1xuICB9XG4gIGZ1bmN0aW9uIGQzX2NvbGxhcHNlKHMpIHtcbiAgICByZXR1cm4gcy50cmltKCkucmVwbGFjZSgvXFxzKy9nLCBcIiBcIik7XG4gIH1cbiAgZDNfc2VsZWN0aW9uUHJvdG90eXBlLmNsYXNzZWQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgICAgaWYgKHR5cGVvZiBuYW1lID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHZhciBub2RlID0gdGhpcy5ub2RlKCksIG4gPSAobmFtZSA9IGQzX3NlbGVjdGlvbl9jbGFzc2VzKG5hbWUpKS5sZW5ndGgsIGkgPSAtMTtcbiAgICAgICAgaWYgKHZhbHVlID0gbm9kZS5jbGFzc0xpc3QpIHtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgbikgaWYgKCF2YWx1ZS5jb250YWlucyhuYW1lW2ldKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbHVlID0gbm9kZS5nZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKTtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgbikgaWYgKCFkM19zZWxlY3Rpb25fY2xhc3NlZFJlKG5hbWVbaV0pLnRlc3QodmFsdWUpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBmb3IgKHZhbHVlIGluIG5hbWUpIHRoaXMuZWFjaChkM19zZWxlY3Rpb25fY2xhc3NlZCh2YWx1ZSwgbmFtZVt2YWx1ZV0pKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5lYWNoKGQzX3NlbGVjdGlvbl9jbGFzc2VkKG5hbWUsIHZhbHVlKSk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3NlbGVjdGlvbl9jbGFzc2VkUmUobmFtZSkge1xuICAgIHJldHVybiBuZXcgUmVnRXhwKFwiKD86XnxcXFxccyspXCIgKyBkMy5yZXF1b3RlKG5hbWUpICsgXCIoPzpcXFxccyt8JClcIiwgXCJnXCIpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3NlbGVjdGlvbl9jbGFzc2VzKG5hbWUpIHtcbiAgICByZXR1cm4gKG5hbWUgKyBcIlwiKS50cmltKCkuc3BsaXQoL158XFxzKy8pO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3NlbGVjdGlvbl9jbGFzc2VkKG5hbWUsIHZhbHVlKSB7XG4gICAgbmFtZSA9IGQzX3NlbGVjdGlvbl9jbGFzc2VzKG5hbWUpLm1hcChkM19zZWxlY3Rpb25fY2xhc3NlZE5hbWUpO1xuICAgIHZhciBuID0gbmFtZS5sZW5ndGg7XG4gICAgZnVuY3Rpb24gY2xhc3NlZENvbnN0YW50KCkge1xuICAgICAgdmFyIGkgPSAtMTtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSBuYW1lW2ldKHRoaXMsIHZhbHVlKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY2xhc3NlZEZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGkgPSAtMSwgeCA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB3aGlsZSAoKytpIDwgbikgbmFtZVtpXSh0aGlzLCB4KTtcbiAgICB9XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gY2xhc3NlZEZ1bmN0aW9uIDogY2xhc3NlZENvbnN0YW50O1xuICB9XG4gIGZ1bmN0aW9uIGQzX3NlbGVjdGlvbl9jbGFzc2VkTmFtZShuYW1lKSB7XG4gICAgdmFyIHJlID0gZDNfc2VsZWN0aW9uX2NsYXNzZWRSZShuYW1lKTtcbiAgICByZXR1cm4gZnVuY3Rpb24obm9kZSwgdmFsdWUpIHtcbiAgICAgIGlmIChjID0gbm9kZS5jbGFzc0xpc3QpIHJldHVybiB2YWx1ZSA/IGMuYWRkKG5hbWUpIDogYy5yZW1vdmUobmFtZSk7XG4gICAgICB2YXIgYyA9IG5vZGUuZ2V0QXR0cmlidXRlKFwiY2xhc3NcIikgfHwgXCJcIjtcbiAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICByZS5sYXN0SW5kZXggPSAwO1xuICAgICAgICBpZiAoIXJlLnRlc3QoYykpIG5vZGUuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgZDNfY29sbGFwc2UoYyArIFwiIFwiICsgbmFtZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBkM19jb2xsYXBzZShjLnJlcGxhY2UocmUsIFwiIFwiKSkpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbiAgZDNfc2VsZWN0aW9uUHJvdG90eXBlLnN0eWxlID0gZnVuY3Rpb24obmFtZSwgdmFsdWUsIHByaW9yaXR5KSB7XG4gICAgdmFyIG4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGlmIChuIDwgMykge1xuICAgICAgaWYgKHR5cGVvZiBuYW1lICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGlmIChuIDwgMikgdmFsdWUgPSBcIlwiO1xuICAgICAgICBmb3IgKHByaW9yaXR5IGluIG5hbWUpIHRoaXMuZWFjaChkM19zZWxlY3Rpb25fc3R5bGUocHJpb3JpdHksIG5hbWVbcHJpb3JpdHldLCB2YWx1ZSkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIGlmIChuIDwgMikgcmV0dXJuIGQzX3dpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMubm9kZSgpLCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKG5hbWUpO1xuICAgICAgcHJpb3JpdHkgPSBcIlwiO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5lYWNoKGQzX3NlbGVjdGlvbl9zdHlsZShuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpKTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfc2VsZWN0aW9uX3N0eWxlKG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICAgIGZ1bmN0aW9uIHN0eWxlTnVsbCgpIHtcbiAgICAgIHRoaXMuc3R5bGUucmVtb3ZlUHJvcGVydHkobmFtZSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHN0eWxlQ29uc3RhbnQoKSB7XG4gICAgICB0aGlzLnN0eWxlLnNldFByb3BlcnR5KG5hbWUsIHZhbHVlLCBwcmlvcml0eSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHN0eWxlRnVuY3Rpb24oKSB7XG4gICAgICB2YXIgeCA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBpZiAoeCA9PSBudWxsKSB0aGlzLnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpOyBlbHNlIHRoaXMuc3R5bGUuc2V0UHJvcGVydHkobmFtZSwgeCwgcHJpb3JpdHkpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWUgPT0gbnVsbCA/IHN0eWxlTnVsbCA6IHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gc3R5bGVGdW5jdGlvbiA6IHN0eWxlQ29uc3RhbnQ7XG4gIH1cbiAgZDNfc2VsZWN0aW9uUHJvdG90eXBlLnByb3BlcnR5ID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIHRoaXMubm9kZSgpW25hbWVdO1xuICAgICAgZm9yICh2YWx1ZSBpbiBuYW1lKSB0aGlzLmVhY2goZDNfc2VsZWN0aW9uX3Byb3BlcnR5KHZhbHVlLCBuYW1lW3ZhbHVlXSkpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmVhY2goZDNfc2VsZWN0aW9uX3Byb3BlcnR5KG5hbWUsIHZhbHVlKSk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3NlbGVjdGlvbl9wcm9wZXJ0eShuYW1lLCB2YWx1ZSkge1xuICAgIGZ1bmN0aW9uIHByb3BlcnR5TnVsbCgpIHtcbiAgICAgIGRlbGV0ZSB0aGlzW25hbWVdO1xuICAgIH1cbiAgICBmdW5jdGlvbiBwcm9wZXJ0eUNvbnN0YW50KCkge1xuICAgICAgdGhpc1tuYW1lXSA9IHZhbHVlO1xuICAgIH1cbiAgICBmdW5jdGlvbiBwcm9wZXJ0eUZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHggPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgaWYgKHggPT0gbnVsbCkgZGVsZXRlIHRoaXNbbmFtZV07IGVsc2UgdGhpc1tuYW1lXSA9IHg7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZSA9PSBudWxsID8gcHJvcGVydHlOdWxsIDogdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIgPyBwcm9wZXJ0eUZ1bmN0aW9uIDogcHJvcGVydHlDb25zdGFudDtcbiAgfVxuICBkM19zZWxlY3Rpb25Qcm90b3R5cGUudGV4dCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyB0aGlzLmVhY2godHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIgPyBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB2ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHRoaXMudGV4dENvbnRlbnQgPSB2ID09IG51bGwgPyBcIlwiIDogdjtcbiAgICB9IDogdmFsdWUgPT0gbnVsbCA/IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy50ZXh0Q29udGVudCA9IFwiXCI7XG4gICAgfSA6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy50ZXh0Q29udGVudCA9IHZhbHVlO1xuICAgIH0pIDogdGhpcy5ub2RlKCkudGV4dENvbnRlbnQ7XG4gIH07XG4gIGQzX3NlbGVjdGlvblByb3RvdHlwZS5odG1sID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IHRoaXMuZWFjaCh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIiA/IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgdGhpcy5pbm5lckhUTUwgPSB2ID09IG51bGwgPyBcIlwiIDogdjtcbiAgICB9IDogdmFsdWUgPT0gbnVsbCA/IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5pbm5lckhUTUwgPSBcIlwiO1xuICAgIH0gOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuaW5uZXJIVE1MID0gdmFsdWU7XG4gICAgfSkgOiB0aGlzLm5vZGUoKS5pbm5lckhUTUw7XG4gIH07XG4gIGQzX3NlbGVjdGlvblByb3RvdHlwZS5hcHBlbmQgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgbmFtZSA9IGQzX3NlbGVjdGlvbl9jcmVhdG9yKG5hbWUpO1xuICAgIHJldHVybiB0aGlzLnNlbGVjdChmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmFwcGVuZENoaWxkKG5hbWUuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gICAgfSk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3NlbGVjdGlvbl9jcmVhdG9yKG5hbWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIG5hbWUgPT09IFwiZnVuY3Rpb25cIiA/IG5hbWUgOiAobmFtZSA9IGQzLm5zLnF1YWxpZnkobmFtZSkpLmxvY2FsID8gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5vd25lckRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhuYW1lLnNwYWNlLCBuYW1lLmxvY2FsKTtcbiAgICB9IDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5vd25lckRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyh0aGlzLm5hbWVzcGFjZVVSSSwgbmFtZSk7XG4gICAgfTtcbiAgfVxuICBkM19zZWxlY3Rpb25Qcm90b3R5cGUuaW5zZXJ0ID0gZnVuY3Rpb24obmFtZSwgYmVmb3JlKSB7XG4gICAgbmFtZSA9IGQzX3NlbGVjdGlvbl9jcmVhdG9yKG5hbWUpO1xuICAgIGJlZm9yZSA9IGQzX3NlbGVjdGlvbl9zZWxlY3RvcihiZWZvcmUpO1xuICAgIHJldHVybiB0aGlzLnNlbGVjdChmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmluc2VydEJlZm9yZShuYW1lLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyksIGJlZm9yZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IG51bGwpO1xuICAgIH0pO1xuICB9O1xuICBkM19zZWxlY3Rpb25Qcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChkM19zZWxlY3Rpb25SZW1vdmUpO1xuICB9O1xuICBmdW5jdGlvbiBkM19zZWxlY3Rpb25SZW1vdmUoKSB7XG4gICAgdmFyIHBhcmVudCA9IHRoaXMucGFyZW50Tm9kZTtcbiAgICBpZiAocGFyZW50KSBwYXJlbnQucmVtb3ZlQ2hpbGQodGhpcyk7XG4gIH1cbiAgZDNfc2VsZWN0aW9uUHJvdG90eXBlLmRhdGEgPSBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgdmFyIGkgPSAtMSwgbiA9IHRoaXMubGVuZ3RoLCBncm91cCwgbm9kZTtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIHZhbHVlID0gbmV3IEFycmF5KG4gPSAoZ3JvdXAgPSB0aGlzWzBdKS5sZW5ndGgpO1xuICAgICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgICAgIHZhbHVlW2ldID0gbm9kZS5fX2RhdGFfXztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICBmdW5jdGlvbiBiaW5kKGdyb3VwLCBncm91cERhdGEpIHtcbiAgICAgIHZhciBpLCBuID0gZ3JvdXAubGVuZ3RoLCBtID0gZ3JvdXBEYXRhLmxlbmd0aCwgbjAgPSBNYXRoLm1pbihuLCBtKSwgdXBkYXRlTm9kZXMgPSBuZXcgQXJyYXkobSksIGVudGVyTm9kZXMgPSBuZXcgQXJyYXkobSksIGV4aXROb2RlcyA9IG5ldyBBcnJheShuKSwgbm9kZSwgbm9kZURhdGE7XG4gICAgICBpZiAoa2V5KSB7XG4gICAgICAgIHZhciBub2RlQnlLZXlWYWx1ZSA9IG5ldyBkM19NYXAoKSwga2V5VmFsdWVzID0gbmV3IEFycmF5KG4pLCBrZXlWYWx1ZTtcbiAgICAgICAgZm9yIChpID0gLTE7ICsraSA8IG47ICkge1xuICAgICAgICAgIGlmIChub2RlQnlLZXlWYWx1ZS5oYXMoa2V5VmFsdWUgPSBrZXkuY2FsbChub2RlID0gZ3JvdXBbaV0sIG5vZGUuX19kYXRhX18sIGkpKSkge1xuICAgICAgICAgICAgZXhpdE5vZGVzW2ldID0gbm9kZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbm9kZUJ5S2V5VmFsdWUuc2V0KGtleVZhbHVlLCBub2RlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAga2V5VmFsdWVzW2ldID0ga2V5VmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gLTE7ICsraSA8IG07ICkge1xuICAgICAgICAgIGlmICghKG5vZGUgPSBub2RlQnlLZXlWYWx1ZS5nZXQoa2V5VmFsdWUgPSBrZXkuY2FsbChncm91cERhdGEsIG5vZGVEYXRhID0gZ3JvdXBEYXRhW2ldLCBpKSkpKSB7XG4gICAgICAgICAgICBlbnRlck5vZGVzW2ldID0gZDNfc2VsZWN0aW9uX2RhdGFOb2RlKG5vZGVEYXRhKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKG5vZGUgIT09IHRydWUpIHtcbiAgICAgICAgICAgIHVwZGF0ZU5vZGVzW2ldID0gbm9kZTtcbiAgICAgICAgICAgIG5vZGUuX19kYXRhX18gPSBub2RlRGF0YTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbm9kZUJ5S2V5VmFsdWUuc2V0KGtleVZhbHVlLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAtMTsgKytpIDwgbjsgKSB7XG4gICAgICAgICAgaWYgKG5vZGVCeUtleVZhbHVlLmdldChrZXlWYWx1ZXNbaV0pICE9PSB0cnVlKSB7XG4gICAgICAgICAgICBleGl0Tm9kZXNbaV0gPSBncm91cFtpXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAoaSA9IC0xOyArK2kgPCBuMDsgKSB7XG4gICAgICAgICAgbm9kZSA9IGdyb3VwW2ldO1xuICAgICAgICAgIG5vZGVEYXRhID0gZ3JvdXBEYXRhW2ldO1xuICAgICAgICAgIGlmIChub2RlKSB7XG4gICAgICAgICAgICBub2RlLl9fZGF0YV9fID0gbm9kZURhdGE7XG4gICAgICAgICAgICB1cGRhdGVOb2Rlc1tpXSA9IG5vZGU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVudGVyTm9kZXNbaV0gPSBkM19zZWxlY3Rpb25fZGF0YU5vZGUobm9kZURhdGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKDtpIDwgbTsgKytpKSB7XG4gICAgICAgICAgZW50ZXJOb2Rlc1tpXSA9IGQzX3NlbGVjdGlvbl9kYXRhTm9kZShncm91cERhdGFbaV0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoO2kgPCBuOyArK2kpIHtcbiAgICAgICAgICBleGl0Tm9kZXNbaV0gPSBncm91cFtpXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZW50ZXJOb2Rlcy51cGRhdGUgPSB1cGRhdGVOb2RlcztcbiAgICAgIGVudGVyTm9kZXMucGFyZW50Tm9kZSA9IHVwZGF0ZU5vZGVzLnBhcmVudE5vZGUgPSBleGl0Tm9kZXMucGFyZW50Tm9kZSA9IGdyb3VwLnBhcmVudE5vZGU7XG4gICAgICBlbnRlci5wdXNoKGVudGVyTm9kZXMpO1xuICAgICAgdXBkYXRlLnB1c2godXBkYXRlTm9kZXMpO1xuICAgICAgZXhpdC5wdXNoKGV4aXROb2Rlcyk7XG4gICAgfVxuICAgIHZhciBlbnRlciA9IGQzX3NlbGVjdGlvbl9lbnRlcihbXSksIHVwZGF0ZSA9IGQzX3NlbGVjdGlvbihbXSksIGV4aXQgPSBkM19zZWxlY3Rpb24oW10pO1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgICAgYmluZChncm91cCA9IHRoaXNbaV0sIHZhbHVlLmNhbGwoZ3JvdXAsIGdyb3VwLnBhcmVudE5vZGUuX19kYXRhX18sIGkpKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgICAgYmluZChncm91cCA9IHRoaXNbaV0sIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdXBkYXRlLmVudGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZW50ZXI7XG4gICAgfTtcbiAgICB1cGRhdGUuZXhpdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGV4aXQ7XG4gICAgfTtcbiAgICByZXR1cm4gdXBkYXRlO1xuICB9O1xuICBmdW5jdGlvbiBkM19zZWxlY3Rpb25fZGF0YU5vZGUoZGF0YSkge1xuICAgIHJldHVybiB7XG4gICAgICBfX2RhdGFfXzogZGF0YVxuICAgIH07XG4gIH1cbiAgZDNfc2VsZWN0aW9uUHJvdG90eXBlLmRhdHVtID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IHRoaXMucHJvcGVydHkoXCJfX2RhdGFfX1wiLCB2YWx1ZSkgOiB0aGlzLnByb3BlcnR5KFwiX19kYXRhX19cIik7XG4gIH07XG4gIGQzX3NlbGVjdGlvblByb3RvdHlwZS5maWx0ZXIgPSBmdW5jdGlvbihmaWx0ZXIpIHtcbiAgICB2YXIgc3ViZ3JvdXBzID0gW10sIHN1Ymdyb3VwLCBncm91cCwgbm9kZTtcbiAgICBpZiAodHlwZW9mIGZpbHRlciAhPT0gXCJmdW5jdGlvblwiKSBmaWx0ZXIgPSBkM19zZWxlY3Rpb25fZmlsdGVyKGZpbHRlcik7XG4gICAgZm9yICh2YXIgaiA9IDAsIG0gPSB0aGlzLmxlbmd0aDsgaiA8IG07IGorKykge1xuICAgICAgc3ViZ3JvdXBzLnB1c2goc3ViZ3JvdXAgPSBbXSk7XG4gICAgICBzdWJncm91cC5wYXJlbnROb2RlID0gKGdyb3VwID0gdGhpc1tqXSkucGFyZW50Tm9kZTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBuID0gZ3JvdXAubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgIGlmICgobm9kZSA9IGdyb3VwW2ldKSAmJiBmaWx0ZXIuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBqKSkge1xuICAgICAgICAgIHN1Ymdyb3VwLnB1c2gobm9kZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGQzX3NlbGVjdGlvbihzdWJncm91cHMpO1xuICB9O1xuICBmdW5jdGlvbiBkM19zZWxlY3Rpb25fZmlsdGVyKHNlbGVjdG9yKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGQzX3NlbGVjdE1hdGNoZXModGhpcywgc2VsZWN0b3IpO1xuICAgIH07XG4gIH1cbiAgZDNfc2VsZWN0aW9uUHJvdG90eXBlLm9yZGVyID0gZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgaiA9IC0xLCBtID0gdGhpcy5sZW5ndGg7ICsraiA8IG07ICkge1xuICAgICAgZm9yICh2YXIgZ3JvdXAgPSB0aGlzW2pdLCBpID0gZ3JvdXAubGVuZ3RoIC0gMSwgbmV4dCA9IGdyb3VwW2ldLCBub2RlOyAtLWkgPj0gMDsgKSB7XG4gICAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgICBpZiAobmV4dCAmJiBuZXh0ICE9PSBub2RlLm5leHRTaWJsaW5nKSBuZXh0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5vZGUsIG5leHQpO1xuICAgICAgICAgIG5leHQgPSBub2RlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBkM19zZWxlY3Rpb25Qcm90b3R5cGUuc29ydCA9IGZ1bmN0aW9uKGNvbXBhcmF0b3IpIHtcbiAgICBjb21wYXJhdG9yID0gZDNfc2VsZWN0aW9uX3NvcnRDb21wYXJhdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgZm9yICh2YXIgaiA9IC0xLCBtID0gdGhpcy5sZW5ndGg7ICsraiA8IG07ICkgdGhpc1tqXS5zb3J0KGNvbXBhcmF0b3IpO1xuICAgIHJldHVybiB0aGlzLm9yZGVyKCk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3NlbGVjdGlvbl9zb3J0Q29tcGFyYXRvcihjb21wYXJhdG9yKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSBjb21wYXJhdG9yID0gZDNfYXNjZW5kaW5nO1xuICAgIHJldHVybiBmdW5jdGlvbihhLCBiKSB7XG4gICAgICByZXR1cm4gYSAmJiBiID8gY29tcGFyYXRvcihhLl9fZGF0YV9fLCBiLl9fZGF0YV9fKSA6ICFhIC0gIWI7XG4gICAgfTtcbiAgfVxuICBkM19zZWxlY3Rpb25Qcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIGQzX3NlbGVjdGlvbl9lYWNoKHRoaXMsIGZ1bmN0aW9uKG5vZGUsIGksIGopIHtcbiAgICAgIGNhbGxiYWNrLmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgaik7XG4gICAgfSk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3NlbGVjdGlvbl9lYWNoKGdyb3VwcywgY2FsbGJhY2spIHtcbiAgICBmb3IgKHZhciBqID0gMCwgbSA9IGdyb3Vwcy5sZW5ndGg7IGogPCBtOyBqKyspIHtcbiAgICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBpID0gMCwgbiA9IGdyb3VwLmxlbmd0aCwgbm9kZTsgaSA8IG47IGkrKykge1xuICAgICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSBjYWxsYmFjayhub2RlLCBpLCBqKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGdyb3VwcztcbiAgfVxuICBkM19zZWxlY3Rpb25Qcm90b3R5cGUuY2FsbCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgdmFyIGFyZ3MgPSBkM19hcnJheShhcmd1bWVudHMpO1xuICAgIGNhbGxiYWNrLmFwcGx5KGFyZ3NbMF0gPSB0aGlzLCBhcmdzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgZDNfc2VsZWN0aW9uUHJvdG90eXBlLmVtcHR5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICF0aGlzLm5vZGUoKTtcbiAgfTtcbiAgZDNfc2VsZWN0aW9uUHJvdG90eXBlLm5vZGUgPSBmdW5jdGlvbigpIHtcbiAgICBmb3IgKHZhciBqID0gMCwgbSA9IHRoaXMubGVuZ3RoOyBqIDwgbTsgaisrKSB7XG4gICAgICBmb3IgKHZhciBncm91cCA9IHRoaXNbal0sIGkgPSAwLCBuID0gZ3JvdXAubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgIHZhciBub2RlID0gZ3JvdXBbaV07XG4gICAgICAgIGlmIChub2RlKSByZXR1cm4gbm9kZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG4gIGQzX3NlbGVjdGlvblByb3RvdHlwZS5zaXplID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG4gPSAwO1xuICAgIGQzX3NlbGVjdGlvbl9lYWNoKHRoaXMsIGZ1bmN0aW9uKCkge1xuICAgICAgKytuO1xuICAgIH0pO1xuICAgIHJldHVybiBuO1xuICB9O1xuICBmdW5jdGlvbiBkM19zZWxlY3Rpb25fZW50ZXIoc2VsZWN0aW9uKSB7XG4gICAgZDNfc3ViY2xhc3Moc2VsZWN0aW9uLCBkM19zZWxlY3Rpb25fZW50ZXJQcm90b3R5cGUpO1xuICAgIHJldHVybiBzZWxlY3Rpb247XG4gIH1cbiAgdmFyIGQzX3NlbGVjdGlvbl9lbnRlclByb3RvdHlwZSA9IFtdO1xuICBkMy5zZWxlY3Rpb24uZW50ZXIgPSBkM19zZWxlY3Rpb25fZW50ZXI7XG4gIGQzLnNlbGVjdGlvbi5lbnRlci5wcm90b3R5cGUgPSBkM19zZWxlY3Rpb25fZW50ZXJQcm90b3R5cGU7XG4gIGQzX3NlbGVjdGlvbl9lbnRlclByb3RvdHlwZS5hcHBlbmQgPSBkM19zZWxlY3Rpb25Qcm90b3R5cGUuYXBwZW5kO1xuICBkM19zZWxlY3Rpb25fZW50ZXJQcm90b3R5cGUuZW1wdHkgPSBkM19zZWxlY3Rpb25Qcm90b3R5cGUuZW1wdHk7XG4gIGQzX3NlbGVjdGlvbl9lbnRlclByb3RvdHlwZS5ub2RlID0gZDNfc2VsZWN0aW9uUHJvdG90eXBlLm5vZGU7XG4gIGQzX3NlbGVjdGlvbl9lbnRlclByb3RvdHlwZS5jYWxsID0gZDNfc2VsZWN0aW9uUHJvdG90eXBlLmNhbGw7XG4gIGQzX3NlbGVjdGlvbl9lbnRlclByb3RvdHlwZS5zaXplID0gZDNfc2VsZWN0aW9uUHJvdG90eXBlLnNpemU7XG4gIGQzX3NlbGVjdGlvbl9lbnRlclByb3RvdHlwZS5zZWxlY3QgPSBmdW5jdGlvbihzZWxlY3Rvcikge1xuICAgIHZhciBzdWJncm91cHMgPSBbXSwgc3ViZ3JvdXAsIHN1Ym5vZGUsIHVwZ3JvdXAsIGdyb3VwLCBub2RlO1xuICAgIGZvciAodmFyIGogPSAtMSwgbSA9IHRoaXMubGVuZ3RoOyArK2ogPCBtOyApIHtcbiAgICAgIHVwZ3JvdXAgPSAoZ3JvdXAgPSB0aGlzW2pdKS51cGRhdGU7XG4gICAgICBzdWJncm91cHMucHVzaChzdWJncm91cCA9IFtdKTtcbiAgICAgIHN1Ymdyb3VwLnBhcmVudE5vZGUgPSBncm91cC5wYXJlbnROb2RlO1xuICAgICAgZm9yICh2YXIgaSA9IC0xLCBuID0gZ3JvdXAubGVuZ3RoOyArK2kgPCBuOyApIHtcbiAgICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgICAgIHN1Ymdyb3VwLnB1c2godXBncm91cFtpXSA9IHN1Ym5vZGUgPSBzZWxlY3Rvci5jYWxsKGdyb3VwLnBhcmVudE5vZGUsIG5vZGUuX19kYXRhX18sIGksIGopKTtcbiAgICAgICAgICBzdWJub2RlLl9fZGF0YV9fID0gbm9kZS5fX2RhdGFfXztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdWJncm91cC5wdXNoKG51bGwpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkM19zZWxlY3Rpb24oc3ViZ3JvdXBzKTtcbiAgfTtcbiAgZDNfc2VsZWN0aW9uX2VudGVyUHJvdG90eXBlLmluc2VydCA9IGZ1bmN0aW9uKG5hbWUsIGJlZm9yZSkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikgYmVmb3JlID0gZDNfc2VsZWN0aW9uX2VudGVySW5zZXJ0QmVmb3JlKHRoaXMpO1xuICAgIHJldHVybiBkM19zZWxlY3Rpb25Qcm90b3R5cGUuaW5zZXJ0LmNhbGwodGhpcywgbmFtZSwgYmVmb3JlKTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfc2VsZWN0aW9uX2VudGVySW5zZXJ0QmVmb3JlKGVudGVyKSB7XG4gICAgdmFyIGkwLCBqMDtcbiAgICByZXR1cm4gZnVuY3Rpb24oZCwgaSwgaikge1xuICAgICAgdmFyIGdyb3VwID0gZW50ZXJbal0udXBkYXRlLCBuID0gZ3JvdXAubGVuZ3RoLCBub2RlO1xuICAgICAgaWYgKGogIT0gajApIGowID0gaiwgaTAgPSAwO1xuICAgICAgaWYgKGkgPj0gaTApIGkwID0gaSArIDE7XG4gICAgICB3aGlsZSAoIShub2RlID0gZ3JvdXBbaTBdKSAmJiArK2kwIDwgbikgO1xuICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfTtcbiAgfVxuICBkMy5zZWxlY3QgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgdmFyIGdyb3VwID0gWyB0eXBlb2Ygbm9kZSA9PT0gXCJzdHJpbmdcIiA/IGQzX3NlbGVjdChub2RlLCBkM19kb2N1bWVudCkgOiBub2RlIF07XG4gICAgZ3JvdXAucGFyZW50Tm9kZSA9IGQzX2RvY3VtZW50RWxlbWVudDtcbiAgICByZXR1cm4gZDNfc2VsZWN0aW9uKFsgZ3JvdXAgXSk7XG4gIH07XG4gIGQzLnNlbGVjdEFsbCA9IGZ1bmN0aW9uKG5vZGVzKSB7XG4gICAgdmFyIGdyb3VwID0gZDNfYXJyYXkodHlwZW9mIG5vZGVzID09PSBcInN0cmluZ1wiID8gZDNfc2VsZWN0QWxsKG5vZGVzLCBkM19kb2N1bWVudCkgOiBub2Rlcyk7XG4gICAgZ3JvdXAucGFyZW50Tm9kZSA9IGQzX2RvY3VtZW50RWxlbWVudDtcbiAgICByZXR1cm4gZDNfc2VsZWN0aW9uKFsgZ3JvdXAgXSk7XG4gIH07XG4gIHZhciBkM19zZWxlY3Rpb25Sb290ID0gZDMuc2VsZWN0KGQzX2RvY3VtZW50RWxlbWVudCk7XG4gIGQzX3NlbGVjdGlvblByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKSB7XG4gICAgdmFyIG4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGlmIChuIDwgMykge1xuICAgICAgaWYgKHR5cGVvZiB0eXBlICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGlmIChuIDwgMikgbGlzdGVuZXIgPSBmYWxzZTtcbiAgICAgICAgZm9yIChjYXB0dXJlIGluIHR5cGUpIHRoaXMuZWFjaChkM19zZWxlY3Rpb25fb24oY2FwdHVyZSwgdHlwZVtjYXB0dXJlXSwgbGlzdGVuZXIpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICBpZiAobiA8IDIpIHJldHVybiAobiA9IHRoaXMubm9kZSgpW1wiX19vblwiICsgdHlwZV0pICYmIG4uXztcbiAgICAgIGNhcHR1cmUgPSBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZWFjaChkM19zZWxlY3Rpb25fb24odHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpKTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfc2VsZWN0aW9uX29uKHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKSB7XG4gICAgdmFyIG5hbWUgPSBcIl9fb25cIiArIHR5cGUsIGkgPSB0eXBlLmluZGV4T2YoXCIuXCIpLCB3cmFwID0gZDNfc2VsZWN0aW9uX29uTGlzdGVuZXI7XG4gICAgaWYgKGkgPiAwKSB0eXBlID0gdHlwZS5zbGljZSgwLCBpKTtcbiAgICB2YXIgZmlsdGVyID0gZDNfc2VsZWN0aW9uX29uRmlsdGVycy5nZXQodHlwZSk7XG4gICAgaWYgKGZpbHRlcikgdHlwZSA9IGZpbHRlciwgd3JhcCA9IGQzX3NlbGVjdGlvbl9vbkZpbHRlcjtcbiAgICBmdW5jdGlvbiBvblJlbW92ZSgpIHtcbiAgICAgIHZhciBsID0gdGhpc1tuYW1lXTtcbiAgICAgIGlmIChsKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsLCBsLiQpO1xuICAgICAgICBkZWxldGUgdGhpc1tuYW1lXTtcbiAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gb25BZGQoKSB7XG4gICAgICB2YXIgbCA9IHdyYXAobGlzdGVuZXIsIGQzX2FycmF5KGFyZ3VtZW50cykpO1xuICAgICAgb25SZW1vdmUuY2FsbCh0aGlzKTtcbiAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCB0aGlzW25hbWVdID0gbCwgbC4kID0gY2FwdHVyZSk7XG4gICAgICBsLl8gPSBsaXN0ZW5lcjtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmVtb3ZlQWxsKCkge1xuICAgICAgdmFyIHJlID0gbmV3IFJlZ0V4cChcIl5fX29uKFteLl0rKVwiICsgZDMucmVxdW90ZSh0eXBlKSArIFwiJFwiKSwgbWF0Y2g7XG4gICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMpIHtcbiAgICAgICAgaWYgKG1hdGNoID0gbmFtZS5tYXRjaChyZSkpIHtcbiAgICAgICAgICB2YXIgbCA9IHRoaXNbbmFtZV07XG4gICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKG1hdGNoWzFdLCBsLCBsLiQpO1xuICAgICAgICAgIGRlbGV0ZSB0aGlzW25hbWVdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpID8gbGlzdGVuZXIgPyBvbkFkZCA6IG9uUmVtb3ZlIDogbGlzdGVuZXIgPyBkM19ub29wIDogcmVtb3ZlQWxsO1xuICB9XG4gIHZhciBkM19zZWxlY3Rpb25fb25GaWx0ZXJzID0gZDMubWFwKHtcbiAgICBtb3VzZWVudGVyOiBcIm1vdXNlb3ZlclwiLFxuICAgIG1vdXNlbGVhdmU6IFwibW91c2VvdXRcIlxuICB9KTtcbiAgZDNfc2VsZWN0aW9uX29uRmlsdGVycy5mb3JFYWNoKGZ1bmN0aW9uKGspIHtcbiAgICBpZiAoXCJvblwiICsgayBpbiBkM19kb2N1bWVudCkgZDNfc2VsZWN0aW9uX29uRmlsdGVycy5yZW1vdmUoayk7XG4gIH0pO1xuICBmdW5jdGlvbiBkM19zZWxlY3Rpb25fb25MaXN0ZW5lcihsaXN0ZW5lciwgYXJndW1lbnR6KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBvID0gZDMuZXZlbnQ7XG4gICAgICBkMy5ldmVudCA9IGU7XG4gICAgICBhcmd1bWVudHpbMF0gPSB0aGlzLl9fZGF0YV9fO1xuICAgICAgdHJ5IHtcbiAgICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnR6KTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGQzLmV2ZW50ID0gbztcbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIGQzX3NlbGVjdGlvbl9vbkZpbHRlcihsaXN0ZW5lciwgYXJndW1lbnR6KSB7XG4gICAgdmFyIGwgPSBkM19zZWxlY3Rpb25fb25MaXN0ZW5lcihsaXN0ZW5lciwgYXJndW1lbnR6KTtcbiAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgdmFyIHRhcmdldCA9IHRoaXMsIHJlbGF0ZWQgPSBlLnJlbGF0ZWRUYXJnZXQ7XG4gICAgICBpZiAoIXJlbGF0ZWQgfHwgcmVsYXRlZCAhPT0gdGFyZ2V0ICYmICEocmVsYXRlZC5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbih0YXJnZXQpICYgOCkpIHtcbiAgICAgICAgbC5jYWxsKHRhcmdldCwgZSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICB2YXIgZDNfZXZlbnRfZHJhZ1NlbGVjdCA9IFwib25zZWxlY3RzdGFydFwiIGluIGQzX2RvY3VtZW50ID8gbnVsbCA6IGQzX3ZlbmRvclN5bWJvbChkM19kb2N1bWVudEVsZW1lbnQuc3R5bGUsIFwidXNlclNlbGVjdFwiKSwgZDNfZXZlbnRfZHJhZ0lkID0gMDtcbiAgZnVuY3Rpb24gZDNfZXZlbnRfZHJhZ1N1cHByZXNzKCkge1xuICAgIHZhciBuYW1lID0gXCIuZHJhZ3N1cHByZXNzLVwiICsgKytkM19ldmVudF9kcmFnSWQsIGNsaWNrID0gXCJjbGlja1wiICsgbmFtZSwgdyA9IGQzLnNlbGVjdChkM193aW5kb3cpLm9uKFwidG91Y2htb3ZlXCIgKyBuYW1lLCBkM19ldmVudFByZXZlbnREZWZhdWx0KS5vbihcImRyYWdzdGFydFwiICsgbmFtZSwgZDNfZXZlbnRQcmV2ZW50RGVmYXVsdCkub24oXCJzZWxlY3RzdGFydFwiICsgbmFtZSwgZDNfZXZlbnRQcmV2ZW50RGVmYXVsdCk7XG4gICAgaWYgKGQzX2V2ZW50X2RyYWdTZWxlY3QpIHtcbiAgICAgIHZhciBzdHlsZSA9IGQzX2RvY3VtZW50RWxlbWVudC5zdHlsZSwgc2VsZWN0ID0gc3R5bGVbZDNfZXZlbnRfZHJhZ1NlbGVjdF07XG4gICAgICBzdHlsZVtkM19ldmVudF9kcmFnU2VsZWN0XSA9IFwibm9uZVwiO1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24oc3VwcHJlc3NDbGljaykge1xuICAgICAgdy5vbihuYW1lLCBudWxsKTtcbiAgICAgIGlmIChkM19ldmVudF9kcmFnU2VsZWN0KSBzdHlsZVtkM19ldmVudF9kcmFnU2VsZWN0XSA9IHNlbGVjdDtcbiAgICAgIGlmIChzdXBwcmVzc0NsaWNrKSB7XG4gICAgICAgIHZhciBvZmYgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICB3Lm9uKGNsaWNrLCBudWxsKTtcbiAgICAgICAgfTtcbiAgICAgICAgdy5vbihjbGljaywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZDNfZXZlbnRQcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIG9mZigpO1xuICAgICAgICB9LCB0cnVlKTtcbiAgICAgICAgc2V0VGltZW91dChvZmYsIDApO1xuICAgICAgfVxuICAgIH07XG4gIH1cbiAgZDMubW91c2UgPSBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgICByZXR1cm4gZDNfbW91c2VQb2ludChjb250YWluZXIsIGQzX2V2ZW50U291cmNlKCkpO1xuICB9O1xuICB2YXIgZDNfbW91c2VfYnVnNDQwODMgPSAvV2ViS2l0Ly50ZXN0KGQzX3dpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50KSA/IC0xIDogMDtcbiAgZnVuY3Rpb24gZDNfbW91c2VQb2ludChjb250YWluZXIsIGUpIHtcbiAgICBpZiAoZS5jaGFuZ2VkVG91Y2hlcykgZSA9IGUuY2hhbmdlZFRvdWNoZXNbMF07XG4gICAgdmFyIHN2ZyA9IGNvbnRhaW5lci5vd25lclNWR0VsZW1lbnQgfHwgY29udGFpbmVyO1xuICAgIGlmIChzdmcuY3JlYXRlU1ZHUG9pbnQpIHtcbiAgICAgIHZhciBwb2ludCA9IHN2Zy5jcmVhdGVTVkdQb2ludCgpO1xuICAgICAgaWYgKGQzX21vdXNlX2J1ZzQ0MDgzIDwgMCAmJiAoZDNfd2luZG93LnNjcm9sbFggfHwgZDNfd2luZG93LnNjcm9sbFkpKSB7XG4gICAgICAgIHN2ZyA9IGQzLnNlbGVjdChcImJvZHlcIikuYXBwZW5kKFwic3ZnXCIpLnN0eWxlKHtcbiAgICAgICAgICBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgIG1hcmdpbjogMCxcbiAgICAgICAgICBwYWRkaW5nOiAwLFxuICAgICAgICAgIGJvcmRlcjogXCJub25lXCJcbiAgICAgICAgfSwgXCJpbXBvcnRhbnRcIik7XG4gICAgICAgIHZhciBjdG0gPSBzdmdbMF1bMF0uZ2V0U2NyZWVuQ1RNKCk7XG4gICAgICAgIGQzX21vdXNlX2J1ZzQ0MDgzID0gIShjdG0uZiB8fCBjdG0uZSk7XG4gICAgICAgIHN2Zy5yZW1vdmUoKTtcbiAgICAgIH1cbiAgICAgIGlmIChkM19tb3VzZV9idWc0NDA4MykgcG9pbnQueCA9IGUucGFnZVgsIHBvaW50LnkgPSBlLnBhZ2VZOyBlbHNlIHBvaW50LnggPSBlLmNsaWVudFgsIFxuICAgICAgcG9pbnQueSA9IGUuY2xpZW50WTtcbiAgICAgIHBvaW50ID0gcG9pbnQubWF0cml4VHJhbnNmb3JtKGNvbnRhaW5lci5nZXRTY3JlZW5DVE0oKS5pbnZlcnNlKCkpO1xuICAgICAgcmV0dXJuIFsgcG9pbnQueCwgcG9pbnQueSBdO1xuICAgIH1cbiAgICB2YXIgcmVjdCA9IGNvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICByZXR1cm4gWyBlLmNsaWVudFggLSByZWN0LmxlZnQgLSBjb250YWluZXIuY2xpZW50TGVmdCwgZS5jbGllbnRZIC0gcmVjdC50b3AgLSBjb250YWluZXIuY2xpZW50VG9wIF07XG4gIH1cbiAgZDMudG91Y2ggPSBmdW5jdGlvbihjb250YWluZXIsIHRvdWNoZXMsIGlkZW50aWZpZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIGlkZW50aWZpZXIgPSB0b3VjaGVzLCB0b3VjaGVzID0gZDNfZXZlbnRTb3VyY2UoKS5jaGFuZ2VkVG91Y2hlcztcbiAgICBpZiAodG91Y2hlcykgZm9yICh2YXIgaSA9IDAsIG4gPSB0b3VjaGVzLmxlbmd0aCwgdG91Y2g7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmICgodG91Y2ggPSB0b3VjaGVzW2ldKS5pZGVudGlmaWVyID09PSBpZGVudGlmaWVyKSB7XG4gICAgICAgIHJldHVybiBkM19tb3VzZVBvaW50KGNvbnRhaW5lciwgdG91Y2gpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgZDMuYmVoYXZpb3IuZHJhZyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBldmVudCA9IGQzX2V2ZW50RGlzcGF0Y2goZHJhZywgXCJkcmFnXCIsIFwiZHJhZ3N0YXJ0XCIsIFwiZHJhZ2VuZFwiKSwgb3JpZ2luID0gbnVsbCwgbW91c2Vkb3duID0gZHJhZ3N0YXJ0KGQzX25vb3AsIGQzLm1vdXNlLCBkM19iZWhhdmlvcl9kcmFnTW91c2VTdWJqZWN0LCBcIm1vdXNlbW92ZVwiLCBcIm1vdXNldXBcIiksIHRvdWNoc3RhcnQgPSBkcmFnc3RhcnQoZDNfYmVoYXZpb3JfZHJhZ1RvdWNoSWQsIGQzLnRvdWNoLCBkM19iZWhhdmlvcl9kcmFnVG91Y2hTdWJqZWN0LCBcInRvdWNobW92ZVwiLCBcInRvdWNoZW5kXCIpO1xuICAgIGZ1bmN0aW9uIGRyYWcoKSB7XG4gICAgICB0aGlzLm9uKFwibW91c2Vkb3duLmRyYWdcIiwgbW91c2Vkb3duKS5vbihcInRvdWNoc3RhcnQuZHJhZ1wiLCB0b3VjaHN0YXJ0KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZHJhZ3N0YXJ0KGlkLCBwb3NpdGlvbiwgc3ViamVjdCwgbW92ZSwgZW5kKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcywgdGFyZ2V0ID0gZDMuZXZlbnQudGFyZ2V0LCBwYXJlbnQgPSB0aGF0LnBhcmVudE5vZGUsIGRpc3BhdGNoID0gZXZlbnQub2YodGhhdCwgYXJndW1lbnRzKSwgZHJhZ2dlZCA9IDAsIGRyYWdJZCA9IGlkKCksIGRyYWdOYW1lID0gXCIuZHJhZ1wiICsgKGRyYWdJZCA9PSBudWxsID8gXCJcIiA6IFwiLVwiICsgZHJhZ0lkKSwgZHJhZ09mZnNldCwgZHJhZ1N1YmplY3QgPSBkMy5zZWxlY3Qoc3ViamVjdCgpKS5vbihtb3ZlICsgZHJhZ05hbWUsIG1vdmVkKS5vbihlbmQgKyBkcmFnTmFtZSwgZW5kZWQpLCBkcmFnUmVzdG9yZSA9IGQzX2V2ZW50X2RyYWdTdXBwcmVzcygpLCBwb3NpdGlvbjAgPSBwb3NpdGlvbihwYXJlbnQsIGRyYWdJZCk7XG4gICAgICAgIGlmIChvcmlnaW4pIHtcbiAgICAgICAgICBkcmFnT2Zmc2V0ID0gb3JpZ2luLmFwcGx5KHRoYXQsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgZHJhZ09mZnNldCA9IFsgZHJhZ09mZnNldC54IC0gcG9zaXRpb24wWzBdLCBkcmFnT2Zmc2V0LnkgLSBwb3NpdGlvbjBbMV0gXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkcmFnT2Zmc2V0ID0gWyAwLCAwIF07XG4gICAgICAgIH1cbiAgICAgICAgZGlzcGF0Y2goe1xuICAgICAgICAgIHR5cGU6IFwiZHJhZ3N0YXJ0XCJcbiAgICAgICAgfSk7XG4gICAgICAgIGZ1bmN0aW9uIG1vdmVkKCkge1xuICAgICAgICAgIHZhciBwb3NpdGlvbjEgPSBwb3NpdGlvbihwYXJlbnQsIGRyYWdJZCksIGR4LCBkeTtcbiAgICAgICAgICBpZiAoIXBvc2l0aW9uMSkgcmV0dXJuO1xuICAgICAgICAgIGR4ID0gcG9zaXRpb24xWzBdIC0gcG9zaXRpb24wWzBdO1xuICAgICAgICAgIGR5ID0gcG9zaXRpb24xWzFdIC0gcG9zaXRpb24wWzFdO1xuICAgICAgICAgIGRyYWdnZWQgfD0gZHggfCBkeTtcbiAgICAgICAgICBwb3NpdGlvbjAgPSBwb3NpdGlvbjE7XG4gICAgICAgICAgZGlzcGF0Y2goe1xuICAgICAgICAgICAgdHlwZTogXCJkcmFnXCIsXG4gICAgICAgICAgICB4OiBwb3NpdGlvbjFbMF0gKyBkcmFnT2Zmc2V0WzBdLFxuICAgICAgICAgICAgeTogcG9zaXRpb24xWzFdICsgZHJhZ09mZnNldFsxXSxcbiAgICAgICAgICAgIGR4OiBkeCxcbiAgICAgICAgICAgIGR5OiBkeVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIGVuZGVkKCkge1xuICAgICAgICAgIGlmICghcG9zaXRpb24ocGFyZW50LCBkcmFnSWQpKSByZXR1cm47XG4gICAgICAgICAgZHJhZ1N1YmplY3Qub24obW92ZSArIGRyYWdOYW1lLCBudWxsKS5vbihlbmQgKyBkcmFnTmFtZSwgbnVsbCk7XG4gICAgICAgICAgZHJhZ1Jlc3RvcmUoZHJhZ2dlZCAmJiBkMy5ldmVudC50YXJnZXQgPT09IHRhcmdldCk7XG4gICAgICAgICAgZGlzcGF0Y2goe1xuICAgICAgICAgICAgdHlwZTogXCJkcmFnZW5kXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gICAgZHJhZy5vcmlnaW4gPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBvcmlnaW47XG4gICAgICBvcmlnaW4gPSB4O1xuICAgICAgcmV0dXJuIGRyYWc7XG4gICAgfTtcbiAgICByZXR1cm4gZDMucmViaW5kKGRyYWcsIGV2ZW50LCBcIm9uXCIpO1xuICB9O1xuICBmdW5jdGlvbiBkM19iZWhhdmlvcl9kcmFnVG91Y2hJZCgpIHtcbiAgICByZXR1cm4gZDMuZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0uaWRlbnRpZmllcjtcbiAgfVxuICBmdW5jdGlvbiBkM19iZWhhdmlvcl9kcmFnVG91Y2hTdWJqZWN0KCkge1xuICAgIHJldHVybiBkMy5ldmVudC50YXJnZXQ7XG4gIH1cbiAgZnVuY3Rpb24gZDNfYmVoYXZpb3JfZHJhZ01vdXNlU3ViamVjdCgpIHtcbiAgICByZXR1cm4gZDNfd2luZG93O1xuICB9XG4gIGQzLnRvdWNoZXMgPSBmdW5jdGlvbihjb250YWluZXIsIHRvdWNoZXMpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHRvdWNoZXMgPSBkM19ldmVudFNvdXJjZSgpLnRvdWNoZXM7XG4gICAgcmV0dXJuIHRvdWNoZXMgPyBkM19hcnJheSh0b3VjaGVzKS5tYXAoZnVuY3Rpb24odG91Y2gpIHtcbiAgICAgIHZhciBwb2ludCA9IGQzX21vdXNlUG9pbnQoY29udGFpbmVyLCB0b3VjaCk7XG4gICAgICBwb2ludC5pZGVudGlmaWVyID0gdG91Y2guaWRlbnRpZmllcjtcbiAgICAgIHJldHVybiBwb2ludDtcbiAgICB9KSA6IFtdO1xuICB9O1xuICB2YXIgzrUgPSAxZS02LCDOtTIgPSDOtSAqIM61LCDPgCA9IE1hdGguUEksIM+EID0gMiAqIM+ALCDPhM61ID0gz4QgLSDOtSwgaGFsZs+AID0gz4AgLyAyLCBkM19yYWRpYW5zID0gz4AgLyAxODAsIGQzX2RlZ3JlZXMgPSAxODAgLyDPgDtcbiAgZnVuY3Rpb24gZDNfc2duKHgpIHtcbiAgICByZXR1cm4geCA+IDAgPyAxIDogeCA8IDAgPyAtMSA6IDA7XG4gIH1cbiAgZnVuY3Rpb24gZDNfY3Jvc3MyZChhLCBiLCBjKSB7XG4gICAgcmV0dXJuIChiWzBdIC0gYVswXSkgKiAoY1sxXSAtIGFbMV0pIC0gKGJbMV0gLSBhWzFdKSAqIChjWzBdIC0gYVswXSk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfYWNvcyh4KSB7XG4gICAgcmV0dXJuIHggPiAxID8gMCA6IHggPCAtMSA/IM+AIDogTWF0aC5hY29zKHgpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2FzaW4oeCkge1xuICAgIHJldHVybiB4ID4gMSA/IGhhbGbPgCA6IHggPCAtMSA/IC1oYWxmz4AgOiBNYXRoLmFzaW4oeCk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfc2luaCh4KSB7XG4gICAgcmV0dXJuICgoeCA9IE1hdGguZXhwKHgpKSAtIDEgLyB4KSAvIDI7XG4gIH1cbiAgZnVuY3Rpb24gZDNfY29zaCh4KSB7XG4gICAgcmV0dXJuICgoeCA9IE1hdGguZXhwKHgpKSArIDEgLyB4KSAvIDI7XG4gIH1cbiAgZnVuY3Rpb24gZDNfdGFuaCh4KSB7XG4gICAgcmV0dXJuICgoeCA9IE1hdGguZXhwKDIgKiB4KSkgLSAxKSAvICh4ICsgMSk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfaGF2ZXJzaW4oeCkge1xuICAgIHJldHVybiAoeCA9IE1hdGguc2luKHggLyAyKSkgKiB4O1xuICB9XG4gIHZhciDPgSA9IE1hdGguU1FSVDIsIM+BMiA9IDIsIM+BNCA9IDQ7XG4gIGQzLmludGVycG9sYXRlWm9vbSA9IGZ1bmN0aW9uKHAwLCBwMSkge1xuICAgIHZhciB1eDAgPSBwMFswXSwgdXkwID0gcDBbMV0sIHcwID0gcDBbMl0sIHV4MSA9IHAxWzBdLCB1eTEgPSBwMVsxXSwgdzEgPSBwMVsyXTtcbiAgICB2YXIgZHggPSB1eDEgLSB1eDAsIGR5ID0gdXkxIC0gdXkwLCBkMiA9IGR4ICogZHggKyBkeSAqIGR5LCBkMSA9IE1hdGguc3FydChkMiksIGIwID0gKHcxICogdzEgLSB3MCAqIHcwICsgz4E0ICogZDIpIC8gKDIgKiB3MCAqIM+BMiAqIGQxKSwgYjEgPSAodzEgKiB3MSAtIHcwICogdzAgLSDPgTQgKiBkMikgLyAoMiAqIHcxICogz4EyICogZDEpLCByMCA9IE1hdGgubG9nKE1hdGguc3FydChiMCAqIGIwICsgMSkgLSBiMCksIHIxID0gTWF0aC5sb2coTWF0aC5zcXJ0KGIxICogYjEgKyAxKSAtIGIxKSwgZHIgPSByMSAtIHIwLCBTID0gKGRyIHx8IE1hdGgubG9nKHcxIC8gdzApKSAvIM+BO1xuICAgIGZ1bmN0aW9uIGludGVycG9sYXRlKHQpIHtcbiAgICAgIHZhciBzID0gdCAqIFM7XG4gICAgICBpZiAoZHIpIHtcbiAgICAgICAgdmFyIGNvc2hyMCA9IGQzX2Nvc2gocjApLCB1ID0gdzAgLyAoz4EyICogZDEpICogKGNvc2hyMCAqIGQzX3Rhbmgoz4EgKiBzICsgcjApIC0gZDNfc2luaChyMCkpO1xuICAgICAgICByZXR1cm4gWyB1eDAgKyB1ICogZHgsIHV5MCArIHUgKiBkeSwgdzAgKiBjb3NocjAgLyBkM19jb3NoKM+BICogcyArIHIwKSBdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFsgdXgwICsgdCAqIGR4LCB1eTAgKyB0ICogZHksIHcwICogTWF0aC5leHAoz4EgKiBzKSBdO1xuICAgIH1cbiAgICBpbnRlcnBvbGF0ZS5kdXJhdGlvbiA9IFMgKiAxZTM7XG4gICAgcmV0dXJuIGludGVycG9sYXRlO1xuICB9O1xuICBkMy5iZWhhdmlvci56b29tID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZpZXcgPSB7XG4gICAgICB4OiAwLFxuICAgICAgeTogMCxcbiAgICAgIGs6IDFcbiAgICB9LCB0cmFuc2xhdGUwLCBjZW50ZXIwLCBjZW50ZXIsIHNpemUgPSBbIDk2MCwgNTAwIF0sIHNjYWxlRXh0ZW50ID0gZDNfYmVoYXZpb3Jfem9vbUluZmluaXR5LCBkdXJhdGlvbiA9IDI1MCwgem9vbWluZyA9IDAsIG1vdXNlZG93biA9IFwibW91c2Vkb3duLnpvb21cIiwgbW91c2Vtb3ZlID0gXCJtb3VzZW1vdmUuem9vbVwiLCBtb3VzZXVwID0gXCJtb3VzZXVwLnpvb21cIiwgbW91c2V3aGVlbFRpbWVyLCB0b3VjaHN0YXJ0ID0gXCJ0b3VjaHN0YXJ0Lnpvb21cIiwgdG91Y2h0aW1lLCBldmVudCA9IGQzX2V2ZW50RGlzcGF0Y2goem9vbSwgXCJ6b29tc3RhcnRcIiwgXCJ6b29tXCIsIFwiem9vbWVuZFwiKSwgeDAsIHgxLCB5MCwgeTE7XG4gICAgZnVuY3Rpb24gem9vbShnKSB7XG4gICAgICBnLm9uKG1vdXNlZG93biwgbW91c2Vkb3duZWQpLm9uKGQzX2JlaGF2aW9yX3pvb21XaGVlbCArIFwiLnpvb21cIiwgbW91c2V3aGVlbGVkKS5vbihcImRibGNsaWNrLnpvb21cIiwgZGJsY2xpY2tlZCkub24odG91Y2hzdGFydCwgdG91Y2hzdGFydGVkKTtcbiAgICB9XG4gICAgem9vbS5ldmVudCA9IGZ1bmN0aW9uKGcpIHtcbiAgICAgIGcuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGRpc3BhdGNoID0gZXZlbnQub2YodGhpcywgYXJndW1lbnRzKSwgdmlldzEgPSB2aWV3O1xuICAgICAgICBpZiAoZDNfdHJhbnNpdGlvbkluaGVyaXRJZCkge1xuICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS50cmFuc2l0aW9uKCkuZWFjaChcInN0YXJ0Lnpvb21cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2aWV3ID0gdGhpcy5fX2NoYXJ0X18gfHwge1xuICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICB5OiAwLFxuICAgICAgICAgICAgICBrOiAxXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgem9vbXN0YXJ0ZWQoZGlzcGF0Y2gpO1xuICAgICAgICAgIH0pLnR3ZWVuKFwiem9vbTp6b29tXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGR4ID0gc2l6ZVswXSwgZHkgPSBzaXplWzFdLCBjeCA9IGNlbnRlcjAgPyBjZW50ZXIwWzBdIDogZHggLyAyLCBjeSA9IGNlbnRlcjAgPyBjZW50ZXIwWzFdIDogZHkgLyAyLCBpID0gZDMuaW50ZXJwb2xhdGVab29tKFsgKGN4IC0gdmlldy54KSAvIHZpZXcuaywgKGN5IC0gdmlldy55KSAvIHZpZXcuaywgZHggLyB2aWV3LmsgXSwgWyAoY3ggLSB2aWV3MS54KSAvIHZpZXcxLmssIChjeSAtIHZpZXcxLnkpIC8gdmlldzEuaywgZHggLyB2aWV3MS5rIF0pO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgICAgICAgdmFyIGwgPSBpKHQpLCBrID0gZHggLyBsWzJdO1xuICAgICAgICAgICAgICB0aGlzLl9fY2hhcnRfXyA9IHZpZXcgPSB7XG4gICAgICAgICAgICAgICAgeDogY3ggLSBsWzBdICogayxcbiAgICAgICAgICAgICAgICB5OiBjeSAtIGxbMV0gKiBrLFxuICAgICAgICAgICAgICAgIGs6IGtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgem9vbWVkKGRpc3BhdGNoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkuZWFjaChcImludGVycnVwdC56b29tXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgem9vbWVuZGVkKGRpc3BhdGNoKTtcbiAgICAgICAgICB9KS5lYWNoKFwiZW5kLnpvb21cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB6b29tZW5kZWQoZGlzcGF0Y2gpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX19jaGFydF9fID0gdmlldztcbiAgICAgICAgICB6b29tc3RhcnRlZChkaXNwYXRjaCk7XG4gICAgICAgICAgem9vbWVkKGRpc3BhdGNoKTtcbiAgICAgICAgICB6b29tZW5kZWQoZGlzcGF0Y2gpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICAgIHpvb20udHJhbnNsYXRlID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gWyB2aWV3LngsIHZpZXcueSBdO1xuICAgICAgdmlldyA9IHtcbiAgICAgICAgeDogK19bMF0sXG4gICAgICAgIHk6ICtfWzFdLFxuICAgICAgICBrOiB2aWV3LmtcbiAgICAgIH07XG4gICAgICByZXNjYWxlKCk7XG4gICAgICByZXR1cm4gem9vbTtcbiAgICB9O1xuICAgIHpvb20uc2NhbGUgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB2aWV3Lms7XG4gICAgICB2aWV3ID0ge1xuICAgICAgICB4OiB2aWV3LngsXG4gICAgICAgIHk6IHZpZXcueSxcbiAgICAgICAgazogK19cbiAgICAgIH07XG4gICAgICByZXNjYWxlKCk7XG4gICAgICByZXR1cm4gem9vbTtcbiAgICB9O1xuICAgIHpvb20uc2NhbGVFeHRlbnQgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBzY2FsZUV4dGVudDtcbiAgICAgIHNjYWxlRXh0ZW50ID0gXyA9PSBudWxsID8gZDNfYmVoYXZpb3Jfem9vbUluZmluaXR5IDogWyArX1swXSwgK19bMV0gXTtcbiAgICAgIHJldHVybiB6b29tO1xuICAgIH07XG4gICAgem9vbS5jZW50ZXIgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBjZW50ZXI7XG4gICAgICBjZW50ZXIgPSBfICYmIFsgK19bMF0sICtfWzFdIF07XG4gICAgICByZXR1cm4gem9vbTtcbiAgICB9O1xuICAgIHpvb20uc2l6ZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHNpemU7XG4gICAgICBzaXplID0gXyAmJiBbICtfWzBdLCArX1sxXSBdO1xuICAgICAgcmV0dXJuIHpvb207XG4gICAgfTtcbiAgICB6b29tLmR1cmF0aW9uID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gZHVyYXRpb247XG4gICAgICBkdXJhdGlvbiA9ICtfO1xuICAgICAgcmV0dXJuIHpvb207XG4gICAgfTtcbiAgICB6b29tLnggPSBmdW5jdGlvbih6KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB4MTtcbiAgICAgIHgxID0gejtcbiAgICAgIHgwID0gei5jb3B5KCk7XG4gICAgICB2aWV3ID0ge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAwLFxuICAgICAgICBrOiAxXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHpvb207XG4gICAgfTtcbiAgICB6b29tLnkgPSBmdW5jdGlvbih6KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB5MTtcbiAgICAgIHkxID0gejtcbiAgICAgIHkwID0gei5jb3B5KCk7XG4gICAgICB2aWV3ID0ge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAwLFxuICAgICAgICBrOiAxXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHpvb207XG4gICAgfTtcbiAgICBmdW5jdGlvbiBsb2NhdGlvbihwKSB7XG4gICAgICByZXR1cm4gWyAocFswXSAtIHZpZXcueCkgLyB2aWV3LmssIChwWzFdIC0gdmlldy55KSAvIHZpZXcuayBdO1xuICAgIH1cbiAgICBmdW5jdGlvbiBwb2ludChsKSB7XG4gICAgICByZXR1cm4gWyBsWzBdICogdmlldy5rICsgdmlldy54LCBsWzFdICogdmlldy5rICsgdmlldy55IF07XG4gICAgfVxuICAgIGZ1bmN0aW9uIHNjYWxlVG8ocykge1xuICAgICAgdmlldy5rID0gTWF0aC5tYXgoc2NhbGVFeHRlbnRbMF0sIE1hdGgubWluKHNjYWxlRXh0ZW50WzFdLCBzKSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHRyYW5zbGF0ZVRvKHAsIGwpIHtcbiAgICAgIGwgPSBwb2ludChsKTtcbiAgICAgIHZpZXcueCArPSBwWzBdIC0gbFswXTtcbiAgICAgIHZpZXcueSArPSBwWzFdIC0gbFsxXTtcbiAgICB9XG4gICAgZnVuY3Rpb24gem9vbVRvKHRoYXQsIHAsIGwsIGspIHtcbiAgICAgIHRoYXQuX19jaGFydF9fID0ge1xuICAgICAgICB4OiB2aWV3LngsXG4gICAgICAgIHk6IHZpZXcueSxcbiAgICAgICAgazogdmlldy5rXG4gICAgICB9O1xuICAgICAgc2NhbGVUbyhNYXRoLnBvdygyLCBrKSk7XG4gICAgICB0cmFuc2xhdGVUbyhjZW50ZXIwID0gcCwgbCk7XG4gICAgICB0aGF0ID0gZDMuc2VsZWN0KHRoYXQpO1xuICAgICAgaWYgKGR1cmF0aW9uID4gMCkgdGhhdCA9IHRoYXQudHJhbnNpdGlvbigpLmR1cmF0aW9uKGR1cmF0aW9uKTtcbiAgICAgIHRoYXQuY2FsbCh6b29tLmV2ZW50KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmVzY2FsZSgpIHtcbiAgICAgIGlmICh4MSkgeDEuZG9tYWluKHgwLnJhbmdlKCkubWFwKGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgcmV0dXJuICh4IC0gdmlldy54KSAvIHZpZXcuaztcbiAgICAgIH0pLm1hcCh4MC5pbnZlcnQpKTtcbiAgICAgIGlmICh5MSkgeTEuZG9tYWluKHkwLnJhbmdlKCkubWFwKGZ1bmN0aW9uKHkpIHtcbiAgICAgICAgcmV0dXJuICh5IC0gdmlldy55KSAvIHZpZXcuaztcbiAgICAgIH0pLm1hcCh5MC5pbnZlcnQpKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gem9vbXN0YXJ0ZWQoZGlzcGF0Y2gpIHtcbiAgICAgIGlmICghem9vbWluZysrKSBkaXNwYXRjaCh7XG4gICAgICAgIHR5cGU6IFwiem9vbXN0YXJ0XCJcbiAgICAgIH0pO1xuICAgIH1cbiAgICBmdW5jdGlvbiB6b29tZWQoZGlzcGF0Y2gpIHtcbiAgICAgIHJlc2NhbGUoKTtcbiAgICAgIGRpc3BhdGNoKHtcbiAgICAgICAgdHlwZTogXCJ6b29tXCIsXG4gICAgICAgIHNjYWxlOiB2aWV3LmssXG4gICAgICAgIHRyYW5zbGF0ZTogWyB2aWV3LngsIHZpZXcueSBdXG4gICAgICB9KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gem9vbWVuZGVkKGRpc3BhdGNoKSB7XG4gICAgICBpZiAoIS0tem9vbWluZykgZGlzcGF0Y2goe1xuICAgICAgICB0eXBlOiBcInpvb21lbmRcIlxuICAgICAgfSk7XG4gICAgICBjZW50ZXIwID0gbnVsbDtcbiAgICB9XG4gICAgZnVuY3Rpb24gbW91c2Vkb3duZWQoKSB7XG4gICAgICB2YXIgdGhhdCA9IHRoaXMsIHRhcmdldCA9IGQzLmV2ZW50LnRhcmdldCwgZGlzcGF0Y2ggPSBldmVudC5vZih0aGF0LCBhcmd1bWVudHMpLCBkcmFnZ2VkID0gMCwgc3ViamVjdCA9IGQzLnNlbGVjdChkM193aW5kb3cpLm9uKG1vdXNlbW92ZSwgbW92ZWQpLm9uKG1vdXNldXAsIGVuZGVkKSwgbG9jYXRpb24wID0gbG9jYXRpb24oZDMubW91c2UodGhhdCkpLCBkcmFnUmVzdG9yZSA9IGQzX2V2ZW50X2RyYWdTdXBwcmVzcygpO1xuICAgICAgZDNfc2VsZWN0aW9uX2ludGVycnVwdC5jYWxsKHRoYXQpO1xuICAgICAgem9vbXN0YXJ0ZWQoZGlzcGF0Y2gpO1xuICAgICAgZnVuY3Rpb24gbW92ZWQoKSB7XG4gICAgICAgIGRyYWdnZWQgPSAxO1xuICAgICAgICB0cmFuc2xhdGVUbyhkMy5tb3VzZSh0aGF0KSwgbG9jYXRpb24wKTtcbiAgICAgICAgem9vbWVkKGRpc3BhdGNoKTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIGVuZGVkKCkge1xuICAgICAgICBzdWJqZWN0Lm9uKG1vdXNlbW92ZSwgbnVsbCkub24obW91c2V1cCwgbnVsbCk7XG4gICAgICAgIGRyYWdSZXN0b3JlKGRyYWdnZWQgJiYgZDMuZXZlbnQudGFyZ2V0ID09PSB0YXJnZXQpO1xuICAgICAgICB6b29tZW5kZWQoZGlzcGF0Y2gpO1xuICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiB0b3VjaHN0YXJ0ZWQoKSB7XG4gICAgICB2YXIgdGhhdCA9IHRoaXMsIGRpc3BhdGNoID0gZXZlbnQub2YodGhhdCwgYXJndW1lbnRzKSwgbG9jYXRpb25zMCA9IHt9LCBkaXN0YW5jZTAgPSAwLCBzY2FsZTAsIHpvb21OYW1lID0gXCIuem9vbS1cIiArIGQzLmV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLmlkZW50aWZpZXIsIHRvdWNobW92ZSA9IFwidG91Y2htb3ZlXCIgKyB6b29tTmFtZSwgdG91Y2hlbmQgPSBcInRvdWNoZW5kXCIgKyB6b29tTmFtZSwgdGFyZ2V0cyA9IFtdLCBzdWJqZWN0ID0gZDMuc2VsZWN0KHRoYXQpLCBkcmFnUmVzdG9yZSA9IGQzX2V2ZW50X2RyYWdTdXBwcmVzcygpO1xuICAgICAgc3RhcnRlZCgpO1xuICAgICAgem9vbXN0YXJ0ZWQoZGlzcGF0Y2gpO1xuICAgICAgc3ViamVjdC5vbihtb3VzZWRvd24sIG51bGwpLm9uKHRvdWNoc3RhcnQsIHN0YXJ0ZWQpO1xuICAgICAgZnVuY3Rpb24gcmVsb2NhdGUoKSB7XG4gICAgICAgIHZhciB0b3VjaGVzID0gZDMudG91Y2hlcyh0aGF0KTtcbiAgICAgICAgc2NhbGUwID0gdmlldy5rO1xuICAgICAgICB0b3VjaGVzLmZvckVhY2goZnVuY3Rpb24odCkge1xuICAgICAgICAgIGlmICh0LmlkZW50aWZpZXIgaW4gbG9jYXRpb25zMCkgbG9jYXRpb25zMFt0LmlkZW50aWZpZXJdID0gbG9jYXRpb24odCk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdG91Y2hlcztcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIHN0YXJ0ZWQoKSB7XG4gICAgICAgIHZhciB0YXJnZXQgPSBkMy5ldmVudC50YXJnZXQ7XG4gICAgICAgIGQzLnNlbGVjdCh0YXJnZXQpLm9uKHRvdWNobW92ZSwgbW92ZWQpLm9uKHRvdWNoZW5kLCBlbmRlZCk7XG4gICAgICAgIHRhcmdldHMucHVzaCh0YXJnZXQpO1xuICAgICAgICB2YXIgY2hhbmdlZCA9IGQzLmV2ZW50LmNoYW5nZWRUb3VjaGVzO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbiA9IGNoYW5nZWQubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgICAgICAgbG9jYXRpb25zMFtjaGFuZ2VkW2ldLmlkZW50aWZpZXJdID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdG91Y2hlcyA9IHJlbG9jYXRlKCksIG5vdyA9IERhdGUubm93KCk7XG4gICAgICAgIGlmICh0b3VjaGVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgIGlmIChub3cgLSB0b3VjaHRpbWUgPCA1MDApIHtcbiAgICAgICAgICAgIHZhciBwID0gdG91Y2hlc1swXTtcbiAgICAgICAgICAgIHpvb21Ubyh0aGF0LCBwLCBsb2NhdGlvbnMwW3AuaWRlbnRpZmllcl0sIE1hdGguZmxvb3IoTWF0aC5sb2codmlldy5rKSAvIE1hdGguTE4yKSArIDEpO1xuICAgICAgICAgICAgZDNfZXZlbnRQcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0b3VjaHRpbWUgPSBub3c7XG4gICAgICAgIH0gZWxzZSBpZiAodG91Y2hlcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgdmFyIHAgPSB0b3VjaGVzWzBdLCBxID0gdG91Y2hlc1sxXSwgZHggPSBwWzBdIC0gcVswXSwgZHkgPSBwWzFdIC0gcVsxXTtcbiAgICAgICAgICBkaXN0YW5jZTAgPSBkeCAqIGR4ICsgZHkgKiBkeTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZnVuY3Rpb24gbW92ZWQoKSB7XG4gICAgICAgIHZhciB0b3VjaGVzID0gZDMudG91Y2hlcyh0aGF0KSwgcDAsIGwwLCBwMSwgbDE7XG4gICAgICAgIGQzX3NlbGVjdGlvbl9pbnRlcnJ1cHQuY2FsbCh0aGF0KTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIG4gPSB0b3VjaGVzLmxlbmd0aDsgaSA8IG47ICsraSwgbDEgPSBudWxsKSB7XG4gICAgICAgICAgcDEgPSB0b3VjaGVzW2ldO1xuICAgICAgICAgIGlmIChsMSA9IGxvY2F0aW9uczBbcDEuaWRlbnRpZmllcl0pIHtcbiAgICAgICAgICAgIGlmIChsMCkgYnJlYWs7XG4gICAgICAgICAgICBwMCA9IHAxLCBsMCA9IGwxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobDEpIHtcbiAgICAgICAgICB2YXIgZGlzdGFuY2UxID0gKGRpc3RhbmNlMSA9IHAxWzBdIC0gcDBbMF0pICogZGlzdGFuY2UxICsgKGRpc3RhbmNlMSA9IHAxWzFdIC0gcDBbMV0pICogZGlzdGFuY2UxLCBzY2FsZTEgPSBkaXN0YW5jZTAgJiYgTWF0aC5zcXJ0KGRpc3RhbmNlMSAvIGRpc3RhbmNlMCk7XG4gICAgICAgICAgcDAgPSBbIChwMFswXSArIHAxWzBdKSAvIDIsIChwMFsxXSArIHAxWzFdKSAvIDIgXTtcbiAgICAgICAgICBsMCA9IFsgKGwwWzBdICsgbDFbMF0pIC8gMiwgKGwwWzFdICsgbDFbMV0pIC8gMiBdO1xuICAgICAgICAgIHNjYWxlVG8oc2NhbGUxICogc2NhbGUwKTtcbiAgICAgICAgfVxuICAgICAgICB0b3VjaHRpbWUgPSBudWxsO1xuICAgICAgICB0cmFuc2xhdGVUbyhwMCwgbDApO1xuICAgICAgICB6b29tZWQoZGlzcGF0Y2gpO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gZW5kZWQoKSB7XG4gICAgICAgIGlmIChkMy5ldmVudC50b3VjaGVzLmxlbmd0aCkge1xuICAgICAgICAgIHZhciBjaGFuZ2VkID0gZDMuZXZlbnQuY2hhbmdlZFRvdWNoZXM7XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDAsIG4gPSBjaGFuZ2VkLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgICAgICAgICAgZGVsZXRlIGxvY2F0aW9uczBbY2hhbmdlZFtpXS5pZGVudGlmaWVyXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZm9yICh2YXIgaWRlbnRpZmllciBpbiBsb2NhdGlvbnMwKSB7XG4gICAgICAgICAgICByZXR1cm4gdm9pZCByZWxvY2F0ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBkMy5zZWxlY3RBbGwodGFyZ2V0cykub24oem9vbU5hbWUsIG51bGwpO1xuICAgICAgICBzdWJqZWN0Lm9uKG1vdXNlZG93biwgbW91c2Vkb3duZWQpLm9uKHRvdWNoc3RhcnQsIHRvdWNoc3RhcnRlZCk7XG4gICAgICAgIGRyYWdSZXN0b3JlKCk7XG4gICAgICAgIHpvb21lbmRlZChkaXNwYXRjaCk7XG4gICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIG1vdXNld2hlZWxlZCgpIHtcbiAgICAgIHZhciBkaXNwYXRjaCA9IGV2ZW50Lm9mKHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBpZiAobW91c2V3aGVlbFRpbWVyKSBjbGVhclRpbWVvdXQobW91c2V3aGVlbFRpbWVyKTsgZWxzZSB0cmFuc2xhdGUwID0gbG9jYXRpb24oY2VudGVyMCA9IGNlbnRlciB8fCBkMy5tb3VzZSh0aGlzKSksIFxuICAgICAgZDNfc2VsZWN0aW9uX2ludGVycnVwdC5jYWxsKHRoaXMpLCB6b29tc3RhcnRlZChkaXNwYXRjaCk7XG4gICAgICBtb3VzZXdoZWVsVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBtb3VzZXdoZWVsVGltZXIgPSBudWxsO1xuICAgICAgICB6b29tZW5kZWQoZGlzcGF0Y2gpO1xuICAgICAgfSwgNTApO1xuICAgICAgZDNfZXZlbnRQcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgc2NhbGVUbyhNYXRoLnBvdygyLCBkM19iZWhhdmlvcl96b29tRGVsdGEoKSAqIC4wMDIpICogdmlldy5rKTtcbiAgICAgIHRyYW5zbGF0ZVRvKGNlbnRlcjAsIHRyYW5zbGF0ZTApO1xuICAgICAgem9vbWVkKGRpc3BhdGNoKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZGJsY2xpY2tlZCgpIHtcbiAgICAgIHZhciBwID0gZDMubW91c2UodGhpcyksIGsgPSBNYXRoLmxvZyh2aWV3LmspIC8gTWF0aC5MTjI7XG4gICAgICB6b29tVG8odGhpcywgcCwgbG9jYXRpb24ocCksIGQzLmV2ZW50LnNoaWZ0S2V5ID8gTWF0aC5jZWlsKGspIC0gMSA6IE1hdGguZmxvb3IoaykgKyAxKTtcbiAgICB9XG4gICAgcmV0dXJuIGQzLnJlYmluZCh6b29tLCBldmVudCwgXCJvblwiKTtcbiAgfTtcbiAgdmFyIGQzX2JlaGF2aW9yX3pvb21JbmZpbml0eSA9IFsgMCwgSW5maW5pdHkgXTtcbiAgdmFyIGQzX2JlaGF2aW9yX3pvb21EZWx0YSwgZDNfYmVoYXZpb3Jfem9vbVdoZWVsID0gXCJvbndoZWVsXCIgaW4gZDNfZG9jdW1lbnQgPyAoZDNfYmVoYXZpb3Jfem9vbURlbHRhID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIC1kMy5ldmVudC5kZWx0YVkgKiAoZDMuZXZlbnQuZGVsdGFNb2RlID8gMTIwIDogMSk7XG4gIH0sIFwid2hlZWxcIikgOiBcIm9ubW91c2V3aGVlbFwiIGluIGQzX2RvY3VtZW50ID8gKGQzX2JlaGF2aW9yX3pvb21EZWx0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkMy5ldmVudC53aGVlbERlbHRhO1xuICB9LCBcIm1vdXNld2hlZWxcIikgOiAoZDNfYmVoYXZpb3Jfem9vbURlbHRhID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIC1kMy5ldmVudC5kZXRhaWw7XG4gIH0sIFwiTW96TW91c2VQaXhlbFNjcm9sbFwiKTtcbiAgZDMuY29sb3IgPSBkM19jb2xvcjtcbiAgZnVuY3Rpb24gZDNfY29sb3IoKSB7fVxuICBkM19jb2xvci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5yZ2IoKSArIFwiXCI7XG4gIH07XG4gIGQzLmhzbCA9IGQzX2hzbDtcbiAgZnVuY3Rpb24gZDNfaHNsKGgsIHMsIGwpIHtcbiAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIGQzX2hzbCA/IHZvaWQgKHRoaXMuaCA9ICtoLCB0aGlzLnMgPSArcywgdGhpcy5sID0gK2wpIDogYXJndW1lbnRzLmxlbmd0aCA8IDIgPyBoIGluc3RhbmNlb2YgZDNfaHNsID8gbmV3IGQzX2hzbChoLmgsIGgucywgaC5sKSA6IGQzX3JnYl9wYXJzZShcIlwiICsgaCwgZDNfcmdiX2hzbCwgZDNfaHNsKSA6IG5ldyBkM19oc2woaCwgcywgbCk7XG4gIH1cbiAgdmFyIGQzX2hzbFByb3RvdHlwZSA9IGQzX2hzbC5wcm90b3R5cGUgPSBuZXcgZDNfY29sb3IoKTtcbiAgZDNfaHNsUHJvdG90eXBlLmJyaWdodGVyID0gZnVuY3Rpb24oaykge1xuICAgIGsgPSBNYXRoLnBvdyguNywgYXJndW1lbnRzLmxlbmd0aCA/IGsgOiAxKTtcbiAgICByZXR1cm4gbmV3IGQzX2hzbCh0aGlzLmgsIHRoaXMucywgdGhpcy5sIC8gayk7XG4gIH07XG4gIGQzX2hzbFByb3RvdHlwZS5kYXJrZXIgPSBmdW5jdGlvbihrKSB7XG4gICAgayA9IE1hdGgucG93KC43LCBhcmd1bWVudHMubGVuZ3RoID8gayA6IDEpO1xuICAgIHJldHVybiBuZXcgZDNfaHNsKHRoaXMuaCwgdGhpcy5zLCBrICogdGhpcy5sKTtcbiAgfTtcbiAgZDNfaHNsUHJvdG90eXBlLnJnYiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkM19oc2xfcmdiKHRoaXMuaCwgdGhpcy5zLCB0aGlzLmwpO1xuICB9O1xuICBmdW5jdGlvbiBkM19oc2xfcmdiKGgsIHMsIGwpIHtcbiAgICB2YXIgbTEsIG0yO1xuICAgIGggPSBpc05hTihoKSA/IDAgOiAoaCAlPSAzNjApIDwgMCA/IGggKyAzNjAgOiBoO1xuICAgIHMgPSBpc05hTihzKSA/IDAgOiBzIDwgMCA/IDAgOiBzID4gMSA/IDEgOiBzO1xuICAgIGwgPSBsIDwgMCA/IDAgOiBsID4gMSA/IDEgOiBsO1xuICAgIG0yID0gbCA8PSAuNSA/IGwgKiAoMSArIHMpIDogbCArIHMgLSBsICogcztcbiAgICBtMSA9IDIgKiBsIC0gbTI7XG4gICAgZnVuY3Rpb24gdihoKSB7XG4gICAgICBpZiAoaCA+IDM2MCkgaCAtPSAzNjA7IGVsc2UgaWYgKGggPCAwKSBoICs9IDM2MDtcbiAgICAgIGlmIChoIDwgNjApIHJldHVybiBtMSArIChtMiAtIG0xKSAqIGggLyA2MDtcbiAgICAgIGlmIChoIDwgMTgwKSByZXR1cm4gbTI7XG4gICAgICBpZiAoaCA8IDI0MCkgcmV0dXJuIG0xICsgKG0yIC0gbTEpICogKDI0MCAtIGgpIC8gNjA7XG4gICAgICByZXR1cm4gbTE7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHZ2KGgpIHtcbiAgICAgIHJldHVybiBNYXRoLnJvdW5kKHYoaCkgKiAyNTUpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IGQzX3JnYih2dihoICsgMTIwKSwgdnYoaCksIHZ2KGggLSAxMjApKTtcbiAgfVxuICBkMy5oY2wgPSBkM19oY2w7XG4gIGZ1bmN0aW9uIGQzX2hjbChoLCBjLCBsKSB7XG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBkM19oY2wgPyB2b2lkICh0aGlzLmggPSAraCwgdGhpcy5jID0gK2MsIHRoaXMubCA9ICtsKSA6IGFyZ3VtZW50cy5sZW5ndGggPCAyID8gaCBpbnN0YW5jZW9mIGQzX2hjbCA/IG5ldyBkM19oY2woaC5oLCBoLmMsIGgubCkgOiBoIGluc3RhbmNlb2YgZDNfbGFiID8gZDNfbGFiX2hjbChoLmwsIGguYSwgaC5iKSA6IGQzX2xhYl9oY2woKGggPSBkM19yZ2JfbGFiKChoID0gZDMucmdiKGgpKS5yLCBoLmcsIGguYikpLmwsIGguYSwgaC5iKSA6IG5ldyBkM19oY2woaCwgYywgbCk7XG4gIH1cbiAgdmFyIGQzX2hjbFByb3RvdHlwZSA9IGQzX2hjbC5wcm90b3R5cGUgPSBuZXcgZDNfY29sb3IoKTtcbiAgZDNfaGNsUHJvdG90eXBlLmJyaWdodGVyID0gZnVuY3Rpb24oaykge1xuICAgIHJldHVybiBuZXcgZDNfaGNsKHRoaXMuaCwgdGhpcy5jLCBNYXRoLm1pbigxMDAsIHRoaXMubCArIGQzX2xhYl9LICogKGFyZ3VtZW50cy5sZW5ndGggPyBrIDogMSkpKTtcbiAgfTtcbiAgZDNfaGNsUHJvdG90eXBlLmRhcmtlciA9IGZ1bmN0aW9uKGspIHtcbiAgICByZXR1cm4gbmV3IGQzX2hjbCh0aGlzLmgsIHRoaXMuYywgTWF0aC5tYXgoMCwgdGhpcy5sIC0gZDNfbGFiX0sgKiAoYXJndW1lbnRzLmxlbmd0aCA/IGsgOiAxKSkpO1xuICB9O1xuICBkM19oY2xQcm90b3R5cGUucmdiID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzX2hjbF9sYWIodGhpcy5oLCB0aGlzLmMsIHRoaXMubCkucmdiKCk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX2hjbF9sYWIoaCwgYywgbCkge1xuICAgIGlmIChpc05hTihoKSkgaCA9IDA7XG4gICAgaWYgKGlzTmFOKGMpKSBjID0gMDtcbiAgICByZXR1cm4gbmV3IGQzX2xhYihsLCBNYXRoLmNvcyhoICo9IGQzX3JhZGlhbnMpICogYywgTWF0aC5zaW4oaCkgKiBjKTtcbiAgfVxuICBkMy5sYWIgPSBkM19sYWI7XG4gIGZ1bmN0aW9uIGQzX2xhYihsLCBhLCBiKSB7XG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBkM19sYWIgPyB2b2lkICh0aGlzLmwgPSArbCwgdGhpcy5hID0gK2EsIHRoaXMuYiA9ICtiKSA6IGFyZ3VtZW50cy5sZW5ndGggPCAyID8gbCBpbnN0YW5jZW9mIGQzX2xhYiA/IG5ldyBkM19sYWIobC5sLCBsLmEsIGwuYikgOiBsIGluc3RhbmNlb2YgZDNfaGNsID8gZDNfaGNsX2xhYihsLmgsIGwuYywgbC5sKSA6IGQzX3JnYl9sYWIoKGwgPSBkM19yZ2IobCkpLnIsIGwuZywgbC5iKSA6IG5ldyBkM19sYWIobCwgYSwgYik7XG4gIH1cbiAgdmFyIGQzX2xhYl9LID0gMTg7XG4gIHZhciBkM19sYWJfWCA9IC45NTA0NywgZDNfbGFiX1kgPSAxLCBkM19sYWJfWiA9IDEuMDg4ODM7XG4gIHZhciBkM19sYWJQcm90b3R5cGUgPSBkM19sYWIucHJvdG90eXBlID0gbmV3IGQzX2NvbG9yKCk7XG4gIGQzX2xhYlByb3RvdHlwZS5icmlnaHRlciA9IGZ1bmN0aW9uKGspIHtcbiAgICByZXR1cm4gbmV3IGQzX2xhYihNYXRoLm1pbigxMDAsIHRoaXMubCArIGQzX2xhYl9LICogKGFyZ3VtZW50cy5sZW5ndGggPyBrIDogMSkpLCB0aGlzLmEsIHRoaXMuYik7XG4gIH07XG4gIGQzX2xhYlByb3RvdHlwZS5kYXJrZXIgPSBmdW5jdGlvbihrKSB7XG4gICAgcmV0dXJuIG5ldyBkM19sYWIoTWF0aC5tYXgoMCwgdGhpcy5sIC0gZDNfbGFiX0sgKiAoYXJndW1lbnRzLmxlbmd0aCA/IGsgOiAxKSksIHRoaXMuYSwgdGhpcy5iKTtcbiAgfTtcbiAgZDNfbGFiUHJvdG90eXBlLnJnYiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkM19sYWJfcmdiKHRoaXMubCwgdGhpcy5hLCB0aGlzLmIpO1xuICB9O1xuICBmdW5jdGlvbiBkM19sYWJfcmdiKGwsIGEsIGIpIHtcbiAgICB2YXIgeSA9IChsICsgMTYpIC8gMTE2LCB4ID0geSArIGEgLyA1MDAsIHogPSB5IC0gYiAvIDIwMDtcbiAgICB4ID0gZDNfbGFiX3h5eih4KSAqIGQzX2xhYl9YO1xuICAgIHkgPSBkM19sYWJfeHl6KHkpICogZDNfbGFiX1k7XG4gICAgeiA9IGQzX2xhYl94eXooeikgKiBkM19sYWJfWjtcbiAgICByZXR1cm4gbmV3IGQzX3JnYihkM194eXpfcmdiKDMuMjQwNDU0MiAqIHggLSAxLjUzNzEzODUgKiB5IC0gLjQ5ODUzMTQgKiB6KSwgZDNfeHl6X3JnYigtLjk2OTI2NiAqIHggKyAxLjg3NjAxMDggKiB5ICsgLjA0MTU1NiAqIHopLCBkM194eXpfcmdiKC4wNTU2NDM0ICogeCAtIC4yMDQwMjU5ICogeSArIDEuMDU3MjI1MiAqIHopKTtcbiAgfVxuICBmdW5jdGlvbiBkM19sYWJfaGNsKGwsIGEsIGIpIHtcbiAgICByZXR1cm4gbCA+IDAgPyBuZXcgZDNfaGNsKE1hdGguYXRhbjIoYiwgYSkgKiBkM19kZWdyZWVzLCBNYXRoLnNxcnQoYSAqIGEgKyBiICogYiksIGwpIDogbmV3IGQzX2hjbChOYU4sIE5hTiwgbCk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfbGFiX3h5eih4KSB7XG4gICAgcmV0dXJuIHggPiAuMjA2ODkzMDM0ID8geCAqIHggKiB4IDogKHggLSA0IC8gMjkpIC8gNy43ODcwMzc7XG4gIH1cbiAgZnVuY3Rpb24gZDNfeHl6X2xhYih4KSB7XG4gICAgcmV0dXJuIHggPiAuMDA4ODU2ID8gTWF0aC5wb3coeCwgMSAvIDMpIDogNy43ODcwMzcgKiB4ICsgNCAvIDI5O1xuICB9XG4gIGZ1bmN0aW9uIGQzX3h5el9yZ2Iocikge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKDI1NSAqIChyIDw9IC4wMDMwNCA/IDEyLjkyICogciA6IDEuMDU1ICogTWF0aC5wb3cociwgMSAvIDIuNCkgLSAuMDU1KSk7XG4gIH1cbiAgZDMucmdiID0gZDNfcmdiO1xuICBmdW5jdGlvbiBkM19yZ2IociwgZywgYikge1xuICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgZDNfcmdiID8gdm9pZCAodGhpcy5yID0gfn5yLCB0aGlzLmcgPSB+fmcsIHRoaXMuYiA9IH5+YikgOiBhcmd1bWVudHMubGVuZ3RoIDwgMiA/IHIgaW5zdGFuY2VvZiBkM19yZ2IgPyBuZXcgZDNfcmdiKHIuciwgci5nLCByLmIpIDogZDNfcmdiX3BhcnNlKFwiXCIgKyByLCBkM19yZ2IsIGQzX2hzbF9yZ2IpIDogbmV3IGQzX3JnYihyLCBnLCBiKTtcbiAgfVxuICBmdW5jdGlvbiBkM19yZ2JOdW1iZXIodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IGQzX3JnYih2YWx1ZSA+PiAxNiwgdmFsdWUgPj4gOCAmIDI1NSwgdmFsdWUgJiAyNTUpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3JnYlN0cmluZyh2YWx1ZSkge1xuICAgIHJldHVybiBkM19yZ2JOdW1iZXIodmFsdWUpICsgXCJcIjtcbiAgfVxuICB2YXIgZDNfcmdiUHJvdG90eXBlID0gZDNfcmdiLnByb3RvdHlwZSA9IG5ldyBkM19jb2xvcigpO1xuICBkM19yZ2JQcm90b3R5cGUuYnJpZ2h0ZXIgPSBmdW5jdGlvbihrKSB7XG4gICAgayA9IE1hdGgucG93KC43LCBhcmd1bWVudHMubGVuZ3RoID8gayA6IDEpO1xuICAgIHZhciByID0gdGhpcy5yLCBnID0gdGhpcy5nLCBiID0gdGhpcy5iLCBpID0gMzA7XG4gICAgaWYgKCFyICYmICFnICYmICFiKSByZXR1cm4gbmV3IGQzX3JnYihpLCBpLCBpKTtcbiAgICBpZiAociAmJiByIDwgaSkgciA9IGk7XG4gICAgaWYgKGcgJiYgZyA8IGkpIGcgPSBpO1xuICAgIGlmIChiICYmIGIgPCBpKSBiID0gaTtcbiAgICByZXR1cm4gbmV3IGQzX3JnYihNYXRoLm1pbigyNTUsIHIgLyBrKSwgTWF0aC5taW4oMjU1LCBnIC8gayksIE1hdGgubWluKDI1NSwgYiAvIGspKTtcbiAgfTtcbiAgZDNfcmdiUHJvdG90eXBlLmRhcmtlciA9IGZ1bmN0aW9uKGspIHtcbiAgICBrID0gTWF0aC5wb3coLjcsIGFyZ3VtZW50cy5sZW5ndGggPyBrIDogMSk7XG4gICAgcmV0dXJuIG5ldyBkM19yZ2IoayAqIHRoaXMuciwgayAqIHRoaXMuZywgayAqIHRoaXMuYik7XG4gIH07XG4gIGQzX3JnYlByb3RvdHlwZS5oc2wgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDNfcmdiX2hzbCh0aGlzLnIsIHRoaXMuZywgdGhpcy5iKTtcbiAgfTtcbiAgZDNfcmdiUHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwiI1wiICsgZDNfcmdiX2hleCh0aGlzLnIpICsgZDNfcmdiX2hleCh0aGlzLmcpICsgZDNfcmdiX2hleCh0aGlzLmIpO1xuICB9O1xuICBmdW5jdGlvbiBkM19yZ2JfaGV4KHYpIHtcbiAgICByZXR1cm4gdiA8IDE2ID8gXCIwXCIgKyBNYXRoLm1heCgwLCB2KS50b1N0cmluZygxNikgOiBNYXRoLm1pbigyNTUsIHYpLnRvU3RyaW5nKDE2KTtcbiAgfVxuICBmdW5jdGlvbiBkM19yZ2JfcGFyc2UoZm9ybWF0LCByZ2IsIGhzbCkge1xuICAgIHZhciByID0gMCwgZyA9IDAsIGIgPSAwLCBtMSwgbTIsIGNvbG9yO1xuICAgIG0xID0gLyhbYS16XSspXFwoKC4qKVxcKS9pLmV4ZWMoZm9ybWF0KTtcbiAgICBpZiAobTEpIHtcbiAgICAgIG0yID0gbTFbMl0uc3BsaXQoXCIsXCIpO1xuICAgICAgc3dpdGNoIChtMVsxXSkge1xuICAgICAgIGNhc2UgXCJoc2xcIjpcbiAgICAgICAge1xuICAgICAgICAgIHJldHVybiBoc2wocGFyc2VGbG9hdChtMlswXSksIHBhcnNlRmxvYXQobTJbMV0pIC8gMTAwLCBwYXJzZUZsb2F0KG0yWzJdKSAvIDEwMCk7XG4gICAgICAgIH1cblxuICAgICAgIGNhc2UgXCJyZ2JcIjpcbiAgICAgICAge1xuICAgICAgICAgIHJldHVybiByZ2IoZDNfcmdiX3BhcnNlTnVtYmVyKG0yWzBdKSwgZDNfcmdiX3BhcnNlTnVtYmVyKG0yWzFdKSwgZDNfcmdiX3BhcnNlTnVtYmVyKG0yWzJdKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGNvbG9yID0gZDNfcmdiX25hbWVzLmdldChmb3JtYXQpKSByZXR1cm4gcmdiKGNvbG9yLnIsIGNvbG9yLmcsIGNvbG9yLmIpO1xuICAgIGlmIChmb3JtYXQgIT0gbnVsbCAmJiBmb3JtYXQuY2hhckF0KDApID09PSBcIiNcIiAmJiAhaXNOYU4oY29sb3IgPSBwYXJzZUludChmb3JtYXQuc2xpY2UoMSksIDE2KSkpIHtcbiAgICAgIGlmIChmb3JtYXQubGVuZ3RoID09PSA0KSB7XG4gICAgICAgIHIgPSAoY29sb3IgJiAzODQwKSA+PiA0O1xuICAgICAgICByID0gciA+PiA0IHwgcjtcbiAgICAgICAgZyA9IGNvbG9yICYgMjQwO1xuICAgICAgICBnID0gZyA+PiA0IHwgZztcbiAgICAgICAgYiA9IGNvbG9yICYgMTU7XG4gICAgICAgIGIgPSBiIDw8IDQgfCBiO1xuICAgICAgfSBlbHNlIGlmIChmb3JtYXQubGVuZ3RoID09PSA3KSB7XG4gICAgICAgIHIgPSAoY29sb3IgJiAxNjcxMTY4MCkgPj4gMTY7XG4gICAgICAgIGcgPSAoY29sb3IgJiA2NTI4MCkgPj4gODtcbiAgICAgICAgYiA9IGNvbG9yICYgMjU1O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmdiKHIsIGcsIGIpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3JnYl9oc2wociwgZywgYikge1xuICAgIHZhciBtaW4gPSBNYXRoLm1pbihyIC89IDI1NSwgZyAvPSAyNTUsIGIgLz0gMjU1KSwgbWF4ID0gTWF0aC5tYXgociwgZywgYiksIGQgPSBtYXggLSBtaW4sIGgsIHMsIGwgPSAobWF4ICsgbWluKSAvIDI7XG4gICAgaWYgKGQpIHtcbiAgICAgIHMgPSBsIDwgLjUgPyBkIC8gKG1heCArIG1pbikgOiBkIC8gKDIgLSBtYXggLSBtaW4pO1xuICAgICAgaWYgKHIgPT0gbWF4KSBoID0gKGcgLSBiKSAvIGQgKyAoZyA8IGIgPyA2IDogMCk7IGVsc2UgaWYgKGcgPT0gbWF4KSBoID0gKGIgLSByKSAvIGQgKyAyOyBlbHNlIGggPSAociAtIGcpIC8gZCArIDQ7XG4gICAgICBoICo9IDYwO1xuICAgIH0gZWxzZSB7XG4gICAgICBoID0gTmFOO1xuICAgICAgcyA9IGwgPiAwICYmIGwgPCAxID8gMCA6IGg7XG4gICAgfVxuICAgIHJldHVybiBuZXcgZDNfaHNsKGgsIHMsIGwpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3JnYl9sYWIociwgZywgYikge1xuICAgIHIgPSBkM19yZ2JfeHl6KHIpO1xuICAgIGcgPSBkM19yZ2JfeHl6KGcpO1xuICAgIGIgPSBkM19yZ2JfeHl6KGIpO1xuICAgIHZhciB4ID0gZDNfeHl6X2xhYigoLjQxMjQ1NjQgKiByICsgLjM1NzU3NjEgKiBnICsgLjE4MDQzNzUgKiBiKSAvIGQzX2xhYl9YKSwgeSA9IGQzX3h5el9sYWIoKC4yMTI2NzI5ICogciArIC43MTUxNTIyICogZyArIC4wNzIxNzUgKiBiKSAvIGQzX2xhYl9ZKSwgeiA9IGQzX3h5el9sYWIoKC4wMTkzMzM5ICogciArIC4xMTkxOTIgKiBnICsgLjk1MDMwNDEgKiBiKSAvIGQzX2xhYl9aKTtcbiAgICByZXR1cm4gZDNfbGFiKDExNiAqIHkgLSAxNiwgNTAwICogKHggLSB5KSwgMjAwICogKHkgLSB6KSk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfcmdiX3h5eihyKSB7XG4gICAgcmV0dXJuIChyIC89IDI1NSkgPD0gLjA0MDQ1ID8gciAvIDEyLjkyIDogTWF0aC5wb3coKHIgKyAuMDU1KSAvIDEuMDU1LCAyLjQpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3JnYl9wYXJzZU51bWJlcihjKSB7XG4gICAgdmFyIGYgPSBwYXJzZUZsb2F0KGMpO1xuICAgIHJldHVybiBjLmNoYXJBdChjLmxlbmd0aCAtIDEpID09PSBcIiVcIiA/IE1hdGgucm91bmQoZiAqIDIuNTUpIDogZjtcbiAgfVxuICB2YXIgZDNfcmdiX25hbWVzID0gZDMubWFwKHtcbiAgICBhbGljZWJsdWU6IDE1NzkyMzgzLFxuICAgIGFudGlxdWV3aGl0ZTogMTY0NDQzNzUsXG4gICAgYXF1YTogNjU1MzUsXG4gICAgYXF1YW1hcmluZTogODM4ODU2NCxcbiAgICBhenVyZTogMTU3OTQxNzUsXG4gICAgYmVpZ2U6IDE2MTE5MjYwLFxuICAgIGJpc3F1ZTogMTY3NzAyNDQsXG4gICAgYmxhY2s6IDAsXG4gICAgYmxhbmNoZWRhbG1vbmQ6IDE2NzcyMDQ1LFxuICAgIGJsdWU6IDI1NSxcbiAgICBibHVldmlvbGV0OiA5MDU1MjAyLFxuICAgIGJyb3duOiAxMDgyNDIzNCxcbiAgICBidXJseXdvb2Q6IDE0NTk2MjMxLFxuICAgIGNhZGV0Ymx1ZTogNjI2NjUyOCxcbiAgICBjaGFydHJldXNlOiA4Mzg4MzUyLFxuICAgIGNob2NvbGF0ZTogMTM3ODk0NzAsXG4gICAgY29yYWw6IDE2NzQ0MjcyLFxuICAgIGNvcm5mbG93ZXJibHVlOiA2NTkxOTgxLFxuICAgIGNvcm5zaWxrOiAxNjc3NTM4OCxcbiAgICBjcmltc29uOiAxNDQyMzEwMCxcbiAgICBjeWFuOiA2NTUzNSxcbiAgICBkYXJrYmx1ZTogMTM5LFxuICAgIGRhcmtjeWFuOiAzNTcyMyxcbiAgICBkYXJrZ29sZGVucm9kOiAxMjA5MjkzOSxcbiAgICBkYXJrZ3JheTogMTExMTkwMTcsXG4gICAgZGFya2dyZWVuOiAyNTYwMCxcbiAgICBkYXJrZ3JleTogMTExMTkwMTcsXG4gICAgZGFya2toYWtpOiAxMjQzMzI1OSxcbiAgICBkYXJrbWFnZW50YTogOTEwOTY0MyxcbiAgICBkYXJrb2xpdmVncmVlbjogNTU5Nzk5OSxcbiAgICBkYXJrb3JhbmdlOiAxNjc0NzUyMCxcbiAgICBkYXJrb3JjaGlkOiAxMDA0MDAxMixcbiAgICBkYXJrcmVkOiA5MTA5NTA0LFxuICAgIGRhcmtzYWxtb246IDE1MzA4NDEwLFxuICAgIGRhcmtzZWFncmVlbjogOTQxOTkxOSxcbiAgICBkYXJrc2xhdGVibHVlOiA0NzM0MzQ3LFxuICAgIGRhcmtzbGF0ZWdyYXk6IDMxMDA0OTUsXG4gICAgZGFya3NsYXRlZ3JleTogMzEwMDQ5NSxcbiAgICBkYXJrdHVycXVvaXNlOiA1Mjk0NSxcbiAgICBkYXJrdmlvbGV0OiA5Njk5NTM5LFxuICAgIGRlZXBwaW5rOiAxNjcxNjk0NyxcbiAgICBkZWVwc2t5Ymx1ZTogNDkxNTEsXG4gICAgZGltZ3JheTogNjkwODI2NSxcbiAgICBkaW1ncmV5OiA2OTA4MjY1LFxuICAgIGRvZGdlcmJsdWU6IDIwMDMxOTksXG4gICAgZmlyZWJyaWNrOiAxMTY3NDE0NixcbiAgICBmbG9yYWx3aGl0ZTogMTY3NzU5MjAsXG4gICAgZm9yZXN0Z3JlZW46IDIyNjM4NDIsXG4gICAgZnVjaHNpYTogMTY3MTE5MzUsXG4gICAgZ2FpbnNib3JvOiAxNDQ3NDQ2MCxcbiAgICBnaG9zdHdoaXRlOiAxNjMxNjY3MSxcbiAgICBnb2xkOiAxNjc2NjcyMCxcbiAgICBnb2xkZW5yb2Q6IDE0MzI5MTIwLFxuICAgIGdyYXk6IDg0MjE1MDQsXG4gICAgZ3JlZW46IDMyNzY4LFxuICAgIGdyZWVueWVsbG93OiAxMTQwMzA1NSxcbiAgICBncmV5OiA4NDIxNTA0LFxuICAgIGhvbmV5ZGV3OiAxNTc5NDE2MCxcbiAgICBob3RwaW5rOiAxNjczODc0MCxcbiAgICBpbmRpYW5yZWQ6IDEzNDU4NTI0LFxuICAgIGluZGlnbzogNDkxNTMzMCxcbiAgICBpdm9yeTogMTY3NzcyMDAsXG4gICAga2hha2k6IDE1Nzg3NjYwLFxuICAgIGxhdmVuZGVyOiAxNTEzMjQxMCxcbiAgICBsYXZlbmRlcmJsdXNoOiAxNjc3MzM2NSxcbiAgICBsYXduZ3JlZW46IDgxOTA5NzYsXG4gICAgbGVtb25jaGlmZm9uOiAxNjc3NTg4NSxcbiAgICBsaWdodGJsdWU6IDExMzkzMjU0LFxuICAgIGxpZ2h0Y29yYWw6IDE1NzYxNTM2LFxuICAgIGxpZ2h0Y3lhbjogMTQ3NDU1OTksXG4gICAgbGlnaHRnb2xkZW5yb2R5ZWxsb3c6IDE2NDQ4MjEwLFxuICAgIGxpZ2h0Z3JheTogMTM4ODIzMjMsXG4gICAgbGlnaHRncmVlbjogOTQ5ODI1NixcbiAgICBsaWdodGdyZXk6IDEzODgyMzIzLFxuICAgIGxpZ2h0cGluazogMTY3NTg0NjUsXG4gICAgbGlnaHRzYWxtb246IDE2NzUyNzYyLFxuICAgIGxpZ2h0c2VhZ3JlZW46IDIxNDI4OTAsXG4gICAgbGlnaHRza3libHVlOiA4OTAwMzQ2LFxuICAgIGxpZ2h0c2xhdGVncmF5OiA3ODMzNzUzLFxuICAgIGxpZ2h0c2xhdGVncmV5OiA3ODMzNzUzLFxuICAgIGxpZ2h0c3RlZWxibHVlOiAxMTU4NDczNCxcbiAgICBsaWdodHllbGxvdzogMTY3NzcxODQsXG4gICAgbGltZTogNjUyODAsXG4gICAgbGltZWdyZWVuOiAzMzI5MzMwLFxuICAgIGxpbmVuOiAxNjQ0NTY3MCxcbiAgICBtYWdlbnRhOiAxNjcxMTkzNSxcbiAgICBtYXJvb246IDgzODg2MDgsXG4gICAgbWVkaXVtYXF1YW1hcmluZTogNjczNzMyMixcbiAgICBtZWRpdW1ibHVlOiAyMDUsXG4gICAgbWVkaXVtb3JjaGlkOiAxMjIxMTY2NyxcbiAgICBtZWRpdW1wdXJwbGU6IDk2NjI2ODMsXG4gICAgbWVkaXVtc2VhZ3JlZW46IDM5NzgwOTcsXG4gICAgbWVkaXVtc2xhdGVibHVlOiA4MDg3NzkwLFxuICAgIG1lZGl1bXNwcmluZ2dyZWVuOiA2NDE1NCxcbiAgICBtZWRpdW10dXJxdW9pc2U6IDQ3NzIzMDAsXG4gICAgbWVkaXVtdmlvbGV0cmVkOiAxMzA0NzE3MyxcbiAgICBtaWRuaWdodGJsdWU6IDE2NDQ5MTIsXG4gICAgbWludGNyZWFtOiAxNjEyMTg1MCxcbiAgICBtaXN0eXJvc2U6IDE2NzcwMjczLFxuICAgIG1vY2Nhc2luOiAxNjc3MDIyOSxcbiAgICBuYXZham93aGl0ZTogMTY3Njg2ODUsXG4gICAgbmF2eTogMTI4LFxuICAgIG9sZGxhY2U6IDE2NjQzNTU4LFxuICAgIG9saXZlOiA4NDIxMzc2LFxuICAgIG9saXZlZHJhYjogNzA0ODczOSxcbiAgICBvcmFuZ2U6IDE2NzUzOTIwLFxuICAgIG9yYW5nZXJlZDogMTY3MjkzNDQsXG4gICAgb3JjaGlkOiAxNDMxNTczNCxcbiAgICBwYWxlZ29sZGVucm9kOiAxNTY1NzEzMCxcbiAgICBwYWxlZ3JlZW46IDEwMDI1ODgwLFxuICAgIHBhbGV0dXJxdW9pc2U6IDExNTI5OTY2LFxuICAgIHBhbGV2aW9sZXRyZWQ6IDE0MzgxMjAzLFxuICAgIHBhcGF5YXdoaXA6IDE2NzczMDc3LFxuICAgIHBlYWNocHVmZjogMTY3Njc2NzMsXG4gICAgcGVydTogMTM0Njg5OTEsXG4gICAgcGluazogMTY3NjEwMzUsXG4gICAgcGx1bTogMTQ1MjQ2MzcsXG4gICAgcG93ZGVyYmx1ZTogMTE1OTE5MTAsXG4gICAgcHVycGxlOiA4Mzg4NzM2LFxuICAgIHJlZDogMTY3MTE2ODAsXG4gICAgcm9zeWJyb3duOiAxMjM1NzUxOSxcbiAgICByb3lhbGJsdWU6IDQyODY5NDUsXG4gICAgc2FkZGxlYnJvd246IDkxMjcxODcsXG4gICAgc2FsbW9uOiAxNjQxNjg4MixcbiAgICBzYW5keWJyb3duOiAxNjAzMjg2NCxcbiAgICBzZWFncmVlbjogMzA1MDMyNyxcbiAgICBzZWFzaGVsbDogMTY3NzQ2MzgsXG4gICAgc2llbm5hOiAxMDUwNjc5NyxcbiAgICBzaWx2ZXI6IDEyNjMyMjU2LFxuICAgIHNreWJsdWU6IDg5MDAzMzEsXG4gICAgc2xhdGVibHVlOiA2OTcwMDYxLFxuICAgIHNsYXRlZ3JheTogNzM3Mjk0NCxcbiAgICBzbGF0ZWdyZXk6IDczNzI5NDQsXG4gICAgc25vdzogMTY3NzU5MzAsXG4gICAgc3ByaW5nZ3JlZW46IDY1NDA3LFxuICAgIHN0ZWVsYmx1ZTogNDYyMDk4MCxcbiAgICB0YW46IDEzODA4NzgwLFxuICAgIHRlYWw6IDMyODk2LFxuICAgIHRoaXN0bGU6IDE0MjA0ODg4LFxuICAgIHRvbWF0bzogMTY3MzcwOTUsXG4gICAgdHVycXVvaXNlOiA0MjUxODU2LFxuICAgIHZpb2xldDogMTU2MzEwODYsXG4gICAgd2hlYXQ6IDE2MTEzMzMxLFxuICAgIHdoaXRlOiAxNjc3NzIxNSxcbiAgICB3aGl0ZXNtb2tlOiAxNjExOTI4NSxcbiAgICB5ZWxsb3c6IDE2Nzc2OTYwLFxuICAgIHllbGxvd2dyZWVuOiAxMDE0NTA3NFxuICB9KTtcbiAgZDNfcmdiX25hbWVzLmZvckVhY2goZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgIGQzX3JnYl9uYW1lcy5zZXQoa2V5LCBkM19yZ2JOdW1iZXIodmFsdWUpKTtcbiAgfSk7XG4gIGZ1bmN0aW9uIGQzX2Z1bmN0b3Iodikge1xuICAgIHJldHVybiB0eXBlb2YgdiA9PT0gXCJmdW5jdGlvblwiID8gdiA6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHY7XG4gICAgfTtcbiAgfVxuICBkMy5mdW5jdG9yID0gZDNfZnVuY3RvcjtcbiAgZnVuY3Rpb24gZDNfaWRlbnRpdHkoZCkge1xuICAgIHJldHVybiBkO1xuICB9XG4gIGQzLnhociA9IGQzX3hoclR5cGUoZDNfaWRlbnRpdHkpO1xuICBmdW5jdGlvbiBkM194aHJUeXBlKHJlc3BvbnNlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHVybCwgbWltZVR5cGUsIGNhbGxiYWNrKSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMiAmJiB0eXBlb2YgbWltZVR5cGUgPT09IFwiZnVuY3Rpb25cIikgY2FsbGJhY2sgPSBtaW1lVHlwZSwgXG4gICAgICBtaW1lVHlwZSA9IG51bGw7XG4gICAgICByZXR1cm4gZDNfeGhyKHVybCwgbWltZVR5cGUsIHJlc3BvbnNlLCBjYWxsYmFjayk7XG4gICAgfTtcbiAgfVxuICBmdW5jdGlvbiBkM194aHIodXJsLCBtaW1lVHlwZSwgcmVzcG9uc2UsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHhociA9IHt9LCBkaXNwYXRjaCA9IGQzLmRpc3BhdGNoKFwiYmVmb3Jlc2VuZFwiLCBcInByb2dyZXNzXCIsIFwibG9hZFwiLCBcImVycm9yXCIpLCBoZWFkZXJzID0ge30sIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKSwgcmVzcG9uc2VUeXBlID0gbnVsbDtcbiAgICBpZiAoZDNfd2luZG93LlhEb21haW5SZXF1ZXN0ICYmICEoXCJ3aXRoQ3JlZGVudGlhbHNcIiBpbiByZXF1ZXN0KSAmJiAvXihodHRwKHMpPzopP1xcL1xcLy8udGVzdCh1cmwpKSByZXF1ZXN0ID0gbmV3IFhEb21haW5SZXF1ZXN0KCk7XG4gICAgXCJvbmxvYWRcIiBpbiByZXF1ZXN0ID8gcmVxdWVzdC5vbmxvYWQgPSByZXF1ZXN0Lm9uZXJyb3IgPSByZXNwb25kIDogcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJlcXVlc3QucmVhZHlTdGF0ZSA+IDMgJiYgcmVzcG9uZCgpO1xuICAgIH07XG4gICAgZnVuY3Rpb24gcmVzcG9uZCgpIHtcbiAgICAgIHZhciBzdGF0dXMgPSByZXF1ZXN0LnN0YXR1cywgcmVzdWx0O1xuICAgICAgaWYgKCFzdGF0dXMgJiYgZDNfeGhySGFzUmVzcG9uc2UocmVxdWVzdCkgfHwgc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDAgfHwgc3RhdHVzID09PSAzMDQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXN1bHQgPSByZXNwb25zZS5jYWxsKHhociwgcmVxdWVzdCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBkaXNwYXRjaC5lcnJvci5jYWxsKHhociwgZSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGRpc3BhdGNoLmxvYWQuY2FsbCh4aHIsIHJlc3VsdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkaXNwYXRjaC5lcnJvci5jYWxsKHhociwgcmVxdWVzdCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlcXVlc3Qub25wcm9ncmVzcyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICB2YXIgbyA9IGQzLmV2ZW50O1xuICAgICAgZDMuZXZlbnQgPSBldmVudDtcbiAgICAgIHRyeSB7XG4gICAgICAgIGRpc3BhdGNoLnByb2dyZXNzLmNhbGwoeGhyLCByZXF1ZXN0KTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGQzLmV2ZW50ID0gbztcbiAgICAgIH1cbiAgICB9O1xuICAgIHhoci5oZWFkZXIgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgICAgbmFtZSA9IChuYW1lICsgXCJcIikudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikgcmV0dXJuIGhlYWRlcnNbbmFtZV07XG4gICAgICBpZiAodmFsdWUgPT0gbnVsbCkgZGVsZXRlIGhlYWRlcnNbbmFtZV07IGVsc2UgaGVhZGVyc1tuYW1lXSA9IHZhbHVlICsgXCJcIjtcbiAgICAgIHJldHVybiB4aHI7XG4gICAgfTtcbiAgICB4aHIubWltZVR5cGUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gbWltZVR5cGU7XG4gICAgICBtaW1lVHlwZSA9IHZhbHVlID09IG51bGwgPyBudWxsIDogdmFsdWUgKyBcIlwiO1xuICAgICAgcmV0dXJuIHhocjtcbiAgICB9O1xuICAgIHhoci5yZXNwb25zZVR5cGUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gcmVzcG9uc2VUeXBlO1xuICAgICAgcmVzcG9uc2VUeXBlID0gdmFsdWU7XG4gICAgICByZXR1cm4geGhyO1xuICAgIH07XG4gICAgeGhyLnJlc3BvbnNlID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJlc3BvbnNlID0gdmFsdWU7XG4gICAgICByZXR1cm4geGhyO1xuICAgIH07XG4gICAgWyBcImdldFwiLCBcInBvc3RcIiBdLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICB4aHJbbWV0aG9kXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4geGhyLnNlbmQuYXBwbHkoeGhyLCBbIG1ldGhvZCBdLmNvbmNhdChkM19hcnJheShhcmd1bWVudHMpKSk7XG4gICAgICB9O1xuICAgIH0pO1xuICAgIHhoci5zZW5kID0gZnVuY3Rpb24obWV0aG9kLCBkYXRhLCBjYWxsYmFjaykge1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIgJiYgdHlwZW9mIGRhdGEgPT09IFwiZnVuY3Rpb25cIikgY2FsbGJhY2sgPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgICAgIHJlcXVlc3Qub3BlbihtZXRob2QsIHVybCwgdHJ1ZSk7XG4gICAgICBpZiAobWltZVR5cGUgIT0gbnVsbCAmJiAhKFwiYWNjZXB0XCIgaW4gaGVhZGVycykpIGhlYWRlcnNbXCJhY2NlcHRcIl0gPSBtaW1lVHlwZSArIFwiLCovKlwiO1xuICAgICAgaWYgKHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcikgZm9yICh2YXIgbmFtZSBpbiBoZWFkZXJzKSByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIobmFtZSwgaGVhZGVyc1tuYW1lXSk7XG4gICAgICBpZiAobWltZVR5cGUgIT0gbnVsbCAmJiByZXF1ZXN0Lm92ZXJyaWRlTWltZVR5cGUpIHJlcXVlc3Qub3ZlcnJpZGVNaW1lVHlwZShtaW1lVHlwZSk7XG4gICAgICBpZiAocmVzcG9uc2VUeXBlICE9IG51bGwpIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gcmVzcG9uc2VUeXBlO1xuICAgICAgaWYgKGNhbGxiYWNrICE9IG51bGwpIHhoci5vbihcImVycm9yXCIsIGNhbGxiYWNrKS5vbihcImxvYWRcIiwgZnVuY3Rpb24ocmVxdWVzdCkge1xuICAgICAgICBjYWxsYmFjayhudWxsLCByZXF1ZXN0KTtcbiAgICAgIH0pO1xuICAgICAgZGlzcGF0Y2guYmVmb3Jlc2VuZC5jYWxsKHhociwgcmVxdWVzdCk7XG4gICAgICByZXF1ZXN0LnNlbmQoZGF0YSA9PSBudWxsID8gbnVsbCA6IGRhdGEpO1xuICAgICAgcmV0dXJuIHhocjtcbiAgICB9O1xuICAgIHhoci5hYm9ydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmVxdWVzdC5hYm9ydCgpO1xuICAgICAgcmV0dXJuIHhocjtcbiAgICB9O1xuICAgIGQzLnJlYmluZCh4aHIsIGRpc3BhdGNoLCBcIm9uXCIpO1xuICAgIHJldHVybiBjYWxsYmFjayA9PSBudWxsID8geGhyIDogeGhyLmdldChkM194aHJfZml4Q2FsbGJhY2soY2FsbGJhY2spKTtcbiAgfVxuICBmdW5jdGlvbiBkM194aHJfZml4Q2FsbGJhY2soY2FsbGJhY2spIHtcbiAgICByZXR1cm4gY2FsbGJhY2subGVuZ3RoID09PSAxID8gZnVuY3Rpb24oZXJyb3IsIHJlcXVlc3QpIHtcbiAgICAgIGNhbGxiYWNrKGVycm9yID09IG51bGwgPyByZXF1ZXN0IDogbnVsbCk7XG4gICAgfSA6IGNhbGxiYWNrO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3hockhhc1Jlc3BvbnNlKHJlcXVlc3QpIHtcbiAgICB2YXIgdHlwZSA9IHJlcXVlc3QucmVzcG9uc2VUeXBlO1xuICAgIHJldHVybiB0eXBlICYmIHR5cGUgIT09IFwidGV4dFwiID8gcmVxdWVzdC5yZXNwb25zZSA6IHJlcXVlc3QucmVzcG9uc2VUZXh0O1xuICB9XG4gIGQzLmRzdiA9IGZ1bmN0aW9uKGRlbGltaXRlciwgbWltZVR5cGUpIHtcbiAgICB2YXIgcmVGb3JtYXQgPSBuZXcgUmVnRXhwKCdbXCInICsgZGVsaW1pdGVyICsgXCJcXG5dXCIpLCBkZWxpbWl0ZXJDb2RlID0gZGVsaW1pdGVyLmNoYXJDb2RlQXQoMCk7XG4gICAgZnVuY3Rpb24gZHN2KHVybCwgcm93LCBjYWxsYmFjaykge1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzKSBjYWxsYmFjayA9IHJvdywgcm93ID0gbnVsbDtcbiAgICAgIHZhciB4aHIgPSBkM194aHIodXJsLCBtaW1lVHlwZSwgcm93ID09IG51bGwgPyByZXNwb25zZSA6IHR5cGVkUmVzcG9uc2Uocm93KSwgY2FsbGJhY2spO1xuICAgICAgeGhyLnJvdyA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyB4aHIucmVzcG9uc2UoKHJvdyA9IF8pID09IG51bGwgPyByZXNwb25zZSA6IHR5cGVkUmVzcG9uc2UoXykpIDogcm93O1xuICAgICAgfTtcbiAgICAgIHJldHVybiB4aHI7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlc3BvbnNlKHJlcXVlc3QpIHtcbiAgICAgIHJldHVybiBkc3YucGFyc2UocmVxdWVzdC5yZXNwb25zZVRleHQpO1xuICAgIH1cbiAgICBmdW5jdGlvbiB0eXBlZFJlc3BvbnNlKGYpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihyZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybiBkc3YucGFyc2UocmVxdWVzdC5yZXNwb25zZVRleHQsIGYpO1xuICAgICAgfTtcbiAgICB9XG4gICAgZHN2LnBhcnNlID0gZnVuY3Rpb24odGV4dCwgZikge1xuICAgICAgdmFyIG87XG4gICAgICByZXR1cm4gZHN2LnBhcnNlUm93cyh0ZXh0LCBmdW5jdGlvbihyb3csIGkpIHtcbiAgICAgICAgaWYgKG8pIHJldHVybiBvKHJvdywgaSAtIDEpO1xuICAgICAgICB2YXIgYSA9IG5ldyBGdW5jdGlvbihcImRcIiwgXCJyZXR1cm4ge1wiICsgcm93Lm1hcChmdW5jdGlvbihuYW1lLCBpKSB7XG4gICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG5hbWUpICsgXCI6IGRbXCIgKyBpICsgXCJdXCI7XG4gICAgICAgIH0pLmpvaW4oXCIsXCIpICsgXCJ9XCIpO1xuICAgICAgICBvID0gZiA/IGZ1bmN0aW9uKHJvdywgaSkge1xuICAgICAgICAgIHJldHVybiBmKGEocm93KSwgaSk7XG4gICAgICAgIH0gOiBhO1xuICAgICAgfSk7XG4gICAgfTtcbiAgICBkc3YucGFyc2VSb3dzID0gZnVuY3Rpb24odGV4dCwgZikge1xuICAgICAgdmFyIEVPTCA9IHt9LCBFT0YgPSB7fSwgcm93cyA9IFtdLCBOID0gdGV4dC5sZW5ndGgsIEkgPSAwLCBuID0gMCwgdCwgZW9sO1xuICAgICAgZnVuY3Rpb24gdG9rZW4oKSB7XG4gICAgICAgIGlmIChJID49IE4pIHJldHVybiBFT0Y7XG4gICAgICAgIGlmIChlb2wpIHJldHVybiBlb2wgPSBmYWxzZSwgRU9MO1xuICAgICAgICB2YXIgaiA9IEk7XG4gICAgICAgIGlmICh0ZXh0LmNoYXJDb2RlQXQoaikgPT09IDM0KSB7XG4gICAgICAgICAgdmFyIGkgPSBqO1xuICAgICAgICAgIHdoaWxlIChpKysgPCBOKSB7XG4gICAgICAgICAgICBpZiAodGV4dC5jaGFyQ29kZUF0KGkpID09PSAzNCkge1xuICAgICAgICAgICAgICBpZiAodGV4dC5jaGFyQ29kZUF0KGkgKyAxKSAhPT0gMzQpIGJyZWFrO1xuICAgICAgICAgICAgICArK2k7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIEkgPSBpICsgMjtcbiAgICAgICAgICB2YXIgYyA9IHRleHQuY2hhckNvZGVBdChpICsgMSk7XG4gICAgICAgICAgaWYgKGMgPT09IDEzKSB7XG4gICAgICAgICAgICBlb2wgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKHRleHQuY2hhckNvZGVBdChpICsgMikgPT09IDEwKSArK0k7XG4gICAgICAgICAgfSBlbHNlIGlmIChjID09PSAxMCkge1xuICAgICAgICAgICAgZW9sID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRleHQuc2xpY2UoaiArIDEsIGkpLnJlcGxhY2UoL1wiXCIvZywgJ1wiJyk7XG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKEkgPCBOKSB7XG4gICAgICAgICAgdmFyIGMgPSB0ZXh0LmNoYXJDb2RlQXQoSSsrKSwgayA9IDE7XG4gICAgICAgICAgaWYgKGMgPT09IDEwKSBlb2wgPSB0cnVlOyBlbHNlIGlmIChjID09PSAxMykge1xuICAgICAgICAgICAgZW9sID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICh0ZXh0LmNoYXJDb2RlQXQoSSkgPT09IDEwKSArK0ksICsraztcbiAgICAgICAgICB9IGVsc2UgaWYgKGMgIT09IGRlbGltaXRlckNvZGUpIGNvbnRpbnVlO1xuICAgICAgICAgIHJldHVybiB0ZXh0LnNsaWNlKGosIEkgLSBrKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGV4dC5zbGljZShqKTtcbiAgICAgIH1cbiAgICAgIHdoaWxlICgodCA9IHRva2VuKCkpICE9PSBFT0YpIHtcbiAgICAgICAgdmFyIGEgPSBbXTtcbiAgICAgICAgd2hpbGUgKHQgIT09IEVPTCAmJiB0ICE9PSBFT0YpIHtcbiAgICAgICAgICBhLnB1c2godCk7XG4gICAgICAgICAgdCA9IHRva2VuKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGYgJiYgKGEgPSBmKGEsIG4rKykpID09IG51bGwpIGNvbnRpbnVlO1xuICAgICAgICByb3dzLnB1c2goYSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcm93cztcbiAgICB9O1xuICAgIGRzdi5mb3JtYXQgPSBmdW5jdGlvbihyb3dzKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShyb3dzWzBdKSkgcmV0dXJuIGRzdi5mb3JtYXRSb3dzKHJvd3MpO1xuICAgICAgdmFyIGZpZWxkU2V0ID0gbmV3IGQzX1NldCgpLCBmaWVsZHMgPSBbXTtcbiAgICAgIHJvd3MuZm9yRWFjaChmdW5jdGlvbihyb3cpIHtcbiAgICAgICAgZm9yICh2YXIgZmllbGQgaW4gcm93KSB7XG4gICAgICAgICAgaWYgKCFmaWVsZFNldC5oYXMoZmllbGQpKSB7XG4gICAgICAgICAgICBmaWVsZHMucHVzaChmaWVsZFNldC5hZGQoZmllbGQpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIFsgZmllbGRzLm1hcChmb3JtYXRWYWx1ZSkuam9pbihkZWxpbWl0ZXIpIF0uY29uY2F0KHJvd3MubWFwKGZ1bmN0aW9uKHJvdykge1xuICAgICAgICByZXR1cm4gZmllbGRzLm1hcChmdW5jdGlvbihmaWVsZCkge1xuICAgICAgICAgIHJldHVybiBmb3JtYXRWYWx1ZShyb3dbZmllbGRdKTtcbiAgICAgICAgfSkuam9pbihkZWxpbWl0ZXIpO1xuICAgICAgfSkpLmpvaW4oXCJcXG5cIik7XG4gICAgfTtcbiAgICBkc3YuZm9ybWF0Um93cyA9IGZ1bmN0aW9uKHJvd3MpIHtcbiAgICAgIHJldHVybiByb3dzLm1hcChmb3JtYXRSb3cpLmpvaW4oXCJcXG5cIik7XG4gICAgfTtcbiAgICBmdW5jdGlvbiBmb3JtYXRSb3cocm93KSB7XG4gICAgICByZXR1cm4gcm93Lm1hcChmb3JtYXRWYWx1ZSkuam9pbihkZWxpbWl0ZXIpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBmb3JtYXRWYWx1ZSh0ZXh0KSB7XG4gICAgICByZXR1cm4gcmVGb3JtYXQudGVzdCh0ZXh0KSA/ICdcIicgKyB0ZXh0LnJlcGxhY2UoL1xcXCIvZywgJ1wiXCInKSArICdcIicgOiB0ZXh0O1xuICAgIH1cbiAgICByZXR1cm4gZHN2O1xuICB9O1xuICBkMy5jc3YgPSBkMy5kc3YoXCIsXCIsIFwidGV4dC9jc3ZcIik7XG4gIGQzLnRzdiA9IGQzLmRzdihcIlx0XCIsIFwidGV4dC90YWItc2VwYXJhdGVkLXZhbHVlc1wiKTtcbiAgdmFyIGQzX3RpbWVyX3F1ZXVlSGVhZCwgZDNfdGltZXJfcXVldWVUYWlsLCBkM190aW1lcl9pbnRlcnZhbCwgZDNfdGltZXJfdGltZW91dCwgZDNfdGltZXJfYWN0aXZlLCBkM190aW1lcl9mcmFtZSA9IGQzX3dpbmRvd1tkM192ZW5kb3JTeW1ib2woZDNfd2luZG93LCBcInJlcXVlc3RBbmltYXRpb25GcmFtZVwiKV0gfHwgZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICBzZXRUaW1lb3V0KGNhbGxiYWNrLCAxNyk7XG4gIH07XG4gIGQzLnRpbWVyID0gZnVuY3Rpb24oY2FsbGJhY2ssIGRlbGF5LCB0aGVuKSB7XG4gICAgdmFyIG4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGlmIChuIDwgMikgZGVsYXkgPSAwO1xuICAgIGlmIChuIDwgMykgdGhlbiA9IERhdGUubm93KCk7XG4gICAgdmFyIHRpbWUgPSB0aGVuICsgZGVsYXksIHRpbWVyID0ge1xuICAgICAgYzogY2FsbGJhY2ssXG4gICAgICB0OiB0aW1lLFxuICAgICAgZjogZmFsc2UsXG4gICAgICBuOiBudWxsXG4gICAgfTtcbiAgICBpZiAoZDNfdGltZXJfcXVldWVUYWlsKSBkM190aW1lcl9xdWV1ZVRhaWwubiA9IHRpbWVyOyBlbHNlIGQzX3RpbWVyX3F1ZXVlSGVhZCA9IHRpbWVyO1xuICAgIGQzX3RpbWVyX3F1ZXVlVGFpbCA9IHRpbWVyO1xuICAgIGlmICghZDNfdGltZXJfaW50ZXJ2YWwpIHtcbiAgICAgIGQzX3RpbWVyX3RpbWVvdXQgPSBjbGVhclRpbWVvdXQoZDNfdGltZXJfdGltZW91dCk7XG4gICAgICBkM190aW1lcl9pbnRlcnZhbCA9IDE7XG4gICAgICBkM190aW1lcl9mcmFtZShkM190aW1lcl9zdGVwKTtcbiAgICB9XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3RpbWVyX3N0ZXAoKSB7XG4gICAgdmFyIG5vdyA9IGQzX3RpbWVyX21hcmsoKSwgZGVsYXkgPSBkM190aW1lcl9zd2VlcCgpIC0gbm93O1xuICAgIGlmIChkZWxheSA+IDI0KSB7XG4gICAgICBpZiAoaXNGaW5pdGUoZGVsYXkpKSB7XG4gICAgICAgIGNsZWFyVGltZW91dChkM190aW1lcl90aW1lb3V0KTtcbiAgICAgICAgZDNfdGltZXJfdGltZW91dCA9IHNldFRpbWVvdXQoZDNfdGltZXJfc3RlcCwgZGVsYXkpO1xuICAgICAgfVxuICAgICAgZDNfdGltZXJfaW50ZXJ2YWwgPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBkM190aW1lcl9pbnRlcnZhbCA9IDE7XG4gICAgICBkM190aW1lcl9mcmFtZShkM190aW1lcl9zdGVwKTtcbiAgICB9XG4gIH1cbiAgZDMudGltZXIuZmx1c2ggPSBmdW5jdGlvbigpIHtcbiAgICBkM190aW1lcl9tYXJrKCk7XG4gICAgZDNfdGltZXJfc3dlZXAoKTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfdGltZXJfbWFyaygpIHtcbiAgICB2YXIgbm93ID0gRGF0ZS5ub3coKTtcbiAgICBkM190aW1lcl9hY3RpdmUgPSBkM190aW1lcl9xdWV1ZUhlYWQ7XG4gICAgd2hpbGUgKGQzX3RpbWVyX2FjdGl2ZSkge1xuICAgICAgaWYgKG5vdyA+PSBkM190aW1lcl9hY3RpdmUudCkgZDNfdGltZXJfYWN0aXZlLmYgPSBkM190aW1lcl9hY3RpdmUuYyhub3cgLSBkM190aW1lcl9hY3RpdmUudCk7XG4gICAgICBkM190aW1lcl9hY3RpdmUgPSBkM190aW1lcl9hY3RpdmUubjtcbiAgICB9XG4gICAgcmV0dXJuIG5vdztcbiAgfVxuICBmdW5jdGlvbiBkM190aW1lcl9zd2VlcCgpIHtcbiAgICB2YXIgdDAsIHQxID0gZDNfdGltZXJfcXVldWVIZWFkLCB0aW1lID0gSW5maW5pdHk7XG4gICAgd2hpbGUgKHQxKSB7XG4gICAgICBpZiAodDEuZikge1xuICAgICAgICB0MSA9IHQwID8gdDAubiA9IHQxLm4gOiBkM190aW1lcl9xdWV1ZUhlYWQgPSB0MS5uO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHQxLnQgPCB0aW1lKSB0aW1lID0gdDEudDtcbiAgICAgICAgdDEgPSAodDAgPSB0MSkubjtcbiAgICAgIH1cbiAgICB9XG4gICAgZDNfdGltZXJfcXVldWVUYWlsID0gdDA7XG4gICAgcmV0dXJuIHRpbWU7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZm9ybWF0X3ByZWNpc2lvbih4LCBwKSB7XG4gICAgcmV0dXJuIHAgLSAoeCA/IE1hdGguY2VpbChNYXRoLmxvZyh4KSAvIE1hdGguTE4xMCkgOiAxKTtcbiAgfVxuICBkMy5yb3VuZCA9IGZ1bmN0aW9uKHgsIG4pIHtcbiAgICByZXR1cm4gbiA/IE1hdGgucm91bmQoeCAqIChuID0gTWF0aC5wb3coMTAsIG4pKSkgLyBuIDogTWF0aC5yb3VuZCh4KTtcbiAgfTtcbiAgdmFyIGQzX2Zvcm1hdFByZWZpeGVzID0gWyBcInlcIiwgXCJ6XCIsIFwiYVwiLCBcImZcIiwgXCJwXCIsIFwiblwiLCBcIsK1XCIsIFwibVwiLCBcIlwiLCBcImtcIiwgXCJNXCIsIFwiR1wiLCBcIlRcIiwgXCJQXCIsIFwiRVwiLCBcIlpcIiwgXCJZXCIgXS5tYXAoZDNfZm9ybWF0UHJlZml4KTtcbiAgZDMuZm9ybWF0UHJlZml4ID0gZnVuY3Rpb24odmFsdWUsIHByZWNpc2lvbikge1xuICAgIHZhciBpID0gMDtcbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIGlmICh2YWx1ZSA8IDApIHZhbHVlICo9IC0xO1xuICAgICAgaWYgKHByZWNpc2lvbikgdmFsdWUgPSBkMy5yb3VuZCh2YWx1ZSwgZDNfZm9ybWF0X3ByZWNpc2lvbih2YWx1ZSwgcHJlY2lzaW9uKSk7XG4gICAgICBpID0gMSArIE1hdGguZmxvb3IoMWUtMTIgKyBNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMTApO1xuICAgICAgaSA9IE1hdGgubWF4KC0yNCwgTWF0aC5taW4oMjQsIE1hdGguZmxvb3IoKGkgLSAxKSAvIDMpICogMykpO1xuICAgIH1cbiAgICByZXR1cm4gZDNfZm9ybWF0UHJlZml4ZXNbOCArIGkgLyAzXTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfZm9ybWF0UHJlZml4KGQsIGkpIHtcbiAgICB2YXIgayA9IE1hdGgucG93KDEwLCBhYnMoOCAtIGkpICogMyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNjYWxlOiBpID4gOCA/IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIGQgLyBrO1xuICAgICAgfSA6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIGQgKiBrO1xuICAgICAgfSxcbiAgICAgIHN5bWJvbDogZFxuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZDNfbG9jYWxlX251bWJlckZvcm1hdChsb2NhbGUpIHtcbiAgICB2YXIgbG9jYWxlX2RlY2ltYWwgPSBsb2NhbGUuZGVjaW1hbCwgbG9jYWxlX3Rob3VzYW5kcyA9IGxvY2FsZS50aG91c2FuZHMsIGxvY2FsZV9ncm91cGluZyA9IGxvY2FsZS5ncm91cGluZywgbG9jYWxlX2N1cnJlbmN5ID0gbG9jYWxlLmN1cnJlbmN5LCBmb3JtYXRHcm91cCA9IGxvY2FsZV9ncm91cGluZyAmJiBsb2NhbGVfdGhvdXNhbmRzID8gZnVuY3Rpb24odmFsdWUsIHdpZHRoKSB7XG4gICAgICB2YXIgaSA9IHZhbHVlLmxlbmd0aCwgdCA9IFtdLCBqID0gMCwgZyA9IGxvY2FsZV9ncm91cGluZ1swXSwgbGVuZ3RoID0gMDtcbiAgICAgIHdoaWxlIChpID4gMCAmJiBnID4gMCkge1xuICAgICAgICBpZiAobGVuZ3RoICsgZyArIDEgPiB3aWR0aCkgZyA9IE1hdGgubWF4KDEsIHdpZHRoIC0gbGVuZ3RoKTtcbiAgICAgICAgdC5wdXNoKHZhbHVlLnN1YnN0cmluZyhpIC09IGcsIGkgKyBnKSk7XG4gICAgICAgIGlmICgobGVuZ3RoICs9IGcgKyAxKSA+IHdpZHRoKSBicmVhaztcbiAgICAgICAgZyA9IGxvY2FsZV9ncm91cGluZ1tqID0gKGogKyAxKSAlIGxvY2FsZV9ncm91cGluZy5sZW5ndGhdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHQucmV2ZXJzZSgpLmpvaW4obG9jYWxlX3Rob3VzYW5kcyk7XG4gICAgfSA6IGQzX2lkZW50aXR5O1xuICAgIHJldHVybiBmdW5jdGlvbihzcGVjaWZpZXIpIHtcbiAgICAgIHZhciBtYXRjaCA9IGQzX2Zvcm1hdF9yZS5leGVjKHNwZWNpZmllciksIGZpbGwgPSBtYXRjaFsxXSB8fCBcIiBcIiwgYWxpZ24gPSBtYXRjaFsyXSB8fCBcIj5cIiwgc2lnbiA9IG1hdGNoWzNdIHx8IFwiLVwiLCBzeW1ib2wgPSBtYXRjaFs0XSB8fCBcIlwiLCB6ZmlsbCA9IG1hdGNoWzVdLCB3aWR0aCA9ICttYXRjaFs2XSwgY29tbWEgPSBtYXRjaFs3XSwgcHJlY2lzaW9uID0gbWF0Y2hbOF0sIHR5cGUgPSBtYXRjaFs5XSwgc2NhbGUgPSAxLCBwcmVmaXggPSBcIlwiLCBzdWZmaXggPSBcIlwiLCBpbnRlZ2VyID0gZmFsc2UsIGV4cG9uZW50ID0gdHJ1ZTtcbiAgICAgIGlmIChwcmVjaXNpb24pIHByZWNpc2lvbiA9ICtwcmVjaXNpb24uc3Vic3RyaW5nKDEpO1xuICAgICAgaWYgKHpmaWxsIHx8IGZpbGwgPT09IFwiMFwiICYmIGFsaWduID09PSBcIj1cIikge1xuICAgICAgICB6ZmlsbCA9IGZpbGwgPSBcIjBcIjtcbiAgICAgICAgYWxpZ24gPSBcIj1cIjtcbiAgICAgIH1cbiAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgIGNhc2UgXCJuXCI6XG4gICAgICAgIGNvbW1hID0gdHJ1ZTtcbiAgICAgICAgdHlwZSA9IFwiZ1wiO1xuICAgICAgICBicmVhaztcblxuICAgICAgIGNhc2UgXCIlXCI6XG4gICAgICAgIHNjYWxlID0gMTAwO1xuICAgICAgICBzdWZmaXggPSBcIiVcIjtcbiAgICAgICAgdHlwZSA9IFwiZlwiO1xuICAgICAgICBicmVhaztcblxuICAgICAgIGNhc2UgXCJwXCI6XG4gICAgICAgIHNjYWxlID0gMTAwO1xuICAgICAgICBzdWZmaXggPSBcIiVcIjtcbiAgICAgICAgdHlwZSA9IFwiclwiO1xuICAgICAgICBicmVhaztcblxuICAgICAgIGNhc2UgXCJiXCI6XG4gICAgICAgY2FzZSBcIm9cIjpcbiAgICAgICBjYXNlIFwieFwiOlxuICAgICAgIGNhc2UgXCJYXCI6XG4gICAgICAgIGlmIChzeW1ib2wgPT09IFwiI1wiKSBwcmVmaXggPSBcIjBcIiArIHR5cGUudG9Mb3dlckNhc2UoKTtcblxuICAgICAgIGNhc2UgXCJjXCI6XG4gICAgICAgIGV4cG9uZW50ID0gZmFsc2U7XG5cbiAgICAgICBjYXNlIFwiZFwiOlxuICAgICAgICBpbnRlZ2VyID0gdHJ1ZTtcbiAgICAgICAgcHJlY2lzaW9uID0gMDtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgICBjYXNlIFwic1wiOlxuICAgICAgICBzY2FsZSA9IC0xO1xuICAgICAgICB0eXBlID0gXCJyXCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaWYgKHN5bWJvbCA9PT0gXCIkXCIpIHByZWZpeCA9IGxvY2FsZV9jdXJyZW5jeVswXSwgc3VmZml4ID0gbG9jYWxlX2N1cnJlbmN5WzFdO1xuICAgICAgaWYgKHR5cGUgPT0gXCJyXCIgJiYgIXByZWNpc2lvbikgdHlwZSA9IFwiZ1wiO1xuICAgICAgaWYgKHByZWNpc2lvbiAhPSBudWxsKSB7XG4gICAgICAgIGlmICh0eXBlID09IFwiZ1wiKSBwcmVjaXNpb24gPSBNYXRoLm1heCgxLCBNYXRoLm1pbigyMSwgcHJlY2lzaW9uKSk7IGVsc2UgaWYgKHR5cGUgPT0gXCJlXCIgfHwgdHlwZSA9PSBcImZcIikgcHJlY2lzaW9uID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMjAsIHByZWNpc2lvbikpO1xuICAgICAgfVxuICAgICAgdHlwZSA9IGQzX2Zvcm1hdF90eXBlcy5nZXQodHlwZSkgfHwgZDNfZm9ybWF0X3R5cGVEZWZhdWx0O1xuICAgICAgdmFyIHpjb21tYSA9IHpmaWxsICYmIGNvbW1hO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHZhciBmdWxsU3VmZml4ID0gc3VmZml4O1xuICAgICAgICBpZiAoaW50ZWdlciAmJiB2YWx1ZSAlIDEpIHJldHVybiBcIlwiO1xuICAgICAgICB2YXIgbmVnYXRpdmUgPSB2YWx1ZSA8IDAgfHwgdmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCA/ICh2YWx1ZSA9IC12YWx1ZSwgXCItXCIpIDogc2lnbiA9PT0gXCItXCIgPyBcIlwiIDogc2lnbjtcbiAgICAgICAgaWYgKHNjYWxlIDwgMCkge1xuICAgICAgICAgIHZhciB1bml0ID0gZDMuZm9ybWF0UHJlZml4KHZhbHVlLCBwcmVjaXNpb24pO1xuICAgICAgICAgIHZhbHVlID0gdW5pdC5zY2FsZSh2YWx1ZSk7XG4gICAgICAgICAgZnVsbFN1ZmZpeCA9IHVuaXQuc3ltYm9sICsgc3VmZml4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbHVlICo9IHNjYWxlO1xuICAgICAgICB9XG4gICAgICAgIHZhbHVlID0gdHlwZSh2YWx1ZSwgcHJlY2lzaW9uKTtcbiAgICAgICAgdmFyIGkgPSB2YWx1ZS5sYXN0SW5kZXhPZihcIi5cIiksIGJlZm9yZSwgYWZ0ZXI7XG4gICAgICAgIGlmIChpIDwgMCkge1xuICAgICAgICAgIHZhciBqID0gZXhwb25lbnQgPyB2YWx1ZS5sYXN0SW5kZXhPZihcImVcIikgOiAtMTtcbiAgICAgICAgICBpZiAoaiA8IDApIGJlZm9yZSA9IHZhbHVlLCBhZnRlciA9IFwiXCI7IGVsc2UgYmVmb3JlID0gdmFsdWUuc3Vic3RyaW5nKDAsIGopLCBhZnRlciA9IHZhbHVlLnN1YnN0cmluZyhqKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBiZWZvcmUgPSB2YWx1ZS5zdWJzdHJpbmcoMCwgaSk7XG4gICAgICAgICAgYWZ0ZXIgPSBsb2NhbGVfZGVjaW1hbCArIHZhbHVlLnN1YnN0cmluZyhpICsgMSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF6ZmlsbCAmJiBjb21tYSkgYmVmb3JlID0gZm9ybWF0R3JvdXAoYmVmb3JlLCBJbmZpbml0eSk7XG4gICAgICAgIHZhciBsZW5ndGggPSBwcmVmaXgubGVuZ3RoICsgYmVmb3JlLmxlbmd0aCArIGFmdGVyLmxlbmd0aCArICh6Y29tbWEgPyAwIDogbmVnYXRpdmUubGVuZ3RoKSwgcGFkZGluZyA9IGxlbmd0aCA8IHdpZHRoID8gbmV3IEFycmF5KGxlbmd0aCA9IHdpZHRoIC0gbGVuZ3RoICsgMSkuam9pbihmaWxsKSA6IFwiXCI7XG4gICAgICAgIGlmICh6Y29tbWEpIGJlZm9yZSA9IGZvcm1hdEdyb3VwKHBhZGRpbmcgKyBiZWZvcmUsIHBhZGRpbmcubGVuZ3RoID8gd2lkdGggLSBhZnRlci5sZW5ndGggOiBJbmZpbml0eSk7XG4gICAgICAgIG5lZ2F0aXZlICs9IHByZWZpeDtcbiAgICAgICAgdmFsdWUgPSBiZWZvcmUgKyBhZnRlcjtcbiAgICAgICAgcmV0dXJuIChhbGlnbiA9PT0gXCI8XCIgPyBuZWdhdGl2ZSArIHZhbHVlICsgcGFkZGluZyA6IGFsaWduID09PSBcIj5cIiA/IHBhZGRpbmcgKyBuZWdhdGl2ZSArIHZhbHVlIDogYWxpZ24gPT09IFwiXlwiID8gcGFkZGluZy5zdWJzdHJpbmcoMCwgbGVuZ3RoID4+PSAxKSArIG5lZ2F0aXZlICsgdmFsdWUgKyBwYWRkaW5nLnN1YnN0cmluZyhsZW5ndGgpIDogbmVnYXRpdmUgKyAoemNvbW1hID8gdmFsdWUgOiBwYWRkaW5nICsgdmFsdWUpKSArIGZ1bGxTdWZmaXg7XG4gICAgICB9O1xuICAgIH07XG4gIH1cbiAgdmFyIGQzX2Zvcm1hdF9yZSA9IC8oPzooW157XSk/KFs8Pj1eXSkpPyhbK1xcLSBdKT8oWyQjXSk/KDApPyhcXGQrKT8oLCk/KFxcLi0/XFxkKyk/KFthLXolXSk/L2k7XG4gIHZhciBkM19mb3JtYXRfdHlwZXMgPSBkMy5tYXAoe1xuICAgIGI6IGZ1bmN0aW9uKHgpIHtcbiAgICAgIHJldHVybiB4LnRvU3RyaW5nKDIpO1xuICAgIH0sXG4gICAgYzogZnVuY3Rpb24oeCkge1xuICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoeCk7XG4gICAgfSxcbiAgICBvOiBmdW5jdGlvbih4KSB7XG4gICAgICByZXR1cm4geC50b1N0cmluZyg4KTtcbiAgICB9LFxuICAgIHg6IGZ1bmN0aW9uKHgpIHtcbiAgICAgIHJldHVybiB4LnRvU3RyaW5nKDE2KTtcbiAgICB9LFxuICAgIFg6IGZ1bmN0aW9uKHgpIHtcbiAgICAgIHJldHVybiB4LnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpO1xuICAgIH0sXG4gICAgZzogZnVuY3Rpb24oeCwgcCkge1xuICAgICAgcmV0dXJuIHgudG9QcmVjaXNpb24ocCk7XG4gICAgfSxcbiAgICBlOiBmdW5jdGlvbih4LCBwKSB7XG4gICAgICByZXR1cm4geC50b0V4cG9uZW50aWFsKHApO1xuICAgIH0sXG4gICAgZjogZnVuY3Rpb24oeCwgcCkge1xuICAgICAgcmV0dXJuIHgudG9GaXhlZChwKTtcbiAgICB9LFxuICAgIHI6IGZ1bmN0aW9uKHgsIHApIHtcbiAgICAgIHJldHVybiAoeCA9IGQzLnJvdW5kKHgsIGQzX2Zvcm1hdF9wcmVjaXNpb24oeCwgcCkpKS50b0ZpeGVkKE1hdGgubWF4KDAsIE1hdGgubWluKDIwLCBkM19mb3JtYXRfcHJlY2lzaW9uKHggKiAoMSArIDFlLTE1KSwgcCkpKSk7XG4gICAgfVxuICB9KTtcbiAgZnVuY3Rpb24gZDNfZm9ybWF0X3R5cGVEZWZhdWx0KHgpIHtcbiAgICByZXR1cm4geCArIFwiXCI7XG4gIH1cbiAgdmFyIGQzX3RpbWUgPSBkMy50aW1lID0ge30sIGQzX2RhdGUgPSBEYXRlO1xuICBmdW5jdGlvbiBkM19kYXRlX3V0YygpIHtcbiAgICB0aGlzLl8gPSBuZXcgRGF0ZShhcmd1bWVudHMubGVuZ3RoID4gMSA/IERhdGUuVVRDLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgOiBhcmd1bWVudHNbMF0pO1xuICB9XG4gIGQzX2RhdGVfdXRjLnByb3RvdHlwZSA9IHtcbiAgICBnZXREYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl8uZ2V0VVRDRGF0ZSgpO1xuICAgIH0sXG4gICAgZ2V0RGF5OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl8uZ2V0VVRDRGF5KCk7XG4gICAgfSxcbiAgICBnZXRGdWxsWWVhcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fLmdldFVUQ0Z1bGxZZWFyKCk7XG4gICAgfSxcbiAgICBnZXRIb3VyczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fLmdldFVUQ0hvdXJzKCk7XG4gICAgfSxcbiAgICBnZXRNaWxsaXNlY29uZHM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuXy5nZXRVVENNaWxsaXNlY29uZHMoKTtcbiAgICB9LFxuICAgIGdldE1pbnV0ZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuXy5nZXRVVENNaW51dGVzKCk7XG4gICAgfSxcbiAgICBnZXRNb250aDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fLmdldFVUQ01vbnRoKCk7XG4gICAgfSxcbiAgICBnZXRTZWNvbmRzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl8uZ2V0VVRDU2Vjb25kcygpO1xuICAgIH0sXG4gICAgZ2V0VGltZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fLmdldFRpbWUoKTtcbiAgICB9LFxuICAgIGdldFRpbWV6b25lT2Zmc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH0sXG4gICAgdmFsdWVPZjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fLnZhbHVlT2YoKTtcbiAgICB9LFxuICAgIHNldERhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgZDNfdGltZV9wcm90b3R5cGUuc2V0VVRDRGF0ZS5hcHBseSh0aGlzLl8sIGFyZ3VtZW50cyk7XG4gICAgfSxcbiAgICBzZXREYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgZDNfdGltZV9wcm90b3R5cGUuc2V0VVRDRGF5LmFwcGx5KHRoaXMuXywgYXJndW1lbnRzKTtcbiAgICB9LFxuICAgIHNldEZ1bGxZZWFyOiBmdW5jdGlvbigpIHtcbiAgICAgIGQzX3RpbWVfcHJvdG90eXBlLnNldFVUQ0Z1bGxZZWFyLmFwcGx5KHRoaXMuXywgYXJndW1lbnRzKTtcbiAgICB9LFxuICAgIHNldEhvdXJzOiBmdW5jdGlvbigpIHtcbiAgICAgIGQzX3RpbWVfcHJvdG90eXBlLnNldFVUQ0hvdXJzLmFwcGx5KHRoaXMuXywgYXJndW1lbnRzKTtcbiAgICB9LFxuICAgIHNldE1pbGxpc2Vjb25kczogZnVuY3Rpb24oKSB7XG4gICAgICBkM190aW1lX3Byb3RvdHlwZS5zZXRVVENNaWxsaXNlY29uZHMuYXBwbHkodGhpcy5fLCBhcmd1bWVudHMpO1xuICAgIH0sXG4gICAgc2V0TWludXRlczogZnVuY3Rpb24oKSB7XG4gICAgICBkM190aW1lX3Byb3RvdHlwZS5zZXRVVENNaW51dGVzLmFwcGx5KHRoaXMuXywgYXJndW1lbnRzKTtcbiAgICB9LFxuICAgIHNldE1vbnRoOiBmdW5jdGlvbigpIHtcbiAgICAgIGQzX3RpbWVfcHJvdG90eXBlLnNldFVUQ01vbnRoLmFwcGx5KHRoaXMuXywgYXJndW1lbnRzKTtcbiAgICB9LFxuICAgIHNldFNlY29uZHM6IGZ1bmN0aW9uKCkge1xuICAgICAgZDNfdGltZV9wcm90b3R5cGUuc2V0VVRDU2Vjb25kcy5hcHBseSh0aGlzLl8sIGFyZ3VtZW50cyk7XG4gICAgfSxcbiAgICBzZXRUaW1lOiBmdW5jdGlvbigpIHtcbiAgICAgIGQzX3RpbWVfcHJvdG90eXBlLnNldFRpbWUuYXBwbHkodGhpcy5fLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfTtcbiAgdmFyIGQzX3RpbWVfcHJvdG90eXBlID0gRGF0ZS5wcm90b3R5cGU7XG4gIGZ1bmN0aW9uIGQzX3RpbWVfaW50ZXJ2YWwobG9jYWwsIHN0ZXAsIG51bWJlcikge1xuICAgIGZ1bmN0aW9uIHJvdW5kKGRhdGUpIHtcbiAgICAgIHZhciBkMCA9IGxvY2FsKGRhdGUpLCBkMSA9IG9mZnNldChkMCwgMSk7XG4gICAgICByZXR1cm4gZGF0ZSAtIGQwIDwgZDEgLSBkYXRlID8gZDAgOiBkMTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY2VpbChkYXRlKSB7XG4gICAgICBzdGVwKGRhdGUgPSBsb2NhbChuZXcgZDNfZGF0ZShkYXRlIC0gMSkpLCAxKTtcbiAgICAgIHJldHVybiBkYXRlO1xuICAgIH1cbiAgICBmdW5jdGlvbiBvZmZzZXQoZGF0ZSwgaykge1xuICAgICAgc3RlcChkYXRlID0gbmV3IGQzX2RhdGUoK2RhdGUpLCBrKTtcbiAgICAgIHJldHVybiBkYXRlO1xuICAgIH1cbiAgICBmdW5jdGlvbiByYW5nZSh0MCwgdDEsIGR0KSB7XG4gICAgICB2YXIgdGltZSA9IGNlaWwodDApLCB0aW1lcyA9IFtdO1xuICAgICAgaWYgKGR0ID4gMSkge1xuICAgICAgICB3aGlsZSAodGltZSA8IHQxKSB7XG4gICAgICAgICAgaWYgKCEobnVtYmVyKHRpbWUpICUgZHQpKSB0aW1lcy5wdXNoKG5ldyBEYXRlKCt0aW1lKSk7XG4gICAgICAgICAgc3RlcCh0aW1lLCAxKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2hpbGUgKHRpbWUgPCB0MSkgdGltZXMucHVzaChuZXcgRGF0ZSgrdGltZSkpLCBzdGVwKHRpbWUsIDEpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRpbWVzO1xuICAgIH1cbiAgICBmdW5jdGlvbiByYW5nZV91dGModDAsIHQxLCBkdCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgZDNfZGF0ZSA9IGQzX2RhdGVfdXRjO1xuICAgICAgICB2YXIgdXRjID0gbmV3IGQzX2RhdGVfdXRjKCk7XG4gICAgICAgIHV0Yy5fID0gdDA7XG4gICAgICAgIHJldHVybiByYW5nZSh1dGMsIHQxLCBkdCk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBkM19kYXRlID0gRGF0ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgbG9jYWwuZmxvb3IgPSBsb2NhbDtcbiAgICBsb2NhbC5yb3VuZCA9IHJvdW5kO1xuICAgIGxvY2FsLmNlaWwgPSBjZWlsO1xuICAgIGxvY2FsLm9mZnNldCA9IG9mZnNldDtcbiAgICBsb2NhbC5yYW5nZSA9IHJhbmdlO1xuICAgIHZhciB1dGMgPSBsb2NhbC51dGMgPSBkM190aW1lX2ludGVydmFsX3V0Yyhsb2NhbCk7XG4gICAgdXRjLmZsb29yID0gdXRjO1xuICAgIHV0Yy5yb3VuZCA9IGQzX3RpbWVfaW50ZXJ2YWxfdXRjKHJvdW5kKTtcbiAgICB1dGMuY2VpbCA9IGQzX3RpbWVfaW50ZXJ2YWxfdXRjKGNlaWwpO1xuICAgIHV0Yy5vZmZzZXQgPSBkM190aW1lX2ludGVydmFsX3V0YyhvZmZzZXQpO1xuICAgIHV0Yy5yYW5nZSA9IHJhbmdlX3V0YztcbiAgICByZXR1cm4gbG9jYWw7XG4gIH1cbiAgZnVuY3Rpb24gZDNfdGltZV9pbnRlcnZhbF91dGMobWV0aG9kKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGUsIGspIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGQzX2RhdGUgPSBkM19kYXRlX3V0YztcbiAgICAgICAgdmFyIHV0YyA9IG5ldyBkM19kYXRlX3V0YygpO1xuICAgICAgICB1dGMuXyA9IGRhdGU7XG4gICAgICAgIHJldHVybiBtZXRob2QodXRjLCBrKS5fO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgZDNfZGF0ZSA9IERhdGU7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICBkM190aW1lLnllYXIgPSBkM190aW1lX2ludGVydmFsKGZ1bmN0aW9uKGRhdGUpIHtcbiAgICBkYXRlID0gZDNfdGltZS5kYXkoZGF0ZSk7XG4gICAgZGF0ZS5zZXRNb250aCgwLCAxKTtcbiAgICByZXR1cm4gZGF0ZTtcbiAgfSwgZnVuY3Rpb24oZGF0ZSwgb2Zmc2V0KSB7XG4gICAgZGF0ZS5zZXRGdWxsWWVhcihkYXRlLmdldEZ1bGxZZWFyKCkgKyBvZmZzZXQpO1xuICB9LCBmdW5jdGlvbihkYXRlKSB7XG4gICAgcmV0dXJuIGRhdGUuZ2V0RnVsbFllYXIoKTtcbiAgfSk7XG4gIGQzX3RpbWUueWVhcnMgPSBkM190aW1lLnllYXIucmFuZ2U7XG4gIGQzX3RpbWUueWVhcnMudXRjID0gZDNfdGltZS55ZWFyLnV0Yy5yYW5nZTtcbiAgZDNfdGltZS5kYXkgPSBkM190aW1lX2ludGVydmFsKGZ1bmN0aW9uKGRhdGUpIHtcbiAgICB2YXIgZGF5ID0gbmV3IGQzX2RhdGUoMmUzLCAwKTtcbiAgICBkYXkuc2V0RnVsbFllYXIoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIGRhdGUuZ2V0RGF0ZSgpKTtcbiAgICByZXR1cm4gZGF5O1xuICB9LCBmdW5jdGlvbihkYXRlLCBvZmZzZXQpIHtcbiAgICBkYXRlLnNldERhdGUoZGF0ZS5nZXREYXRlKCkgKyBvZmZzZXQpO1xuICB9LCBmdW5jdGlvbihkYXRlKSB7XG4gICAgcmV0dXJuIGRhdGUuZ2V0RGF0ZSgpIC0gMTtcbiAgfSk7XG4gIGQzX3RpbWUuZGF5cyA9IGQzX3RpbWUuZGF5LnJhbmdlO1xuICBkM190aW1lLmRheXMudXRjID0gZDNfdGltZS5kYXkudXRjLnJhbmdlO1xuICBkM190aW1lLmRheU9mWWVhciA9IGZ1bmN0aW9uKGRhdGUpIHtcbiAgICB2YXIgeWVhciA9IGQzX3RpbWUueWVhcihkYXRlKTtcbiAgICByZXR1cm4gTWF0aC5mbG9vcigoZGF0ZSAtIHllYXIgLSAoZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpIC0geWVhci5nZXRUaW1lem9uZU9mZnNldCgpKSAqIDZlNCkgLyA4NjRlNSk7XG4gIH07XG4gIFsgXCJzdW5kYXlcIiwgXCJtb25kYXlcIiwgXCJ0dWVzZGF5XCIsIFwid2VkbmVzZGF5XCIsIFwidGh1cnNkYXlcIiwgXCJmcmlkYXlcIiwgXCJzYXR1cmRheVwiIF0uZm9yRWFjaChmdW5jdGlvbihkYXksIGkpIHtcbiAgICBpID0gNyAtIGk7XG4gICAgdmFyIGludGVydmFsID0gZDNfdGltZVtkYXldID0gZDNfdGltZV9pbnRlcnZhbChmdW5jdGlvbihkYXRlKSB7XG4gICAgICAoZGF0ZSA9IGQzX3RpbWUuZGF5KGRhdGUpKS5zZXREYXRlKGRhdGUuZ2V0RGF0ZSgpIC0gKGRhdGUuZ2V0RGF5KCkgKyBpKSAlIDcpO1xuICAgICAgcmV0dXJuIGRhdGU7XG4gICAgfSwgZnVuY3Rpb24oZGF0ZSwgb2Zmc2V0KSB7XG4gICAgICBkYXRlLnNldERhdGUoZGF0ZS5nZXREYXRlKCkgKyBNYXRoLmZsb29yKG9mZnNldCkgKiA3KTtcbiAgICB9LCBmdW5jdGlvbihkYXRlKSB7XG4gICAgICB2YXIgZGF5ID0gZDNfdGltZS55ZWFyKGRhdGUpLmdldERheSgpO1xuICAgICAgcmV0dXJuIE1hdGguZmxvb3IoKGQzX3RpbWUuZGF5T2ZZZWFyKGRhdGUpICsgKGRheSArIGkpICUgNykgLyA3KSAtIChkYXkgIT09IGkpO1xuICAgIH0pO1xuICAgIGQzX3RpbWVbZGF5ICsgXCJzXCJdID0gaW50ZXJ2YWwucmFuZ2U7XG4gICAgZDNfdGltZVtkYXkgKyBcInNcIl0udXRjID0gaW50ZXJ2YWwudXRjLnJhbmdlO1xuICAgIGQzX3RpbWVbZGF5ICsgXCJPZlllYXJcIl0gPSBmdW5jdGlvbihkYXRlKSB7XG4gICAgICB2YXIgZGF5ID0gZDNfdGltZS55ZWFyKGRhdGUpLmdldERheSgpO1xuICAgICAgcmV0dXJuIE1hdGguZmxvb3IoKGQzX3RpbWUuZGF5T2ZZZWFyKGRhdGUpICsgKGRheSArIGkpICUgNykgLyA3KTtcbiAgICB9O1xuICB9KTtcbiAgZDNfdGltZS53ZWVrID0gZDNfdGltZS5zdW5kYXk7XG4gIGQzX3RpbWUud2Vla3MgPSBkM190aW1lLnN1bmRheS5yYW5nZTtcbiAgZDNfdGltZS53ZWVrcy51dGMgPSBkM190aW1lLnN1bmRheS51dGMucmFuZ2U7XG4gIGQzX3RpbWUud2Vla09mWWVhciA9IGQzX3RpbWUuc3VuZGF5T2ZZZWFyO1xuICBmdW5jdGlvbiBkM19sb2NhbGVfdGltZUZvcm1hdChsb2NhbGUpIHtcbiAgICB2YXIgbG9jYWxlX2RhdGVUaW1lID0gbG9jYWxlLmRhdGVUaW1lLCBsb2NhbGVfZGF0ZSA9IGxvY2FsZS5kYXRlLCBsb2NhbGVfdGltZSA9IGxvY2FsZS50aW1lLCBsb2NhbGVfcGVyaW9kcyA9IGxvY2FsZS5wZXJpb2RzLCBsb2NhbGVfZGF5cyA9IGxvY2FsZS5kYXlzLCBsb2NhbGVfc2hvcnREYXlzID0gbG9jYWxlLnNob3J0RGF5cywgbG9jYWxlX21vbnRocyA9IGxvY2FsZS5tb250aHMsIGxvY2FsZV9zaG9ydE1vbnRocyA9IGxvY2FsZS5zaG9ydE1vbnRocztcbiAgICBmdW5jdGlvbiBkM190aW1lX2Zvcm1hdCh0ZW1wbGF0ZSkge1xuICAgICAgdmFyIG4gPSB0ZW1wbGF0ZS5sZW5ndGg7XG4gICAgICBmdW5jdGlvbiBmb3JtYXQoZGF0ZSkge1xuICAgICAgICB2YXIgc3RyaW5nID0gW10sIGkgPSAtMSwgaiA9IDAsIGMsIHAsIGY7XG4gICAgICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgICAgaWYgKHRlbXBsYXRlLmNoYXJDb2RlQXQoaSkgPT09IDM3KSB7XG4gICAgICAgICAgICBzdHJpbmcucHVzaCh0ZW1wbGF0ZS5zbGljZShqLCBpKSk7XG4gICAgICAgICAgICBpZiAoKHAgPSBkM190aW1lX2Zvcm1hdFBhZHNbYyA9IHRlbXBsYXRlLmNoYXJBdCgrK2kpXSkgIT0gbnVsbCkgYyA9IHRlbXBsYXRlLmNoYXJBdCgrK2kpO1xuICAgICAgICAgICAgaWYgKGYgPSBkM190aW1lX2Zvcm1hdHNbY10pIGMgPSBmKGRhdGUsIHAgPT0gbnVsbCA/IGMgPT09IFwiZVwiID8gXCIgXCIgOiBcIjBcIiA6IHApO1xuICAgICAgICAgICAgc3RyaW5nLnB1c2goYyk7XG4gICAgICAgICAgICBqID0gaSArIDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHN0cmluZy5wdXNoKHRlbXBsYXRlLnNsaWNlKGosIGkpKTtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5qb2luKFwiXCIpO1xuICAgICAgfVxuICAgICAgZm9ybWF0LnBhcnNlID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgICAgIHZhciBkID0ge1xuICAgICAgICAgIHk6IDE5MDAsXG4gICAgICAgICAgbTogMCxcbiAgICAgICAgICBkOiAxLFxuICAgICAgICAgIEg6IDAsXG4gICAgICAgICAgTTogMCxcbiAgICAgICAgICBTOiAwLFxuICAgICAgICAgIEw6IDAsXG4gICAgICAgICAgWjogbnVsbFxuICAgICAgICB9LCBpID0gZDNfdGltZV9wYXJzZShkLCB0ZW1wbGF0ZSwgc3RyaW5nLCAwKTtcbiAgICAgICAgaWYgKGkgIT0gc3RyaW5nLmxlbmd0aCkgcmV0dXJuIG51bGw7XG4gICAgICAgIGlmIChcInBcIiBpbiBkKSBkLkggPSBkLkggJSAxMiArIGQucCAqIDEyO1xuICAgICAgICB2YXIgbG9jYWxaID0gZC5aICE9IG51bGwgJiYgZDNfZGF0ZSAhPT0gZDNfZGF0ZV91dGMsIGRhdGUgPSBuZXcgKGxvY2FsWiA/IGQzX2RhdGVfdXRjIDogZDNfZGF0ZSkoKTtcbiAgICAgICAgaWYgKFwialwiIGluIGQpIGRhdGUuc2V0RnVsbFllYXIoZC55LCAwLCBkLmopOyBlbHNlIGlmIChcIndcIiBpbiBkICYmIChcIldcIiBpbiBkIHx8IFwiVVwiIGluIGQpKSB7XG4gICAgICAgICAgZGF0ZS5zZXRGdWxsWWVhcihkLnksIDAsIDEpO1xuICAgICAgICAgIGRhdGUuc2V0RnVsbFllYXIoZC55LCAwLCBcIldcIiBpbiBkID8gKGQudyArIDYpICUgNyArIGQuVyAqIDcgLSAoZGF0ZS5nZXREYXkoKSArIDUpICUgNyA6IGQudyArIGQuVSAqIDcgLSAoZGF0ZS5nZXREYXkoKSArIDYpICUgNyk7XG4gICAgICAgIH0gZWxzZSBkYXRlLnNldEZ1bGxZZWFyKGQueSwgZC5tLCBkLmQpO1xuICAgICAgICBkYXRlLnNldEhvdXJzKGQuSCArIChkLlogLyAxMDAgfCAwKSwgZC5NICsgZC5aICUgMTAwLCBkLlMsIGQuTCk7XG4gICAgICAgIHJldHVybiBsb2NhbFogPyBkYXRlLl8gOiBkYXRlO1xuICAgICAgfTtcbiAgICAgIGZvcm1hdC50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgICB9O1xuICAgICAgcmV0dXJuIGZvcm1hdDtcbiAgICB9XG4gICAgZnVuY3Rpb24gZDNfdGltZV9wYXJzZShkYXRlLCB0ZW1wbGF0ZSwgc3RyaW5nLCBqKSB7XG4gICAgICB2YXIgYywgcCwgdCwgaSA9IDAsIG4gPSB0ZW1wbGF0ZS5sZW5ndGgsIG0gPSBzdHJpbmcubGVuZ3RoO1xuICAgICAgd2hpbGUgKGkgPCBuKSB7XG4gICAgICAgIGlmIChqID49IG0pIHJldHVybiAtMTtcbiAgICAgICAgYyA9IHRlbXBsYXRlLmNoYXJDb2RlQXQoaSsrKTtcbiAgICAgICAgaWYgKGMgPT09IDM3KSB7XG4gICAgICAgICAgdCA9IHRlbXBsYXRlLmNoYXJBdChpKyspO1xuICAgICAgICAgIHAgPSBkM190aW1lX3BhcnNlcnNbdCBpbiBkM190aW1lX2Zvcm1hdFBhZHMgPyB0ZW1wbGF0ZS5jaGFyQXQoaSsrKSA6IHRdO1xuICAgICAgICAgIGlmICghcCB8fCAoaiA9IHAoZGF0ZSwgc3RyaW5nLCBqKSkgPCAwKSByZXR1cm4gLTE7XG4gICAgICAgIH0gZWxzZSBpZiAoYyAhPSBzdHJpbmcuY2hhckNvZGVBdChqKyspKSB7XG4gICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gajtcbiAgICB9XG4gICAgZDNfdGltZV9mb3JtYXQudXRjID0gZnVuY3Rpb24odGVtcGxhdGUpIHtcbiAgICAgIHZhciBsb2NhbCA9IGQzX3RpbWVfZm9ybWF0KHRlbXBsYXRlKTtcbiAgICAgIGZ1bmN0aW9uIGZvcm1hdChkYXRlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZDNfZGF0ZSA9IGQzX2RhdGVfdXRjO1xuICAgICAgICAgIHZhciB1dGMgPSBuZXcgZDNfZGF0ZSgpO1xuICAgICAgICAgIHV0Yy5fID0gZGF0ZTtcbiAgICAgICAgICByZXR1cm4gbG9jYWwodXRjKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBkM19kYXRlID0gRGF0ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZm9ybWF0LnBhcnNlID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZDNfZGF0ZSA9IGQzX2RhdGVfdXRjO1xuICAgICAgICAgIHZhciBkYXRlID0gbG9jYWwucGFyc2Uoc3RyaW5nKTtcbiAgICAgICAgICByZXR1cm4gZGF0ZSAmJiBkYXRlLl87XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgZDNfZGF0ZSA9IERhdGU7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBmb3JtYXQudG9TdHJpbmcgPSBsb2NhbC50b1N0cmluZztcbiAgICAgIHJldHVybiBmb3JtYXQ7XG4gICAgfTtcbiAgICBkM190aW1lX2Zvcm1hdC5tdWx0aSA9IGQzX3RpbWVfZm9ybWF0LnV0Yy5tdWx0aSA9IGQzX3RpbWVfZm9ybWF0TXVsdGk7XG4gICAgdmFyIGQzX3RpbWVfcGVyaW9kTG9va3VwID0gZDMubWFwKCksIGQzX3RpbWVfZGF5UmUgPSBkM190aW1lX2Zvcm1hdFJlKGxvY2FsZV9kYXlzKSwgZDNfdGltZV9kYXlMb29rdXAgPSBkM190aW1lX2Zvcm1hdExvb2t1cChsb2NhbGVfZGF5cyksIGQzX3RpbWVfZGF5QWJicmV2UmUgPSBkM190aW1lX2Zvcm1hdFJlKGxvY2FsZV9zaG9ydERheXMpLCBkM190aW1lX2RheUFiYnJldkxvb2t1cCA9IGQzX3RpbWVfZm9ybWF0TG9va3VwKGxvY2FsZV9zaG9ydERheXMpLCBkM190aW1lX21vbnRoUmUgPSBkM190aW1lX2Zvcm1hdFJlKGxvY2FsZV9tb250aHMpLCBkM190aW1lX21vbnRoTG9va3VwID0gZDNfdGltZV9mb3JtYXRMb29rdXAobG9jYWxlX21vbnRocyksIGQzX3RpbWVfbW9udGhBYmJyZXZSZSA9IGQzX3RpbWVfZm9ybWF0UmUobG9jYWxlX3Nob3J0TW9udGhzKSwgZDNfdGltZV9tb250aEFiYnJldkxvb2t1cCA9IGQzX3RpbWVfZm9ybWF0TG9va3VwKGxvY2FsZV9zaG9ydE1vbnRocyk7XG4gICAgbG9jYWxlX3BlcmlvZHMuZm9yRWFjaChmdW5jdGlvbihwLCBpKSB7XG4gICAgICBkM190aW1lX3BlcmlvZExvb2t1cC5zZXQocC50b0xvd2VyQ2FzZSgpLCBpKTtcbiAgICB9KTtcbiAgICB2YXIgZDNfdGltZV9mb3JtYXRzID0ge1xuICAgICAgYTogZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gbG9jYWxlX3Nob3J0RGF5c1tkLmdldERheSgpXTtcbiAgICAgIH0sXG4gICAgICBBOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBsb2NhbGVfZGF5c1tkLmdldERheSgpXTtcbiAgICAgIH0sXG4gICAgICBiOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBsb2NhbGVfc2hvcnRNb250aHNbZC5nZXRNb250aCgpXTtcbiAgICAgIH0sXG4gICAgICBCOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBsb2NhbGVfbW9udGhzW2QuZ2V0TW9udGgoKV07XG4gICAgICB9LFxuICAgICAgYzogZDNfdGltZV9mb3JtYXQobG9jYWxlX2RhdGVUaW1lKSxcbiAgICAgIGQ6IGZ1bmN0aW9uKGQsIHApIHtcbiAgICAgICAgcmV0dXJuIGQzX3RpbWVfZm9ybWF0UGFkKGQuZ2V0RGF0ZSgpLCBwLCAyKTtcbiAgICAgIH0sXG4gICAgICBlOiBmdW5jdGlvbihkLCBwKSB7XG4gICAgICAgIHJldHVybiBkM190aW1lX2Zvcm1hdFBhZChkLmdldERhdGUoKSwgcCwgMik7XG4gICAgICB9LFxuICAgICAgSDogZnVuY3Rpb24oZCwgcCkge1xuICAgICAgICByZXR1cm4gZDNfdGltZV9mb3JtYXRQYWQoZC5nZXRIb3VycygpLCBwLCAyKTtcbiAgICAgIH0sXG4gICAgICBJOiBmdW5jdGlvbihkLCBwKSB7XG4gICAgICAgIHJldHVybiBkM190aW1lX2Zvcm1hdFBhZChkLmdldEhvdXJzKCkgJSAxMiB8fCAxMiwgcCwgMik7XG4gICAgICB9LFxuICAgICAgajogZnVuY3Rpb24oZCwgcCkge1xuICAgICAgICByZXR1cm4gZDNfdGltZV9mb3JtYXRQYWQoMSArIGQzX3RpbWUuZGF5T2ZZZWFyKGQpLCBwLCAzKTtcbiAgICAgIH0sXG4gICAgICBMOiBmdW5jdGlvbihkLCBwKSB7XG4gICAgICAgIHJldHVybiBkM190aW1lX2Zvcm1hdFBhZChkLmdldE1pbGxpc2Vjb25kcygpLCBwLCAzKTtcbiAgICAgIH0sXG4gICAgICBtOiBmdW5jdGlvbihkLCBwKSB7XG4gICAgICAgIHJldHVybiBkM190aW1lX2Zvcm1hdFBhZChkLmdldE1vbnRoKCkgKyAxLCBwLCAyKTtcbiAgICAgIH0sXG4gICAgICBNOiBmdW5jdGlvbihkLCBwKSB7XG4gICAgICAgIHJldHVybiBkM190aW1lX2Zvcm1hdFBhZChkLmdldE1pbnV0ZXMoKSwgcCwgMik7XG4gICAgICB9LFxuICAgICAgcDogZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gbG9jYWxlX3BlcmlvZHNbKyhkLmdldEhvdXJzKCkgPj0gMTIpXTtcbiAgICAgIH0sXG4gICAgICBTOiBmdW5jdGlvbihkLCBwKSB7XG4gICAgICAgIHJldHVybiBkM190aW1lX2Zvcm1hdFBhZChkLmdldFNlY29uZHMoKSwgcCwgMik7XG4gICAgICB9LFxuICAgICAgVTogZnVuY3Rpb24oZCwgcCkge1xuICAgICAgICByZXR1cm4gZDNfdGltZV9mb3JtYXRQYWQoZDNfdGltZS5zdW5kYXlPZlllYXIoZCksIHAsIDIpO1xuICAgICAgfSxcbiAgICAgIHc6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIGQuZ2V0RGF5KCk7XG4gICAgICB9LFxuICAgICAgVzogZnVuY3Rpb24oZCwgcCkge1xuICAgICAgICByZXR1cm4gZDNfdGltZV9mb3JtYXRQYWQoZDNfdGltZS5tb25kYXlPZlllYXIoZCksIHAsIDIpO1xuICAgICAgfSxcbiAgICAgIHg6IGQzX3RpbWVfZm9ybWF0KGxvY2FsZV9kYXRlKSxcbiAgICAgIFg6IGQzX3RpbWVfZm9ybWF0KGxvY2FsZV90aW1lKSxcbiAgICAgIHk6IGZ1bmN0aW9uKGQsIHApIHtcbiAgICAgICAgcmV0dXJuIGQzX3RpbWVfZm9ybWF0UGFkKGQuZ2V0RnVsbFllYXIoKSAlIDEwMCwgcCwgMik7XG4gICAgICB9LFxuICAgICAgWTogZnVuY3Rpb24oZCwgcCkge1xuICAgICAgICByZXR1cm4gZDNfdGltZV9mb3JtYXRQYWQoZC5nZXRGdWxsWWVhcigpICUgMWU0LCBwLCA0KTtcbiAgICAgIH0sXG4gICAgICBaOiBkM190aW1lX3pvbmUsXG4gICAgICBcIiVcIjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBcIiVcIjtcbiAgICAgIH1cbiAgICB9O1xuICAgIHZhciBkM190aW1lX3BhcnNlcnMgPSB7XG4gICAgICBhOiBkM190aW1lX3BhcnNlV2Vla2RheUFiYnJldixcbiAgICAgIEE6IGQzX3RpbWVfcGFyc2VXZWVrZGF5LFxuICAgICAgYjogZDNfdGltZV9wYXJzZU1vbnRoQWJicmV2LFxuICAgICAgQjogZDNfdGltZV9wYXJzZU1vbnRoLFxuICAgICAgYzogZDNfdGltZV9wYXJzZUxvY2FsZUZ1bGwsXG4gICAgICBkOiBkM190aW1lX3BhcnNlRGF5LFxuICAgICAgZTogZDNfdGltZV9wYXJzZURheSxcbiAgICAgIEg6IGQzX3RpbWVfcGFyc2VIb3VyMjQsXG4gICAgICBJOiBkM190aW1lX3BhcnNlSG91cjI0LFxuICAgICAgajogZDNfdGltZV9wYXJzZURheU9mWWVhcixcbiAgICAgIEw6IGQzX3RpbWVfcGFyc2VNaWxsaXNlY29uZHMsXG4gICAgICBtOiBkM190aW1lX3BhcnNlTW9udGhOdW1iZXIsXG4gICAgICBNOiBkM190aW1lX3BhcnNlTWludXRlcyxcbiAgICAgIHA6IGQzX3RpbWVfcGFyc2VBbVBtLFxuICAgICAgUzogZDNfdGltZV9wYXJzZVNlY29uZHMsXG4gICAgICBVOiBkM190aW1lX3BhcnNlV2Vla051bWJlclN1bmRheSxcbiAgICAgIHc6IGQzX3RpbWVfcGFyc2VXZWVrZGF5TnVtYmVyLFxuICAgICAgVzogZDNfdGltZV9wYXJzZVdlZWtOdW1iZXJNb25kYXksXG4gICAgICB4OiBkM190aW1lX3BhcnNlTG9jYWxlRGF0ZSxcbiAgICAgIFg6IGQzX3RpbWVfcGFyc2VMb2NhbGVUaW1lLFxuICAgICAgeTogZDNfdGltZV9wYXJzZVllYXIsXG4gICAgICBZOiBkM190aW1lX3BhcnNlRnVsbFllYXIsXG4gICAgICBaOiBkM190aW1lX3BhcnNlWm9uZSxcbiAgICAgIFwiJVwiOiBkM190aW1lX3BhcnNlTGl0ZXJhbFBlcmNlbnRcbiAgICB9O1xuICAgIGZ1bmN0aW9uIGQzX3RpbWVfcGFyc2VXZWVrZGF5QWJicmV2KGRhdGUsIHN0cmluZywgaSkge1xuICAgICAgZDNfdGltZV9kYXlBYmJyZXZSZS5sYXN0SW5kZXggPSAwO1xuICAgICAgdmFyIG4gPSBkM190aW1lX2RheUFiYnJldlJlLmV4ZWMoc3RyaW5nLnNsaWNlKGkpKTtcbiAgICAgIHJldHVybiBuID8gKGRhdGUudyA9IGQzX3RpbWVfZGF5QWJicmV2TG9va3VwLmdldChuWzBdLnRvTG93ZXJDYXNlKCkpLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGQzX3RpbWVfcGFyc2VXZWVrZGF5KGRhdGUsIHN0cmluZywgaSkge1xuICAgICAgZDNfdGltZV9kYXlSZS5sYXN0SW5kZXggPSAwO1xuICAgICAgdmFyIG4gPSBkM190aW1lX2RheVJlLmV4ZWMoc3RyaW5nLnNsaWNlKGkpKTtcbiAgICAgIHJldHVybiBuID8gKGRhdGUudyA9IGQzX3RpbWVfZGF5TG9va3VwLmdldChuWzBdLnRvTG93ZXJDYXNlKCkpLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGQzX3RpbWVfcGFyc2VNb250aEFiYnJldihkYXRlLCBzdHJpbmcsIGkpIHtcbiAgICAgIGQzX3RpbWVfbW9udGhBYmJyZXZSZS5sYXN0SW5kZXggPSAwO1xuICAgICAgdmFyIG4gPSBkM190aW1lX21vbnRoQWJicmV2UmUuZXhlYyhzdHJpbmcuc2xpY2UoaSkpO1xuICAgICAgcmV0dXJuIG4gPyAoZGF0ZS5tID0gZDNfdGltZV9tb250aEFiYnJldkxvb2t1cC5nZXQoblswXS50b0xvd2VyQ2FzZSgpKSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xuICAgIH1cbiAgICBmdW5jdGlvbiBkM190aW1lX3BhcnNlTW9udGgoZGF0ZSwgc3RyaW5nLCBpKSB7XG4gICAgICBkM190aW1lX21vbnRoUmUubGFzdEluZGV4ID0gMDtcbiAgICAgIHZhciBuID0gZDNfdGltZV9tb250aFJlLmV4ZWMoc3RyaW5nLnNsaWNlKGkpKTtcbiAgICAgIHJldHVybiBuID8gKGRhdGUubSA9IGQzX3RpbWVfbW9udGhMb29rdXAuZ2V0KG5bMF0udG9Mb3dlckNhc2UoKSksIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZDNfdGltZV9wYXJzZUxvY2FsZUZ1bGwoZGF0ZSwgc3RyaW5nLCBpKSB7XG4gICAgICByZXR1cm4gZDNfdGltZV9wYXJzZShkYXRlLCBkM190aW1lX2Zvcm1hdHMuYy50b1N0cmluZygpLCBzdHJpbmcsIGkpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBkM190aW1lX3BhcnNlTG9jYWxlRGF0ZShkYXRlLCBzdHJpbmcsIGkpIHtcbiAgICAgIHJldHVybiBkM190aW1lX3BhcnNlKGRhdGUsIGQzX3RpbWVfZm9ybWF0cy54LnRvU3RyaW5nKCksIHN0cmluZywgaSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGQzX3RpbWVfcGFyc2VMb2NhbGVUaW1lKGRhdGUsIHN0cmluZywgaSkge1xuICAgICAgcmV0dXJuIGQzX3RpbWVfcGFyc2UoZGF0ZSwgZDNfdGltZV9mb3JtYXRzLlgudG9TdHJpbmcoKSwgc3RyaW5nLCBpKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZDNfdGltZV9wYXJzZUFtUG0oZGF0ZSwgc3RyaW5nLCBpKSB7XG4gICAgICB2YXIgbiA9IGQzX3RpbWVfcGVyaW9kTG9va3VwLmdldChzdHJpbmcuc2xpY2UoaSwgaSArPSAyKS50b0xvd2VyQ2FzZSgpKTtcbiAgICAgIHJldHVybiBuID09IG51bGwgPyAtMSA6IChkYXRlLnAgPSBuLCBpKTtcbiAgICB9XG4gICAgcmV0dXJuIGQzX3RpbWVfZm9ybWF0O1xuICB9XG4gIHZhciBkM190aW1lX2Zvcm1hdFBhZHMgPSB7XG4gICAgXCItXCI6IFwiXCIsXG4gICAgXzogXCIgXCIsXG4gICAgXCIwXCI6IFwiMFwiXG4gIH0sIGQzX3RpbWVfbnVtYmVyUmUgPSAvXlxccypcXGQrLywgZDNfdGltZV9wZXJjZW50UmUgPSAvXiUvO1xuICBmdW5jdGlvbiBkM190aW1lX2Zvcm1hdFBhZCh2YWx1ZSwgZmlsbCwgd2lkdGgpIHtcbiAgICB2YXIgc2lnbiA9IHZhbHVlIDwgMCA/IFwiLVwiIDogXCJcIiwgc3RyaW5nID0gKHNpZ24gPyAtdmFsdWUgOiB2YWx1ZSkgKyBcIlwiLCBsZW5ndGggPSBzdHJpbmcubGVuZ3RoO1xuICAgIHJldHVybiBzaWduICsgKGxlbmd0aCA8IHdpZHRoID8gbmV3IEFycmF5KHdpZHRoIC0gbGVuZ3RoICsgMSkuam9pbihmaWxsKSArIHN0cmluZyA6IHN0cmluZyk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfdGltZV9mb3JtYXRSZShuYW1lcykge1xuICAgIHJldHVybiBuZXcgUmVnRXhwKFwiXig/OlwiICsgbmFtZXMubWFwKGQzLnJlcXVvdGUpLmpvaW4oXCJ8XCIpICsgXCIpXCIsIFwiaVwiKTtcbiAgfVxuICBmdW5jdGlvbiBkM190aW1lX2Zvcm1hdExvb2t1cChuYW1lcykge1xuICAgIHZhciBtYXAgPSBuZXcgZDNfTWFwKCksIGkgPSAtMSwgbiA9IG5hbWVzLmxlbmd0aDtcbiAgICB3aGlsZSAoKytpIDwgbikgbWFwLnNldChuYW1lc1tpXS50b0xvd2VyQ2FzZSgpLCBpKTtcbiAgICByZXR1cm4gbWFwO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3RpbWVfcGFyc2VXZWVrZGF5TnVtYmVyKGRhdGUsIHN0cmluZywgaSkge1xuICAgIGQzX3RpbWVfbnVtYmVyUmUubGFzdEluZGV4ID0gMDtcbiAgICB2YXIgbiA9IGQzX3RpbWVfbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDEpKTtcbiAgICByZXR1cm4gbiA/IChkYXRlLncgPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3RpbWVfcGFyc2VXZWVrTnVtYmVyU3VuZGF5KGRhdGUsIHN0cmluZywgaSkge1xuICAgIGQzX3RpbWVfbnVtYmVyUmUubGFzdEluZGV4ID0gMDtcbiAgICB2YXIgbiA9IGQzX3RpbWVfbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSkpO1xuICAgIHJldHVybiBuID8gKGRhdGUuVSA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG4gIH1cbiAgZnVuY3Rpb24gZDNfdGltZV9wYXJzZVdlZWtOdW1iZXJNb25kYXkoZGF0ZSwgc3RyaW5nLCBpKSB7XG4gICAgZDNfdGltZV9udW1iZXJSZS5sYXN0SW5kZXggPSAwO1xuICAgIHZhciBuID0gZDNfdGltZV9udW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpKSk7XG4gICAgcmV0dXJuIG4gPyAoZGF0ZS5XID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbiAgfVxuICBmdW5jdGlvbiBkM190aW1lX3BhcnNlRnVsbFllYXIoZGF0ZSwgc3RyaW5nLCBpKSB7XG4gICAgZDNfdGltZV9udW1iZXJSZS5sYXN0SW5kZXggPSAwO1xuICAgIHZhciBuID0gZDNfdGltZV9udW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgNCkpO1xuICAgIHJldHVybiBuID8gKGRhdGUueSA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG4gIH1cbiAgZnVuY3Rpb24gZDNfdGltZV9wYXJzZVllYXIoZGF0ZSwgc3RyaW5nLCBpKSB7XG4gICAgZDNfdGltZV9udW1iZXJSZS5sYXN0SW5kZXggPSAwO1xuICAgIHZhciBuID0gZDNfdGltZV9udW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgMikpO1xuICAgIHJldHVybiBuID8gKGRhdGUueSA9IGQzX3RpbWVfZXhwYW5kWWVhcigrblswXSksIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbiAgfVxuICBmdW5jdGlvbiBkM190aW1lX3BhcnNlWm9uZShkYXRlLCBzdHJpbmcsIGkpIHtcbiAgICByZXR1cm4gL15bKy1dXFxkezR9JC8udGVzdChzdHJpbmcgPSBzdHJpbmcuc2xpY2UoaSwgaSArIDUpKSA/IChkYXRlLlogPSAtc3RyaW5nLCBcbiAgICBpICsgNSkgOiAtMTtcbiAgfVxuICBmdW5jdGlvbiBkM190aW1lX2V4cGFuZFllYXIoZCkge1xuICAgIHJldHVybiBkICsgKGQgPiA2OCA/IDE5MDAgOiAyZTMpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3RpbWVfcGFyc2VNb250aE51bWJlcihkYXRlLCBzdHJpbmcsIGkpIHtcbiAgICBkM190aW1lX251bWJlclJlLmxhc3RJbmRleCA9IDA7XG4gICAgdmFyIG4gPSBkM190aW1lX251bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAyKSk7XG4gICAgcmV0dXJuIG4gPyAoZGF0ZS5tID0gblswXSAtIDEsIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbiAgfVxuICBmdW5jdGlvbiBkM190aW1lX3BhcnNlRGF5KGRhdGUsIHN0cmluZywgaSkge1xuICAgIGQzX3RpbWVfbnVtYmVyUmUubGFzdEluZGV4ID0gMDtcbiAgICB2YXIgbiA9IGQzX3RpbWVfbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDIpKTtcbiAgICByZXR1cm4gbiA/IChkYXRlLmQgPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3RpbWVfcGFyc2VEYXlPZlllYXIoZGF0ZSwgc3RyaW5nLCBpKSB7XG4gICAgZDNfdGltZV9udW1iZXJSZS5sYXN0SW5kZXggPSAwO1xuICAgIHZhciBuID0gZDNfdGltZV9udW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgMykpO1xuICAgIHJldHVybiBuID8gKGRhdGUuaiA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG4gIH1cbiAgZnVuY3Rpb24gZDNfdGltZV9wYXJzZUhvdXIyNChkYXRlLCBzdHJpbmcsIGkpIHtcbiAgICBkM190aW1lX251bWJlclJlLmxhc3RJbmRleCA9IDA7XG4gICAgdmFyIG4gPSBkM190aW1lX251bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAyKSk7XG4gICAgcmV0dXJuIG4gPyAoZGF0ZS5IID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbiAgfVxuICBmdW5jdGlvbiBkM190aW1lX3BhcnNlTWludXRlcyhkYXRlLCBzdHJpbmcsIGkpIHtcbiAgICBkM190aW1lX251bWJlclJlLmxhc3RJbmRleCA9IDA7XG4gICAgdmFyIG4gPSBkM190aW1lX251bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAyKSk7XG4gICAgcmV0dXJuIG4gPyAoZGF0ZS5NID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbiAgfVxuICBmdW5jdGlvbiBkM190aW1lX3BhcnNlU2Vjb25kcyhkYXRlLCBzdHJpbmcsIGkpIHtcbiAgICBkM190aW1lX251bWJlclJlLmxhc3RJbmRleCA9IDA7XG4gICAgdmFyIG4gPSBkM190aW1lX251bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAyKSk7XG4gICAgcmV0dXJuIG4gPyAoZGF0ZS5TID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbiAgfVxuICBmdW5jdGlvbiBkM190aW1lX3BhcnNlTWlsbGlzZWNvbmRzKGRhdGUsIHN0cmluZywgaSkge1xuICAgIGQzX3RpbWVfbnVtYmVyUmUubGFzdEluZGV4ID0gMDtcbiAgICB2YXIgbiA9IGQzX3RpbWVfbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDMpKTtcbiAgICByZXR1cm4gbiA/IChkYXRlLkwgPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3RpbWVfem9uZShkKSB7XG4gICAgdmFyIHogPSBkLmdldFRpbWV6b25lT2Zmc2V0KCksIHpzID0geiA+IDAgPyBcIi1cIiA6IFwiK1wiLCB6aCA9IGFicyh6KSAvIDYwIHwgMCwgem0gPSBhYnMoeikgJSA2MDtcbiAgICByZXR1cm4genMgKyBkM190aW1lX2Zvcm1hdFBhZCh6aCwgXCIwXCIsIDIpICsgZDNfdGltZV9mb3JtYXRQYWQoem0sIFwiMFwiLCAyKTtcbiAgfVxuICBmdW5jdGlvbiBkM190aW1lX3BhcnNlTGl0ZXJhbFBlcmNlbnQoZGF0ZSwgc3RyaW5nLCBpKSB7XG4gICAgZDNfdGltZV9wZXJjZW50UmUubGFzdEluZGV4ID0gMDtcbiAgICB2YXIgbiA9IGQzX3RpbWVfcGVyY2VudFJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAxKSk7XG4gICAgcmV0dXJuIG4gPyBpICsgblswXS5sZW5ndGggOiAtMTtcbiAgfVxuICBmdW5jdGlvbiBkM190aW1lX2Zvcm1hdE11bHRpKGZvcm1hdHMpIHtcbiAgICB2YXIgbiA9IGZvcm1hdHMubGVuZ3RoLCBpID0gLTE7XG4gICAgd2hpbGUgKCsraSA8IG4pIGZvcm1hdHNbaV1bMF0gPSB0aGlzKGZvcm1hdHNbaV1bMF0pO1xuICAgIHJldHVybiBmdW5jdGlvbihkYXRlKSB7XG4gICAgICB2YXIgaSA9IDAsIGYgPSBmb3JtYXRzW2ldO1xuICAgICAgd2hpbGUgKCFmWzFdKGRhdGUpKSBmID0gZm9ybWF0c1srK2ldO1xuICAgICAgcmV0dXJuIGZbMF0oZGF0ZSk7XG4gICAgfTtcbiAgfVxuICBkMy5sb2NhbGUgPSBmdW5jdGlvbihsb2NhbGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbnVtYmVyRm9ybWF0OiBkM19sb2NhbGVfbnVtYmVyRm9ybWF0KGxvY2FsZSksXG4gICAgICB0aW1lRm9ybWF0OiBkM19sb2NhbGVfdGltZUZvcm1hdChsb2NhbGUpXG4gICAgfTtcbiAgfTtcbiAgdmFyIGQzX2xvY2FsZV9lblVTID0gZDMubG9jYWxlKHtcbiAgICBkZWNpbWFsOiBcIi5cIixcbiAgICB0aG91c2FuZHM6IFwiLFwiLFxuICAgIGdyb3VwaW5nOiBbIDMgXSxcbiAgICBjdXJyZW5jeTogWyBcIiRcIiwgXCJcIiBdLFxuICAgIGRhdGVUaW1lOiBcIiVhICViICVlICVYICVZXCIsXG4gICAgZGF0ZTogXCIlbS8lZC8lWVwiLFxuICAgIHRpbWU6IFwiJUg6JU06JVNcIixcbiAgICBwZXJpb2RzOiBbIFwiQU1cIiwgXCJQTVwiIF0sXG4gICAgZGF5czogWyBcIlN1bmRheVwiLCBcIk1vbmRheVwiLCBcIlR1ZXNkYXlcIiwgXCJXZWRuZXNkYXlcIiwgXCJUaHVyc2RheVwiLCBcIkZyaWRheVwiLCBcIlNhdHVyZGF5XCIgXSxcbiAgICBzaG9ydERheXM6IFsgXCJTdW5cIiwgXCJNb25cIiwgXCJUdWVcIiwgXCJXZWRcIiwgXCJUaHVcIiwgXCJGcmlcIiwgXCJTYXRcIiBdLFxuICAgIG1vbnRoczogWyBcIkphbnVhcnlcIiwgXCJGZWJydWFyeVwiLCBcIk1hcmNoXCIsIFwiQXByaWxcIiwgXCJNYXlcIiwgXCJKdW5lXCIsIFwiSnVseVwiLCBcIkF1Z3VzdFwiLCBcIlNlcHRlbWJlclwiLCBcIk9jdG9iZXJcIiwgXCJOb3ZlbWJlclwiLCBcIkRlY2VtYmVyXCIgXSxcbiAgICBzaG9ydE1vbnRoczogWyBcIkphblwiLCBcIkZlYlwiLCBcIk1hclwiLCBcIkFwclwiLCBcIk1heVwiLCBcIkp1blwiLCBcIkp1bFwiLCBcIkF1Z1wiLCBcIlNlcFwiLCBcIk9jdFwiLCBcIk5vdlwiLCBcIkRlY1wiIF1cbiAgfSk7XG4gIGQzLmZvcm1hdCA9IGQzX2xvY2FsZV9lblVTLm51bWJlckZvcm1hdDtcbiAgZDMuZ2VvID0ge307XG4gIGZ1bmN0aW9uIGQzX2FkZGVyKCkge31cbiAgZDNfYWRkZXIucHJvdG90eXBlID0ge1xuICAgIHM6IDAsXG4gICAgdDogMCxcbiAgICBhZGQ6IGZ1bmN0aW9uKHkpIHtcbiAgICAgIGQzX2FkZGVyU3VtKHksIHRoaXMudCwgZDNfYWRkZXJUZW1wKTtcbiAgICAgIGQzX2FkZGVyU3VtKGQzX2FkZGVyVGVtcC5zLCB0aGlzLnMsIHRoaXMpO1xuICAgICAgaWYgKHRoaXMucykgdGhpcy50ICs9IGQzX2FkZGVyVGVtcC50OyBlbHNlIHRoaXMucyA9IGQzX2FkZGVyVGVtcC50O1xuICAgIH0sXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zID0gdGhpcy50ID0gMDtcbiAgICB9LFxuICAgIHZhbHVlT2Y6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMucztcbiAgICB9XG4gIH07XG4gIHZhciBkM19hZGRlclRlbXAgPSBuZXcgZDNfYWRkZXIoKTtcbiAgZnVuY3Rpb24gZDNfYWRkZXJTdW0oYSwgYiwgbykge1xuICAgIHZhciB4ID0gby5zID0gYSArIGIsIGJ2ID0geCAtIGEsIGF2ID0geCAtIGJ2O1xuICAgIG8udCA9IGEgLSBhdiArIChiIC0gYnYpO1xuICB9XG4gIGQzLmdlby5zdHJlYW0gPSBmdW5jdGlvbihvYmplY3QsIGxpc3RlbmVyKSB7XG4gICAgaWYgKG9iamVjdCAmJiBkM19nZW9fc3RyZWFtT2JqZWN0VHlwZS5oYXNPd25Qcm9wZXJ0eShvYmplY3QudHlwZSkpIHtcbiAgICAgIGQzX2dlb19zdHJlYW1PYmplY3RUeXBlW29iamVjdC50eXBlXShvYmplY3QsIGxpc3RlbmVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZDNfZ2VvX3N0cmVhbUdlb21ldHJ5KG9iamVjdCwgbGlzdGVuZXIpO1xuICAgIH1cbiAgfTtcbiAgZnVuY3Rpb24gZDNfZ2VvX3N0cmVhbUdlb21ldHJ5KGdlb21ldHJ5LCBsaXN0ZW5lcikge1xuICAgIGlmIChnZW9tZXRyeSAmJiBkM19nZW9fc3RyZWFtR2VvbWV0cnlUeXBlLmhhc093blByb3BlcnR5KGdlb21ldHJ5LnR5cGUpKSB7XG4gICAgICBkM19nZW9fc3RyZWFtR2VvbWV0cnlUeXBlW2dlb21ldHJ5LnR5cGVdKGdlb21ldHJ5LCBsaXN0ZW5lcik7XG4gICAgfVxuICB9XG4gIHZhciBkM19nZW9fc3RyZWFtT2JqZWN0VHlwZSA9IHtcbiAgICBGZWF0dXJlOiBmdW5jdGlvbihmZWF0dXJlLCBsaXN0ZW5lcikge1xuICAgICAgZDNfZ2VvX3N0cmVhbUdlb21ldHJ5KGZlYXR1cmUuZ2VvbWV0cnksIGxpc3RlbmVyKTtcbiAgICB9LFxuICAgIEZlYXR1cmVDb2xsZWN0aW9uOiBmdW5jdGlvbihvYmplY3QsIGxpc3RlbmVyKSB7XG4gICAgICB2YXIgZmVhdHVyZXMgPSBvYmplY3QuZmVhdHVyZXMsIGkgPSAtMSwgbiA9IGZlYXR1cmVzLmxlbmd0aDtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSBkM19nZW9fc3RyZWFtR2VvbWV0cnkoZmVhdHVyZXNbaV0uZ2VvbWV0cnksIGxpc3RlbmVyKTtcbiAgICB9XG4gIH07XG4gIHZhciBkM19nZW9fc3RyZWFtR2VvbWV0cnlUeXBlID0ge1xuICAgIFNwaGVyZTogZnVuY3Rpb24ob2JqZWN0LCBsaXN0ZW5lcikge1xuICAgICAgbGlzdGVuZXIuc3BoZXJlKCk7XG4gICAgfSxcbiAgICBQb2ludDogZnVuY3Rpb24ob2JqZWN0LCBsaXN0ZW5lcikge1xuICAgICAgb2JqZWN0ID0gb2JqZWN0LmNvb3JkaW5hdGVzO1xuICAgICAgbGlzdGVuZXIucG9pbnQob2JqZWN0WzBdLCBvYmplY3RbMV0sIG9iamVjdFsyXSk7XG4gICAgfSxcbiAgICBNdWx0aVBvaW50OiBmdW5jdGlvbihvYmplY3QsIGxpc3RlbmVyKSB7XG4gICAgICB2YXIgY29vcmRpbmF0ZXMgPSBvYmplY3QuY29vcmRpbmF0ZXMsIGkgPSAtMSwgbiA9IGNvb3JkaW5hdGVzLmxlbmd0aDtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSBvYmplY3QgPSBjb29yZGluYXRlc1tpXSwgbGlzdGVuZXIucG9pbnQob2JqZWN0WzBdLCBvYmplY3RbMV0sIG9iamVjdFsyXSk7XG4gICAgfSxcbiAgICBMaW5lU3RyaW5nOiBmdW5jdGlvbihvYmplY3QsIGxpc3RlbmVyKSB7XG4gICAgICBkM19nZW9fc3RyZWFtTGluZShvYmplY3QuY29vcmRpbmF0ZXMsIGxpc3RlbmVyLCAwKTtcbiAgICB9LFxuICAgIE11bHRpTGluZVN0cmluZzogZnVuY3Rpb24ob2JqZWN0LCBsaXN0ZW5lcikge1xuICAgICAgdmFyIGNvb3JkaW5hdGVzID0gb2JqZWN0LmNvb3JkaW5hdGVzLCBpID0gLTEsIG4gPSBjb29yZGluYXRlcy5sZW5ndGg7XG4gICAgICB3aGlsZSAoKytpIDwgbikgZDNfZ2VvX3N0cmVhbUxpbmUoY29vcmRpbmF0ZXNbaV0sIGxpc3RlbmVyLCAwKTtcbiAgICB9LFxuICAgIFBvbHlnb246IGZ1bmN0aW9uKG9iamVjdCwgbGlzdGVuZXIpIHtcbiAgICAgIGQzX2dlb19zdHJlYW1Qb2x5Z29uKG9iamVjdC5jb29yZGluYXRlcywgbGlzdGVuZXIpO1xuICAgIH0sXG4gICAgTXVsdGlQb2x5Z29uOiBmdW5jdGlvbihvYmplY3QsIGxpc3RlbmVyKSB7XG4gICAgICB2YXIgY29vcmRpbmF0ZXMgPSBvYmplY3QuY29vcmRpbmF0ZXMsIGkgPSAtMSwgbiA9IGNvb3JkaW5hdGVzLmxlbmd0aDtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSBkM19nZW9fc3RyZWFtUG9seWdvbihjb29yZGluYXRlc1tpXSwgbGlzdGVuZXIpO1xuICAgIH0sXG4gICAgR2VvbWV0cnlDb2xsZWN0aW9uOiBmdW5jdGlvbihvYmplY3QsIGxpc3RlbmVyKSB7XG4gICAgICB2YXIgZ2VvbWV0cmllcyA9IG9iamVjdC5nZW9tZXRyaWVzLCBpID0gLTEsIG4gPSBnZW9tZXRyaWVzLmxlbmd0aDtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSBkM19nZW9fc3RyZWFtR2VvbWV0cnkoZ2VvbWV0cmllc1tpXSwgbGlzdGVuZXIpO1xuICAgIH1cbiAgfTtcbiAgZnVuY3Rpb24gZDNfZ2VvX3N0cmVhbUxpbmUoY29vcmRpbmF0ZXMsIGxpc3RlbmVyLCBjbG9zZWQpIHtcbiAgICB2YXIgaSA9IC0xLCBuID0gY29vcmRpbmF0ZXMubGVuZ3RoIC0gY2xvc2VkLCBjb29yZGluYXRlO1xuICAgIGxpc3RlbmVyLmxpbmVTdGFydCgpO1xuICAgIHdoaWxlICgrK2kgPCBuKSBjb29yZGluYXRlID0gY29vcmRpbmF0ZXNbaV0sIGxpc3RlbmVyLnBvaW50KGNvb3JkaW5hdGVbMF0sIGNvb3JkaW5hdGVbMV0sIGNvb3JkaW5hdGVbMl0pO1xuICAgIGxpc3RlbmVyLmxpbmVFbmQoKTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fc3RyZWFtUG9seWdvbihjb29yZGluYXRlcywgbGlzdGVuZXIpIHtcbiAgICB2YXIgaSA9IC0xLCBuID0gY29vcmRpbmF0ZXMubGVuZ3RoO1xuICAgIGxpc3RlbmVyLnBvbHlnb25TdGFydCgpO1xuICAgIHdoaWxlICgrK2kgPCBuKSBkM19nZW9fc3RyZWFtTGluZShjb29yZGluYXRlc1tpXSwgbGlzdGVuZXIsIDEpO1xuICAgIGxpc3RlbmVyLnBvbHlnb25FbmQoKTtcbiAgfVxuICBkMy5nZW8uYXJlYSA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIGQzX2dlb19hcmVhU3VtID0gMDtcbiAgICBkMy5nZW8uc3RyZWFtKG9iamVjdCwgZDNfZ2VvX2FyZWEpO1xuICAgIHJldHVybiBkM19nZW9fYXJlYVN1bTtcbiAgfTtcbiAgdmFyIGQzX2dlb19hcmVhU3VtLCBkM19nZW9fYXJlYVJpbmdTdW0gPSBuZXcgZDNfYWRkZXIoKTtcbiAgdmFyIGQzX2dlb19hcmVhID0ge1xuICAgIHNwaGVyZTogZnVuY3Rpb24oKSB7XG4gICAgICBkM19nZW9fYXJlYVN1bSArPSA0ICogz4A7XG4gICAgfSxcbiAgICBwb2ludDogZDNfbm9vcCxcbiAgICBsaW5lU3RhcnQ6IGQzX25vb3AsXG4gICAgbGluZUVuZDogZDNfbm9vcCxcbiAgICBwb2x5Z29uU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgZDNfZ2VvX2FyZWFSaW5nU3VtLnJlc2V0KCk7XG4gICAgICBkM19nZW9fYXJlYS5saW5lU3RhcnQgPSBkM19nZW9fYXJlYVJpbmdTdGFydDtcbiAgICB9LFxuICAgIHBvbHlnb25FbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFyZWEgPSAyICogZDNfZ2VvX2FyZWFSaW5nU3VtO1xuICAgICAgZDNfZ2VvX2FyZWFTdW0gKz0gYXJlYSA8IDAgPyA0ICogz4AgKyBhcmVhIDogYXJlYTtcbiAgICAgIGQzX2dlb19hcmVhLmxpbmVTdGFydCA9IGQzX2dlb19hcmVhLmxpbmVFbmQgPSBkM19nZW9fYXJlYS5wb2ludCA9IGQzX25vb3A7XG4gICAgfVxuICB9O1xuICBmdW5jdGlvbiBkM19nZW9fYXJlYVJpbmdTdGFydCgpIHtcbiAgICB2YXIgzrswMCwgz4YwMCwgzrswLCBjb3PPhjAsIHNpbs+GMDtcbiAgICBkM19nZW9fYXJlYS5wb2ludCA9IGZ1bmN0aW9uKM67LCDPhikge1xuICAgICAgZDNfZ2VvX2FyZWEucG9pbnQgPSBuZXh0UG9pbnQ7XG4gICAgICDOuzAgPSAozrswMCA9IM67KSAqIGQzX3JhZGlhbnMsIGNvc8+GMCA9IE1hdGguY29zKM+GID0gKM+GMDAgPSDPhikgKiBkM19yYWRpYW5zIC8gMiArIM+AIC8gNCksIFxuICAgICAgc2luz4YwID0gTWF0aC5zaW4oz4YpO1xuICAgIH07XG4gICAgZnVuY3Rpb24gbmV4dFBvaW50KM67LCDPhikge1xuICAgICAgzrsgKj0gZDNfcmFkaWFucztcbiAgICAgIM+GID0gz4YgKiBkM19yYWRpYW5zIC8gMiArIM+AIC8gNDtcbiAgICAgIHZhciBkzrsgPSDOuyAtIM67MCwgc2TOuyA9IGTOuyA+PSAwID8gMSA6IC0xLCBhZM67ID0gc2TOuyAqIGTOuywgY29zz4YgPSBNYXRoLmNvcyjPhiksIHNpbs+GID0gTWF0aC5zaW4oz4YpLCBrID0gc2luz4YwICogc2luz4YsIHUgPSBjb3PPhjAgKiBjb3PPhiArIGsgKiBNYXRoLmNvcyhhZM67KSwgdiA9IGsgKiBzZM67ICogTWF0aC5zaW4oYWTOuyk7XG4gICAgICBkM19nZW9fYXJlYVJpbmdTdW0uYWRkKE1hdGguYXRhbjIodiwgdSkpO1xuICAgICAgzrswID0gzrssIGNvc8+GMCA9IGNvc8+GLCBzaW7PhjAgPSBzaW7PhjtcbiAgICB9XG4gICAgZDNfZ2VvX2FyZWEubGluZUVuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgbmV4dFBvaW50KM67MDAsIM+GMDApO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvX2NhcnRlc2lhbihzcGhlcmljYWwpIHtcbiAgICB2YXIgzrsgPSBzcGhlcmljYWxbMF0sIM+GID0gc3BoZXJpY2FsWzFdLCBjb3PPhiA9IE1hdGguY29zKM+GKTtcbiAgICByZXR1cm4gWyBjb3PPhiAqIE1hdGguY29zKM67KSwgY29zz4YgKiBNYXRoLnNpbijOuyksIE1hdGguc2luKM+GKSBdO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb19jYXJ0ZXNpYW5Eb3QoYSwgYikge1xuICAgIHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdICsgYVsyXSAqIGJbMl07XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvX2NhcnRlc2lhbkNyb3NzKGEsIGIpIHtcbiAgICByZXR1cm4gWyBhWzFdICogYlsyXSAtIGFbMl0gKiBiWzFdLCBhWzJdICogYlswXSAtIGFbMF0gKiBiWzJdLCBhWzBdICogYlsxXSAtIGFbMV0gKiBiWzBdIF07XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvX2NhcnRlc2lhbkFkZChhLCBiKSB7XG4gICAgYVswXSArPSBiWzBdO1xuICAgIGFbMV0gKz0gYlsxXTtcbiAgICBhWzJdICs9IGJbMl07XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvX2NhcnRlc2lhblNjYWxlKHZlY3Rvciwgaykge1xuICAgIHJldHVybiBbIHZlY3RvclswXSAqIGssIHZlY3RvclsxXSAqIGssIHZlY3RvclsyXSAqIGsgXTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fY2FydGVzaWFuTm9ybWFsaXplKGQpIHtcbiAgICB2YXIgbCA9IE1hdGguc3FydChkWzBdICogZFswXSArIGRbMV0gKiBkWzFdICsgZFsyXSAqIGRbMl0pO1xuICAgIGRbMF0gLz0gbDtcbiAgICBkWzFdIC89IGw7XG4gICAgZFsyXSAvPSBsO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb19zcGhlcmljYWwoY2FydGVzaWFuKSB7XG4gICAgcmV0dXJuIFsgTWF0aC5hdGFuMihjYXJ0ZXNpYW5bMV0sIGNhcnRlc2lhblswXSksIGQzX2FzaW4oY2FydGVzaWFuWzJdKSBdO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb19zcGhlcmljYWxFcXVhbChhLCBiKSB7XG4gICAgcmV0dXJuIGFicyhhWzBdIC0gYlswXSkgPCDOtSAmJiBhYnMoYVsxXSAtIGJbMV0pIDwgzrU7XG4gIH1cbiAgZDMuZ2VvLmJvdW5kcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciDOuzAsIM+GMCwgzrsxLCDPhjEsIM67XywgzrtfXywgz4ZfXywgcDAsIGTOu1N1bSwgcmFuZ2VzLCByYW5nZTtcbiAgICB2YXIgYm91bmQgPSB7XG4gICAgICBwb2ludDogcG9pbnQsXG4gICAgICBsaW5lU3RhcnQ6IGxpbmVTdGFydCxcbiAgICAgIGxpbmVFbmQ6IGxpbmVFbmQsXG4gICAgICBwb2x5Z29uU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBib3VuZC5wb2ludCA9IHJpbmdQb2ludDtcbiAgICAgICAgYm91bmQubGluZVN0YXJ0ID0gcmluZ1N0YXJ0O1xuICAgICAgICBib3VuZC5saW5lRW5kID0gcmluZ0VuZDtcbiAgICAgICAgZM67U3VtID0gMDtcbiAgICAgICAgZDNfZ2VvX2FyZWEucG9seWdvblN0YXJ0KCk7XG4gICAgICB9LFxuICAgICAgcG9seWdvbkVuZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGQzX2dlb19hcmVhLnBvbHlnb25FbmQoKTtcbiAgICAgICAgYm91bmQucG9pbnQgPSBwb2ludDtcbiAgICAgICAgYm91bmQubGluZVN0YXJ0ID0gbGluZVN0YXJ0O1xuICAgICAgICBib3VuZC5saW5lRW5kID0gbGluZUVuZDtcbiAgICAgICAgaWYgKGQzX2dlb19hcmVhUmluZ1N1bSA8IDApIM67MCA9IC0ozrsxID0gMTgwKSwgz4YwID0gLSjPhjEgPSA5MCk7IGVsc2UgaWYgKGTOu1N1bSA+IM61KSDPhjEgPSA5MDsgZWxzZSBpZiAoZM67U3VtIDwgLc61KSDPhjAgPSAtOTA7XG4gICAgICAgIHJhbmdlWzBdID0gzrswLCByYW5nZVsxXSA9IM67MTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGZ1bmN0aW9uIHBvaW50KM67LCDPhikge1xuICAgICAgcmFuZ2VzLnB1c2gocmFuZ2UgPSBbIM67MCA9IM67LCDOuzEgPSDOuyBdKTtcbiAgICAgIGlmICjPhiA8IM+GMCkgz4YwID0gz4Y7XG4gICAgICBpZiAoz4YgPiDPhjEpIM+GMSA9IM+GO1xuICAgIH1cbiAgICBmdW5jdGlvbiBsaW5lUG9pbnQozrssIM+GKSB7XG4gICAgICB2YXIgcCA9IGQzX2dlb19jYXJ0ZXNpYW4oWyDOuyAqIGQzX3JhZGlhbnMsIM+GICogZDNfcmFkaWFucyBdKTtcbiAgICAgIGlmIChwMCkge1xuICAgICAgICB2YXIgbm9ybWFsID0gZDNfZ2VvX2NhcnRlc2lhbkNyb3NzKHAwLCBwKSwgZXF1YXRvcmlhbCA9IFsgbm9ybWFsWzFdLCAtbm9ybWFsWzBdLCAwIF0sIGluZmxlY3Rpb24gPSBkM19nZW9fY2FydGVzaWFuQ3Jvc3MoZXF1YXRvcmlhbCwgbm9ybWFsKTtcbiAgICAgICAgZDNfZ2VvX2NhcnRlc2lhbk5vcm1hbGl6ZShpbmZsZWN0aW9uKTtcbiAgICAgICAgaW5mbGVjdGlvbiA9IGQzX2dlb19zcGhlcmljYWwoaW5mbGVjdGlvbik7XG4gICAgICAgIHZhciBkzrsgPSDOuyAtIM67XywgcyA9IGTOuyA+IDAgPyAxIDogLTEsIM67aSA9IGluZmxlY3Rpb25bMF0gKiBkM19kZWdyZWVzICogcywgYW50aW1lcmlkaWFuID0gYWJzKGTOuykgPiAxODA7XG4gICAgICAgIGlmIChhbnRpbWVyaWRpYW4gXiAocyAqIM67XyA8IM67aSAmJiDOu2kgPCBzICogzrspKSB7XG4gICAgICAgICAgdmFyIM+GaSA9IGluZmxlY3Rpb25bMV0gKiBkM19kZWdyZWVzO1xuICAgICAgICAgIGlmICjPhmkgPiDPhjEpIM+GMSA9IM+GaTtcbiAgICAgICAgfSBlbHNlIGlmICjOu2kgPSAozrtpICsgMzYwKSAlIDM2MCAtIDE4MCwgYW50aW1lcmlkaWFuIF4gKHMgKiDOu18gPCDOu2kgJiYgzrtpIDwgcyAqIM67KSkge1xuICAgICAgICAgIHZhciDPhmkgPSAtaW5mbGVjdGlvblsxXSAqIGQzX2RlZ3JlZXM7XG4gICAgICAgICAgaWYgKM+GaSA8IM+GMCkgz4YwID0gz4ZpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICjPhiA8IM+GMCkgz4YwID0gz4Y7XG4gICAgICAgICAgaWYgKM+GID4gz4YxKSDPhjEgPSDPhjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYW50aW1lcmlkaWFuKSB7XG4gICAgICAgICAgaWYgKM67IDwgzrtfKSB7XG4gICAgICAgICAgICBpZiAoYW5nbGUozrswLCDOuykgPiBhbmdsZSjOuzAsIM67MSkpIM67MSA9IM67O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoYW5nbGUozrssIM67MSkgPiBhbmdsZSjOuzAsIM67MSkpIM67MCA9IM67O1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAozrsxID49IM67MCkge1xuICAgICAgICAgICAgaWYgKM67IDwgzrswKSDOuzAgPSDOuztcbiAgICAgICAgICAgIGlmICjOuyA+IM67MSkgzrsxID0gzrs7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICjOuyA+IM67Xykge1xuICAgICAgICAgICAgICBpZiAoYW5nbGUozrswLCDOuykgPiBhbmdsZSjOuzAsIM67MSkpIM67MSA9IM67O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKGFuZ2xlKM67LCDOuzEpID4gYW5nbGUozrswLCDOuzEpKSDOuzAgPSDOuztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBvaW50KM67LCDPhik7XG4gICAgICB9XG4gICAgICBwMCA9IHAsIM67XyA9IM67O1xuICAgIH1cbiAgICBmdW5jdGlvbiBsaW5lU3RhcnQoKSB7XG4gICAgICBib3VuZC5wb2ludCA9IGxpbmVQb2ludDtcbiAgICB9XG4gICAgZnVuY3Rpb24gbGluZUVuZCgpIHtcbiAgICAgIHJhbmdlWzBdID0gzrswLCByYW5nZVsxXSA9IM67MTtcbiAgICAgIGJvdW5kLnBvaW50ID0gcG9pbnQ7XG4gICAgICBwMCA9IG51bGw7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJpbmdQb2ludCjOuywgz4YpIHtcbiAgICAgIGlmIChwMCkge1xuICAgICAgICB2YXIgZM67ID0gzrsgLSDOu187XG4gICAgICAgIGTOu1N1bSArPSBhYnMoZM67KSA+IDE4MCA/IGTOuyArIChkzrsgPiAwID8gMzYwIDogLTM2MCkgOiBkzrs7XG4gICAgICB9IGVsc2UgzrtfXyA9IM67LCDPhl9fID0gz4Y7XG4gICAgICBkM19nZW9fYXJlYS5wb2ludCjOuywgz4YpO1xuICAgICAgbGluZVBvaW50KM67LCDPhik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJpbmdTdGFydCgpIHtcbiAgICAgIGQzX2dlb19hcmVhLmxpbmVTdGFydCgpO1xuICAgIH1cbiAgICBmdW5jdGlvbiByaW5nRW5kKCkge1xuICAgICAgcmluZ1BvaW50KM67X18sIM+GX18pO1xuICAgICAgZDNfZ2VvX2FyZWEubGluZUVuZCgpO1xuICAgICAgaWYgKGFicyhkzrtTdW0pID4gzrUpIM67MCA9IC0ozrsxID0gMTgwKTtcbiAgICAgIHJhbmdlWzBdID0gzrswLCByYW5nZVsxXSA9IM67MTtcbiAgICAgIHAwID0gbnVsbDtcbiAgICB9XG4gICAgZnVuY3Rpb24gYW5nbGUozrswLCDOuzEpIHtcbiAgICAgIHJldHVybiAozrsxIC09IM67MCkgPCAwID8gzrsxICsgMzYwIDogzrsxO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjb21wYXJlUmFuZ2VzKGEsIGIpIHtcbiAgICAgIHJldHVybiBhWzBdIC0gYlswXTtcbiAgICB9XG4gICAgZnVuY3Rpb24gd2l0aGluUmFuZ2UoeCwgcmFuZ2UpIHtcbiAgICAgIHJldHVybiByYW5nZVswXSA8PSByYW5nZVsxXSA/IHJhbmdlWzBdIDw9IHggJiYgeCA8PSByYW5nZVsxXSA6IHggPCByYW5nZVswXSB8fCByYW5nZVsxXSA8IHg7XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbihmZWF0dXJlKSB7XG4gICAgICDPhjEgPSDOuzEgPSAtKM67MCA9IM+GMCA9IEluZmluaXR5KTtcbiAgICAgIHJhbmdlcyA9IFtdO1xuICAgICAgZDMuZ2VvLnN0cmVhbShmZWF0dXJlLCBib3VuZCk7XG4gICAgICB2YXIgbiA9IHJhbmdlcy5sZW5ndGg7XG4gICAgICBpZiAobikge1xuICAgICAgICByYW5nZXMuc29ydChjb21wYXJlUmFuZ2VzKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDEsIGEgPSByYW5nZXNbMF0sIGIsIG1lcmdlZCA9IFsgYSBdOyBpIDwgbjsgKytpKSB7XG4gICAgICAgICAgYiA9IHJhbmdlc1tpXTtcbiAgICAgICAgICBpZiAod2l0aGluUmFuZ2UoYlswXSwgYSkgfHwgd2l0aGluUmFuZ2UoYlsxXSwgYSkpIHtcbiAgICAgICAgICAgIGlmIChhbmdsZShhWzBdLCBiWzFdKSA+IGFuZ2xlKGFbMF0sIGFbMV0pKSBhWzFdID0gYlsxXTtcbiAgICAgICAgICAgIGlmIChhbmdsZShiWzBdLCBhWzFdKSA+IGFuZ2xlKGFbMF0sIGFbMV0pKSBhWzBdID0gYlswXTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWVyZ2VkLnB1c2goYSA9IGIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgYmVzdCA9IC1JbmZpbml0eSwgZM67O1xuICAgICAgICBmb3IgKHZhciBuID0gbWVyZ2VkLmxlbmd0aCAtIDEsIGkgPSAwLCBhID0gbWVyZ2VkW25dLCBiOyBpIDw9IG47IGEgPSBiLCArK2kpIHtcbiAgICAgICAgICBiID0gbWVyZ2VkW2ldO1xuICAgICAgICAgIGlmICgoZM67ID0gYW5nbGUoYVsxXSwgYlswXSkpID4gYmVzdCkgYmVzdCA9IGTOuywgzrswID0gYlswXSwgzrsxID0gYVsxXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmFuZ2VzID0gcmFuZ2UgPSBudWxsO1xuICAgICAgcmV0dXJuIM67MCA9PT0gSW5maW5pdHkgfHwgz4YwID09PSBJbmZpbml0eSA/IFsgWyBOYU4sIE5hTiBdLCBbIE5hTiwgTmFOIF0gXSA6IFsgWyDOuzAsIM+GMCBdLCBbIM67MSwgz4YxIF0gXTtcbiAgICB9O1xuICB9KCk7XG4gIGQzLmdlby5jZW50cm9pZCA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIGQzX2dlb19jZW50cm9pZFcwID0gZDNfZ2VvX2NlbnRyb2lkVzEgPSBkM19nZW9fY2VudHJvaWRYMCA9IGQzX2dlb19jZW50cm9pZFkwID0gZDNfZ2VvX2NlbnRyb2lkWjAgPSBkM19nZW9fY2VudHJvaWRYMSA9IGQzX2dlb19jZW50cm9pZFkxID0gZDNfZ2VvX2NlbnRyb2lkWjEgPSBkM19nZW9fY2VudHJvaWRYMiA9IGQzX2dlb19jZW50cm9pZFkyID0gZDNfZ2VvX2NlbnRyb2lkWjIgPSAwO1xuICAgIGQzLmdlby5zdHJlYW0ob2JqZWN0LCBkM19nZW9fY2VudHJvaWQpO1xuICAgIHZhciB4ID0gZDNfZ2VvX2NlbnRyb2lkWDIsIHkgPSBkM19nZW9fY2VudHJvaWRZMiwgeiA9IGQzX2dlb19jZW50cm9pZFoyLCBtID0geCAqIHggKyB5ICogeSArIHogKiB6O1xuICAgIGlmIChtIDwgzrUyKSB7XG4gICAgICB4ID0gZDNfZ2VvX2NlbnRyb2lkWDEsIHkgPSBkM19nZW9fY2VudHJvaWRZMSwgeiA9IGQzX2dlb19jZW50cm9pZFoxO1xuICAgICAgaWYgKGQzX2dlb19jZW50cm9pZFcxIDwgzrUpIHggPSBkM19nZW9fY2VudHJvaWRYMCwgeSA9IGQzX2dlb19jZW50cm9pZFkwLCB6ID0gZDNfZ2VvX2NlbnRyb2lkWjA7XG4gICAgICBtID0geCAqIHggKyB5ICogeSArIHogKiB6O1xuICAgICAgaWYgKG0gPCDOtTIpIHJldHVybiBbIE5hTiwgTmFOIF07XG4gICAgfVxuICAgIHJldHVybiBbIE1hdGguYXRhbjIoeSwgeCkgKiBkM19kZWdyZWVzLCBkM19hc2luKHogLyBNYXRoLnNxcnQobSkpICogZDNfZGVncmVlcyBdO1xuICB9O1xuICB2YXIgZDNfZ2VvX2NlbnRyb2lkVzAsIGQzX2dlb19jZW50cm9pZFcxLCBkM19nZW9fY2VudHJvaWRYMCwgZDNfZ2VvX2NlbnRyb2lkWTAsIGQzX2dlb19jZW50cm9pZFowLCBkM19nZW9fY2VudHJvaWRYMSwgZDNfZ2VvX2NlbnRyb2lkWTEsIGQzX2dlb19jZW50cm9pZFoxLCBkM19nZW9fY2VudHJvaWRYMiwgZDNfZ2VvX2NlbnRyb2lkWTIsIGQzX2dlb19jZW50cm9pZFoyO1xuICB2YXIgZDNfZ2VvX2NlbnRyb2lkID0ge1xuICAgIHNwaGVyZTogZDNfbm9vcCxcbiAgICBwb2ludDogZDNfZ2VvX2NlbnRyb2lkUG9pbnQsXG4gICAgbGluZVN0YXJ0OiBkM19nZW9fY2VudHJvaWRMaW5lU3RhcnQsXG4gICAgbGluZUVuZDogZDNfZ2VvX2NlbnRyb2lkTGluZUVuZCxcbiAgICBwb2x5Z29uU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgZDNfZ2VvX2NlbnRyb2lkLmxpbmVTdGFydCA9IGQzX2dlb19jZW50cm9pZFJpbmdTdGFydDtcbiAgICB9LFxuICAgIHBvbHlnb25FbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgZDNfZ2VvX2NlbnRyb2lkLmxpbmVTdGFydCA9IGQzX2dlb19jZW50cm9pZExpbmVTdGFydDtcbiAgICB9XG4gIH07XG4gIGZ1bmN0aW9uIGQzX2dlb19jZW50cm9pZFBvaW50KM67LCDPhikge1xuICAgIM67ICo9IGQzX3JhZGlhbnM7XG4gICAgdmFyIGNvc8+GID0gTWF0aC5jb3Moz4YgKj0gZDNfcmFkaWFucyk7XG4gICAgZDNfZ2VvX2NlbnRyb2lkUG9pbnRYWVooY29zz4YgKiBNYXRoLmNvcyjOuyksIGNvc8+GICogTWF0aC5zaW4ozrspLCBNYXRoLnNpbijPhikpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb19jZW50cm9pZFBvaW50WFlaKHgsIHksIHopIHtcbiAgICArK2QzX2dlb19jZW50cm9pZFcwO1xuICAgIGQzX2dlb19jZW50cm9pZFgwICs9ICh4IC0gZDNfZ2VvX2NlbnRyb2lkWDApIC8gZDNfZ2VvX2NlbnRyb2lkVzA7XG4gICAgZDNfZ2VvX2NlbnRyb2lkWTAgKz0gKHkgLSBkM19nZW9fY2VudHJvaWRZMCkgLyBkM19nZW9fY2VudHJvaWRXMDtcbiAgICBkM19nZW9fY2VudHJvaWRaMCArPSAoeiAtIGQzX2dlb19jZW50cm9pZFowKSAvIGQzX2dlb19jZW50cm9pZFcwO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb19jZW50cm9pZExpbmVTdGFydCgpIHtcbiAgICB2YXIgeDAsIHkwLCB6MDtcbiAgICBkM19nZW9fY2VudHJvaWQucG9pbnQgPSBmdW5jdGlvbijOuywgz4YpIHtcbiAgICAgIM67ICo9IGQzX3JhZGlhbnM7XG4gICAgICB2YXIgY29zz4YgPSBNYXRoLmNvcyjPhiAqPSBkM19yYWRpYW5zKTtcbiAgICAgIHgwID0gY29zz4YgKiBNYXRoLmNvcyjOuyk7XG4gICAgICB5MCA9IGNvc8+GICogTWF0aC5zaW4ozrspO1xuICAgICAgejAgPSBNYXRoLnNpbijPhik7XG4gICAgICBkM19nZW9fY2VudHJvaWQucG9pbnQgPSBuZXh0UG9pbnQ7XG4gICAgICBkM19nZW9fY2VudHJvaWRQb2ludFhZWih4MCwgeTAsIHowKTtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIG5leHRQb2ludCjOuywgz4YpIHtcbiAgICAgIM67ICo9IGQzX3JhZGlhbnM7XG4gICAgICB2YXIgY29zz4YgPSBNYXRoLmNvcyjPhiAqPSBkM19yYWRpYW5zKSwgeCA9IGNvc8+GICogTWF0aC5jb3MozrspLCB5ID0gY29zz4YgKiBNYXRoLnNpbijOuyksIHogPSBNYXRoLnNpbijPhiksIHcgPSBNYXRoLmF0YW4yKE1hdGguc3FydCgodyA9IHkwICogeiAtIHowICogeSkgKiB3ICsgKHcgPSB6MCAqIHggLSB4MCAqIHopICogdyArICh3ID0geDAgKiB5IC0geTAgKiB4KSAqIHcpLCB4MCAqIHggKyB5MCAqIHkgKyB6MCAqIHopO1xuICAgICAgZDNfZ2VvX2NlbnRyb2lkVzEgKz0gdztcbiAgICAgIGQzX2dlb19jZW50cm9pZFgxICs9IHcgKiAoeDAgKyAoeDAgPSB4KSk7XG4gICAgICBkM19nZW9fY2VudHJvaWRZMSArPSB3ICogKHkwICsgKHkwID0geSkpO1xuICAgICAgZDNfZ2VvX2NlbnRyb2lkWjEgKz0gdyAqICh6MCArICh6MCA9IHopKTtcbiAgICAgIGQzX2dlb19jZW50cm9pZFBvaW50WFlaKHgwLCB5MCwgejApO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fY2VudHJvaWRMaW5lRW5kKCkge1xuICAgIGQzX2dlb19jZW50cm9pZC5wb2ludCA9IGQzX2dlb19jZW50cm9pZFBvaW50O1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb19jZW50cm9pZFJpbmdTdGFydCgpIHtcbiAgICB2YXIgzrswMCwgz4YwMCwgeDAsIHkwLCB6MDtcbiAgICBkM19nZW9fY2VudHJvaWQucG9pbnQgPSBmdW5jdGlvbijOuywgz4YpIHtcbiAgICAgIM67MDAgPSDOuywgz4YwMCA9IM+GO1xuICAgICAgZDNfZ2VvX2NlbnRyb2lkLnBvaW50ID0gbmV4dFBvaW50O1xuICAgICAgzrsgKj0gZDNfcmFkaWFucztcbiAgICAgIHZhciBjb3PPhiA9IE1hdGguY29zKM+GICo9IGQzX3JhZGlhbnMpO1xuICAgICAgeDAgPSBjb3PPhiAqIE1hdGguY29zKM67KTtcbiAgICAgIHkwID0gY29zz4YgKiBNYXRoLnNpbijOuyk7XG4gICAgICB6MCA9IE1hdGguc2luKM+GKTtcbiAgICAgIGQzX2dlb19jZW50cm9pZFBvaW50WFlaKHgwLCB5MCwgejApO1xuICAgIH07XG4gICAgZDNfZ2VvX2NlbnRyb2lkLmxpbmVFbmQgPSBmdW5jdGlvbigpIHtcbiAgICAgIG5leHRQb2ludCjOuzAwLCDPhjAwKTtcbiAgICAgIGQzX2dlb19jZW50cm9pZC5saW5lRW5kID0gZDNfZ2VvX2NlbnRyb2lkTGluZUVuZDtcbiAgICAgIGQzX2dlb19jZW50cm9pZC5wb2ludCA9IGQzX2dlb19jZW50cm9pZFBvaW50O1xuICAgIH07XG4gICAgZnVuY3Rpb24gbmV4dFBvaW50KM67LCDPhikge1xuICAgICAgzrsgKj0gZDNfcmFkaWFucztcbiAgICAgIHZhciBjb3PPhiA9IE1hdGguY29zKM+GICo9IGQzX3JhZGlhbnMpLCB4ID0gY29zz4YgKiBNYXRoLmNvcyjOuyksIHkgPSBjb3PPhiAqIE1hdGguc2luKM67KSwgeiA9IE1hdGguc2luKM+GKSwgY3ggPSB5MCAqIHogLSB6MCAqIHksIGN5ID0gejAgKiB4IC0geDAgKiB6LCBjeiA9IHgwICogeSAtIHkwICogeCwgbSA9IE1hdGguc3FydChjeCAqIGN4ICsgY3kgKiBjeSArIGN6ICogY3opLCB1ID0geDAgKiB4ICsgeTAgKiB5ICsgejAgKiB6LCB2ID0gbSAmJiAtZDNfYWNvcyh1KSAvIG0sIHcgPSBNYXRoLmF0YW4yKG0sIHUpO1xuICAgICAgZDNfZ2VvX2NlbnRyb2lkWDIgKz0gdiAqIGN4O1xuICAgICAgZDNfZ2VvX2NlbnRyb2lkWTIgKz0gdiAqIGN5O1xuICAgICAgZDNfZ2VvX2NlbnRyb2lkWjIgKz0gdiAqIGN6O1xuICAgICAgZDNfZ2VvX2NlbnRyb2lkVzEgKz0gdztcbiAgICAgIGQzX2dlb19jZW50cm9pZFgxICs9IHcgKiAoeDAgKyAoeDAgPSB4KSk7XG4gICAgICBkM19nZW9fY2VudHJvaWRZMSArPSB3ICogKHkwICsgKHkwID0geSkpO1xuICAgICAgZDNfZ2VvX2NlbnRyb2lkWjEgKz0gdyAqICh6MCArICh6MCA9IHopKTtcbiAgICAgIGQzX2dlb19jZW50cm9pZFBvaW50WFlaKHgwLCB5MCwgejApO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fY29tcG9zZShhLCBiKSB7XG4gICAgZnVuY3Rpb24gY29tcG9zZSh4LCB5KSB7XG4gICAgICByZXR1cm4geCA9IGEoeCwgeSksIGIoeFswXSwgeFsxXSk7XG4gICAgfVxuICAgIGlmIChhLmludmVydCAmJiBiLmludmVydCkgY29tcG9zZS5pbnZlcnQgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgICByZXR1cm4geCA9IGIuaW52ZXJ0KHgsIHkpLCB4ICYmIGEuaW52ZXJ0KHhbMF0sIHhbMV0pO1xuICAgIH07XG4gICAgcmV0dXJuIGNvbXBvc2U7XG4gIH1cbiAgZnVuY3Rpb24gZDNfdHJ1ZSgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fY2xpcFBvbHlnb24oc2VnbWVudHMsIGNvbXBhcmUsIGNsaXBTdGFydEluc2lkZSwgaW50ZXJwb2xhdGUsIGxpc3RlbmVyKSB7XG4gICAgdmFyIHN1YmplY3QgPSBbXSwgY2xpcCA9IFtdO1xuICAgIHNlZ21lbnRzLmZvckVhY2goZnVuY3Rpb24oc2VnbWVudCkge1xuICAgICAgaWYgKChuID0gc2VnbWVudC5sZW5ndGggLSAxKSA8PSAwKSByZXR1cm47XG4gICAgICB2YXIgbiwgcDAgPSBzZWdtZW50WzBdLCBwMSA9IHNlZ21lbnRbbl07XG4gICAgICBpZiAoZDNfZ2VvX3NwaGVyaWNhbEVxdWFsKHAwLCBwMSkpIHtcbiAgICAgICAgbGlzdGVuZXIubGluZVN0YXJ0KCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgKytpKSBsaXN0ZW5lci5wb2ludCgocDAgPSBzZWdtZW50W2ldKVswXSwgcDBbMV0pO1xuICAgICAgICBsaXN0ZW5lci5saW5lRW5kKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciBhID0gbmV3IGQzX2dlb19jbGlwUG9seWdvbkludGVyc2VjdGlvbihwMCwgc2VnbWVudCwgbnVsbCwgdHJ1ZSksIGIgPSBuZXcgZDNfZ2VvX2NsaXBQb2x5Z29uSW50ZXJzZWN0aW9uKHAwLCBudWxsLCBhLCBmYWxzZSk7XG4gICAgICBhLm8gPSBiO1xuICAgICAgc3ViamVjdC5wdXNoKGEpO1xuICAgICAgY2xpcC5wdXNoKGIpO1xuICAgICAgYSA9IG5ldyBkM19nZW9fY2xpcFBvbHlnb25JbnRlcnNlY3Rpb24ocDEsIHNlZ21lbnQsIG51bGwsIGZhbHNlKTtcbiAgICAgIGIgPSBuZXcgZDNfZ2VvX2NsaXBQb2x5Z29uSW50ZXJzZWN0aW9uKHAxLCBudWxsLCBhLCB0cnVlKTtcbiAgICAgIGEubyA9IGI7XG4gICAgICBzdWJqZWN0LnB1c2goYSk7XG4gICAgICBjbGlwLnB1c2goYik7XG4gICAgfSk7XG4gICAgY2xpcC5zb3J0KGNvbXBhcmUpO1xuICAgIGQzX2dlb19jbGlwUG9seWdvbkxpbmtDaXJjdWxhcihzdWJqZWN0KTtcbiAgICBkM19nZW9fY2xpcFBvbHlnb25MaW5rQ2lyY3VsYXIoY2xpcCk7XG4gICAgaWYgKCFzdWJqZWN0Lmxlbmd0aCkgcmV0dXJuO1xuICAgIGZvciAodmFyIGkgPSAwLCBlbnRyeSA9IGNsaXBTdGFydEluc2lkZSwgbiA9IGNsaXAubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgICBjbGlwW2ldLmUgPSBlbnRyeSA9ICFlbnRyeTtcbiAgICB9XG4gICAgdmFyIHN0YXJ0ID0gc3ViamVjdFswXSwgcG9pbnRzLCBwb2ludDtcbiAgICB3aGlsZSAoMSkge1xuICAgICAgdmFyIGN1cnJlbnQgPSBzdGFydCwgaXNTdWJqZWN0ID0gdHJ1ZTtcbiAgICAgIHdoaWxlIChjdXJyZW50LnYpIGlmICgoY3VycmVudCA9IGN1cnJlbnQubikgPT09IHN0YXJ0KSByZXR1cm47XG4gICAgICBwb2ludHMgPSBjdXJyZW50Lno7XG4gICAgICBsaXN0ZW5lci5saW5lU3RhcnQoKTtcbiAgICAgIGRvIHtcbiAgICAgICAgY3VycmVudC52ID0gY3VycmVudC5vLnYgPSB0cnVlO1xuICAgICAgICBpZiAoY3VycmVudC5lKSB7XG4gICAgICAgICAgaWYgKGlzU3ViamVjdCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIG4gPSBwb2ludHMubGVuZ3RoOyBpIDwgbjsgKytpKSBsaXN0ZW5lci5wb2ludCgocG9pbnQgPSBwb2ludHNbaV0pWzBdLCBwb2ludFsxXSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGludGVycG9sYXRlKGN1cnJlbnQueCwgY3VycmVudC5uLngsIDEsIGxpc3RlbmVyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY3VycmVudCA9IGN1cnJlbnQubjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoaXNTdWJqZWN0KSB7XG4gICAgICAgICAgICBwb2ludHMgPSBjdXJyZW50LnAuejtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSBwb2ludHMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIGxpc3RlbmVyLnBvaW50KChwb2ludCA9IHBvaW50c1tpXSlbMF0sIHBvaW50WzFdKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW50ZXJwb2xhdGUoY3VycmVudC54LCBjdXJyZW50LnAueCwgLTEsIGxpc3RlbmVyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY3VycmVudCA9IGN1cnJlbnQucDtcbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50ID0gY3VycmVudC5vO1xuICAgICAgICBwb2ludHMgPSBjdXJyZW50Lno7XG4gICAgICAgIGlzU3ViamVjdCA9ICFpc1N1YmplY3Q7XG4gICAgICB9IHdoaWxlICghY3VycmVudC52KTtcbiAgICAgIGxpc3RlbmVyLmxpbmVFbmQoKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvX2NsaXBQb2x5Z29uTGlua0NpcmN1bGFyKGFycmF5KSB7XG4gICAgaWYgKCEobiA9IGFycmF5Lmxlbmd0aCkpIHJldHVybjtcbiAgICB2YXIgbiwgaSA9IDAsIGEgPSBhcnJheVswXSwgYjtcbiAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgYS5uID0gYiA9IGFycmF5W2ldO1xuICAgICAgYi5wID0gYTtcbiAgICAgIGEgPSBiO1xuICAgIH1cbiAgICBhLm4gPSBiID0gYXJyYXlbMF07XG4gICAgYi5wID0gYTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fY2xpcFBvbHlnb25JbnRlcnNlY3Rpb24ocG9pbnQsIHBvaW50cywgb3RoZXIsIGVudHJ5KSB7XG4gICAgdGhpcy54ID0gcG9pbnQ7XG4gICAgdGhpcy56ID0gcG9pbnRzO1xuICAgIHRoaXMubyA9IG90aGVyO1xuICAgIHRoaXMuZSA9IGVudHJ5O1xuICAgIHRoaXMudiA9IGZhbHNlO1xuICAgIHRoaXMubiA9IHRoaXMucCA9IG51bGw7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvX2NsaXAocG9pbnRWaXNpYmxlLCBjbGlwTGluZSwgaW50ZXJwb2xhdGUsIGNsaXBTdGFydCkge1xuICAgIHJldHVybiBmdW5jdGlvbihyb3RhdGUsIGxpc3RlbmVyKSB7XG4gICAgICB2YXIgbGluZSA9IGNsaXBMaW5lKGxpc3RlbmVyKSwgcm90YXRlZENsaXBTdGFydCA9IHJvdGF0ZS5pbnZlcnQoY2xpcFN0YXJ0WzBdLCBjbGlwU3RhcnRbMV0pO1xuICAgICAgdmFyIGNsaXAgPSB7XG4gICAgICAgIHBvaW50OiBwb2ludCxcbiAgICAgICAgbGluZVN0YXJ0OiBsaW5lU3RhcnQsXG4gICAgICAgIGxpbmVFbmQ6IGxpbmVFbmQsXG4gICAgICAgIHBvbHlnb25TdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgY2xpcC5wb2ludCA9IHBvaW50UmluZztcbiAgICAgICAgICBjbGlwLmxpbmVTdGFydCA9IHJpbmdTdGFydDtcbiAgICAgICAgICBjbGlwLmxpbmVFbmQgPSByaW5nRW5kO1xuICAgICAgICAgIHNlZ21lbnRzID0gW107XG4gICAgICAgICAgcG9seWdvbiA9IFtdO1xuICAgICAgICB9LFxuICAgICAgICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBjbGlwLnBvaW50ID0gcG9pbnQ7XG4gICAgICAgICAgY2xpcC5saW5lU3RhcnQgPSBsaW5lU3RhcnQ7XG4gICAgICAgICAgY2xpcC5saW5lRW5kID0gbGluZUVuZDtcbiAgICAgICAgICBzZWdtZW50cyA9IGQzLm1lcmdlKHNlZ21lbnRzKTtcbiAgICAgICAgICB2YXIgY2xpcFN0YXJ0SW5zaWRlID0gZDNfZ2VvX3BvaW50SW5Qb2x5Z29uKHJvdGF0ZWRDbGlwU3RhcnQsIHBvbHlnb24pO1xuICAgICAgICAgIGlmIChzZWdtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmICghcG9seWdvblN0YXJ0ZWQpIGxpc3RlbmVyLnBvbHlnb25TdGFydCgpLCBwb2x5Z29uU3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICBkM19nZW9fY2xpcFBvbHlnb24oc2VnbWVudHMsIGQzX2dlb19jbGlwU29ydCwgY2xpcFN0YXJ0SW5zaWRlLCBpbnRlcnBvbGF0ZSwgbGlzdGVuZXIpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY2xpcFN0YXJ0SW5zaWRlKSB7XG4gICAgICAgICAgICBpZiAoIXBvbHlnb25TdGFydGVkKSBsaXN0ZW5lci5wb2x5Z29uU3RhcnQoKSwgcG9seWdvblN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgbGlzdGVuZXIubGluZVN0YXJ0KCk7XG4gICAgICAgICAgICBpbnRlcnBvbGF0ZShudWxsLCBudWxsLCAxLCBsaXN0ZW5lcik7XG4gICAgICAgICAgICBsaXN0ZW5lci5saW5lRW5kKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChwb2x5Z29uU3RhcnRlZCkgbGlzdGVuZXIucG9seWdvbkVuZCgpLCBwb2x5Z29uU3RhcnRlZCA9IGZhbHNlO1xuICAgICAgICAgIHNlZ21lbnRzID0gcG9seWdvbiA9IG51bGw7XG4gICAgICAgIH0sXG4gICAgICAgIHNwaGVyZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgbGlzdGVuZXIucG9seWdvblN0YXJ0KCk7XG4gICAgICAgICAgbGlzdGVuZXIubGluZVN0YXJ0KCk7XG4gICAgICAgICAgaW50ZXJwb2xhdGUobnVsbCwgbnVsbCwgMSwgbGlzdGVuZXIpO1xuICAgICAgICAgIGxpc3RlbmVyLmxpbmVFbmQoKTtcbiAgICAgICAgICBsaXN0ZW5lci5wb2x5Z29uRW5kKCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBmdW5jdGlvbiBwb2ludCjOuywgz4YpIHtcbiAgICAgICAgdmFyIHBvaW50ID0gcm90YXRlKM67LCDPhik7XG4gICAgICAgIGlmIChwb2ludFZpc2libGUozrsgPSBwb2ludFswXSwgz4YgPSBwb2ludFsxXSkpIGxpc3RlbmVyLnBvaW50KM67LCDPhik7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBwb2ludExpbmUozrssIM+GKSB7XG4gICAgICAgIHZhciBwb2ludCA9IHJvdGF0ZSjOuywgz4YpO1xuICAgICAgICBsaW5lLnBvaW50KHBvaW50WzBdLCBwb2ludFsxXSk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBsaW5lU3RhcnQoKSB7XG4gICAgICAgIGNsaXAucG9pbnQgPSBwb2ludExpbmU7XG4gICAgICAgIGxpbmUubGluZVN0YXJ0KCk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBsaW5lRW5kKCkge1xuICAgICAgICBjbGlwLnBvaW50ID0gcG9pbnQ7XG4gICAgICAgIGxpbmUubGluZUVuZCgpO1xuICAgICAgfVxuICAgICAgdmFyIHNlZ21lbnRzO1xuICAgICAgdmFyIGJ1ZmZlciA9IGQzX2dlb19jbGlwQnVmZmVyTGlzdGVuZXIoKSwgcmluZ0xpc3RlbmVyID0gY2xpcExpbmUoYnVmZmVyKSwgcG9seWdvblN0YXJ0ZWQgPSBmYWxzZSwgcG9seWdvbiwgcmluZztcbiAgICAgIGZ1bmN0aW9uIHBvaW50UmluZyjOuywgz4YpIHtcbiAgICAgICAgcmluZy5wdXNoKFsgzrssIM+GIF0pO1xuICAgICAgICB2YXIgcG9pbnQgPSByb3RhdGUozrssIM+GKTtcbiAgICAgICAgcmluZ0xpc3RlbmVyLnBvaW50KHBvaW50WzBdLCBwb2ludFsxXSk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiByaW5nU3RhcnQoKSB7XG4gICAgICAgIHJpbmdMaXN0ZW5lci5saW5lU3RhcnQoKTtcbiAgICAgICAgcmluZyA9IFtdO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gcmluZ0VuZCgpIHtcbiAgICAgICAgcG9pbnRSaW5nKHJpbmdbMF1bMF0sIHJpbmdbMF1bMV0pO1xuICAgICAgICByaW5nTGlzdGVuZXIubGluZUVuZCgpO1xuICAgICAgICB2YXIgY2xlYW4gPSByaW5nTGlzdGVuZXIuY2xlYW4oKSwgcmluZ1NlZ21lbnRzID0gYnVmZmVyLmJ1ZmZlcigpLCBzZWdtZW50LCBuID0gcmluZ1NlZ21lbnRzLmxlbmd0aDtcbiAgICAgICAgcmluZy5wb3AoKTtcbiAgICAgICAgcG9seWdvbi5wdXNoKHJpbmcpO1xuICAgICAgICByaW5nID0gbnVsbDtcbiAgICAgICAgaWYgKCFuKSByZXR1cm47XG4gICAgICAgIGlmIChjbGVhbiAmIDEpIHtcbiAgICAgICAgICBzZWdtZW50ID0gcmluZ1NlZ21lbnRzWzBdO1xuICAgICAgICAgIHZhciBuID0gc2VnbWVudC5sZW5ndGggLSAxLCBpID0gLTEsIHBvaW50O1xuICAgICAgICAgIGlmIChuID4gMCkge1xuICAgICAgICAgICAgaWYgKCFwb2x5Z29uU3RhcnRlZCkgbGlzdGVuZXIucG9seWdvblN0YXJ0KCksIHBvbHlnb25TdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGxpc3RlbmVyLmxpbmVTdGFydCgpO1xuICAgICAgICAgICAgd2hpbGUgKCsraSA8IG4pIGxpc3RlbmVyLnBvaW50KChwb2ludCA9IHNlZ21lbnRbaV0pWzBdLCBwb2ludFsxXSk7XG4gICAgICAgICAgICBsaXN0ZW5lci5saW5lRW5kKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAobiA+IDEgJiYgY2xlYW4gJiAyKSByaW5nU2VnbWVudHMucHVzaChyaW5nU2VnbWVudHMucG9wKCkuY29uY2F0KHJpbmdTZWdtZW50cy5zaGlmdCgpKSk7XG4gICAgICAgIHNlZ21lbnRzLnB1c2gocmluZ1NlZ21lbnRzLmZpbHRlcihkM19nZW9fY2xpcFNlZ21lbnRMZW5ndGgxKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY2xpcDtcbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb19jbGlwU2VnbWVudExlbmd0aDEoc2VnbWVudCkge1xuICAgIHJldHVybiBzZWdtZW50Lmxlbmd0aCA+IDE7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvX2NsaXBCdWZmZXJMaXN0ZW5lcigpIHtcbiAgICB2YXIgbGluZXMgPSBbXSwgbGluZTtcbiAgICByZXR1cm4ge1xuICAgICAgbGluZVN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgbGluZXMucHVzaChsaW5lID0gW10pO1xuICAgICAgfSxcbiAgICAgIHBvaW50OiBmdW5jdGlvbijOuywgz4YpIHtcbiAgICAgICAgbGluZS5wdXNoKFsgzrssIM+GIF0pO1xuICAgICAgfSxcbiAgICAgIGxpbmVFbmQ6IGQzX25vb3AsXG4gICAgICBidWZmZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYnVmZmVyID0gbGluZXM7XG4gICAgICAgIGxpbmVzID0gW107XG4gICAgICAgIGxpbmUgPSBudWxsO1xuICAgICAgICByZXR1cm4gYnVmZmVyO1xuICAgICAgfSxcbiAgICAgIHJlam9pbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChsaW5lcy5sZW5ndGggPiAxKSBsaW5lcy5wdXNoKGxpbmVzLnBvcCgpLmNvbmNhdChsaW5lcy5zaGlmdCgpKSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fY2xpcFNvcnQoYSwgYikge1xuICAgIHJldHVybiAoKGEgPSBhLngpWzBdIDwgMCA/IGFbMV0gLSBoYWxmz4AgLSDOtSA6IGhhbGbPgCAtIGFbMV0pIC0gKChiID0gYi54KVswXSA8IDAgPyBiWzFdIC0gaGFsZs+AIC0gzrUgOiBoYWxmz4AgLSBiWzFdKTtcbiAgfVxuICB2YXIgZDNfZ2VvX2NsaXBBbnRpbWVyaWRpYW4gPSBkM19nZW9fY2xpcChkM190cnVlLCBkM19nZW9fY2xpcEFudGltZXJpZGlhbkxpbmUsIGQzX2dlb19jbGlwQW50aW1lcmlkaWFuSW50ZXJwb2xhdGUsIFsgLc+ALCAtz4AgLyAyIF0pO1xuICBmdW5jdGlvbiBkM19nZW9fY2xpcEFudGltZXJpZGlhbkxpbmUobGlzdGVuZXIpIHtcbiAgICB2YXIgzrswID0gTmFOLCDPhjAgPSBOYU4sIHPOuzAgPSBOYU4sIGNsZWFuO1xuICAgIHJldHVybiB7XG4gICAgICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBsaXN0ZW5lci5saW5lU3RhcnQoKTtcbiAgICAgICAgY2xlYW4gPSAxO1xuICAgICAgfSxcbiAgICAgIHBvaW50OiBmdW5jdGlvbijOuzEsIM+GMSkge1xuICAgICAgICB2YXIgc867MSA9IM67MSA+IDAgPyDPgCA6IC3PgCwgZM67ID0gYWJzKM67MSAtIM67MCk7XG4gICAgICAgIGlmIChhYnMoZM67IC0gz4ApIDwgzrUpIHtcbiAgICAgICAgICBsaXN0ZW5lci5wb2ludCjOuzAsIM+GMCA9ICjPhjAgKyDPhjEpIC8gMiA+IDAgPyBoYWxmz4AgOiAtaGFsZs+AKTtcbiAgICAgICAgICBsaXN0ZW5lci5wb2ludChzzrswLCDPhjApO1xuICAgICAgICAgIGxpc3RlbmVyLmxpbmVFbmQoKTtcbiAgICAgICAgICBsaXN0ZW5lci5saW5lU3RhcnQoKTtcbiAgICAgICAgICBsaXN0ZW5lci5wb2ludChzzrsxLCDPhjApO1xuICAgICAgICAgIGxpc3RlbmVyLnBvaW50KM67MSwgz4YwKTtcbiAgICAgICAgICBjbGVhbiA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAoc867MCAhPT0gc867MSAmJiBkzrsgPj0gz4ApIHtcbiAgICAgICAgICBpZiAoYWJzKM67MCAtIHPOuzApIDwgzrUpIM67MCAtPSBzzrswICogzrU7XG4gICAgICAgICAgaWYgKGFicyjOuzEgLSBzzrsxKSA8IM61KSDOuzEgLT0gc867MSAqIM61O1xuICAgICAgICAgIM+GMCA9IGQzX2dlb19jbGlwQW50aW1lcmlkaWFuSW50ZXJzZWN0KM67MCwgz4YwLCDOuzEsIM+GMSk7XG4gICAgICAgICAgbGlzdGVuZXIucG9pbnQoc867MCwgz4YwKTtcbiAgICAgICAgICBsaXN0ZW5lci5saW5lRW5kKCk7XG4gICAgICAgICAgbGlzdGVuZXIubGluZVN0YXJ0KCk7XG4gICAgICAgICAgbGlzdGVuZXIucG9pbnQoc867MSwgz4YwKTtcbiAgICAgICAgICBjbGVhbiA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgbGlzdGVuZXIucG9pbnQozrswID0gzrsxLCDPhjAgPSDPhjEpO1xuICAgICAgICBzzrswID0gc867MTtcbiAgICAgIH0sXG4gICAgICBsaW5lRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgbGlzdGVuZXIubGluZUVuZCgpO1xuICAgICAgICDOuzAgPSDPhjAgPSBOYU47XG4gICAgICB9LFxuICAgICAgY2xlYW46IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gMiAtIGNsZWFuO1xuICAgICAgfVxuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvX2NsaXBBbnRpbWVyaWRpYW5JbnRlcnNlY3QozrswLCDPhjAsIM67MSwgz4YxKSB7XG4gICAgdmFyIGNvc8+GMCwgY29zz4YxLCBzaW7OuzBfzrsxID0gTWF0aC5zaW4ozrswIC0gzrsxKTtcbiAgICByZXR1cm4gYWJzKHNpbs67MF/OuzEpID4gzrUgPyBNYXRoLmF0YW4oKE1hdGguc2luKM+GMCkgKiAoY29zz4YxID0gTWF0aC5jb3Moz4YxKSkgKiBNYXRoLnNpbijOuzEpIC0gTWF0aC5zaW4oz4YxKSAqIChjb3PPhjAgPSBNYXRoLmNvcyjPhjApKSAqIE1hdGguc2luKM67MCkpIC8gKGNvc8+GMCAqIGNvc8+GMSAqIHNpbs67MF/OuzEpKSA6ICjPhjAgKyDPhjEpIC8gMjtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fY2xpcEFudGltZXJpZGlhbkludGVycG9sYXRlKGZyb20sIHRvLCBkaXJlY3Rpb24sIGxpc3RlbmVyKSB7XG4gICAgdmFyIM+GO1xuICAgIGlmIChmcm9tID09IG51bGwpIHtcbiAgICAgIM+GID0gZGlyZWN0aW9uICogaGFsZs+AO1xuICAgICAgbGlzdGVuZXIucG9pbnQoLc+ALCDPhik7XG4gICAgICBsaXN0ZW5lci5wb2ludCgwLCDPhik7XG4gICAgICBsaXN0ZW5lci5wb2ludCjPgCwgz4YpO1xuICAgICAgbGlzdGVuZXIucG9pbnQoz4AsIDApO1xuICAgICAgbGlzdGVuZXIucG9pbnQoz4AsIC3Phik7XG4gICAgICBsaXN0ZW5lci5wb2ludCgwLCAtz4YpO1xuICAgICAgbGlzdGVuZXIucG9pbnQoLc+ALCAtz4YpO1xuICAgICAgbGlzdGVuZXIucG9pbnQoLc+ALCAwKTtcbiAgICAgIGxpc3RlbmVyLnBvaW50KC3PgCwgz4YpO1xuICAgIH0gZWxzZSBpZiAoYWJzKGZyb21bMF0gLSB0b1swXSkgPiDOtSkge1xuICAgICAgdmFyIHMgPSBmcm9tWzBdIDwgdG9bMF0gPyDPgCA6IC3PgDtcbiAgICAgIM+GID0gZGlyZWN0aW9uICogcyAvIDI7XG4gICAgICBsaXN0ZW5lci5wb2ludCgtcywgz4YpO1xuICAgICAgbGlzdGVuZXIucG9pbnQoMCwgz4YpO1xuICAgICAgbGlzdGVuZXIucG9pbnQocywgz4YpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0ZW5lci5wb2ludCh0b1swXSwgdG9bMV0pO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fcG9pbnRJblBvbHlnb24ocG9pbnQsIHBvbHlnb24pIHtcbiAgICB2YXIgbWVyaWRpYW4gPSBwb2ludFswXSwgcGFyYWxsZWwgPSBwb2ludFsxXSwgbWVyaWRpYW5Ob3JtYWwgPSBbIE1hdGguc2luKG1lcmlkaWFuKSwgLU1hdGguY29zKG1lcmlkaWFuKSwgMCBdLCBwb2xhckFuZ2xlID0gMCwgd2luZGluZyA9IDA7XG4gICAgZDNfZ2VvX2FyZWFSaW5nU3VtLnJlc2V0KCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIG4gPSBwb2x5Z29uLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgICAgdmFyIHJpbmcgPSBwb2x5Z29uW2ldLCBtID0gcmluZy5sZW5ndGg7XG4gICAgICBpZiAoIW0pIGNvbnRpbnVlO1xuICAgICAgdmFyIHBvaW50MCA9IHJpbmdbMF0sIM67MCA9IHBvaW50MFswXSwgz4YwID0gcG9pbnQwWzFdIC8gMiArIM+AIC8gNCwgc2luz4YwID0gTWF0aC5zaW4oz4YwKSwgY29zz4YwID0gTWF0aC5jb3Moz4YwKSwgaiA9IDE7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBpZiAoaiA9PT0gbSkgaiA9IDA7XG4gICAgICAgIHBvaW50ID0gcmluZ1tqXTtcbiAgICAgICAgdmFyIM67ID0gcG9pbnRbMF0sIM+GID0gcG9pbnRbMV0gLyAyICsgz4AgLyA0LCBzaW7PhiA9IE1hdGguc2luKM+GKSwgY29zz4YgPSBNYXRoLmNvcyjPhiksIGTOuyA9IM67IC0gzrswLCBzZM67ID0gZM67ID49IDAgPyAxIDogLTEsIGFkzrsgPSBzZM67ICogZM67LCBhbnRpbWVyaWRpYW4gPSBhZM67ID4gz4AsIGsgPSBzaW7PhjAgKiBzaW7PhjtcbiAgICAgICAgZDNfZ2VvX2FyZWFSaW5nU3VtLmFkZChNYXRoLmF0YW4yKGsgKiBzZM67ICogTWF0aC5zaW4oYWTOuyksIGNvc8+GMCAqIGNvc8+GICsgayAqIE1hdGguY29zKGFkzrspKSk7XG4gICAgICAgIHBvbGFyQW5nbGUgKz0gYW50aW1lcmlkaWFuID8gZM67ICsgc2TOuyAqIM+EIDogZM67O1xuICAgICAgICBpZiAoYW50aW1lcmlkaWFuIF4gzrswID49IG1lcmlkaWFuIF4gzrsgPj0gbWVyaWRpYW4pIHtcbiAgICAgICAgICB2YXIgYXJjID0gZDNfZ2VvX2NhcnRlc2lhbkNyb3NzKGQzX2dlb19jYXJ0ZXNpYW4ocG9pbnQwKSwgZDNfZ2VvX2NhcnRlc2lhbihwb2ludCkpO1xuICAgICAgICAgIGQzX2dlb19jYXJ0ZXNpYW5Ob3JtYWxpemUoYXJjKTtcbiAgICAgICAgICB2YXIgaW50ZXJzZWN0aW9uID0gZDNfZ2VvX2NhcnRlc2lhbkNyb3NzKG1lcmlkaWFuTm9ybWFsLCBhcmMpO1xuICAgICAgICAgIGQzX2dlb19jYXJ0ZXNpYW5Ob3JtYWxpemUoaW50ZXJzZWN0aW9uKTtcbiAgICAgICAgICB2YXIgz4ZhcmMgPSAoYW50aW1lcmlkaWFuIF4gZM67ID49IDAgPyAtMSA6IDEpICogZDNfYXNpbihpbnRlcnNlY3Rpb25bMl0pO1xuICAgICAgICAgIGlmIChwYXJhbGxlbCA+IM+GYXJjIHx8IHBhcmFsbGVsID09PSDPhmFyYyAmJiAoYXJjWzBdIHx8IGFyY1sxXSkpIHtcbiAgICAgICAgICAgIHdpbmRpbmcgKz0gYW50aW1lcmlkaWFuIF4gZM67ID49IDAgPyAxIDogLTE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghaisrKSBicmVhaztcbiAgICAgICAgzrswID0gzrssIHNpbs+GMCA9IHNpbs+GLCBjb3PPhjAgPSBjb3PPhiwgcG9pbnQwID0gcG9pbnQ7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAocG9sYXJBbmdsZSA8IC3OtSB8fCBwb2xhckFuZ2xlIDwgzrUgJiYgZDNfZ2VvX2FyZWFSaW5nU3VtIDwgMCkgXiB3aW5kaW5nICYgMTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fY2xpcENpcmNsZShyYWRpdXMpIHtcbiAgICB2YXIgY3IgPSBNYXRoLmNvcyhyYWRpdXMpLCBzbWFsbFJhZGl1cyA9IGNyID4gMCwgbm90SGVtaXNwaGVyZSA9IGFicyhjcikgPiDOtSwgaW50ZXJwb2xhdGUgPSBkM19nZW9fY2lyY2xlSW50ZXJwb2xhdGUocmFkaXVzLCA2ICogZDNfcmFkaWFucyk7XG4gICAgcmV0dXJuIGQzX2dlb19jbGlwKHZpc2libGUsIGNsaXBMaW5lLCBpbnRlcnBvbGF0ZSwgc21hbGxSYWRpdXMgPyBbIDAsIC1yYWRpdXMgXSA6IFsgLc+ALCByYWRpdXMgLSDPgCBdKTtcbiAgICBmdW5jdGlvbiB2aXNpYmxlKM67LCDPhikge1xuICAgICAgcmV0dXJuIE1hdGguY29zKM67KSAqIE1hdGguY29zKM+GKSA+IGNyO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjbGlwTGluZShsaXN0ZW5lcikge1xuICAgICAgdmFyIHBvaW50MCwgYzAsIHYwLCB2MDAsIGNsZWFuO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGluZVN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2MDAgPSB2MCA9IGZhbHNlO1xuICAgICAgICAgIGNsZWFuID0gMTtcbiAgICAgICAgfSxcbiAgICAgICAgcG9pbnQ6IGZ1bmN0aW9uKM67LCDPhikge1xuICAgICAgICAgIHZhciBwb2ludDEgPSBbIM67LCDPhiBdLCBwb2ludDIsIHYgPSB2aXNpYmxlKM67LCDPhiksIGMgPSBzbWFsbFJhZGl1cyA/IHYgPyAwIDogY29kZSjOuywgz4YpIDogdiA/IGNvZGUozrsgKyAozrsgPCAwID8gz4AgOiAtz4ApLCDPhikgOiAwO1xuICAgICAgICAgIGlmICghcG9pbnQwICYmICh2MDAgPSB2MCA9IHYpKSBsaXN0ZW5lci5saW5lU3RhcnQoKTtcbiAgICAgICAgICBpZiAodiAhPT0gdjApIHtcbiAgICAgICAgICAgIHBvaW50MiA9IGludGVyc2VjdChwb2ludDAsIHBvaW50MSk7XG4gICAgICAgICAgICBpZiAoZDNfZ2VvX3NwaGVyaWNhbEVxdWFsKHBvaW50MCwgcG9pbnQyKSB8fCBkM19nZW9fc3BoZXJpY2FsRXF1YWwocG9pbnQxLCBwb2ludDIpKSB7XG4gICAgICAgICAgICAgIHBvaW50MVswXSArPSDOtTtcbiAgICAgICAgICAgICAgcG9pbnQxWzFdICs9IM61O1xuICAgICAgICAgICAgICB2ID0gdmlzaWJsZShwb2ludDFbMF0sIHBvaW50MVsxXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh2ICE9PSB2MCkge1xuICAgICAgICAgICAgY2xlYW4gPSAwO1xuICAgICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgICAgbGlzdGVuZXIubGluZVN0YXJ0KCk7XG4gICAgICAgICAgICAgIHBvaW50MiA9IGludGVyc2VjdChwb2ludDEsIHBvaW50MCk7XG4gICAgICAgICAgICAgIGxpc3RlbmVyLnBvaW50KHBvaW50MlswXSwgcG9pbnQyWzFdKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHBvaW50MiA9IGludGVyc2VjdChwb2ludDAsIHBvaW50MSk7XG4gICAgICAgICAgICAgIGxpc3RlbmVyLnBvaW50KHBvaW50MlswXSwgcG9pbnQyWzFdKTtcbiAgICAgICAgICAgICAgbGlzdGVuZXIubGluZUVuZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcG9pbnQwID0gcG9pbnQyO1xuICAgICAgICAgIH0gZWxzZSBpZiAobm90SGVtaXNwaGVyZSAmJiBwb2ludDAgJiYgc21hbGxSYWRpdXMgXiB2KSB7XG4gICAgICAgICAgICB2YXIgdDtcbiAgICAgICAgICAgIGlmICghKGMgJiBjMCkgJiYgKHQgPSBpbnRlcnNlY3QocG9pbnQxLCBwb2ludDAsIHRydWUpKSkge1xuICAgICAgICAgICAgICBjbGVhbiA9IDA7XG4gICAgICAgICAgICAgIGlmIChzbWFsbFJhZGl1cykge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyLmxpbmVTdGFydCgpO1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyLnBvaW50KHRbMF1bMF0sIHRbMF1bMV0pO1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyLnBvaW50KHRbMV1bMF0sIHRbMV1bMV0pO1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyLmxpbmVFbmQoKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lci5wb2ludCh0WzFdWzBdLCB0WzFdWzFdKTtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lci5saW5lRW5kKCk7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXIubGluZVN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXIucG9pbnQodFswXVswXSwgdFswXVsxXSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHYgJiYgKCFwb2ludDAgfHwgIWQzX2dlb19zcGhlcmljYWxFcXVhbChwb2ludDAsIHBvaW50MSkpKSB7XG4gICAgICAgICAgICBsaXN0ZW5lci5wb2ludChwb2ludDFbMF0sIHBvaW50MVsxXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBvaW50MCA9IHBvaW50MSwgdjAgPSB2LCBjMCA9IGM7XG4gICAgICAgIH0sXG4gICAgICAgIGxpbmVFbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmICh2MCkgbGlzdGVuZXIubGluZUVuZCgpO1xuICAgICAgICAgIHBvaW50MCA9IG51bGw7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFuOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gY2xlYW4gfCAodjAwICYmIHYwKSA8PCAxO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiBpbnRlcnNlY3QoYSwgYiwgdHdvKSB7XG4gICAgICB2YXIgcGEgPSBkM19nZW9fY2FydGVzaWFuKGEpLCBwYiA9IGQzX2dlb19jYXJ0ZXNpYW4oYik7XG4gICAgICB2YXIgbjEgPSBbIDEsIDAsIDAgXSwgbjIgPSBkM19nZW9fY2FydGVzaWFuQ3Jvc3MocGEsIHBiKSwgbjJuMiA9IGQzX2dlb19jYXJ0ZXNpYW5Eb3QobjIsIG4yKSwgbjFuMiA9IG4yWzBdLCBkZXRlcm1pbmFudCA9IG4ybjIgLSBuMW4yICogbjFuMjtcbiAgICAgIGlmICghZGV0ZXJtaW5hbnQpIHJldHVybiAhdHdvICYmIGE7XG4gICAgICB2YXIgYzEgPSBjciAqIG4ybjIgLyBkZXRlcm1pbmFudCwgYzIgPSAtY3IgKiBuMW4yIC8gZGV0ZXJtaW5hbnQsIG4xeG4yID0gZDNfZ2VvX2NhcnRlc2lhbkNyb3NzKG4xLCBuMiksIEEgPSBkM19nZW9fY2FydGVzaWFuU2NhbGUobjEsIGMxKSwgQiA9IGQzX2dlb19jYXJ0ZXNpYW5TY2FsZShuMiwgYzIpO1xuICAgICAgZDNfZ2VvX2NhcnRlc2lhbkFkZChBLCBCKTtcbiAgICAgIHZhciB1ID0gbjF4bjIsIHcgPSBkM19nZW9fY2FydGVzaWFuRG90KEEsIHUpLCB1dSA9IGQzX2dlb19jYXJ0ZXNpYW5Eb3QodSwgdSksIHQyID0gdyAqIHcgLSB1dSAqIChkM19nZW9fY2FydGVzaWFuRG90KEEsIEEpIC0gMSk7XG4gICAgICBpZiAodDIgPCAwKSByZXR1cm47XG4gICAgICB2YXIgdCA9IE1hdGguc3FydCh0MiksIHEgPSBkM19nZW9fY2FydGVzaWFuU2NhbGUodSwgKC13IC0gdCkgLyB1dSk7XG4gICAgICBkM19nZW9fY2FydGVzaWFuQWRkKHEsIEEpO1xuICAgICAgcSA9IGQzX2dlb19zcGhlcmljYWwocSk7XG4gICAgICBpZiAoIXR3bykgcmV0dXJuIHE7XG4gICAgICB2YXIgzrswID0gYVswXSwgzrsxID0gYlswXSwgz4YwID0gYVsxXSwgz4YxID0gYlsxXSwgejtcbiAgICAgIGlmICjOuzEgPCDOuzApIHogPSDOuzAsIM67MCA9IM67MSwgzrsxID0gejtcbiAgICAgIHZhciDOtM67ID0gzrsxIC0gzrswLCBwb2xhciA9IGFicyjOtM67IC0gz4ApIDwgzrUsIG1lcmlkaWFuID0gcG9sYXIgfHwgzrTOuyA8IM61O1xuICAgICAgaWYgKCFwb2xhciAmJiDPhjEgPCDPhjApIHogPSDPhjAsIM+GMCA9IM+GMSwgz4YxID0gejtcbiAgICAgIGlmIChtZXJpZGlhbiA/IHBvbGFyID8gz4YwICsgz4YxID4gMCBeIHFbMV0gPCAoYWJzKHFbMF0gLSDOuzApIDwgzrUgPyDPhjAgOiDPhjEpIDogz4YwIDw9IHFbMV0gJiYgcVsxXSA8PSDPhjEgOiDOtM67ID4gz4AgXiAozrswIDw9IHFbMF0gJiYgcVswXSA8PSDOuzEpKSB7XG4gICAgICAgIHZhciBxMSA9IGQzX2dlb19jYXJ0ZXNpYW5TY2FsZSh1LCAoLXcgKyB0KSAvIHV1KTtcbiAgICAgICAgZDNfZ2VvX2NhcnRlc2lhbkFkZChxMSwgQSk7XG4gICAgICAgIHJldHVybiBbIHEsIGQzX2dlb19zcGhlcmljYWwocTEpIF07XG4gICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNvZGUozrssIM+GKSB7XG4gICAgICB2YXIgciA9IHNtYWxsUmFkaXVzID8gcmFkaXVzIDogz4AgLSByYWRpdXMsIGNvZGUgPSAwO1xuICAgICAgaWYgKM67IDwgLXIpIGNvZGUgfD0gMTsgZWxzZSBpZiAozrsgPiByKSBjb2RlIHw9IDI7XG4gICAgICBpZiAoz4YgPCAtcikgY29kZSB8PSA0OyBlbHNlIGlmICjPhiA+IHIpIGNvZGUgfD0gODtcbiAgICAgIHJldHVybiBjb2RlO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBkM19nZW9tX2NsaXBMaW5lKHgwLCB5MCwgeDEsIHkxKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgIHZhciBhID0gbGluZS5hLCBiID0gbGluZS5iLCBheCA9IGEueCwgYXkgPSBhLnksIGJ4ID0gYi54LCBieSA9IGIueSwgdDAgPSAwLCB0MSA9IDEsIGR4ID0gYnggLSBheCwgZHkgPSBieSAtIGF5LCByO1xuICAgICAgciA9IHgwIC0gYXg7XG4gICAgICBpZiAoIWR4ICYmIHIgPiAwKSByZXR1cm47XG4gICAgICByIC89IGR4O1xuICAgICAgaWYgKGR4IDwgMCkge1xuICAgICAgICBpZiAociA8IHQwKSByZXR1cm47XG4gICAgICAgIGlmIChyIDwgdDEpIHQxID0gcjtcbiAgICAgIH0gZWxzZSBpZiAoZHggPiAwKSB7XG4gICAgICAgIGlmIChyID4gdDEpIHJldHVybjtcbiAgICAgICAgaWYgKHIgPiB0MCkgdDAgPSByO1xuICAgICAgfVxuICAgICAgciA9IHgxIC0gYXg7XG4gICAgICBpZiAoIWR4ICYmIHIgPCAwKSByZXR1cm47XG4gICAgICByIC89IGR4O1xuICAgICAgaWYgKGR4IDwgMCkge1xuICAgICAgICBpZiAociA+IHQxKSByZXR1cm47XG4gICAgICAgIGlmIChyID4gdDApIHQwID0gcjtcbiAgICAgIH0gZWxzZSBpZiAoZHggPiAwKSB7XG4gICAgICAgIGlmIChyIDwgdDApIHJldHVybjtcbiAgICAgICAgaWYgKHIgPCB0MSkgdDEgPSByO1xuICAgICAgfVxuICAgICAgciA9IHkwIC0gYXk7XG4gICAgICBpZiAoIWR5ICYmIHIgPiAwKSByZXR1cm47XG4gICAgICByIC89IGR5O1xuICAgICAgaWYgKGR5IDwgMCkge1xuICAgICAgICBpZiAociA8IHQwKSByZXR1cm47XG4gICAgICAgIGlmIChyIDwgdDEpIHQxID0gcjtcbiAgICAgIH0gZWxzZSBpZiAoZHkgPiAwKSB7XG4gICAgICAgIGlmIChyID4gdDEpIHJldHVybjtcbiAgICAgICAgaWYgKHIgPiB0MCkgdDAgPSByO1xuICAgICAgfVxuICAgICAgciA9IHkxIC0gYXk7XG4gICAgICBpZiAoIWR5ICYmIHIgPCAwKSByZXR1cm47XG4gICAgICByIC89IGR5O1xuICAgICAgaWYgKGR5IDwgMCkge1xuICAgICAgICBpZiAociA+IHQxKSByZXR1cm47XG4gICAgICAgIGlmIChyID4gdDApIHQwID0gcjtcbiAgICAgIH0gZWxzZSBpZiAoZHkgPiAwKSB7XG4gICAgICAgIGlmIChyIDwgdDApIHJldHVybjtcbiAgICAgICAgaWYgKHIgPCB0MSkgdDEgPSByO1xuICAgICAgfVxuICAgICAgaWYgKHQwID4gMCkgbGluZS5hID0ge1xuICAgICAgICB4OiBheCArIHQwICogZHgsXG4gICAgICAgIHk6IGF5ICsgdDAgKiBkeVxuICAgICAgfTtcbiAgICAgIGlmICh0MSA8IDEpIGxpbmUuYiA9IHtcbiAgICAgICAgeDogYXggKyB0MSAqIGR4LFxuICAgICAgICB5OiBheSArIHQxICogZHlcbiAgICAgIH07XG4gICAgICByZXR1cm4gbGluZTtcbiAgICB9O1xuICB9XG4gIHZhciBkM19nZW9fY2xpcEV4dGVudE1BWCA9IDFlOTtcbiAgZDMuZ2VvLmNsaXBFeHRlbnQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgeDAsIHkwLCB4MSwgeTEsIHN0cmVhbSwgY2xpcCwgY2xpcEV4dGVudCA9IHtcbiAgICAgIHN0cmVhbTogZnVuY3Rpb24ob3V0cHV0KSB7XG4gICAgICAgIGlmIChzdHJlYW0pIHN0cmVhbS52YWxpZCA9IGZhbHNlO1xuICAgICAgICBzdHJlYW0gPSBjbGlwKG91dHB1dCk7XG4gICAgICAgIHN0cmVhbS52YWxpZCA9IHRydWU7XG4gICAgICAgIHJldHVybiBzdHJlYW07XG4gICAgICB9LFxuICAgICAgZXh0ZW50OiBmdW5jdGlvbihfKSB7XG4gICAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIFsgWyB4MCwgeTAgXSwgWyB4MSwgeTEgXSBdO1xuICAgICAgICBjbGlwID0gZDNfZ2VvX2NsaXBFeHRlbnQoeDAgPSArX1swXVswXSwgeTAgPSArX1swXVsxXSwgeDEgPSArX1sxXVswXSwgeTEgPSArX1sxXVsxXSk7XG4gICAgICAgIGlmIChzdHJlYW0pIHN0cmVhbS52YWxpZCA9IGZhbHNlLCBzdHJlYW0gPSBudWxsO1xuICAgICAgICByZXR1cm4gY2xpcEV4dGVudDtcbiAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBjbGlwRXh0ZW50LmV4dGVudChbIFsgMCwgMCBdLCBbIDk2MCwgNTAwIF0gXSk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX2dlb19jbGlwRXh0ZW50KHgwLCB5MCwgeDEsIHkxKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGxpc3RlbmVyKSB7XG4gICAgICB2YXIgbGlzdGVuZXJfID0gbGlzdGVuZXIsIGJ1ZmZlckxpc3RlbmVyID0gZDNfZ2VvX2NsaXBCdWZmZXJMaXN0ZW5lcigpLCBjbGlwTGluZSA9IGQzX2dlb21fY2xpcExpbmUoeDAsIHkwLCB4MSwgeTEpLCBzZWdtZW50cywgcG9seWdvbiwgcmluZztcbiAgICAgIHZhciBjbGlwID0ge1xuICAgICAgICBwb2ludDogcG9pbnQsXG4gICAgICAgIGxpbmVTdGFydDogbGluZVN0YXJ0LFxuICAgICAgICBsaW5lRW5kOiBsaW5lRW5kLFxuICAgICAgICBwb2x5Z29uU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGxpc3RlbmVyID0gYnVmZmVyTGlzdGVuZXI7XG4gICAgICAgICAgc2VnbWVudHMgPSBbXTtcbiAgICAgICAgICBwb2x5Z29uID0gW107XG4gICAgICAgICAgY2xlYW4gPSB0cnVlO1xuICAgICAgICB9LFxuICAgICAgICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBsaXN0ZW5lciA9IGxpc3RlbmVyXztcbiAgICAgICAgICBzZWdtZW50cyA9IGQzLm1lcmdlKHNlZ21lbnRzKTtcbiAgICAgICAgICB2YXIgY2xpcFN0YXJ0SW5zaWRlID0gaW5zaWRlUG9seWdvbihbIHgwLCB5MSBdKSwgaW5zaWRlID0gY2xlYW4gJiYgY2xpcFN0YXJ0SW5zaWRlLCB2aXNpYmxlID0gc2VnbWVudHMubGVuZ3RoO1xuICAgICAgICAgIGlmIChpbnNpZGUgfHwgdmlzaWJsZSkge1xuICAgICAgICAgICAgbGlzdGVuZXIucG9seWdvblN0YXJ0KCk7XG4gICAgICAgICAgICBpZiAoaW5zaWRlKSB7XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpbmVTdGFydCgpO1xuICAgICAgICAgICAgICBpbnRlcnBvbGF0ZShudWxsLCBudWxsLCAxLCBsaXN0ZW5lcik7XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpbmVFbmQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh2aXNpYmxlKSB7XG4gICAgICAgICAgICAgIGQzX2dlb19jbGlwUG9seWdvbihzZWdtZW50cywgY29tcGFyZSwgY2xpcFN0YXJ0SW5zaWRlLCBpbnRlcnBvbGF0ZSwgbGlzdGVuZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGlzdGVuZXIucG9seWdvbkVuZCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzZWdtZW50cyA9IHBvbHlnb24gPSByaW5nID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGZ1bmN0aW9uIGluc2lkZVBvbHlnb24ocCkge1xuICAgICAgICB2YXIgd24gPSAwLCBuID0gcG9seWdvbi5sZW5ndGgsIHkgPSBwWzFdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgICAgIGZvciAodmFyIGogPSAxLCB2ID0gcG9seWdvbltpXSwgbSA9IHYubGVuZ3RoLCBhID0gdlswXSwgYjsgaiA8IG07ICsraikge1xuICAgICAgICAgICAgYiA9IHZbal07XG4gICAgICAgICAgICBpZiAoYVsxXSA8PSB5KSB7XG4gICAgICAgICAgICAgIGlmIChiWzFdID4geSAmJiBkM19jcm9zczJkKGEsIGIsIHApID4gMCkgKyt3bjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmIChiWzFdIDw9IHkgJiYgZDNfY3Jvc3MyZChhLCBiLCBwKSA8IDApIC0td247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhID0gYjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHduICE9PSAwO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gaW50ZXJwb2xhdGUoZnJvbSwgdG8sIGRpcmVjdGlvbiwgbGlzdGVuZXIpIHtcbiAgICAgICAgdmFyIGEgPSAwLCBhMSA9IDA7XG4gICAgICAgIGlmIChmcm9tID09IG51bGwgfHwgKGEgPSBjb3JuZXIoZnJvbSwgZGlyZWN0aW9uKSkgIT09IChhMSA9IGNvcm5lcih0bywgZGlyZWN0aW9uKSkgfHwgY29tcGFyZVBvaW50cyhmcm9tLCB0bykgPCAwIF4gZGlyZWN0aW9uID4gMCkge1xuICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgIGxpc3RlbmVyLnBvaW50KGEgPT09IDAgfHwgYSA9PT0gMyA/IHgwIDogeDEsIGEgPiAxID8geTEgOiB5MCk7XG4gICAgICAgICAgfSB3aGlsZSAoKGEgPSAoYSArIGRpcmVjdGlvbiArIDQpICUgNCkgIT09IGExKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsaXN0ZW5lci5wb2ludCh0b1swXSwgdG9bMV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBwb2ludFZpc2libGUoeCwgeSkge1xuICAgICAgICByZXR1cm4geDAgPD0geCAmJiB4IDw9IHgxICYmIHkwIDw9IHkgJiYgeSA8PSB5MTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIHBvaW50KHgsIHkpIHtcbiAgICAgICAgaWYgKHBvaW50VmlzaWJsZSh4LCB5KSkgbGlzdGVuZXIucG9pbnQoeCwgeSk7XG4gICAgICB9XG4gICAgICB2YXIgeF9fLCB5X18sIHZfXywgeF8sIHlfLCB2XywgZmlyc3QsIGNsZWFuO1xuICAgICAgZnVuY3Rpb24gbGluZVN0YXJ0KCkge1xuICAgICAgICBjbGlwLnBvaW50ID0gbGluZVBvaW50O1xuICAgICAgICBpZiAocG9seWdvbikgcG9seWdvbi5wdXNoKHJpbmcgPSBbXSk7XG4gICAgICAgIGZpcnN0ID0gdHJ1ZTtcbiAgICAgICAgdl8gPSBmYWxzZTtcbiAgICAgICAgeF8gPSB5XyA9IE5hTjtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIGxpbmVFbmQoKSB7XG4gICAgICAgIGlmIChzZWdtZW50cykge1xuICAgICAgICAgIGxpbmVQb2ludCh4X18sIHlfXyk7XG4gICAgICAgICAgaWYgKHZfXyAmJiB2XykgYnVmZmVyTGlzdGVuZXIucmVqb2luKCk7XG4gICAgICAgICAgc2VnbWVudHMucHVzaChidWZmZXJMaXN0ZW5lci5idWZmZXIoKSk7XG4gICAgICAgIH1cbiAgICAgICAgY2xpcC5wb2ludCA9IHBvaW50O1xuICAgICAgICBpZiAodl8pIGxpc3RlbmVyLmxpbmVFbmQoKTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIGxpbmVQb2ludCh4LCB5KSB7XG4gICAgICAgIHggPSBNYXRoLm1heCgtZDNfZ2VvX2NsaXBFeHRlbnRNQVgsIE1hdGgubWluKGQzX2dlb19jbGlwRXh0ZW50TUFYLCB4KSk7XG4gICAgICAgIHkgPSBNYXRoLm1heCgtZDNfZ2VvX2NsaXBFeHRlbnRNQVgsIE1hdGgubWluKGQzX2dlb19jbGlwRXh0ZW50TUFYLCB5KSk7XG4gICAgICAgIHZhciB2ID0gcG9pbnRWaXNpYmxlKHgsIHkpO1xuICAgICAgICBpZiAocG9seWdvbikgcmluZy5wdXNoKFsgeCwgeSBdKTtcbiAgICAgICAgaWYgKGZpcnN0KSB7XG4gICAgICAgICAgeF9fID0geCwgeV9fID0geSwgdl9fID0gdjtcbiAgICAgICAgICBmaXJzdCA9IGZhbHNlO1xuICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICBsaXN0ZW5lci5saW5lU3RhcnQoKTtcbiAgICAgICAgICAgIGxpc3RlbmVyLnBvaW50KHgsIHkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAodiAmJiB2XykgbGlzdGVuZXIucG9pbnQoeCwgeSk7IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGwgPSB7XG4gICAgICAgICAgICAgIGE6IHtcbiAgICAgICAgICAgICAgICB4OiB4XyxcbiAgICAgICAgICAgICAgICB5OiB5X1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBiOiB7XG4gICAgICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgICAgICB5OiB5XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAoY2xpcExpbmUobCkpIHtcbiAgICAgICAgICAgICAgaWYgKCF2Xykge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyLmxpbmVTdGFydCgpO1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyLnBvaW50KGwuYS54LCBsLmEueSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgbGlzdGVuZXIucG9pbnQobC5iLngsIGwuYi55KTtcbiAgICAgICAgICAgICAgaWYgKCF2KSBsaXN0ZW5lci5saW5lRW5kKCk7XG4gICAgICAgICAgICAgIGNsZWFuID0gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHYpIHtcbiAgICAgICAgICAgICAgbGlzdGVuZXIubGluZVN0YXJ0KCk7XG4gICAgICAgICAgICAgIGxpc3RlbmVyLnBvaW50KHgsIHkpO1xuICAgICAgICAgICAgICBjbGVhbiA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB4XyA9IHgsIHlfID0geSwgdl8gPSB2O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNsaXA7XG4gICAgfTtcbiAgICBmdW5jdGlvbiBjb3JuZXIocCwgZGlyZWN0aW9uKSB7XG4gICAgICByZXR1cm4gYWJzKHBbMF0gLSB4MCkgPCDOtSA/IGRpcmVjdGlvbiA+IDAgPyAwIDogMyA6IGFicyhwWzBdIC0geDEpIDwgzrUgPyBkaXJlY3Rpb24gPiAwID8gMiA6IDEgOiBhYnMocFsxXSAtIHkwKSA8IM61ID8gZGlyZWN0aW9uID4gMCA/IDEgOiAwIDogZGlyZWN0aW9uID4gMCA/IDMgOiAyO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjb21wYXJlKGEsIGIpIHtcbiAgICAgIHJldHVybiBjb21wYXJlUG9pbnRzKGEueCwgYi54KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY29tcGFyZVBvaW50cyhhLCBiKSB7XG4gICAgICB2YXIgY2EgPSBjb3JuZXIoYSwgMSksIGNiID0gY29ybmVyKGIsIDEpO1xuICAgICAgcmV0dXJuIGNhICE9PSBjYiA/IGNhIC0gY2IgOiBjYSA9PT0gMCA/IGJbMV0gLSBhWzFdIDogY2EgPT09IDEgPyBhWzBdIC0gYlswXSA6IGNhID09PSAyID8gYVsxXSAtIGJbMV0gOiBiWzBdIC0gYVswXTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvX2NvbmljKHByb2plY3RBdCkge1xuICAgIHZhciDPhjAgPSAwLCDPhjEgPSDPgCAvIDMsIG0gPSBkM19nZW9fcHJvamVjdGlvbk11dGF0b3IocHJvamVjdEF0KSwgcCA9IG0oz4YwLCDPhjEpO1xuICAgIHAucGFyYWxsZWxzID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gWyDPhjAgLyDPgCAqIDE4MCwgz4YxIC8gz4AgKiAxODAgXTtcbiAgICAgIHJldHVybiBtKM+GMCA9IF9bMF0gKiDPgCAvIDE4MCwgz4YxID0gX1sxXSAqIM+AIC8gMTgwKTtcbiAgICB9O1xuICAgIHJldHVybiBwO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb19jb25pY0VxdWFsQXJlYSjPhjAsIM+GMSkge1xuICAgIHZhciBzaW7PhjAgPSBNYXRoLnNpbijPhjApLCBuID0gKHNpbs+GMCArIE1hdGguc2luKM+GMSkpIC8gMiwgQyA9IDEgKyBzaW7PhjAgKiAoMiAqIG4gLSBzaW7PhjApLCDPgTAgPSBNYXRoLnNxcnQoQykgLyBuO1xuICAgIGZ1bmN0aW9uIGZvcndhcmQozrssIM+GKSB7XG4gICAgICB2YXIgz4EgPSBNYXRoLnNxcnQoQyAtIDIgKiBuICogTWF0aC5zaW4oz4YpKSAvIG47XG4gICAgICByZXR1cm4gWyDPgSAqIE1hdGguc2luKM67ICo9IG4pLCDPgTAgLSDPgSAqIE1hdGguY29zKM67KSBdO1xuICAgIH1cbiAgICBmb3J3YXJkLmludmVydCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgIHZhciDPgTBfeSA9IM+BMCAtIHk7XG4gICAgICByZXR1cm4gWyBNYXRoLmF0YW4yKHgsIM+BMF95KSAvIG4sIGQzX2FzaW4oKEMgLSAoeCAqIHggKyDPgTBfeSAqIM+BMF95KSAqIG4gKiBuKSAvICgyICogbikpIF07XG4gICAgfTtcbiAgICByZXR1cm4gZm9yd2FyZDtcbiAgfVxuICAoZDMuZ2VvLmNvbmljRXF1YWxBcmVhID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzX2dlb19jb25pYyhkM19nZW9fY29uaWNFcXVhbEFyZWEpO1xuICB9KS5yYXcgPSBkM19nZW9fY29uaWNFcXVhbEFyZWE7XG4gIGQzLmdlby5hbGJlcnMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDMuZ2VvLmNvbmljRXF1YWxBcmVhKCkucm90YXRlKFsgOTYsIDAgXSkuY2VudGVyKFsgLS42LCAzOC43IF0pLnBhcmFsbGVscyhbIDI5LjUsIDQ1LjUgXSkuc2NhbGUoMTA3MCk7XG4gIH07XG4gIGQzLmdlby5hbGJlcnNVc2EgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbG93ZXI0OCA9IGQzLmdlby5hbGJlcnMoKTtcbiAgICB2YXIgYWxhc2thID0gZDMuZ2VvLmNvbmljRXF1YWxBcmVhKCkucm90YXRlKFsgMTU0LCAwIF0pLmNlbnRlcihbIC0yLCA1OC41IF0pLnBhcmFsbGVscyhbIDU1LCA2NSBdKTtcbiAgICB2YXIgaGF3YWlpID0gZDMuZ2VvLmNvbmljRXF1YWxBcmVhKCkucm90YXRlKFsgMTU3LCAwIF0pLmNlbnRlcihbIC0zLCAxOS45IF0pLnBhcmFsbGVscyhbIDgsIDE4IF0pO1xuICAgIHZhciBwb2ludCwgcG9pbnRTdHJlYW0gPSB7XG4gICAgICBwb2ludDogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICBwb2ludCA9IFsgeCwgeSBdO1xuICAgICAgfVxuICAgIH0sIGxvd2VyNDhQb2ludCwgYWxhc2thUG9pbnQsIGhhd2FpaVBvaW50O1xuICAgIGZ1bmN0aW9uIGFsYmVyc1VzYShjb29yZGluYXRlcykge1xuICAgICAgdmFyIHggPSBjb29yZGluYXRlc1swXSwgeSA9IGNvb3JkaW5hdGVzWzFdO1xuICAgICAgcG9pbnQgPSBudWxsO1xuICAgICAgKGxvd2VyNDhQb2ludCh4LCB5KSwgcG9pbnQpIHx8IChhbGFza2FQb2ludCh4LCB5KSwgcG9pbnQpIHx8IGhhd2FpaVBvaW50KHgsIHkpO1xuICAgICAgcmV0dXJuIHBvaW50O1xuICAgIH1cbiAgICBhbGJlcnNVc2EuaW52ZXJ0ID0gZnVuY3Rpb24oY29vcmRpbmF0ZXMpIHtcbiAgICAgIHZhciBrID0gbG93ZXI0OC5zY2FsZSgpLCB0ID0gbG93ZXI0OC50cmFuc2xhdGUoKSwgeCA9IChjb29yZGluYXRlc1swXSAtIHRbMF0pIC8gaywgeSA9IChjb29yZGluYXRlc1sxXSAtIHRbMV0pIC8gaztcbiAgICAgIHJldHVybiAoeSA+PSAuMTIgJiYgeSA8IC4yMzQgJiYgeCA+PSAtLjQyNSAmJiB4IDwgLS4yMTQgPyBhbGFza2EgOiB5ID49IC4xNjYgJiYgeSA8IC4yMzQgJiYgeCA+PSAtLjIxNCAmJiB4IDwgLS4xMTUgPyBoYXdhaWkgOiBsb3dlcjQ4KS5pbnZlcnQoY29vcmRpbmF0ZXMpO1xuICAgIH07XG4gICAgYWxiZXJzVXNhLnN0cmVhbSA9IGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgICAgdmFyIGxvd2VyNDhTdHJlYW0gPSBsb3dlcjQ4LnN0cmVhbShzdHJlYW0pLCBhbGFza2FTdHJlYW0gPSBhbGFza2Euc3RyZWFtKHN0cmVhbSksIGhhd2FpaVN0cmVhbSA9IGhhd2FpaS5zdHJlYW0oc3RyZWFtKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHBvaW50OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgICAgbG93ZXI0OFN0cmVhbS5wb2ludCh4LCB5KTtcbiAgICAgICAgICBhbGFza2FTdHJlYW0ucG9pbnQoeCwgeSk7XG4gICAgICAgICAgaGF3YWlpU3RyZWFtLnBvaW50KHgsIHkpO1xuICAgICAgICB9LFxuICAgICAgICBzcGhlcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGxvd2VyNDhTdHJlYW0uc3BoZXJlKCk7XG4gICAgICAgICAgYWxhc2thU3RyZWFtLnNwaGVyZSgpO1xuICAgICAgICAgIGhhd2FpaVN0cmVhbS5zcGhlcmUoKTtcbiAgICAgICAgfSxcbiAgICAgICAgbGluZVN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBsb3dlcjQ4U3RyZWFtLmxpbmVTdGFydCgpO1xuICAgICAgICAgIGFsYXNrYVN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgICAgICBoYXdhaWlTdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgICAgIH0sXG4gICAgICAgIGxpbmVFbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGxvd2VyNDhTdHJlYW0ubGluZUVuZCgpO1xuICAgICAgICAgIGFsYXNrYVN0cmVhbS5saW5lRW5kKCk7XG4gICAgICAgICAgaGF3YWlpU3RyZWFtLmxpbmVFbmQoKTtcbiAgICAgICAgfSxcbiAgICAgICAgcG9seWdvblN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBsb3dlcjQ4U3RyZWFtLnBvbHlnb25TdGFydCgpO1xuICAgICAgICAgIGFsYXNrYVN0cmVhbS5wb2x5Z29uU3RhcnQoKTtcbiAgICAgICAgICBoYXdhaWlTdHJlYW0ucG9seWdvblN0YXJ0KCk7XG4gICAgICAgIH0sXG4gICAgICAgIHBvbHlnb25FbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGxvd2VyNDhTdHJlYW0ucG9seWdvbkVuZCgpO1xuICAgICAgICAgIGFsYXNrYVN0cmVhbS5wb2x5Z29uRW5kKCk7XG4gICAgICAgICAgaGF3YWlpU3RyZWFtLnBvbHlnb25FbmQoKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuICAgIGFsYmVyc1VzYS5wcmVjaXNpb24gPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBsb3dlcjQ4LnByZWNpc2lvbigpO1xuICAgICAgbG93ZXI0OC5wcmVjaXNpb24oXyk7XG4gICAgICBhbGFza2EucHJlY2lzaW9uKF8pO1xuICAgICAgaGF3YWlpLnByZWNpc2lvbihfKTtcbiAgICAgIHJldHVybiBhbGJlcnNVc2E7XG4gICAgfTtcbiAgICBhbGJlcnNVc2Euc2NhbGUgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBsb3dlcjQ4LnNjYWxlKCk7XG4gICAgICBsb3dlcjQ4LnNjYWxlKF8pO1xuICAgICAgYWxhc2thLnNjYWxlKF8gKiAuMzUpO1xuICAgICAgaGF3YWlpLnNjYWxlKF8pO1xuICAgICAgcmV0dXJuIGFsYmVyc1VzYS50cmFuc2xhdGUobG93ZXI0OC50cmFuc2xhdGUoKSk7XG4gICAgfTtcbiAgICBhbGJlcnNVc2EudHJhbnNsYXRlID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gbG93ZXI0OC50cmFuc2xhdGUoKTtcbiAgICAgIHZhciBrID0gbG93ZXI0OC5zY2FsZSgpLCB4ID0gK19bMF0sIHkgPSArX1sxXTtcbiAgICAgIGxvd2VyNDhQb2ludCA9IGxvd2VyNDgudHJhbnNsYXRlKF8pLmNsaXBFeHRlbnQoWyBbIHggLSAuNDU1ICogaywgeSAtIC4yMzggKiBrIF0sIFsgeCArIC40NTUgKiBrLCB5ICsgLjIzOCAqIGsgXSBdKS5zdHJlYW0ocG9pbnRTdHJlYW0pLnBvaW50O1xuICAgICAgYWxhc2thUG9pbnQgPSBhbGFza2EudHJhbnNsYXRlKFsgeCAtIC4zMDcgKiBrLCB5ICsgLjIwMSAqIGsgXSkuY2xpcEV4dGVudChbIFsgeCAtIC40MjUgKiBrICsgzrUsIHkgKyAuMTIgKiBrICsgzrUgXSwgWyB4IC0gLjIxNCAqIGsgLSDOtSwgeSArIC4yMzQgKiBrIC0gzrUgXSBdKS5zdHJlYW0ocG9pbnRTdHJlYW0pLnBvaW50O1xuICAgICAgaGF3YWlpUG9pbnQgPSBoYXdhaWkudHJhbnNsYXRlKFsgeCAtIC4yMDUgKiBrLCB5ICsgLjIxMiAqIGsgXSkuY2xpcEV4dGVudChbIFsgeCAtIC4yMTQgKiBrICsgzrUsIHkgKyAuMTY2ICogayArIM61IF0sIFsgeCAtIC4xMTUgKiBrIC0gzrUsIHkgKyAuMjM0ICogayAtIM61IF0gXSkuc3RyZWFtKHBvaW50U3RyZWFtKS5wb2ludDtcbiAgICAgIHJldHVybiBhbGJlcnNVc2E7XG4gICAgfTtcbiAgICByZXR1cm4gYWxiZXJzVXNhLnNjYWxlKDEwNzApO1xuICB9O1xuICB2YXIgZDNfZ2VvX3BhdGhBcmVhU3VtLCBkM19nZW9fcGF0aEFyZWFQb2x5Z29uLCBkM19nZW9fcGF0aEFyZWEgPSB7XG4gICAgcG9pbnQ6IGQzX25vb3AsXG4gICAgbGluZVN0YXJ0OiBkM19ub29wLFxuICAgIGxpbmVFbmQ6IGQzX25vb3AsXG4gICAgcG9seWdvblN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgIGQzX2dlb19wYXRoQXJlYVBvbHlnb24gPSAwO1xuICAgICAgZDNfZ2VvX3BhdGhBcmVhLmxpbmVTdGFydCA9IGQzX2dlb19wYXRoQXJlYVJpbmdTdGFydDtcbiAgICB9LFxuICAgIHBvbHlnb25FbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgZDNfZ2VvX3BhdGhBcmVhLmxpbmVTdGFydCA9IGQzX2dlb19wYXRoQXJlYS5saW5lRW5kID0gZDNfZ2VvX3BhdGhBcmVhLnBvaW50ID0gZDNfbm9vcDtcbiAgICAgIGQzX2dlb19wYXRoQXJlYVN1bSArPSBhYnMoZDNfZ2VvX3BhdGhBcmVhUG9seWdvbiAvIDIpO1xuICAgIH1cbiAgfTtcbiAgZnVuY3Rpb24gZDNfZ2VvX3BhdGhBcmVhUmluZ1N0YXJ0KCkge1xuICAgIHZhciB4MDAsIHkwMCwgeDAsIHkwO1xuICAgIGQzX2dlb19wYXRoQXJlYS5wb2ludCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgIGQzX2dlb19wYXRoQXJlYS5wb2ludCA9IG5leHRQb2ludDtcbiAgICAgIHgwMCA9IHgwID0geCwgeTAwID0geTAgPSB5O1xuICAgIH07XG4gICAgZnVuY3Rpb24gbmV4dFBvaW50KHgsIHkpIHtcbiAgICAgIGQzX2dlb19wYXRoQXJlYVBvbHlnb24gKz0geTAgKiB4IC0geDAgKiB5O1xuICAgICAgeDAgPSB4LCB5MCA9IHk7XG4gICAgfVxuICAgIGQzX2dlb19wYXRoQXJlYS5saW5lRW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICBuZXh0UG9pbnQoeDAwLCB5MDApO1xuICAgIH07XG4gIH1cbiAgdmFyIGQzX2dlb19wYXRoQm91bmRzWDAsIGQzX2dlb19wYXRoQm91bmRzWTAsIGQzX2dlb19wYXRoQm91bmRzWDEsIGQzX2dlb19wYXRoQm91bmRzWTE7XG4gIHZhciBkM19nZW9fcGF0aEJvdW5kcyA9IHtcbiAgICBwb2ludDogZDNfZ2VvX3BhdGhCb3VuZHNQb2ludCxcbiAgICBsaW5lU3RhcnQ6IGQzX25vb3AsXG4gICAgbGluZUVuZDogZDNfbm9vcCxcbiAgICBwb2x5Z29uU3RhcnQ6IGQzX25vb3AsXG4gICAgcG9seWdvbkVuZDogZDNfbm9vcFxuICB9O1xuICBmdW5jdGlvbiBkM19nZW9fcGF0aEJvdW5kc1BvaW50KHgsIHkpIHtcbiAgICBpZiAoeCA8IGQzX2dlb19wYXRoQm91bmRzWDApIGQzX2dlb19wYXRoQm91bmRzWDAgPSB4O1xuICAgIGlmICh4ID4gZDNfZ2VvX3BhdGhCb3VuZHNYMSkgZDNfZ2VvX3BhdGhCb3VuZHNYMSA9IHg7XG4gICAgaWYgKHkgPCBkM19nZW9fcGF0aEJvdW5kc1kwKSBkM19nZW9fcGF0aEJvdW5kc1kwID0geTtcbiAgICBpZiAoeSA+IGQzX2dlb19wYXRoQm91bmRzWTEpIGQzX2dlb19wYXRoQm91bmRzWTEgPSB5O1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb19wYXRoQnVmZmVyKCkge1xuICAgIHZhciBwb2ludENpcmNsZSA9IGQzX2dlb19wYXRoQnVmZmVyQ2lyY2xlKDQuNSksIGJ1ZmZlciA9IFtdO1xuICAgIHZhciBzdHJlYW0gPSB7XG4gICAgICBwb2ludDogcG9pbnQsXG4gICAgICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBzdHJlYW0ucG9pbnQgPSBwb2ludExpbmVTdGFydDtcbiAgICAgIH0sXG4gICAgICBsaW5lRW5kOiBsaW5lRW5kLFxuICAgICAgcG9seWdvblN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgc3RyZWFtLmxpbmVFbmQgPSBsaW5lRW5kUG9seWdvbjtcbiAgICAgIH0sXG4gICAgICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgc3RyZWFtLmxpbmVFbmQgPSBsaW5lRW5kO1xuICAgICAgICBzdHJlYW0ucG9pbnQgPSBwb2ludDtcbiAgICAgIH0sXG4gICAgICBwb2ludFJhZGl1czogZnVuY3Rpb24oXykge1xuICAgICAgICBwb2ludENpcmNsZSA9IGQzX2dlb19wYXRoQnVmZmVyQ2lyY2xlKF8pO1xuICAgICAgICByZXR1cm4gc3RyZWFtO1xuICAgICAgfSxcbiAgICAgIHJlc3VsdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChidWZmZXIubGVuZ3RoKSB7XG4gICAgICAgICAgdmFyIHJlc3VsdCA9IGJ1ZmZlci5qb2luKFwiXCIpO1xuICAgICAgICAgIGJ1ZmZlciA9IFtdO1xuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICAgIGZ1bmN0aW9uIHBvaW50KHgsIHkpIHtcbiAgICAgIGJ1ZmZlci5wdXNoKFwiTVwiLCB4LCBcIixcIiwgeSwgcG9pbnRDaXJjbGUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBwb2ludExpbmVTdGFydCh4LCB5KSB7XG4gICAgICBidWZmZXIucHVzaChcIk1cIiwgeCwgXCIsXCIsIHkpO1xuICAgICAgc3RyZWFtLnBvaW50ID0gcG9pbnRMaW5lO1xuICAgIH1cbiAgICBmdW5jdGlvbiBwb2ludExpbmUoeCwgeSkge1xuICAgICAgYnVmZmVyLnB1c2goXCJMXCIsIHgsIFwiLFwiLCB5KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gbGluZUVuZCgpIHtcbiAgICAgIHN0cmVhbS5wb2ludCA9IHBvaW50O1xuICAgIH1cbiAgICBmdW5jdGlvbiBsaW5lRW5kUG9seWdvbigpIHtcbiAgICAgIGJ1ZmZlci5wdXNoKFwiWlwiKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0cmVhbTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fcGF0aEJ1ZmZlckNpcmNsZShyYWRpdXMpIHtcbiAgICByZXR1cm4gXCJtMCxcIiArIHJhZGl1cyArIFwiYVwiICsgcmFkaXVzICsgXCIsXCIgKyByYWRpdXMgKyBcIiAwIDEsMSAwLFwiICsgLTIgKiByYWRpdXMgKyBcImFcIiArIHJhZGl1cyArIFwiLFwiICsgcmFkaXVzICsgXCIgMCAxLDEgMCxcIiArIDIgKiByYWRpdXMgKyBcInpcIjtcbiAgfVxuICB2YXIgZDNfZ2VvX3BhdGhDZW50cm9pZCA9IHtcbiAgICBwb2ludDogZDNfZ2VvX3BhdGhDZW50cm9pZFBvaW50LFxuICAgIGxpbmVTdGFydDogZDNfZ2VvX3BhdGhDZW50cm9pZExpbmVTdGFydCxcbiAgICBsaW5lRW5kOiBkM19nZW9fcGF0aENlbnRyb2lkTGluZUVuZCxcbiAgICBwb2x5Z29uU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgZDNfZ2VvX3BhdGhDZW50cm9pZC5saW5lU3RhcnQgPSBkM19nZW9fcGF0aENlbnRyb2lkUmluZ1N0YXJ0O1xuICAgIH0sXG4gICAgcG9seWdvbkVuZDogZnVuY3Rpb24oKSB7XG4gICAgICBkM19nZW9fcGF0aENlbnRyb2lkLnBvaW50ID0gZDNfZ2VvX3BhdGhDZW50cm9pZFBvaW50O1xuICAgICAgZDNfZ2VvX3BhdGhDZW50cm9pZC5saW5lU3RhcnQgPSBkM19nZW9fcGF0aENlbnRyb2lkTGluZVN0YXJ0O1xuICAgICAgZDNfZ2VvX3BhdGhDZW50cm9pZC5saW5lRW5kID0gZDNfZ2VvX3BhdGhDZW50cm9pZExpbmVFbmQ7XG4gICAgfVxuICB9O1xuICBmdW5jdGlvbiBkM19nZW9fcGF0aENlbnRyb2lkUG9pbnQoeCwgeSkge1xuICAgIGQzX2dlb19jZW50cm9pZFgwICs9IHg7XG4gICAgZDNfZ2VvX2NlbnRyb2lkWTAgKz0geTtcbiAgICArK2QzX2dlb19jZW50cm9pZFowO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb19wYXRoQ2VudHJvaWRMaW5lU3RhcnQoKSB7XG4gICAgdmFyIHgwLCB5MDtcbiAgICBkM19nZW9fcGF0aENlbnRyb2lkLnBvaW50ID0gZnVuY3Rpb24oeCwgeSkge1xuICAgICAgZDNfZ2VvX3BhdGhDZW50cm9pZC5wb2ludCA9IG5leHRQb2ludDtcbiAgICAgIGQzX2dlb19wYXRoQ2VudHJvaWRQb2ludCh4MCA9IHgsIHkwID0geSk7XG4gICAgfTtcbiAgICBmdW5jdGlvbiBuZXh0UG9pbnQoeCwgeSkge1xuICAgICAgdmFyIGR4ID0geCAtIHgwLCBkeSA9IHkgLSB5MCwgeiA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG4gICAgICBkM19nZW9fY2VudHJvaWRYMSArPSB6ICogKHgwICsgeCkgLyAyO1xuICAgICAgZDNfZ2VvX2NlbnRyb2lkWTEgKz0geiAqICh5MCArIHkpIC8gMjtcbiAgICAgIGQzX2dlb19jZW50cm9pZFoxICs9IHo7XG4gICAgICBkM19nZW9fcGF0aENlbnRyb2lkUG9pbnQoeDAgPSB4LCB5MCA9IHkpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fcGF0aENlbnRyb2lkTGluZUVuZCgpIHtcbiAgICBkM19nZW9fcGF0aENlbnRyb2lkLnBvaW50ID0gZDNfZ2VvX3BhdGhDZW50cm9pZFBvaW50O1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb19wYXRoQ2VudHJvaWRSaW5nU3RhcnQoKSB7XG4gICAgdmFyIHgwMCwgeTAwLCB4MCwgeTA7XG4gICAgZDNfZ2VvX3BhdGhDZW50cm9pZC5wb2ludCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgIGQzX2dlb19wYXRoQ2VudHJvaWQucG9pbnQgPSBuZXh0UG9pbnQ7XG4gICAgICBkM19nZW9fcGF0aENlbnRyb2lkUG9pbnQoeDAwID0geDAgPSB4LCB5MDAgPSB5MCA9IHkpO1xuICAgIH07XG4gICAgZnVuY3Rpb24gbmV4dFBvaW50KHgsIHkpIHtcbiAgICAgIHZhciBkeCA9IHggLSB4MCwgZHkgPSB5IC0geTAsIHogPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuICAgICAgZDNfZ2VvX2NlbnRyb2lkWDEgKz0geiAqICh4MCArIHgpIC8gMjtcbiAgICAgIGQzX2dlb19jZW50cm9pZFkxICs9IHogKiAoeTAgKyB5KSAvIDI7XG4gICAgICBkM19nZW9fY2VudHJvaWRaMSArPSB6O1xuICAgICAgeiA9IHkwICogeCAtIHgwICogeTtcbiAgICAgIGQzX2dlb19jZW50cm9pZFgyICs9IHogKiAoeDAgKyB4KTtcbiAgICAgIGQzX2dlb19jZW50cm9pZFkyICs9IHogKiAoeTAgKyB5KTtcbiAgICAgIGQzX2dlb19jZW50cm9pZFoyICs9IHogKiAzO1xuICAgICAgZDNfZ2VvX3BhdGhDZW50cm9pZFBvaW50KHgwID0geCwgeTAgPSB5KTtcbiAgICB9XG4gICAgZDNfZ2VvX3BhdGhDZW50cm9pZC5saW5lRW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICBuZXh0UG9pbnQoeDAwLCB5MDApO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvX3BhdGhDb250ZXh0KGNvbnRleHQpIHtcbiAgICB2YXIgcG9pbnRSYWRpdXMgPSA0LjU7XG4gICAgdmFyIHN0cmVhbSA9IHtcbiAgICAgIHBvaW50OiBwb2ludCxcbiAgICAgIGxpbmVTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHN0cmVhbS5wb2ludCA9IHBvaW50TGluZVN0YXJ0O1xuICAgICAgfSxcbiAgICAgIGxpbmVFbmQ6IGxpbmVFbmQsXG4gICAgICBwb2x5Z29uU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBzdHJlYW0ubGluZUVuZCA9IGxpbmVFbmRQb2x5Z29uO1xuICAgICAgfSxcbiAgICAgIHBvbHlnb25FbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBzdHJlYW0ubGluZUVuZCA9IGxpbmVFbmQ7XG4gICAgICAgIHN0cmVhbS5wb2ludCA9IHBvaW50O1xuICAgICAgfSxcbiAgICAgIHBvaW50UmFkaXVzOiBmdW5jdGlvbihfKSB7XG4gICAgICAgIHBvaW50UmFkaXVzID0gXztcbiAgICAgICAgcmV0dXJuIHN0cmVhbTtcbiAgICAgIH0sXG4gICAgICByZXN1bHQ6IGQzX25vb3BcbiAgICB9O1xuICAgIGZ1bmN0aW9uIHBvaW50KHgsIHkpIHtcbiAgICAgIGNvbnRleHQubW92ZVRvKHggKyBwb2ludFJhZGl1cywgeSk7XG4gICAgICBjb250ZXh0LmFyYyh4LCB5LCBwb2ludFJhZGl1cywgMCwgz4QpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBwb2ludExpbmVTdGFydCh4LCB5KSB7XG4gICAgICBjb250ZXh0Lm1vdmVUbyh4LCB5KTtcbiAgICAgIHN0cmVhbS5wb2ludCA9IHBvaW50TGluZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcG9pbnRMaW5lKHgsIHkpIHtcbiAgICAgIGNvbnRleHQubGluZVRvKHgsIHkpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBsaW5lRW5kKCkge1xuICAgICAgc3RyZWFtLnBvaW50ID0gcG9pbnQ7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGxpbmVFbmRQb2x5Z29uKCkge1xuICAgICAgY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0cmVhbTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fcmVzYW1wbGUocHJvamVjdCkge1xuICAgIHZhciDOtDIgPSAuNSwgY29zTWluRGlzdGFuY2UgPSBNYXRoLmNvcygzMCAqIGQzX3JhZGlhbnMpLCBtYXhEZXB0aCA9IDE2O1xuICAgIGZ1bmN0aW9uIHJlc2FtcGxlKHN0cmVhbSkge1xuICAgICAgcmV0dXJuIChtYXhEZXB0aCA/IHJlc2FtcGxlUmVjdXJzaXZlIDogcmVzYW1wbGVOb25lKShzdHJlYW0pO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZXNhbXBsZU5vbmUoc3RyZWFtKSB7XG4gICAgICByZXR1cm4gZDNfZ2VvX3RyYW5zZm9ybVBvaW50KHN0cmVhbSwgZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICB4ID0gcHJvamVjdCh4LCB5KTtcbiAgICAgICAgc3RyZWFtLnBvaW50KHhbMF0sIHhbMV0pO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlc2FtcGxlUmVjdXJzaXZlKHN0cmVhbSkge1xuICAgICAgdmFyIM67MDAsIM+GMDAsIHgwMCwgeTAwLCBhMDAsIGIwMCwgYzAwLCDOuzAsIHgwLCB5MCwgYTAsIGIwLCBjMDtcbiAgICAgIHZhciByZXNhbXBsZSA9IHtcbiAgICAgICAgcG9pbnQ6IHBvaW50LFxuICAgICAgICBsaW5lU3RhcnQ6IGxpbmVTdGFydCxcbiAgICAgICAgbGluZUVuZDogbGluZUVuZCxcbiAgICAgICAgcG9seWdvblN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBzdHJlYW0ucG9seWdvblN0YXJ0KCk7XG4gICAgICAgICAgcmVzYW1wbGUubGluZVN0YXJ0ID0gcmluZ1N0YXJ0O1xuICAgICAgICB9LFxuICAgICAgICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBzdHJlYW0ucG9seWdvbkVuZCgpO1xuICAgICAgICAgIHJlc2FtcGxlLmxpbmVTdGFydCA9IGxpbmVTdGFydDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGZ1bmN0aW9uIHBvaW50KHgsIHkpIHtcbiAgICAgICAgeCA9IHByb2plY3QoeCwgeSk7XG4gICAgICAgIHN0cmVhbS5wb2ludCh4WzBdLCB4WzFdKTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIGxpbmVTdGFydCgpIHtcbiAgICAgICAgeDAgPSBOYU47XG4gICAgICAgIHJlc2FtcGxlLnBvaW50ID0gbGluZVBvaW50O1xuICAgICAgICBzdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBsaW5lUG9pbnQozrssIM+GKSB7XG4gICAgICAgIHZhciBjID0gZDNfZ2VvX2NhcnRlc2lhbihbIM67LCDPhiBdKSwgcCA9IHByb2plY3QozrssIM+GKTtcbiAgICAgICAgcmVzYW1wbGVMaW5lVG8oeDAsIHkwLCDOuzAsIGEwLCBiMCwgYzAsIHgwID0gcFswXSwgeTAgPSBwWzFdLCDOuzAgPSDOuywgYTAgPSBjWzBdLCBiMCA9IGNbMV0sIGMwID0gY1syXSwgbWF4RGVwdGgsIHN0cmVhbSk7XG4gICAgICAgIHN0cmVhbS5wb2ludCh4MCwgeTApO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gbGluZUVuZCgpIHtcbiAgICAgICAgcmVzYW1wbGUucG9pbnQgPSBwb2ludDtcbiAgICAgICAgc3RyZWFtLmxpbmVFbmQoKTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIHJpbmdTdGFydCgpIHtcbiAgICAgICAgbGluZVN0YXJ0KCk7XG4gICAgICAgIHJlc2FtcGxlLnBvaW50ID0gcmluZ1BvaW50O1xuICAgICAgICByZXNhbXBsZS5saW5lRW5kID0gcmluZ0VuZDtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIHJpbmdQb2ludCjOuywgz4YpIHtcbiAgICAgICAgbGluZVBvaW50KM67MDAgPSDOuywgz4YwMCA9IM+GKSwgeDAwID0geDAsIHkwMCA9IHkwLCBhMDAgPSBhMCwgYjAwID0gYjAsIGMwMCA9IGMwO1xuICAgICAgICByZXNhbXBsZS5wb2ludCA9IGxpbmVQb2ludDtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIHJpbmdFbmQoKSB7XG4gICAgICAgIHJlc2FtcGxlTGluZVRvKHgwLCB5MCwgzrswLCBhMCwgYjAsIGMwLCB4MDAsIHkwMCwgzrswMCwgYTAwLCBiMDAsIGMwMCwgbWF4RGVwdGgsIHN0cmVhbSk7XG4gICAgICAgIHJlc2FtcGxlLmxpbmVFbmQgPSBsaW5lRW5kO1xuICAgICAgICBsaW5lRW5kKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzYW1wbGU7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlc2FtcGxlTGluZVRvKHgwLCB5MCwgzrswLCBhMCwgYjAsIGMwLCB4MSwgeTEsIM67MSwgYTEsIGIxLCBjMSwgZGVwdGgsIHN0cmVhbSkge1xuICAgICAgdmFyIGR4ID0geDEgLSB4MCwgZHkgPSB5MSAtIHkwLCBkMiA9IGR4ICogZHggKyBkeSAqIGR5O1xuICAgICAgaWYgKGQyID4gNCAqIM60MiAmJiBkZXB0aC0tKSB7XG4gICAgICAgIHZhciBhID0gYTAgKyBhMSwgYiA9IGIwICsgYjEsIGMgPSBjMCArIGMxLCBtID0gTWF0aC5zcXJ0KGEgKiBhICsgYiAqIGIgKyBjICogYyksIM+GMiA9IE1hdGguYXNpbihjIC89IG0pLCDOuzIgPSBhYnMoYWJzKGMpIC0gMSkgPCDOtSB8fCBhYnMozrswIC0gzrsxKSA8IM61ID8gKM67MCArIM67MSkgLyAyIDogTWF0aC5hdGFuMihiLCBhKSwgcCA9IHByb2plY3QozrsyLCDPhjIpLCB4MiA9IHBbMF0sIHkyID0gcFsxXSwgZHgyID0geDIgLSB4MCwgZHkyID0geTIgLSB5MCwgZHogPSBkeSAqIGR4MiAtIGR4ICogZHkyO1xuICAgICAgICBpZiAoZHogKiBkeiAvIGQyID4gzrQyIHx8IGFicygoZHggKiBkeDIgKyBkeSAqIGR5MikgLyBkMiAtIC41KSA+IC4zIHx8IGEwICogYTEgKyBiMCAqIGIxICsgYzAgKiBjMSA8IGNvc01pbkRpc3RhbmNlKSB7XG4gICAgICAgICAgcmVzYW1wbGVMaW5lVG8oeDAsIHkwLCDOuzAsIGEwLCBiMCwgYzAsIHgyLCB5MiwgzrsyLCBhIC89IG0sIGIgLz0gbSwgYywgZGVwdGgsIHN0cmVhbSk7XG4gICAgICAgICAgc3RyZWFtLnBvaW50KHgyLCB5Mik7XG4gICAgICAgICAgcmVzYW1wbGVMaW5lVG8oeDIsIHkyLCDOuzIsIGEsIGIsIGMsIHgxLCB5MSwgzrsxLCBhMSwgYjEsIGMxLCBkZXB0aCwgc3RyZWFtKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXNhbXBsZS5wcmVjaXNpb24gPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBNYXRoLnNxcnQozrQyKTtcbiAgICAgIG1heERlcHRoID0gKM60MiA9IF8gKiBfKSA+IDAgJiYgMTY7XG4gICAgICByZXR1cm4gcmVzYW1wbGU7XG4gICAgfTtcbiAgICByZXR1cm4gcmVzYW1wbGU7XG4gIH1cbiAgZDMuZ2VvLnBhdGggPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcG9pbnRSYWRpdXMgPSA0LjUsIHByb2plY3Rpb24sIGNvbnRleHQsIHByb2plY3RTdHJlYW0sIGNvbnRleHRTdHJlYW0sIGNhY2hlU3RyZWFtO1xuICAgIGZ1bmN0aW9uIHBhdGgob2JqZWN0KSB7XG4gICAgICBpZiAob2JqZWN0KSB7XG4gICAgICAgIGlmICh0eXBlb2YgcG9pbnRSYWRpdXMgPT09IFwiZnVuY3Rpb25cIikgY29udGV4dFN0cmVhbS5wb2ludFJhZGl1cygrcG9pbnRSYWRpdXMuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gICAgICAgIGlmICghY2FjaGVTdHJlYW0gfHwgIWNhY2hlU3RyZWFtLnZhbGlkKSBjYWNoZVN0cmVhbSA9IHByb2plY3RTdHJlYW0oY29udGV4dFN0cmVhbSk7XG4gICAgICAgIGQzLmdlby5zdHJlYW0ob2JqZWN0LCBjYWNoZVN0cmVhbSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29udGV4dFN0cmVhbS5yZXN1bHQoKTtcbiAgICB9XG4gICAgcGF0aC5hcmVhID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgICBkM19nZW9fcGF0aEFyZWFTdW0gPSAwO1xuICAgICAgZDMuZ2VvLnN0cmVhbShvYmplY3QsIHByb2plY3RTdHJlYW0oZDNfZ2VvX3BhdGhBcmVhKSk7XG4gICAgICByZXR1cm4gZDNfZ2VvX3BhdGhBcmVhU3VtO1xuICAgIH07XG4gICAgcGF0aC5jZW50cm9pZCA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgICAgZDNfZ2VvX2NlbnRyb2lkWDAgPSBkM19nZW9fY2VudHJvaWRZMCA9IGQzX2dlb19jZW50cm9pZFowID0gZDNfZ2VvX2NlbnRyb2lkWDEgPSBkM19nZW9fY2VudHJvaWRZMSA9IGQzX2dlb19jZW50cm9pZFoxID0gZDNfZ2VvX2NlbnRyb2lkWDIgPSBkM19nZW9fY2VudHJvaWRZMiA9IGQzX2dlb19jZW50cm9pZFoyID0gMDtcbiAgICAgIGQzLmdlby5zdHJlYW0ob2JqZWN0LCBwcm9qZWN0U3RyZWFtKGQzX2dlb19wYXRoQ2VudHJvaWQpKTtcbiAgICAgIHJldHVybiBkM19nZW9fY2VudHJvaWRaMiA/IFsgZDNfZ2VvX2NlbnRyb2lkWDIgLyBkM19nZW9fY2VudHJvaWRaMiwgZDNfZ2VvX2NlbnRyb2lkWTIgLyBkM19nZW9fY2VudHJvaWRaMiBdIDogZDNfZ2VvX2NlbnRyb2lkWjEgPyBbIGQzX2dlb19jZW50cm9pZFgxIC8gZDNfZ2VvX2NlbnRyb2lkWjEsIGQzX2dlb19jZW50cm9pZFkxIC8gZDNfZ2VvX2NlbnRyb2lkWjEgXSA6IGQzX2dlb19jZW50cm9pZFowID8gWyBkM19nZW9fY2VudHJvaWRYMCAvIGQzX2dlb19jZW50cm9pZFowLCBkM19nZW9fY2VudHJvaWRZMCAvIGQzX2dlb19jZW50cm9pZFowIF0gOiBbIE5hTiwgTmFOIF07XG4gICAgfTtcbiAgICBwYXRoLmJvdW5kcyA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgICAgZDNfZ2VvX3BhdGhCb3VuZHNYMSA9IGQzX2dlb19wYXRoQm91bmRzWTEgPSAtKGQzX2dlb19wYXRoQm91bmRzWDAgPSBkM19nZW9fcGF0aEJvdW5kc1kwID0gSW5maW5pdHkpO1xuICAgICAgZDMuZ2VvLnN0cmVhbShvYmplY3QsIHByb2plY3RTdHJlYW0oZDNfZ2VvX3BhdGhCb3VuZHMpKTtcbiAgICAgIHJldHVybiBbIFsgZDNfZ2VvX3BhdGhCb3VuZHNYMCwgZDNfZ2VvX3BhdGhCb3VuZHNZMCBdLCBbIGQzX2dlb19wYXRoQm91bmRzWDEsIGQzX2dlb19wYXRoQm91bmRzWTEgXSBdO1xuICAgIH07XG4gICAgcGF0aC5wcm9qZWN0aW9uID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gcHJvamVjdGlvbjtcbiAgICAgIHByb2plY3RTdHJlYW0gPSAocHJvamVjdGlvbiA9IF8pID8gXy5zdHJlYW0gfHwgZDNfZ2VvX3BhdGhQcm9qZWN0U3RyZWFtKF8pIDogZDNfaWRlbnRpdHk7XG4gICAgICByZXR1cm4gcmVzZXQoKTtcbiAgICB9O1xuICAgIHBhdGguY29udGV4dCA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGNvbnRleHQ7XG4gICAgICBjb250ZXh0U3RyZWFtID0gKGNvbnRleHQgPSBfKSA9PSBudWxsID8gbmV3IGQzX2dlb19wYXRoQnVmZmVyKCkgOiBuZXcgZDNfZ2VvX3BhdGhDb250ZXh0KF8pO1xuICAgICAgaWYgKHR5cGVvZiBwb2ludFJhZGl1cyAhPT0gXCJmdW5jdGlvblwiKSBjb250ZXh0U3RyZWFtLnBvaW50UmFkaXVzKHBvaW50UmFkaXVzKTtcbiAgICAgIHJldHVybiByZXNldCgpO1xuICAgIH07XG4gICAgcGF0aC5wb2ludFJhZGl1cyA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHBvaW50UmFkaXVzO1xuICAgICAgcG9pbnRSYWRpdXMgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IChjb250ZXh0U3RyZWFtLnBvaW50UmFkaXVzKCtfKSwgK18pO1xuICAgICAgcmV0dXJuIHBhdGg7XG4gICAgfTtcbiAgICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICAgIGNhY2hlU3RyZWFtID0gbnVsbDtcbiAgICAgIHJldHVybiBwYXRoO1xuICAgIH1cbiAgICByZXR1cm4gcGF0aC5wcm9qZWN0aW9uKGQzLmdlby5hbGJlcnNVc2EoKSkuY29udGV4dChudWxsKTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfZ2VvX3BhdGhQcm9qZWN0U3RyZWFtKHByb2plY3QpIHtcbiAgICB2YXIgcmVzYW1wbGUgPSBkM19nZW9fcmVzYW1wbGUoZnVuY3Rpb24oeCwgeSkge1xuICAgICAgcmV0dXJuIHByb2plY3QoWyB4ICogZDNfZGVncmVlcywgeSAqIGQzX2RlZ3JlZXMgXSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgICAgcmV0dXJuIGQzX2dlb19wcm9qZWN0aW9uUmFkaWFucyhyZXNhbXBsZShzdHJlYW0pKTtcbiAgICB9O1xuICB9XG4gIGQzLmdlby50cmFuc2Zvcm0gPSBmdW5jdGlvbihtZXRob2RzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0cmVhbTogZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICAgIHZhciB0cmFuc2Zvcm0gPSBuZXcgZDNfZ2VvX3RyYW5zZm9ybShzdHJlYW0pO1xuICAgICAgICBmb3IgKHZhciBrIGluIG1ldGhvZHMpIHRyYW5zZm9ybVtrXSA9IG1ldGhvZHNba107XG4gICAgICAgIHJldHVybiB0cmFuc2Zvcm07XG4gICAgICB9XG4gICAgfTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfZ2VvX3RyYW5zZm9ybShzdHJlYW0pIHtcbiAgICB0aGlzLnN0cmVhbSA9IHN0cmVhbTtcbiAgfVxuICBkM19nZW9fdHJhbnNmb3JtLnByb3RvdHlwZSA9IHtcbiAgICBwb2ludDogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgdGhpcy5zdHJlYW0ucG9pbnQoeCwgeSk7XG4gICAgfSxcbiAgICBzcGhlcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zdHJlYW0uc3BoZXJlKCk7XG4gICAgfSxcbiAgICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgfSxcbiAgICBsaW5lRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc3RyZWFtLmxpbmVFbmQoKTtcbiAgICB9LFxuICAgIHBvbHlnb25TdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnN0cmVhbS5wb2x5Z29uU3RhcnQoKTtcbiAgICB9LFxuICAgIHBvbHlnb25FbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zdHJlYW0ucG9seWdvbkVuZCgpO1xuICAgIH1cbiAgfTtcbiAgZnVuY3Rpb24gZDNfZ2VvX3RyYW5zZm9ybVBvaW50KHN0cmVhbSwgcG9pbnQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcG9pbnQ6IHBvaW50LFxuICAgICAgc3BoZXJlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgc3RyZWFtLnNwaGVyZSgpO1xuICAgICAgfSxcbiAgICAgIGxpbmVTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgIH0sXG4gICAgICBsaW5lRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgc3RyZWFtLmxpbmVFbmQoKTtcbiAgICAgIH0sXG4gICAgICBwb2x5Z29uU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBzdHJlYW0ucG9seWdvblN0YXJ0KCk7XG4gICAgICB9LFxuICAgICAgcG9seWdvbkVuZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHN0cmVhbS5wb2x5Z29uRW5kKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICBkMy5nZW8ucHJvamVjdGlvbiA9IGQzX2dlb19wcm9qZWN0aW9uO1xuICBkMy5nZW8ucHJvamVjdGlvbk11dGF0b3IgPSBkM19nZW9fcHJvamVjdGlvbk11dGF0b3I7XG4gIGZ1bmN0aW9uIGQzX2dlb19wcm9qZWN0aW9uKHByb2plY3QpIHtcbiAgICByZXR1cm4gZDNfZ2VvX3Byb2plY3Rpb25NdXRhdG9yKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHByb2plY3Q7XG4gICAgfSkoKTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fcHJvamVjdGlvbk11dGF0b3IocHJvamVjdEF0KSB7XG4gICAgdmFyIHByb2plY3QsIHJvdGF0ZSwgcHJvamVjdFJvdGF0ZSwgcHJvamVjdFJlc2FtcGxlID0gZDNfZ2VvX3Jlc2FtcGxlKGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgIHggPSBwcm9qZWN0KHgsIHkpO1xuICAgICAgcmV0dXJuIFsgeFswXSAqIGsgKyDOtHgsIM60eSAtIHhbMV0gKiBrIF07XG4gICAgfSksIGsgPSAxNTAsIHggPSA0ODAsIHkgPSAyNTAsIM67ID0gMCwgz4YgPSAwLCDOtM67ID0gMCwgzrTPhiA9IDAsIM60zrMgPSAwLCDOtHgsIM60eSwgcHJlY2xpcCA9IGQzX2dlb19jbGlwQW50aW1lcmlkaWFuLCBwb3N0Y2xpcCA9IGQzX2lkZW50aXR5LCBjbGlwQW5nbGUgPSBudWxsLCBjbGlwRXh0ZW50ID0gbnVsbCwgc3RyZWFtO1xuICAgIGZ1bmN0aW9uIHByb2plY3Rpb24ocG9pbnQpIHtcbiAgICAgIHBvaW50ID0gcHJvamVjdFJvdGF0ZShwb2ludFswXSAqIGQzX3JhZGlhbnMsIHBvaW50WzFdICogZDNfcmFkaWFucyk7XG4gICAgICByZXR1cm4gWyBwb2ludFswXSAqIGsgKyDOtHgsIM60eSAtIHBvaW50WzFdICogayBdO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpbnZlcnQocG9pbnQpIHtcbiAgICAgIHBvaW50ID0gcHJvamVjdFJvdGF0ZS5pbnZlcnQoKHBvaW50WzBdIC0gzrR4KSAvIGssICjOtHkgLSBwb2ludFsxXSkgLyBrKTtcbiAgICAgIHJldHVybiBwb2ludCAmJiBbIHBvaW50WzBdICogZDNfZGVncmVlcywgcG9pbnRbMV0gKiBkM19kZWdyZWVzIF07XG4gICAgfVxuICAgIHByb2plY3Rpb24uc3RyZWFtID0gZnVuY3Rpb24ob3V0cHV0KSB7XG4gICAgICBpZiAoc3RyZWFtKSBzdHJlYW0udmFsaWQgPSBmYWxzZTtcbiAgICAgIHN0cmVhbSA9IGQzX2dlb19wcm9qZWN0aW9uUmFkaWFucyhwcmVjbGlwKHJvdGF0ZSwgcHJvamVjdFJlc2FtcGxlKHBvc3RjbGlwKG91dHB1dCkpKSk7XG4gICAgICBzdHJlYW0udmFsaWQgPSB0cnVlO1xuICAgICAgcmV0dXJuIHN0cmVhbTtcbiAgICB9O1xuICAgIHByb2plY3Rpb24uY2xpcEFuZ2xlID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gY2xpcEFuZ2xlO1xuICAgICAgcHJlY2xpcCA9IF8gPT0gbnVsbCA/IChjbGlwQW5nbGUgPSBfLCBkM19nZW9fY2xpcEFudGltZXJpZGlhbikgOiBkM19nZW9fY2xpcENpcmNsZSgoY2xpcEFuZ2xlID0gK18pICogZDNfcmFkaWFucyk7XG4gICAgICByZXR1cm4gaW52YWxpZGF0ZSgpO1xuICAgIH07XG4gICAgcHJvamVjdGlvbi5jbGlwRXh0ZW50ID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gY2xpcEV4dGVudDtcbiAgICAgIGNsaXBFeHRlbnQgPSBfO1xuICAgICAgcG9zdGNsaXAgPSBfID8gZDNfZ2VvX2NsaXBFeHRlbnQoX1swXVswXSwgX1swXVsxXSwgX1sxXVswXSwgX1sxXVsxXSkgOiBkM19pZGVudGl0eTtcbiAgICAgIHJldHVybiBpbnZhbGlkYXRlKCk7XG4gICAgfTtcbiAgICBwcm9qZWN0aW9uLnNjYWxlID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gaztcbiAgICAgIGsgPSArXztcbiAgICAgIHJldHVybiByZXNldCgpO1xuICAgIH07XG4gICAgcHJvamVjdGlvbi50cmFuc2xhdGUgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBbIHgsIHkgXTtcbiAgICAgIHggPSArX1swXTtcbiAgICAgIHkgPSArX1sxXTtcbiAgICAgIHJldHVybiByZXNldCgpO1xuICAgIH07XG4gICAgcHJvamVjdGlvbi5jZW50ZXIgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBbIM67ICogZDNfZGVncmVlcywgz4YgKiBkM19kZWdyZWVzIF07XG4gICAgICDOuyA9IF9bMF0gJSAzNjAgKiBkM19yYWRpYW5zO1xuICAgICAgz4YgPSBfWzFdICUgMzYwICogZDNfcmFkaWFucztcbiAgICAgIHJldHVybiByZXNldCgpO1xuICAgIH07XG4gICAgcHJvamVjdGlvbi5yb3RhdGUgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBbIM60zrsgKiBkM19kZWdyZWVzLCDOtM+GICogZDNfZGVncmVlcywgzrTOsyAqIGQzX2RlZ3JlZXMgXTtcbiAgICAgIM60zrsgPSBfWzBdICUgMzYwICogZDNfcmFkaWFucztcbiAgICAgIM60z4YgPSBfWzFdICUgMzYwICogZDNfcmFkaWFucztcbiAgICAgIM60zrMgPSBfLmxlbmd0aCA+IDIgPyBfWzJdICUgMzYwICogZDNfcmFkaWFucyA6IDA7XG4gICAgICByZXR1cm4gcmVzZXQoKTtcbiAgICB9O1xuICAgIGQzLnJlYmluZChwcm9qZWN0aW9uLCBwcm9qZWN0UmVzYW1wbGUsIFwicHJlY2lzaW9uXCIpO1xuICAgIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgICAgcHJvamVjdFJvdGF0ZSA9IGQzX2dlb19jb21wb3NlKHJvdGF0ZSA9IGQzX2dlb19yb3RhdGlvbijOtM67LCDOtM+GLCDOtM6zKSwgcHJvamVjdCk7XG4gICAgICB2YXIgY2VudGVyID0gcHJvamVjdCjOuywgz4YpO1xuICAgICAgzrR4ID0geCAtIGNlbnRlclswXSAqIGs7XG4gICAgICDOtHkgPSB5ICsgY2VudGVyWzFdICogaztcbiAgICAgIHJldHVybiBpbnZhbGlkYXRlKCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGludmFsaWRhdGUoKSB7XG4gICAgICBpZiAoc3RyZWFtKSBzdHJlYW0udmFsaWQgPSBmYWxzZSwgc3RyZWFtID0gbnVsbDtcbiAgICAgIHJldHVybiBwcm9qZWN0aW9uO1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBwcm9qZWN0ID0gcHJvamVjdEF0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBwcm9qZWN0aW9uLmludmVydCA9IHByb2plY3QuaW52ZXJ0ICYmIGludmVydDtcbiAgICAgIHJldHVybiByZXNldCgpO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvX3Byb2plY3Rpb25SYWRpYW5zKHN0cmVhbSkge1xuICAgIHJldHVybiBkM19nZW9fdHJhbnNmb3JtUG9pbnQoc3RyZWFtLCBmdW5jdGlvbih4LCB5KSB7XG4gICAgICBzdHJlYW0ucG9pbnQoeCAqIGQzX3JhZGlhbnMsIHkgKiBkM19yYWRpYW5zKTtcbiAgICB9KTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fZXF1aXJlY3Rhbmd1bGFyKM67LCDPhikge1xuICAgIHJldHVybiBbIM67LCDPhiBdO1xuICB9XG4gIChkMy5nZW8uZXF1aXJlY3Rhbmd1bGFyID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzX2dlb19wcm9qZWN0aW9uKGQzX2dlb19lcXVpcmVjdGFuZ3VsYXIpO1xuICB9KS5yYXcgPSBkM19nZW9fZXF1aXJlY3Rhbmd1bGFyLmludmVydCA9IGQzX2dlb19lcXVpcmVjdGFuZ3VsYXI7XG4gIGQzLmdlby5yb3RhdGlvbiA9IGZ1bmN0aW9uKHJvdGF0ZSkge1xuICAgIHJvdGF0ZSA9IGQzX2dlb19yb3RhdGlvbihyb3RhdGVbMF0gJSAzNjAgKiBkM19yYWRpYW5zLCByb3RhdGVbMV0gKiBkM19yYWRpYW5zLCByb3RhdGUubGVuZ3RoID4gMiA/IHJvdGF0ZVsyXSAqIGQzX3JhZGlhbnMgOiAwKTtcbiAgICBmdW5jdGlvbiBmb3J3YXJkKGNvb3JkaW5hdGVzKSB7XG4gICAgICBjb29yZGluYXRlcyA9IHJvdGF0ZShjb29yZGluYXRlc1swXSAqIGQzX3JhZGlhbnMsIGNvb3JkaW5hdGVzWzFdICogZDNfcmFkaWFucyk7XG4gICAgICByZXR1cm4gY29vcmRpbmF0ZXNbMF0gKj0gZDNfZGVncmVlcywgY29vcmRpbmF0ZXNbMV0gKj0gZDNfZGVncmVlcywgY29vcmRpbmF0ZXM7XG4gICAgfVxuICAgIGZvcndhcmQuaW52ZXJ0ID0gZnVuY3Rpb24oY29vcmRpbmF0ZXMpIHtcbiAgICAgIGNvb3JkaW5hdGVzID0gcm90YXRlLmludmVydChjb29yZGluYXRlc1swXSAqIGQzX3JhZGlhbnMsIGNvb3JkaW5hdGVzWzFdICogZDNfcmFkaWFucyk7XG4gICAgICByZXR1cm4gY29vcmRpbmF0ZXNbMF0gKj0gZDNfZGVncmVlcywgY29vcmRpbmF0ZXNbMV0gKj0gZDNfZGVncmVlcywgY29vcmRpbmF0ZXM7XG4gICAgfTtcbiAgICByZXR1cm4gZm9yd2FyZDtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfZ2VvX2lkZW50aXR5Um90YXRpb24ozrssIM+GKSB7XG4gICAgcmV0dXJuIFsgzrsgPiDPgCA/IM67IC0gz4QgOiDOuyA8IC3PgCA/IM67ICsgz4QgOiDOuywgz4YgXTtcbiAgfVxuICBkM19nZW9faWRlbnRpdHlSb3RhdGlvbi5pbnZlcnQgPSBkM19nZW9fZXF1aXJlY3Rhbmd1bGFyO1xuICBmdW5jdGlvbiBkM19nZW9fcm90YXRpb24ozrTOuywgzrTPhiwgzrTOsykge1xuICAgIHJldHVybiDOtM67ID8gzrTPhiB8fCDOtM6zID8gZDNfZ2VvX2NvbXBvc2UoZDNfZ2VvX3JvdGF0aW9uzrsozrTOuyksIGQzX2dlb19yb3RhdGlvbs+GzrMozrTPhiwgzrTOsykpIDogZDNfZ2VvX3JvdGF0aW9uzrsozrTOuykgOiDOtM+GIHx8IM60zrMgPyBkM19nZW9fcm90YXRpb27Phs6zKM60z4YsIM60zrMpIDogZDNfZ2VvX2lkZW50aXR5Um90YXRpb247XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvX2ZvcndhcmRSb3RhdGlvbs67KM60zrspIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ozrssIM+GKSB7XG4gICAgICByZXR1cm4gzrsgKz0gzrTOuywgWyDOuyA+IM+AID8gzrsgLSDPhCA6IM67IDwgLc+AID8gzrsgKyDPhCA6IM67LCDPhiBdO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvX3JvdGF0aW9uzrsozrTOuykge1xuICAgIHZhciByb3RhdGlvbiA9IGQzX2dlb19mb3J3YXJkUm90YXRpb27OuyjOtM67KTtcbiAgICByb3RhdGlvbi5pbnZlcnQgPSBkM19nZW9fZm9yd2FyZFJvdGF0aW9uzrsoLc60zrspO1xuICAgIHJldHVybiByb3RhdGlvbjtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fcm90YXRpb27Phs6zKM60z4YsIM60zrMpIHtcbiAgICB2YXIgY29zzrTPhiA9IE1hdGguY29zKM60z4YpLCBzaW7OtM+GID0gTWF0aC5zaW4ozrTPhiksIGNvc860zrMgPSBNYXRoLmNvcyjOtM6zKSwgc2luzrTOsyA9IE1hdGguc2luKM60zrMpO1xuICAgIGZ1bmN0aW9uIHJvdGF0aW9uKM67LCDPhikge1xuICAgICAgdmFyIGNvc8+GID0gTWF0aC5jb3Moz4YpLCB4ID0gTWF0aC5jb3MozrspICogY29zz4YsIHkgPSBNYXRoLnNpbijOuykgKiBjb3PPhiwgeiA9IE1hdGguc2luKM+GKSwgayA9IHogKiBjb3POtM+GICsgeCAqIHNpbs60z4Y7XG4gICAgICByZXR1cm4gWyBNYXRoLmF0YW4yKHkgKiBjb3POtM6zIC0gayAqIHNpbs60zrMsIHggKiBjb3POtM+GIC0geiAqIHNpbs60z4YpLCBkM19hc2luKGsgKiBjb3POtM6zICsgeSAqIHNpbs60zrMpIF07XG4gICAgfVxuICAgIHJvdGF0aW9uLmludmVydCA9IGZ1bmN0aW9uKM67LCDPhikge1xuICAgICAgdmFyIGNvc8+GID0gTWF0aC5jb3Moz4YpLCB4ID0gTWF0aC5jb3MozrspICogY29zz4YsIHkgPSBNYXRoLnNpbijOuykgKiBjb3PPhiwgeiA9IE1hdGguc2luKM+GKSwgayA9IHogKiBjb3POtM6zIC0geSAqIHNpbs60zrM7XG4gICAgICByZXR1cm4gWyBNYXRoLmF0YW4yKHkgKiBjb3POtM6zICsgeiAqIHNpbs60zrMsIHggKiBjb3POtM+GICsgayAqIHNpbs60z4YpLCBkM19hc2luKGsgKiBjb3POtM+GIC0geCAqIHNpbs60z4YpIF07XG4gICAgfTtcbiAgICByZXR1cm4gcm90YXRpb247XG4gIH1cbiAgZDMuZ2VvLmNpcmNsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBvcmlnaW4gPSBbIDAsIDAgXSwgYW5nbGUsIHByZWNpc2lvbiA9IDYsIGludGVycG9sYXRlO1xuICAgIGZ1bmN0aW9uIGNpcmNsZSgpIHtcbiAgICAgIHZhciBjZW50ZXIgPSB0eXBlb2Ygb3JpZ2luID09PSBcImZ1bmN0aW9uXCIgPyBvcmlnaW4uYXBwbHkodGhpcywgYXJndW1lbnRzKSA6IG9yaWdpbiwgcm90YXRlID0gZDNfZ2VvX3JvdGF0aW9uKC1jZW50ZXJbMF0gKiBkM19yYWRpYW5zLCAtY2VudGVyWzFdICogZDNfcmFkaWFucywgMCkuaW52ZXJ0LCByaW5nID0gW107XG4gICAgICBpbnRlcnBvbGF0ZShudWxsLCBudWxsLCAxLCB7XG4gICAgICAgIHBvaW50OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgICAgcmluZy5wdXNoKHggPSByb3RhdGUoeCwgeSkpO1xuICAgICAgICAgIHhbMF0gKj0gZDNfZGVncmVlcywgeFsxXSAqPSBkM19kZWdyZWVzO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6IFwiUG9seWdvblwiLFxuICAgICAgICBjb29yZGluYXRlczogWyByaW5nIF1cbiAgICAgIH07XG4gICAgfVxuICAgIGNpcmNsZS5vcmlnaW4gPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBvcmlnaW47XG4gICAgICBvcmlnaW4gPSB4O1xuICAgICAgcmV0dXJuIGNpcmNsZTtcbiAgICB9O1xuICAgIGNpcmNsZS5hbmdsZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGFuZ2xlO1xuICAgICAgaW50ZXJwb2xhdGUgPSBkM19nZW9fY2lyY2xlSW50ZXJwb2xhdGUoKGFuZ2xlID0gK3gpICogZDNfcmFkaWFucywgcHJlY2lzaW9uICogZDNfcmFkaWFucyk7XG4gICAgICByZXR1cm4gY2lyY2xlO1xuICAgIH07XG4gICAgY2lyY2xlLnByZWNpc2lvbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHByZWNpc2lvbjtcbiAgICAgIGludGVycG9sYXRlID0gZDNfZ2VvX2NpcmNsZUludGVycG9sYXRlKGFuZ2xlICogZDNfcmFkaWFucywgKHByZWNpc2lvbiA9ICtfKSAqIGQzX3JhZGlhbnMpO1xuICAgICAgcmV0dXJuIGNpcmNsZTtcbiAgICB9O1xuICAgIHJldHVybiBjaXJjbGUuYW5nbGUoOTApO1xuICB9O1xuICBmdW5jdGlvbiBkM19nZW9fY2lyY2xlSW50ZXJwb2xhdGUocmFkaXVzLCBwcmVjaXNpb24pIHtcbiAgICB2YXIgY3IgPSBNYXRoLmNvcyhyYWRpdXMpLCBzciA9IE1hdGguc2luKHJhZGl1cyk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGZyb20sIHRvLCBkaXJlY3Rpb24sIGxpc3RlbmVyKSB7XG4gICAgICB2YXIgc3RlcCA9IGRpcmVjdGlvbiAqIHByZWNpc2lvbjtcbiAgICAgIGlmIChmcm9tICE9IG51bGwpIHtcbiAgICAgICAgZnJvbSA9IGQzX2dlb19jaXJjbGVBbmdsZShjciwgZnJvbSk7XG4gICAgICAgIHRvID0gZDNfZ2VvX2NpcmNsZUFuZ2xlKGNyLCB0byk7XG4gICAgICAgIGlmIChkaXJlY3Rpb24gPiAwID8gZnJvbSA8IHRvIDogZnJvbSA+IHRvKSBmcm9tICs9IGRpcmVjdGlvbiAqIM+EO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZnJvbSA9IHJhZGl1cyArIGRpcmVjdGlvbiAqIM+EO1xuICAgICAgICB0byA9IHJhZGl1cyAtIC41ICogc3RlcDtcbiAgICAgIH1cbiAgICAgIGZvciAodmFyIHBvaW50LCB0ID0gZnJvbTsgZGlyZWN0aW9uID4gMCA/IHQgPiB0byA6IHQgPCB0bzsgdCAtPSBzdGVwKSB7XG4gICAgICAgIGxpc3RlbmVyLnBvaW50KChwb2ludCA9IGQzX2dlb19zcGhlcmljYWwoWyBjciwgLXNyICogTWF0aC5jb3ModCksIC1zciAqIE1hdGguc2luKHQpIF0pKVswXSwgcG9pbnRbMV0pO1xuICAgICAgfVxuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvX2NpcmNsZUFuZ2xlKGNyLCBwb2ludCkge1xuICAgIHZhciBhID0gZDNfZ2VvX2NhcnRlc2lhbihwb2ludCk7XG4gICAgYVswXSAtPSBjcjtcbiAgICBkM19nZW9fY2FydGVzaWFuTm9ybWFsaXplKGEpO1xuICAgIHZhciBhbmdsZSA9IGQzX2Fjb3MoLWFbMV0pO1xuICAgIHJldHVybiAoKC1hWzJdIDwgMCA/IC1hbmdsZSA6IGFuZ2xlKSArIDIgKiBNYXRoLlBJIC0gzrUpICUgKDIgKiBNYXRoLlBJKTtcbiAgfVxuICBkMy5nZW8uZGlzdGFuY2UgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIM6UzrsgPSAoYlswXSAtIGFbMF0pICogZDNfcmFkaWFucywgz4YwID0gYVsxXSAqIGQzX3JhZGlhbnMsIM+GMSA9IGJbMV0gKiBkM19yYWRpYW5zLCBzaW7OlM67ID0gTWF0aC5zaW4ozpTOuyksIGNvc86UzrsgPSBNYXRoLmNvcyjOlM67KSwgc2luz4YwID0gTWF0aC5zaW4oz4YwKSwgY29zz4YwID0gTWF0aC5jb3Moz4YwKSwgc2luz4YxID0gTWF0aC5zaW4oz4YxKSwgY29zz4YxID0gTWF0aC5jb3Moz4YxKSwgdDtcbiAgICByZXR1cm4gTWF0aC5hdGFuMihNYXRoLnNxcnQoKHQgPSBjb3PPhjEgKiBzaW7OlM67KSAqIHQgKyAodCA9IGNvc8+GMCAqIHNpbs+GMSAtIHNpbs+GMCAqIGNvc8+GMSAqIGNvc86UzrspICogdCksIHNpbs+GMCAqIHNpbs+GMSArIGNvc8+GMCAqIGNvc8+GMSAqIGNvc86UzrspO1xuICB9O1xuICBkMy5nZW8uZ3JhdGljdWxlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHgxLCB4MCwgWDEsIFgwLCB5MSwgeTAsIFkxLCBZMCwgZHggPSAxMCwgZHkgPSBkeCwgRFggPSA5MCwgRFkgPSAzNjAsIHgsIHksIFgsIFksIHByZWNpc2lvbiA9IDIuNTtcbiAgICBmdW5jdGlvbiBncmF0aWN1bGUoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiBcIk11bHRpTGluZVN0cmluZ1wiLFxuICAgICAgICBjb29yZGluYXRlczogbGluZXMoKVxuICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gbGluZXMoKSB7XG4gICAgICByZXR1cm4gZDMucmFuZ2UoTWF0aC5jZWlsKFgwIC8gRFgpICogRFgsIFgxLCBEWCkubWFwKFgpLmNvbmNhdChkMy5yYW5nZShNYXRoLmNlaWwoWTAgLyBEWSkgKiBEWSwgWTEsIERZKS5tYXAoWSkpLmNvbmNhdChkMy5yYW5nZShNYXRoLmNlaWwoeDAgLyBkeCkgKiBkeCwgeDEsIGR4KS5maWx0ZXIoZnVuY3Rpb24oeCkge1xuICAgICAgICByZXR1cm4gYWJzKHggJSBEWCkgPiDOtTtcbiAgICAgIH0pLm1hcCh4KSkuY29uY2F0KGQzLnJhbmdlKE1hdGguY2VpbCh5MCAvIGR5KSAqIGR5LCB5MSwgZHkpLmZpbHRlcihmdW5jdGlvbih5KSB7XG4gICAgICAgIHJldHVybiBhYnMoeSAlIERZKSA+IM61O1xuICAgICAgfSkubWFwKHkpKTtcbiAgICB9XG4gICAgZ3JhdGljdWxlLmxpbmVzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbGluZXMoKS5tYXAoZnVuY3Rpb24oY29vcmRpbmF0ZXMpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0eXBlOiBcIkxpbmVTdHJpbmdcIixcbiAgICAgICAgICBjb29yZGluYXRlczogY29vcmRpbmF0ZXNcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIH07XG4gICAgZ3JhdGljdWxlLm91dGxpbmUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6IFwiUG9seWdvblwiLFxuICAgICAgICBjb29yZGluYXRlczogWyBYKFgwKS5jb25jYXQoWShZMSkuc2xpY2UoMSksIFgoWDEpLnJldmVyc2UoKS5zbGljZSgxKSwgWShZMCkucmV2ZXJzZSgpLnNsaWNlKDEpKSBdXG4gICAgICB9O1xuICAgIH07XG4gICAgZ3JhdGljdWxlLmV4dGVudCA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGdyYXRpY3VsZS5taW5vckV4dGVudCgpO1xuICAgICAgcmV0dXJuIGdyYXRpY3VsZS5tYWpvckV4dGVudChfKS5taW5vckV4dGVudChfKTtcbiAgICB9O1xuICAgIGdyYXRpY3VsZS5tYWpvckV4dGVudCA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIFsgWyBYMCwgWTAgXSwgWyBYMSwgWTEgXSBdO1xuICAgICAgWDAgPSArX1swXVswXSwgWDEgPSArX1sxXVswXTtcbiAgICAgIFkwID0gK19bMF1bMV0sIFkxID0gK19bMV1bMV07XG4gICAgICBpZiAoWDAgPiBYMSkgXyA9IFgwLCBYMCA9IFgxLCBYMSA9IF87XG4gICAgICBpZiAoWTAgPiBZMSkgXyA9IFkwLCBZMCA9IFkxLCBZMSA9IF87XG4gICAgICByZXR1cm4gZ3JhdGljdWxlLnByZWNpc2lvbihwcmVjaXNpb24pO1xuICAgIH07XG4gICAgZ3JhdGljdWxlLm1pbm9yRXh0ZW50ID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gWyBbIHgwLCB5MCBdLCBbIHgxLCB5MSBdIF07XG4gICAgICB4MCA9ICtfWzBdWzBdLCB4MSA9ICtfWzFdWzBdO1xuICAgICAgeTAgPSArX1swXVsxXSwgeTEgPSArX1sxXVsxXTtcbiAgICAgIGlmICh4MCA+IHgxKSBfID0geDAsIHgwID0geDEsIHgxID0gXztcbiAgICAgIGlmICh5MCA+IHkxKSBfID0geTAsIHkwID0geTEsIHkxID0gXztcbiAgICAgIHJldHVybiBncmF0aWN1bGUucHJlY2lzaW9uKHByZWNpc2lvbik7XG4gICAgfTtcbiAgICBncmF0aWN1bGUuc3RlcCA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGdyYXRpY3VsZS5taW5vclN0ZXAoKTtcbiAgICAgIHJldHVybiBncmF0aWN1bGUubWFqb3JTdGVwKF8pLm1pbm9yU3RlcChfKTtcbiAgICB9O1xuICAgIGdyYXRpY3VsZS5tYWpvclN0ZXAgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBbIERYLCBEWSBdO1xuICAgICAgRFggPSArX1swXSwgRFkgPSArX1sxXTtcbiAgICAgIHJldHVybiBncmF0aWN1bGU7XG4gICAgfTtcbiAgICBncmF0aWN1bGUubWlub3JTdGVwID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gWyBkeCwgZHkgXTtcbiAgICAgIGR4ID0gK19bMF0sIGR5ID0gK19bMV07XG4gICAgICByZXR1cm4gZ3JhdGljdWxlO1xuICAgIH07XG4gICAgZ3JhdGljdWxlLnByZWNpc2lvbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHByZWNpc2lvbjtcbiAgICAgIHByZWNpc2lvbiA9ICtfO1xuICAgICAgeCA9IGQzX2dlb19ncmF0aWN1bGVYKHkwLCB5MSwgOTApO1xuICAgICAgeSA9IGQzX2dlb19ncmF0aWN1bGVZKHgwLCB4MSwgcHJlY2lzaW9uKTtcbiAgICAgIFggPSBkM19nZW9fZ3JhdGljdWxlWChZMCwgWTEsIDkwKTtcbiAgICAgIFkgPSBkM19nZW9fZ3JhdGljdWxlWShYMCwgWDEsIHByZWNpc2lvbik7XG4gICAgICByZXR1cm4gZ3JhdGljdWxlO1xuICAgIH07XG4gICAgcmV0dXJuIGdyYXRpY3VsZS5tYWpvckV4dGVudChbIFsgLTE4MCwgLTkwICsgzrUgXSwgWyAxODAsIDkwIC0gzrUgXSBdKS5taW5vckV4dGVudChbIFsgLTE4MCwgLTgwIC0gzrUgXSwgWyAxODAsIDgwICsgzrUgXSBdKTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfZ2VvX2dyYXRpY3VsZVgoeTAsIHkxLCBkeSkge1xuICAgIHZhciB5ID0gZDMucmFuZ2UoeTAsIHkxIC0gzrUsIGR5KS5jb25jYXQoeTEpO1xuICAgIHJldHVybiBmdW5jdGlvbih4KSB7XG4gICAgICByZXR1cm4geS5tYXAoZnVuY3Rpb24oeSkge1xuICAgICAgICByZXR1cm4gWyB4LCB5IF07XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb19ncmF0aWN1bGVZKHgwLCB4MSwgZHgpIHtcbiAgICB2YXIgeCA9IGQzLnJhbmdlKHgwLCB4MSAtIM61LCBkeCkuY29uY2F0KHgxKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oeSkge1xuICAgICAgcmV0dXJuIHgubWFwKGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgcmV0dXJuIFsgeCwgeSBdO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuICBmdW5jdGlvbiBkM19zb3VyY2UoZCkge1xuICAgIHJldHVybiBkLnNvdXJjZTtcbiAgfVxuICBmdW5jdGlvbiBkM190YXJnZXQoZCkge1xuICAgIHJldHVybiBkLnRhcmdldDtcbiAgfVxuICBkMy5nZW8uZ3JlYXRBcmMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc291cmNlID0gZDNfc291cmNlLCBzb3VyY2VfLCB0YXJnZXQgPSBkM190YXJnZXQsIHRhcmdldF87XG4gICAgZnVuY3Rpb24gZ3JlYXRBcmMoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiBcIkxpbmVTdHJpbmdcIixcbiAgICAgICAgY29vcmRpbmF0ZXM6IFsgc291cmNlXyB8fCBzb3VyY2UuYXBwbHkodGhpcywgYXJndW1lbnRzKSwgdGFyZ2V0XyB8fCB0YXJnZXQuYXBwbHkodGhpcywgYXJndW1lbnRzKSBdXG4gICAgICB9O1xuICAgIH1cbiAgICBncmVhdEFyYy5kaXN0YW5jZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGQzLmdlby5kaXN0YW5jZShzb3VyY2VfIHx8IHNvdXJjZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpLCB0YXJnZXRfIHx8IHRhcmdldC5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgICB9O1xuICAgIGdyZWF0QXJjLnNvdXJjZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHNvdXJjZTtcbiAgICAgIHNvdXJjZSA9IF8sIHNvdXJjZV8gPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gbnVsbCA6IF87XG4gICAgICByZXR1cm4gZ3JlYXRBcmM7XG4gICAgfTtcbiAgICBncmVhdEFyYy50YXJnZXQgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0YXJnZXQ7XG4gICAgICB0YXJnZXQgPSBfLCB0YXJnZXRfID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IG51bGwgOiBfO1xuICAgICAgcmV0dXJuIGdyZWF0QXJjO1xuICAgIH07XG4gICAgZ3JlYXRBcmMucHJlY2lzaW9uID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IGdyZWF0QXJjIDogMDtcbiAgICB9O1xuICAgIHJldHVybiBncmVhdEFyYztcbiAgfTtcbiAgZDMuZ2VvLmludGVycG9sYXRlID0gZnVuY3Rpb24oc291cmNlLCB0YXJnZXQpIHtcbiAgICByZXR1cm4gZDNfZ2VvX2ludGVycG9sYXRlKHNvdXJjZVswXSAqIGQzX3JhZGlhbnMsIHNvdXJjZVsxXSAqIGQzX3JhZGlhbnMsIHRhcmdldFswXSAqIGQzX3JhZGlhbnMsIHRhcmdldFsxXSAqIGQzX3JhZGlhbnMpO1xuICB9O1xuICBmdW5jdGlvbiBkM19nZW9faW50ZXJwb2xhdGUoeDAsIHkwLCB4MSwgeTEpIHtcbiAgICB2YXIgY3kwID0gTWF0aC5jb3MoeTApLCBzeTAgPSBNYXRoLnNpbih5MCksIGN5MSA9IE1hdGguY29zKHkxKSwgc3kxID0gTWF0aC5zaW4oeTEpLCBreDAgPSBjeTAgKiBNYXRoLmNvcyh4MCksIGt5MCA9IGN5MCAqIE1hdGguc2luKHgwKSwga3gxID0gY3kxICogTWF0aC5jb3MoeDEpLCBreTEgPSBjeTEgKiBNYXRoLnNpbih4MSksIGQgPSAyICogTWF0aC5hc2luKE1hdGguc3FydChkM19oYXZlcnNpbih5MSAtIHkwKSArIGN5MCAqIGN5MSAqIGQzX2hhdmVyc2luKHgxIC0geDApKSksIGsgPSAxIC8gTWF0aC5zaW4oZCk7XG4gICAgdmFyIGludGVycG9sYXRlID0gZCA/IGZ1bmN0aW9uKHQpIHtcbiAgICAgIHZhciBCID0gTWF0aC5zaW4odCAqPSBkKSAqIGssIEEgPSBNYXRoLnNpbihkIC0gdCkgKiBrLCB4ID0gQSAqIGt4MCArIEIgKiBreDEsIHkgPSBBICoga3kwICsgQiAqIGt5MSwgeiA9IEEgKiBzeTAgKyBCICogc3kxO1xuICAgICAgcmV0dXJuIFsgTWF0aC5hdGFuMih5LCB4KSAqIGQzX2RlZ3JlZXMsIE1hdGguYXRhbjIoeiwgTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkpKSAqIGQzX2RlZ3JlZXMgXTtcbiAgICB9IDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gWyB4MCAqIGQzX2RlZ3JlZXMsIHkwICogZDNfZGVncmVlcyBdO1xuICAgIH07XG4gICAgaW50ZXJwb2xhdGUuZGlzdGFuY2UgPSBkO1xuICAgIHJldHVybiBpbnRlcnBvbGF0ZTtcbiAgfVxuICBkMy5nZW8ubGVuZ3RoID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgZDNfZ2VvX2xlbmd0aFN1bSA9IDA7XG4gICAgZDMuZ2VvLnN0cmVhbShvYmplY3QsIGQzX2dlb19sZW5ndGgpO1xuICAgIHJldHVybiBkM19nZW9fbGVuZ3RoU3VtO1xuICB9O1xuICB2YXIgZDNfZ2VvX2xlbmd0aFN1bTtcbiAgdmFyIGQzX2dlb19sZW5ndGggPSB7XG4gICAgc3BoZXJlOiBkM19ub29wLFxuICAgIHBvaW50OiBkM19ub29wLFxuICAgIGxpbmVTdGFydDogZDNfZ2VvX2xlbmd0aExpbmVTdGFydCxcbiAgICBsaW5lRW5kOiBkM19ub29wLFxuICAgIHBvbHlnb25TdGFydDogZDNfbm9vcCxcbiAgICBwb2x5Z29uRW5kOiBkM19ub29wXG4gIH07XG4gIGZ1bmN0aW9uIGQzX2dlb19sZW5ndGhMaW5lU3RhcnQoKSB7XG4gICAgdmFyIM67MCwgc2luz4YwLCBjb3PPhjA7XG4gICAgZDNfZ2VvX2xlbmd0aC5wb2ludCA9IGZ1bmN0aW9uKM67LCDPhikge1xuICAgICAgzrswID0gzrsgKiBkM19yYWRpYW5zLCBzaW7PhjAgPSBNYXRoLnNpbijPhiAqPSBkM19yYWRpYW5zKSwgY29zz4YwID0gTWF0aC5jb3Moz4YpO1xuICAgICAgZDNfZ2VvX2xlbmd0aC5wb2ludCA9IG5leHRQb2ludDtcbiAgICB9O1xuICAgIGQzX2dlb19sZW5ndGgubGluZUVuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgZDNfZ2VvX2xlbmd0aC5wb2ludCA9IGQzX2dlb19sZW5ndGgubGluZUVuZCA9IGQzX25vb3A7XG4gICAgfTtcbiAgICBmdW5jdGlvbiBuZXh0UG9pbnQozrssIM+GKSB7XG4gICAgICB2YXIgc2luz4YgPSBNYXRoLnNpbijPhiAqPSBkM19yYWRpYW5zKSwgY29zz4YgPSBNYXRoLmNvcyjPhiksIHQgPSBhYnMoKM67ICo9IGQzX3JhZGlhbnMpIC0gzrswKSwgY29zzpTOuyA9IE1hdGguY29zKHQpO1xuICAgICAgZDNfZ2VvX2xlbmd0aFN1bSArPSBNYXRoLmF0YW4yKE1hdGguc3FydCgodCA9IGNvc8+GICogTWF0aC5zaW4odCkpICogdCArICh0ID0gY29zz4YwICogc2luz4YgLSBzaW7PhjAgKiBjb3PPhiAqIGNvc86UzrspICogdCksIHNpbs+GMCAqIHNpbs+GICsgY29zz4YwICogY29zz4YgKiBjb3POlM67KTtcbiAgICAgIM67MCA9IM67LCBzaW7PhjAgPSBzaW7PhiwgY29zz4YwID0gY29zz4Y7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb19hemltdXRoYWwoc2NhbGUsIGFuZ2xlKSB7XG4gICAgZnVuY3Rpb24gYXppbXV0aGFsKM67LCDPhikge1xuICAgICAgdmFyIGNvc867ID0gTWF0aC5jb3MozrspLCBjb3PPhiA9IE1hdGguY29zKM+GKSwgayA9IHNjYWxlKGNvc867ICogY29zz4YpO1xuICAgICAgcmV0dXJuIFsgayAqIGNvc8+GICogTWF0aC5zaW4ozrspLCBrICogTWF0aC5zaW4oz4YpIF07XG4gICAgfVxuICAgIGF6aW11dGhhbC5pbnZlcnQgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgICB2YXIgz4EgPSBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSksIGMgPSBhbmdsZSjPgSksIHNpbmMgPSBNYXRoLnNpbihjKSwgY29zYyA9IE1hdGguY29zKGMpO1xuICAgICAgcmV0dXJuIFsgTWF0aC5hdGFuMih4ICogc2luYywgz4EgKiBjb3NjKSwgTWF0aC5hc2luKM+BICYmIHkgKiBzaW5jIC8gz4EpIF07XG4gICAgfTtcbiAgICByZXR1cm4gYXppbXV0aGFsO1xuICB9XG4gIHZhciBkM19nZW9fYXppbXV0aGFsRXF1YWxBcmVhID0gZDNfZ2VvX2F6aW11dGhhbChmdW5jdGlvbihjb3POu2Nvc8+GKSB7XG4gICAgcmV0dXJuIE1hdGguc3FydCgyIC8gKDEgKyBjb3POu2Nvc8+GKSk7XG4gIH0sIGZ1bmN0aW9uKM+BKSB7XG4gICAgcmV0dXJuIDIgKiBNYXRoLmFzaW4oz4EgLyAyKTtcbiAgfSk7XG4gIChkMy5nZW8uYXppbXV0aGFsRXF1YWxBcmVhID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzX2dlb19wcm9qZWN0aW9uKGQzX2dlb19hemltdXRoYWxFcXVhbEFyZWEpO1xuICB9KS5yYXcgPSBkM19nZW9fYXppbXV0aGFsRXF1YWxBcmVhO1xuICB2YXIgZDNfZ2VvX2F6aW11dGhhbEVxdWlkaXN0YW50ID0gZDNfZ2VvX2F6aW11dGhhbChmdW5jdGlvbihjb3POu2Nvc8+GKSB7XG4gICAgdmFyIGMgPSBNYXRoLmFjb3MoY29zzrtjb3PPhik7XG4gICAgcmV0dXJuIGMgJiYgYyAvIE1hdGguc2luKGMpO1xuICB9LCBkM19pZGVudGl0eSk7XG4gIChkMy5nZW8uYXppbXV0aGFsRXF1aWRpc3RhbnQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDNfZ2VvX3Byb2plY3Rpb24oZDNfZ2VvX2F6aW11dGhhbEVxdWlkaXN0YW50KTtcbiAgfSkucmF3ID0gZDNfZ2VvX2F6aW11dGhhbEVxdWlkaXN0YW50O1xuICBmdW5jdGlvbiBkM19nZW9fY29uaWNDb25mb3JtYWwoz4YwLCDPhjEpIHtcbiAgICB2YXIgY29zz4YwID0gTWF0aC5jb3Moz4YwKSwgdCA9IGZ1bmN0aW9uKM+GKSB7XG4gICAgICByZXR1cm4gTWF0aC50YW4oz4AgLyA0ICsgz4YgLyAyKTtcbiAgICB9LCBuID0gz4YwID09PSDPhjEgPyBNYXRoLnNpbijPhjApIDogTWF0aC5sb2coY29zz4YwIC8gTWF0aC5jb3Moz4YxKSkgLyBNYXRoLmxvZyh0KM+GMSkgLyB0KM+GMCkpLCBGID0gY29zz4YwICogTWF0aC5wb3codCjPhjApLCBuKSAvIG47XG4gICAgaWYgKCFuKSByZXR1cm4gZDNfZ2VvX21lcmNhdG9yO1xuICAgIGZ1bmN0aW9uIGZvcndhcmQozrssIM+GKSB7XG4gICAgICBpZiAoRiA+IDApIHtcbiAgICAgICAgaWYgKM+GIDwgLWhhbGbPgCArIM61KSDPhiA9IC1oYWxmz4AgKyDOtTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICjPhiA+IGhhbGbPgCAtIM61KSDPhiA9IGhhbGbPgCAtIM61O1xuICAgICAgfVxuICAgICAgdmFyIM+BID0gRiAvIE1hdGgucG93KHQoz4YpLCBuKTtcbiAgICAgIHJldHVybiBbIM+BICogTWF0aC5zaW4obiAqIM67KSwgRiAtIM+BICogTWF0aC5jb3MobiAqIM67KSBdO1xuICAgIH1cbiAgICBmb3J3YXJkLmludmVydCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgIHZhciDPgTBfeSA9IEYgLSB5LCDPgSA9IGQzX3NnbihuKSAqIE1hdGguc3FydCh4ICogeCArIM+BMF95ICogz4EwX3kpO1xuICAgICAgcmV0dXJuIFsgTWF0aC5hdGFuMih4LCDPgTBfeSkgLyBuLCAyICogTWF0aC5hdGFuKE1hdGgucG93KEYgLyDPgSwgMSAvIG4pKSAtIGhhbGbPgCBdO1xuICAgIH07XG4gICAgcmV0dXJuIGZvcndhcmQ7XG4gIH1cbiAgKGQzLmdlby5jb25pY0NvbmZvcm1hbCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkM19nZW9fY29uaWMoZDNfZ2VvX2NvbmljQ29uZm9ybWFsKTtcbiAgfSkucmF3ID0gZDNfZ2VvX2NvbmljQ29uZm9ybWFsO1xuICBmdW5jdGlvbiBkM19nZW9fY29uaWNFcXVpZGlzdGFudCjPhjAsIM+GMSkge1xuICAgIHZhciBjb3PPhjAgPSBNYXRoLmNvcyjPhjApLCBuID0gz4YwID09PSDPhjEgPyBNYXRoLnNpbijPhjApIDogKGNvc8+GMCAtIE1hdGguY29zKM+GMSkpIC8gKM+GMSAtIM+GMCksIEcgPSBjb3PPhjAgLyBuICsgz4YwO1xuICAgIGlmIChhYnMobikgPCDOtSkgcmV0dXJuIGQzX2dlb19lcXVpcmVjdGFuZ3VsYXI7XG4gICAgZnVuY3Rpb24gZm9yd2FyZCjOuywgz4YpIHtcbiAgICAgIHZhciDPgSA9IEcgLSDPhjtcbiAgICAgIHJldHVybiBbIM+BICogTWF0aC5zaW4obiAqIM67KSwgRyAtIM+BICogTWF0aC5jb3MobiAqIM67KSBdO1xuICAgIH1cbiAgICBmb3J3YXJkLmludmVydCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgIHZhciDPgTBfeSA9IEcgLSB5O1xuICAgICAgcmV0dXJuIFsgTWF0aC5hdGFuMih4LCDPgTBfeSkgLyBuLCBHIC0gZDNfc2duKG4pICogTWF0aC5zcXJ0KHggKiB4ICsgz4EwX3kgKiDPgTBfeSkgXTtcbiAgICB9O1xuICAgIHJldHVybiBmb3J3YXJkO1xuICB9XG4gIChkMy5nZW8uY29uaWNFcXVpZGlzdGFudCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkM19nZW9fY29uaWMoZDNfZ2VvX2NvbmljRXF1aWRpc3RhbnQpO1xuICB9KS5yYXcgPSBkM19nZW9fY29uaWNFcXVpZGlzdGFudDtcbiAgdmFyIGQzX2dlb19nbm9tb25pYyA9IGQzX2dlb19hemltdXRoYWwoZnVuY3Rpb24oY29zzrtjb3PPhikge1xuICAgIHJldHVybiAxIC8gY29zzrtjb3PPhjtcbiAgfSwgTWF0aC5hdGFuKTtcbiAgKGQzLmdlby5nbm9tb25pYyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkM19nZW9fcHJvamVjdGlvbihkM19nZW9fZ25vbW9uaWMpO1xuICB9KS5yYXcgPSBkM19nZW9fZ25vbW9uaWM7XG4gIGZ1bmN0aW9uIGQzX2dlb19tZXJjYXRvcijOuywgz4YpIHtcbiAgICByZXR1cm4gWyDOuywgTWF0aC5sb2coTWF0aC50YW4oz4AgLyA0ICsgz4YgLyAyKSkgXTtcbiAgfVxuICBkM19nZW9fbWVyY2F0b3IuaW52ZXJ0ID0gZnVuY3Rpb24oeCwgeSkge1xuICAgIHJldHVybiBbIHgsIDIgKiBNYXRoLmF0YW4oTWF0aC5leHAoeSkpIC0gaGFsZs+AIF07XG4gIH07XG4gIGZ1bmN0aW9uIGQzX2dlb19tZXJjYXRvclByb2plY3Rpb24ocHJvamVjdCkge1xuICAgIHZhciBtID0gZDNfZ2VvX3Byb2plY3Rpb24ocHJvamVjdCksIHNjYWxlID0gbS5zY2FsZSwgdHJhbnNsYXRlID0gbS50cmFuc2xhdGUsIGNsaXBFeHRlbnQgPSBtLmNsaXBFeHRlbnQsIGNsaXBBdXRvO1xuICAgIG0uc2NhbGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB2ID0gc2NhbGUuYXBwbHkobSwgYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiB2ID09PSBtID8gY2xpcEF1dG8gPyBtLmNsaXBFeHRlbnQobnVsbCkgOiBtIDogdjtcbiAgICB9O1xuICAgIG0udHJhbnNsYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdiA9IHRyYW5zbGF0ZS5hcHBseShtLCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIHYgPT09IG0gPyBjbGlwQXV0byA/IG0uY2xpcEV4dGVudChudWxsKSA6IG0gOiB2O1xuICAgIH07XG4gICAgbS5jbGlwRXh0ZW50ID0gZnVuY3Rpb24oXykge1xuICAgICAgdmFyIHYgPSBjbGlwRXh0ZW50LmFwcGx5KG0sIGFyZ3VtZW50cyk7XG4gICAgICBpZiAodiA9PT0gbSkge1xuICAgICAgICBpZiAoY2xpcEF1dG8gPSBfID09IG51bGwpIHtcbiAgICAgICAgICB2YXIgayA9IM+AICogc2NhbGUoKSwgdCA9IHRyYW5zbGF0ZSgpO1xuICAgICAgICAgIGNsaXBFeHRlbnQoWyBbIHRbMF0gLSBrLCB0WzFdIC0gayBdLCBbIHRbMF0gKyBrLCB0WzFdICsgayBdIF0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGNsaXBBdXRvKSB7XG4gICAgICAgIHYgPSBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHY7XG4gICAgfTtcbiAgICByZXR1cm4gbS5jbGlwRXh0ZW50KG51bGwpO1xuICB9XG4gIChkMy5nZW8ubWVyY2F0b3IgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDNfZ2VvX21lcmNhdG9yUHJvamVjdGlvbihkM19nZW9fbWVyY2F0b3IpO1xuICB9KS5yYXcgPSBkM19nZW9fbWVyY2F0b3I7XG4gIHZhciBkM19nZW9fb3J0aG9ncmFwaGljID0gZDNfZ2VvX2F6aW11dGhhbChmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gMTtcbiAgfSwgTWF0aC5hc2luKTtcbiAgKGQzLmdlby5vcnRob2dyYXBoaWMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDNfZ2VvX3Byb2plY3Rpb24oZDNfZ2VvX29ydGhvZ3JhcGhpYyk7XG4gIH0pLnJhdyA9IGQzX2dlb19vcnRob2dyYXBoaWM7XG4gIHZhciBkM19nZW9fc3RlcmVvZ3JhcGhpYyA9IGQzX2dlb19hemltdXRoYWwoZnVuY3Rpb24oY29zzrtjb3PPhikge1xuICAgIHJldHVybiAxIC8gKDEgKyBjb3POu2Nvc8+GKTtcbiAgfSwgZnVuY3Rpb24oz4EpIHtcbiAgICByZXR1cm4gMiAqIE1hdGguYXRhbijPgSk7XG4gIH0pO1xuICAoZDMuZ2VvLnN0ZXJlb2dyYXBoaWMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDNfZ2VvX3Byb2plY3Rpb24oZDNfZ2VvX3N0ZXJlb2dyYXBoaWMpO1xuICB9KS5yYXcgPSBkM19nZW9fc3RlcmVvZ3JhcGhpYztcbiAgZnVuY3Rpb24gZDNfZ2VvX3RyYW5zdmVyc2VNZXJjYXRvcijOuywgz4YpIHtcbiAgICByZXR1cm4gWyBNYXRoLmxvZyhNYXRoLnRhbijPgCAvIDQgKyDPhiAvIDIpKSwgLc67IF07XG4gIH1cbiAgZDNfZ2VvX3RyYW5zdmVyc2VNZXJjYXRvci5pbnZlcnQgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgcmV0dXJuIFsgLXksIDIgKiBNYXRoLmF0YW4oTWF0aC5leHAoeCkpIC0gaGFsZs+AIF07XG4gIH07XG4gIChkMy5nZW8udHJhbnN2ZXJzZU1lcmNhdG9yID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHByb2plY3Rpb24gPSBkM19nZW9fbWVyY2F0b3JQcm9qZWN0aW9uKGQzX2dlb190cmFuc3ZlcnNlTWVyY2F0b3IpLCBjZW50ZXIgPSBwcm9qZWN0aW9uLmNlbnRlciwgcm90YXRlID0gcHJvamVjdGlvbi5yb3RhdGU7XG4gICAgcHJvamVjdGlvbi5jZW50ZXIgPSBmdW5jdGlvbihfKSB7XG4gICAgICByZXR1cm4gXyA/IGNlbnRlcihbIC1fWzFdLCBfWzBdIF0pIDogKF8gPSBjZW50ZXIoKSwgWyBfWzFdLCAtX1swXSBdKTtcbiAgICB9O1xuICAgIHByb2plY3Rpb24ucm90YXRlID0gZnVuY3Rpb24oXykge1xuICAgICAgcmV0dXJuIF8gPyByb3RhdGUoWyBfWzBdLCBfWzFdLCBfLmxlbmd0aCA+IDIgPyBfWzJdICsgOTAgOiA5MCBdKSA6IChfID0gcm90YXRlKCksIFxuICAgICAgWyBfWzBdLCBfWzFdLCBfWzJdIC0gOTAgXSk7XG4gICAgfTtcbiAgICByZXR1cm4gcm90YXRlKFsgMCwgMCwgOTAgXSk7XG4gIH0pLnJhdyA9IGQzX2dlb190cmFuc3ZlcnNlTWVyY2F0b3I7XG4gIGQzLmdlb20gPSB7fTtcbiAgZnVuY3Rpb24gZDNfZ2VvbV9wb2ludFgoZCkge1xuICAgIHJldHVybiBkWzBdO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb21fcG9pbnRZKGQpIHtcbiAgICByZXR1cm4gZFsxXTtcbiAgfVxuICBkMy5nZW9tLmh1bGwgPSBmdW5jdGlvbih2ZXJ0aWNlcykge1xuICAgIHZhciB4ID0gZDNfZ2VvbV9wb2ludFgsIHkgPSBkM19nZW9tX3BvaW50WTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGh1bGwodmVydGljZXMpO1xuICAgIGZ1bmN0aW9uIGh1bGwoZGF0YSkge1xuICAgICAgaWYgKGRhdGEubGVuZ3RoIDwgMykgcmV0dXJuIFtdO1xuICAgICAgdmFyIGZ4ID0gZDNfZnVuY3Rvcih4KSwgZnkgPSBkM19mdW5jdG9yKHkpLCBpLCBuID0gZGF0YS5sZW5ndGgsIHBvaW50cyA9IFtdLCBmbGlwcGVkUG9pbnRzID0gW107XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgIHBvaW50cy5wdXNoKFsgK2Z4LmNhbGwodGhpcywgZGF0YVtpXSwgaSksICtmeS5jYWxsKHRoaXMsIGRhdGFbaV0sIGkpLCBpIF0pO1xuICAgICAgfVxuICAgICAgcG9pbnRzLnNvcnQoZDNfZ2VvbV9odWxsT3JkZXIpO1xuICAgICAgZm9yIChpID0gMDsgaSA8IG47IGkrKykgZmxpcHBlZFBvaW50cy5wdXNoKFsgcG9pbnRzW2ldWzBdLCAtcG9pbnRzW2ldWzFdIF0pO1xuICAgICAgdmFyIHVwcGVyID0gZDNfZ2VvbV9odWxsVXBwZXIocG9pbnRzKSwgbG93ZXIgPSBkM19nZW9tX2h1bGxVcHBlcihmbGlwcGVkUG9pbnRzKTtcbiAgICAgIHZhciBza2lwTGVmdCA9IGxvd2VyWzBdID09PSB1cHBlclswXSwgc2tpcFJpZ2h0ID0gbG93ZXJbbG93ZXIubGVuZ3RoIC0gMV0gPT09IHVwcGVyW3VwcGVyLmxlbmd0aCAtIDFdLCBwb2x5Z29uID0gW107XG4gICAgICBmb3IgKGkgPSB1cHBlci5sZW5ndGggLSAxOyBpID49IDA7IC0taSkgcG9seWdvbi5wdXNoKGRhdGFbcG9pbnRzW3VwcGVyW2ldXVsyXV0pO1xuICAgICAgZm9yIChpID0gK3NraXBMZWZ0OyBpIDwgbG93ZXIubGVuZ3RoIC0gc2tpcFJpZ2h0OyArK2kpIHBvbHlnb24ucHVzaChkYXRhW3BvaW50c1tsb3dlcltpXV1bMl1dKTtcbiAgICAgIHJldHVybiBwb2x5Z29uO1xuICAgIH1cbiAgICBodWxsLnggPSBmdW5jdGlvbihfKSB7XG4gICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh4ID0gXywgaHVsbCkgOiB4O1xuICAgIH07XG4gICAgaHVsbC55ID0gZnVuY3Rpb24oXykge1xuICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoeSA9IF8sIGh1bGwpIDogeTtcbiAgICB9O1xuICAgIHJldHVybiBodWxsO1xuICB9O1xuICBmdW5jdGlvbiBkM19nZW9tX2h1bGxVcHBlcihwb2ludHMpIHtcbiAgICB2YXIgbiA9IHBvaW50cy5sZW5ndGgsIGh1bGwgPSBbIDAsIDEgXSwgaHMgPSAyO1xuICAgIGZvciAodmFyIGkgPSAyOyBpIDwgbjsgaSsrKSB7XG4gICAgICB3aGlsZSAoaHMgPiAxICYmIGQzX2Nyb3NzMmQocG9pbnRzW2h1bGxbaHMgLSAyXV0sIHBvaW50c1todWxsW2hzIC0gMV1dLCBwb2ludHNbaV0pIDw9IDApIC0taHM7XG4gICAgICBodWxsW2hzKytdID0gaTtcbiAgICB9XG4gICAgcmV0dXJuIGh1bGwuc2xpY2UoMCwgaHMpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb21faHVsbE9yZGVyKGEsIGIpIHtcbiAgICByZXR1cm4gYVswXSAtIGJbMF0gfHwgYVsxXSAtIGJbMV07XG4gIH1cbiAgZDMuZ2VvbS5wb2x5Z29uID0gZnVuY3Rpb24oY29vcmRpbmF0ZXMpIHtcbiAgICBkM19zdWJjbGFzcyhjb29yZGluYXRlcywgZDNfZ2VvbV9wb2x5Z29uUHJvdG90eXBlKTtcbiAgICByZXR1cm4gY29vcmRpbmF0ZXM7XG4gIH07XG4gIHZhciBkM19nZW9tX3BvbHlnb25Qcm90b3R5cGUgPSBkMy5nZW9tLnBvbHlnb24ucHJvdG90eXBlID0gW107XG4gIGQzX2dlb21fcG9seWdvblByb3RvdHlwZS5hcmVhID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGkgPSAtMSwgbiA9IHRoaXMubGVuZ3RoLCBhLCBiID0gdGhpc1tuIC0gMV0sIGFyZWEgPSAwO1xuICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICBhID0gYjtcbiAgICAgIGIgPSB0aGlzW2ldO1xuICAgICAgYXJlYSArPSBhWzFdICogYlswXSAtIGFbMF0gKiBiWzFdO1xuICAgIH1cbiAgICByZXR1cm4gYXJlYSAqIC41O1xuICB9O1xuICBkM19nZW9tX3BvbHlnb25Qcm90b3R5cGUuY2VudHJvaWQgPSBmdW5jdGlvbihrKSB7XG4gICAgdmFyIGkgPSAtMSwgbiA9IHRoaXMubGVuZ3RoLCB4ID0gMCwgeSA9IDAsIGEsIGIgPSB0aGlzW24gLSAxXSwgYztcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIGsgPSAtMSAvICg2ICogdGhpcy5hcmVhKCkpO1xuICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICBhID0gYjtcbiAgICAgIGIgPSB0aGlzW2ldO1xuICAgICAgYyA9IGFbMF0gKiBiWzFdIC0gYlswXSAqIGFbMV07XG4gICAgICB4ICs9IChhWzBdICsgYlswXSkgKiBjO1xuICAgICAgeSArPSAoYVsxXSArIGJbMV0pICogYztcbiAgICB9XG4gICAgcmV0dXJuIFsgeCAqIGssIHkgKiBrIF07XG4gIH07XG4gIGQzX2dlb21fcG9seWdvblByb3RvdHlwZS5jbGlwID0gZnVuY3Rpb24oc3ViamVjdCkge1xuICAgIHZhciBpbnB1dCwgY2xvc2VkID0gZDNfZ2VvbV9wb2x5Z29uQ2xvc2VkKHN1YmplY3QpLCBpID0gLTEsIG4gPSB0aGlzLmxlbmd0aCAtIGQzX2dlb21fcG9seWdvbkNsb3NlZCh0aGlzKSwgaiwgbSwgYSA9IHRoaXNbbiAtIDFdLCBiLCBjLCBkO1xuICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICBpbnB1dCA9IHN1YmplY3Quc2xpY2UoKTtcbiAgICAgIHN1YmplY3QubGVuZ3RoID0gMDtcbiAgICAgIGIgPSB0aGlzW2ldO1xuICAgICAgYyA9IGlucHV0WyhtID0gaW5wdXQubGVuZ3RoIC0gY2xvc2VkKSAtIDFdO1xuICAgICAgaiA9IC0xO1xuICAgICAgd2hpbGUgKCsraiA8IG0pIHtcbiAgICAgICAgZCA9IGlucHV0W2pdO1xuICAgICAgICBpZiAoZDNfZ2VvbV9wb2x5Z29uSW5zaWRlKGQsIGEsIGIpKSB7XG4gICAgICAgICAgaWYgKCFkM19nZW9tX3BvbHlnb25JbnNpZGUoYywgYSwgYikpIHtcbiAgICAgICAgICAgIHN1YmplY3QucHVzaChkM19nZW9tX3BvbHlnb25JbnRlcnNlY3QoYywgZCwgYSwgYikpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzdWJqZWN0LnB1c2goZCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZDNfZ2VvbV9wb2x5Z29uSW5zaWRlKGMsIGEsIGIpKSB7XG4gICAgICAgICAgc3ViamVjdC5wdXNoKGQzX2dlb21fcG9seWdvbkludGVyc2VjdChjLCBkLCBhLCBiKSk7XG4gICAgICAgIH1cbiAgICAgICAgYyA9IGQ7XG4gICAgICB9XG4gICAgICBpZiAoY2xvc2VkKSBzdWJqZWN0LnB1c2goc3ViamVjdFswXSk7XG4gICAgICBhID0gYjtcbiAgICB9XG4gICAgcmV0dXJuIHN1YmplY3Q7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX2dlb21fcG9seWdvbkluc2lkZShwLCBhLCBiKSB7XG4gICAgcmV0dXJuIChiWzBdIC0gYVswXSkgKiAocFsxXSAtIGFbMV0pIDwgKGJbMV0gLSBhWzFdKSAqIChwWzBdIC0gYVswXSk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvbV9wb2x5Z29uSW50ZXJzZWN0KGMsIGQsIGEsIGIpIHtcbiAgICB2YXIgeDEgPSBjWzBdLCB4MyA9IGFbMF0sIHgyMSA9IGRbMF0gLSB4MSwgeDQzID0gYlswXSAtIHgzLCB5MSA9IGNbMV0sIHkzID0gYVsxXSwgeTIxID0gZFsxXSAtIHkxLCB5NDMgPSBiWzFdIC0geTMsIHVhID0gKHg0MyAqICh5MSAtIHkzKSAtIHk0MyAqICh4MSAtIHgzKSkgLyAoeTQzICogeDIxIC0geDQzICogeTIxKTtcbiAgICByZXR1cm4gWyB4MSArIHVhICogeDIxLCB5MSArIHVhICogeTIxIF07XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvbV9wb2x5Z29uQ2xvc2VkKGNvb3JkaW5hdGVzKSB7XG4gICAgdmFyIGEgPSBjb29yZGluYXRlc1swXSwgYiA9IGNvb3JkaW5hdGVzW2Nvb3JkaW5hdGVzLmxlbmd0aCAtIDFdO1xuICAgIHJldHVybiAhKGFbMF0gLSBiWzBdIHx8IGFbMV0gLSBiWzFdKTtcbiAgfVxuICB2YXIgZDNfZ2VvbV92b3Jvbm9pRWRnZXMsIGQzX2dlb21fdm9yb25vaUNlbGxzLCBkM19nZW9tX3Zvcm9ub2lCZWFjaGVzLCBkM19nZW9tX3Zvcm9ub2lCZWFjaFBvb2wgPSBbXSwgZDNfZ2VvbV92b3Jvbm9pRmlyc3RDaXJjbGUsIGQzX2dlb21fdm9yb25vaUNpcmNsZXMsIGQzX2dlb21fdm9yb25vaUNpcmNsZVBvb2wgPSBbXTtcbiAgZnVuY3Rpb24gZDNfZ2VvbV92b3Jvbm9pQmVhY2goKSB7XG4gICAgZDNfZ2VvbV92b3Jvbm9pUmVkQmxhY2tOb2RlKHRoaXMpO1xuICAgIHRoaXMuZWRnZSA9IHRoaXMuc2l0ZSA9IHRoaXMuY2lyY2xlID0gbnVsbDtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9tX3Zvcm9ub2lDcmVhdGVCZWFjaChzaXRlKSB7XG4gICAgdmFyIGJlYWNoID0gZDNfZ2VvbV92b3Jvbm9pQmVhY2hQb29sLnBvcCgpIHx8IG5ldyBkM19nZW9tX3Zvcm9ub2lCZWFjaCgpO1xuICAgIGJlYWNoLnNpdGUgPSBzaXRlO1xuICAgIHJldHVybiBiZWFjaDtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9tX3Zvcm9ub2lEZXRhY2hCZWFjaChiZWFjaCkge1xuICAgIGQzX2dlb21fdm9yb25vaURldGFjaENpcmNsZShiZWFjaCk7XG4gICAgZDNfZ2VvbV92b3Jvbm9pQmVhY2hlcy5yZW1vdmUoYmVhY2gpO1xuICAgIGQzX2dlb21fdm9yb25vaUJlYWNoUG9vbC5wdXNoKGJlYWNoKTtcbiAgICBkM19nZW9tX3Zvcm9ub2lSZWRCbGFja05vZGUoYmVhY2gpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb21fdm9yb25vaVJlbW92ZUJlYWNoKGJlYWNoKSB7XG4gICAgdmFyIGNpcmNsZSA9IGJlYWNoLmNpcmNsZSwgeCA9IGNpcmNsZS54LCB5ID0gY2lyY2xlLmN5LCB2ZXJ0ZXggPSB7XG4gICAgICB4OiB4LFxuICAgICAgeTogeVxuICAgIH0sIHByZXZpb3VzID0gYmVhY2guUCwgbmV4dCA9IGJlYWNoLk4sIGRpc2FwcGVhcmluZyA9IFsgYmVhY2ggXTtcbiAgICBkM19nZW9tX3Zvcm9ub2lEZXRhY2hCZWFjaChiZWFjaCk7XG4gICAgdmFyIGxBcmMgPSBwcmV2aW91cztcbiAgICB3aGlsZSAobEFyYy5jaXJjbGUgJiYgYWJzKHggLSBsQXJjLmNpcmNsZS54KSA8IM61ICYmIGFicyh5IC0gbEFyYy5jaXJjbGUuY3kpIDwgzrUpIHtcbiAgICAgIHByZXZpb3VzID0gbEFyYy5QO1xuICAgICAgZGlzYXBwZWFyaW5nLnVuc2hpZnQobEFyYyk7XG4gICAgICBkM19nZW9tX3Zvcm9ub2lEZXRhY2hCZWFjaChsQXJjKTtcbiAgICAgIGxBcmMgPSBwcmV2aW91cztcbiAgICB9XG4gICAgZGlzYXBwZWFyaW5nLnVuc2hpZnQobEFyYyk7XG4gICAgZDNfZ2VvbV92b3Jvbm9pRGV0YWNoQ2lyY2xlKGxBcmMpO1xuICAgIHZhciByQXJjID0gbmV4dDtcbiAgICB3aGlsZSAockFyYy5jaXJjbGUgJiYgYWJzKHggLSByQXJjLmNpcmNsZS54KSA8IM61ICYmIGFicyh5IC0gckFyYy5jaXJjbGUuY3kpIDwgzrUpIHtcbiAgICAgIG5leHQgPSByQXJjLk47XG4gICAgICBkaXNhcHBlYXJpbmcucHVzaChyQXJjKTtcbiAgICAgIGQzX2dlb21fdm9yb25vaURldGFjaEJlYWNoKHJBcmMpO1xuICAgICAgckFyYyA9IG5leHQ7XG4gICAgfVxuICAgIGRpc2FwcGVhcmluZy5wdXNoKHJBcmMpO1xuICAgIGQzX2dlb21fdm9yb25vaURldGFjaENpcmNsZShyQXJjKTtcbiAgICB2YXIgbkFyY3MgPSBkaXNhcHBlYXJpbmcubGVuZ3RoLCBpQXJjO1xuICAgIGZvciAoaUFyYyA9IDE7IGlBcmMgPCBuQXJjczsgKytpQXJjKSB7XG4gICAgICByQXJjID0gZGlzYXBwZWFyaW5nW2lBcmNdO1xuICAgICAgbEFyYyA9IGRpc2FwcGVhcmluZ1tpQXJjIC0gMV07XG4gICAgICBkM19nZW9tX3Zvcm9ub2lTZXRFZGdlRW5kKHJBcmMuZWRnZSwgbEFyYy5zaXRlLCByQXJjLnNpdGUsIHZlcnRleCk7XG4gICAgfVxuICAgIGxBcmMgPSBkaXNhcHBlYXJpbmdbMF07XG4gICAgckFyYyA9IGRpc2FwcGVhcmluZ1tuQXJjcyAtIDFdO1xuICAgIHJBcmMuZWRnZSA9IGQzX2dlb21fdm9yb25vaUNyZWF0ZUVkZ2UobEFyYy5zaXRlLCByQXJjLnNpdGUsIG51bGwsIHZlcnRleCk7XG4gICAgZDNfZ2VvbV92b3Jvbm9pQXR0YWNoQ2lyY2xlKGxBcmMpO1xuICAgIGQzX2dlb21fdm9yb25vaUF0dGFjaENpcmNsZShyQXJjKTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9tX3Zvcm9ub2lBZGRCZWFjaChzaXRlKSB7XG4gICAgdmFyIHggPSBzaXRlLngsIGRpcmVjdHJpeCA9IHNpdGUueSwgbEFyYywgckFyYywgZHhsLCBkeHIsIG5vZGUgPSBkM19nZW9tX3Zvcm9ub2lCZWFjaGVzLl87XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgIGR4bCA9IGQzX2dlb21fdm9yb25vaUxlZnRCcmVha1BvaW50KG5vZGUsIGRpcmVjdHJpeCkgLSB4O1xuICAgICAgaWYgKGR4bCA+IM61KSBub2RlID0gbm9kZS5MOyBlbHNlIHtcbiAgICAgICAgZHhyID0geCAtIGQzX2dlb21fdm9yb25vaVJpZ2h0QnJlYWtQb2ludChub2RlLCBkaXJlY3RyaXgpO1xuICAgICAgICBpZiAoZHhyID4gzrUpIHtcbiAgICAgICAgICBpZiAoIW5vZGUuUikge1xuICAgICAgICAgICAgbEFyYyA9IG5vZGU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgbm9kZSA9IG5vZGUuUjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoZHhsID4gLc61KSB7XG4gICAgICAgICAgICBsQXJjID0gbm9kZS5QO1xuICAgICAgICAgICAgckFyYyA9IG5vZGU7XG4gICAgICAgICAgfSBlbHNlIGlmIChkeHIgPiAtzrUpIHtcbiAgICAgICAgICAgIGxBcmMgPSBub2RlO1xuICAgICAgICAgICAgckFyYyA9IG5vZGUuTjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbEFyYyA9IHJBcmMgPSBub2RlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB2YXIgbmV3QXJjID0gZDNfZ2VvbV92b3Jvbm9pQ3JlYXRlQmVhY2goc2l0ZSk7XG4gICAgZDNfZ2VvbV92b3Jvbm9pQmVhY2hlcy5pbnNlcnQobEFyYywgbmV3QXJjKTtcbiAgICBpZiAoIWxBcmMgJiYgIXJBcmMpIHJldHVybjtcbiAgICBpZiAobEFyYyA9PT0gckFyYykge1xuICAgICAgZDNfZ2VvbV92b3Jvbm9pRGV0YWNoQ2lyY2xlKGxBcmMpO1xuICAgICAgckFyYyA9IGQzX2dlb21fdm9yb25vaUNyZWF0ZUJlYWNoKGxBcmMuc2l0ZSk7XG4gICAgICBkM19nZW9tX3Zvcm9ub2lCZWFjaGVzLmluc2VydChuZXdBcmMsIHJBcmMpO1xuICAgICAgbmV3QXJjLmVkZ2UgPSByQXJjLmVkZ2UgPSBkM19nZW9tX3Zvcm9ub2lDcmVhdGVFZGdlKGxBcmMuc2l0ZSwgbmV3QXJjLnNpdGUpO1xuICAgICAgZDNfZ2VvbV92b3Jvbm9pQXR0YWNoQ2lyY2xlKGxBcmMpO1xuICAgICAgZDNfZ2VvbV92b3Jvbm9pQXR0YWNoQ2lyY2xlKHJBcmMpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIXJBcmMpIHtcbiAgICAgIG5ld0FyYy5lZGdlID0gZDNfZ2VvbV92b3Jvbm9pQ3JlYXRlRWRnZShsQXJjLnNpdGUsIG5ld0FyYy5zaXRlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZDNfZ2VvbV92b3Jvbm9pRGV0YWNoQ2lyY2xlKGxBcmMpO1xuICAgIGQzX2dlb21fdm9yb25vaURldGFjaENpcmNsZShyQXJjKTtcbiAgICB2YXIgbFNpdGUgPSBsQXJjLnNpdGUsIGF4ID0gbFNpdGUueCwgYXkgPSBsU2l0ZS55LCBieCA9IHNpdGUueCAtIGF4LCBieSA9IHNpdGUueSAtIGF5LCByU2l0ZSA9IHJBcmMuc2l0ZSwgY3ggPSByU2l0ZS54IC0gYXgsIGN5ID0gclNpdGUueSAtIGF5LCBkID0gMiAqIChieCAqIGN5IC0gYnkgKiBjeCksIGhiID0gYnggKiBieCArIGJ5ICogYnksIGhjID0gY3ggKiBjeCArIGN5ICogY3ksIHZlcnRleCA9IHtcbiAgICAgIHg6IChjeSAqIGhiIC0gYnkgKiBoYykgLyBkICsgYXgsXG4gICAgICB5OiAoYnggKiBoYyAtIGN4ICogaGIpIC8gZCArIGF5XG4gICAgfTtcbiAgICBkM19nZW9tX3Zvcm9ub2lTZXRFZGdlRW5kKHJBcmMuZWRnZSwgbFNpdGUsIHJTaXRlLCB2ZXJ0ZXgpO1xuICAgIG5ld0FyYy5lZGdlID0gZDNfZ2VvbV92b3Jvbm9pQ3JlYXRlRWRnZShsU2l0ZSwgc2l0ZSwgbnVsbCwgdmVydGV4KTtcbiAgICByQXJjLmVkZ2UgPSBkM19nZW9tX3Zvcm9ub2lDcmVhdGVFZGdlKHNpdGUsIHJTaXRlLCBudWxsLCB2ZXJ0ZXgpO1xuICAgIGQzX2dlb21fdm9yb25vaUF0dGFjaENpcmNsZShsQXJjKTtcbiAgICBkM19nZW9tX3Zvcm9ub2lBdHRhY2hDaXJjbGUockFyYyk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvbV92b3Jvbm9pTGVmdEJyZWFrUG9pbnQoYXJjLCBkaXJlY3RyaXgpIHtcbiAgICB2YXIgc2l0ZSA9IGFyYy5zaXRlLCByZm9jeCA9IHNpdGUueCwgcmZvY3kgPSBzaXRlLnksIHBieTIgPSByZm9jeSAtIGRpcmVjdHJpeDtcbiAgICBpZiAoIXBieTIpIHJldHVybiByZm9jeDtcbiAgICB2YXIgbEFyYyA9IGFyYy5QO1xuICAgIGlmICghbEFyYykgcmV0dXJuIC1JbmZpbml0eTtcbiAgICBzaXRlID0gbEFyYy5zaXRlO1xuICAgIHZhciBsZm9jeCA9IHNpdGUueCwgbGZvY3kgPSBzaXRlLnksIHBsYnkyID0gbGZvY3kgLSBkaXJlY3RyaXg7XG4gICAgaWYgKCFwbGJ5MikgcmV0dXJuIGxmb2N4O1xuICAgIHZhciBobCA9IGxmb2N4IC0gcmZvY3gsIGFieTIgPSAxIC8gcGJ5MiAtIDEgLyBwbGJ5MiwgYiA9IGhsIC8gcGxieTI7XG4gICAgaWYgKGFieTIpIHJldHVybiAoLWIgKyBNYXRoLnNxcnQoYiAqIGIgLSAyICogYWJ5MiAqIChobCAqIGhsIC8gKC0yICogcGxieTIpIC0gbGZvY3kgKyBwbGJ5MiAvIDIgKyByZm9jeSAtIHBieTIgLyAyKSkpIC8gYWJ5MiArIHJmb2N4O1xuICAgIHJldHVybiAocmZvY3ggKyBsZm9jeCkgLyAyO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb21fdm9yb25vaVJpZ2h0QnJlYWtQb2ludChhcmMsIGRpcmVjdHJpeCkge1xuICAgIHZhciByQXJjID0gYXJjLk47XG4gICAgaWYgKHJBcmMpIHJldHVybiBkM19nZW9tX3Zvcm9ub2lMZWZ0QnJlYWtQb2ludChyQXJjLCBkaXJlY3RyaXgpO1xuICAgIHZhciBzaXRlID0gYXJjLnNpdGU7XG4gICAgcmV0dXJuIHNpdGUueSA9PT0gZGlyZWN0cml4ID8gc2l0ZS54IDogSW5maW5pdHk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvbV92b3Jvbm9pQ2VsbChzaXRlKSB7XG4gICAgdGhpcy5zaXRlID0gc2l0ZTtcbiAgICB0aGlzLmVkZ2VzID0gW107XG4gIH1cbiAgZDNfZ2VvbV92b3Jvbm9pQ2VsbC5wcm90b3R5cGUucHJlcGFyZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBoYWxmRWRnZXMgPSB0aGlzLmVkZ2VzLCBpSGFsZkVkZ2UgPSBoYWxmRWRnZXMubGVuZ3RoLCBlZGdlO1xuICAgIHdoaWxlIChpSGFsZkVkZ2UtLSkge1xuICAgICAgZWRnZSA9IGhhbGZFZGdlc1tpSGFsZkVkZ2VdLmVkZ2U7XG4gICAgICBpZiAoIWVkZ2UuYiB8fCAhZWRnZS5hKSBoYWxmRWRnZXMuc3BsaWNlKGlIYWxmRWRnZSwgMSk7XG4gICAgfVxuICAgIGhhbGZFZGdlcy5zb3J0KGQzX2dlb21fdm9yb25vaUhhbGZFZGdlT3JkZXIpO1xuICAgIHJldHVybiBoYWxmRWRnZXMubGVuZ3RoO1xuICB9O1xuICBmdW5jdGlvbiBkM19nZW9tX3Zvcm9ub2lDbG9zZUNlbGxzKGV4dGVudCkge1xuICAgIHZhciB4MCA9IGV4dGVudFswXVswXSwgeDEgPSBleHRlbnRbMV1bMF0sIHkwID0gZXh0ZW50WzBdWzFdLCB5MSA9IGV4dGVudFsxXVsxXSwgeDIsIHkyLCB4MywgeTMsIGNlbGxzID0gZDNfZ2VvbV92b3Jvbm9pQ2VsbHMsIGlDZWxsID0gY2VsbHMubGVuZ3RoLCBjZWxsLCBpSGFsZkVkZ2UsIGhhbGZFZGdlcywgbkhhbGZFZGdlcywgc3RhcnQsIGVuZDtcbiAgICB3aGlsZSAoaUNlbGwtLSkge1xuICAgICAgY2VsbCA9IGNlbGxzW2lDZWxsXTtcbiAgICAgIGlmICghY2VsbCB8fCAhY2VsbC5wcmVwYXJlKCkpIGNvbnRpbnVlO1xuICAgICAgaGFsZkVkZ2VzID0gY2VsbC5lZGdlcztcbiAgICAgIG5IYWxmRWRnZXMgPSBoYWxmRWRnZXMubGVuZ3RoO1xuICAgICAgaUhhbGZFZGdlID0gMDtcbiAgICAgIHdoaWxlIChpSGFsZkVkZ2UgPCBuSGFsZkVkZ2VzKSB7XG4gICAgICAgIGVuZCA9IGhhbGZFZGdlc1tpSGFsZkVkZ2VdLmVuZCgpLCB4MyA9IGVuZC54LCB5MyA9IGVuZC55O1xuICAgICAgICBzdGFydCA9IGhhbGZFZGdlc1srK2lIYWxmRWRnZSAlIG5IYWxmRWRnZXNdLnN0YXJ0KCksIHgyID0gc3RhcnQueCwgeTIgPSBzdGFydC55O1xuICAgICAgICBpZiAoYWJzKHgzIC0geDIpID4gzrUgfHwgYWJzKHkzIC0geTIpID4gzrUpIHtcbiAgICAgICAgICBoYWxmRWRnZXMuc3BsaWNlKGlIYWxmRWRnZSwgMCwgbmV3IGQzX2dlb21fdm9yb25vaUhhbGZFZGdlKGQzX2dlb21fdm9yb25vaUNyZWF0ZUJvcmRlckVkZ2UoY2VsbC5zaXRlLCBlbmQsIGFicyh4MyAtIHgwKSA8IM61ICYmIHkxIC0geTMgPiDOtSA/IHtcbiAgICAgICAgICAgIHg6IHgwLFxuICAgICAgICAgICAgeTogYWJzKHgyIC0geDApIDwgzrUgPyB5MiA6IHkxXG4gICAgICAgICAgfSA6IGFicyh5MyAtIHkxKSA8IM61ICYmIHgxIC0geDMgPiDOtSA/IHtcbiAgICAgICAgICAgIHg6IGFicyh5MiAtIHkxKSA8IM61ID8geDIgOiB4MSxcbiAgICAgICAgICAgIHk6IHkxXG4gICAgICAgICAgfSA6IGFicyh4MyAtIHgxKSA8IM61ICYmIHkzIC0geTAgPiDOtSA/IHtcbiAgICAgICAgICAgIHg6IHgxLFxuICAgICAgICAgICAgeTogYWJzKHgyIC0geDEpIDwgzrUgPyB5MiA6IHkwXG4gICAgICAgICAgfSA6IGFicyh5MyAtIHkwKSA8IM61ICYmIHgzIC0geDAgPiDOtSA/IHtcbiAgICAgICAgICAgIHg6IGFicyh5MiAtIHkwKSA8IM61ID8geDIgOiB4MCxcbiAgICAgICAgICAgIHk6IHkwXG4gICAgICAgICAgfSA6IG51bGwpLCBjZWxsLnNpdGUsIG51bGwpKTtcbiAgICAgICAgICArK25IYWxmRWRnZXM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvbV92b3Jvbm9pSGFsZkVkZ2VPcmRlcihhLCBiKSB7XG4gICAgcmV0dXJuIGIuYW5nbGUgLSBhLmFuZ2xlO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb21fdm9yb25vaUNpcmNsZSgpIHtcbiAgICBkM19nZW9tX3Zvcm9ub2lSZWRCbGFja05vZGUodGhpcyk7XG4gICAgdGhpcy54ID0gdGhpcy55ID0gdGhpcy5hcmMgPSB0aGlzLnNpdGUgPSB0aGlzLmN5ID0gbnVsbDtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9tX3Zvcm9ub2lBdHRhY2hDaXJjbGUoYXJjKSB7XG4gICAgdmFyIGxBcmMgPSBhcmMuUCwgckFyYyA9IGFyYy5OO1xuICAgIGlmICghbEFyYyB8fCAhckFyYykgcmV0dXJuO1xuICAgIHZhciBsU2l0ZSA9IGxBcmMuc2l0ZSwgY1NpdGUgPSBhcmMuc2l0ZSwgclNpdGUgPSByQXJjLnNpdGU7XG4gICAgaWYgKGxTaXRlID09PSByU2l0ZSkgcmV0dXJuO1xuICAgIHZhciBieCA9IGNTaXRlLngsIGJ5ID0gY1NpdGUueSwgYXggPSBsU2l0ZS54IC0gYngsIGF5ID0gbFNpdGUueSAtIGJ5LCBjeCA9IHJTaXRlLnggLSBieCwgY3kgPSByU2l0ZS55IC0gYnk7XG4gICAgdmFyIGQgPSAyICogKGF4ICogY3kgLSBheSAqIGN4KTtcbiAgICBpZiAoZCA+PSAtzrUyKSByZXR1cm47XG4gICAgdmFyIGhhID0gYXggKiBheCArIGF5ICogYXksIGhjID0gY3ggKiBjeCArIGN5ICogY3ksIHggPSAoY3kgKiBoYSAtIGF5ICogaGMpIC8gZCwgeSA9IChheCAqIGhjIC0gY3ggKiBoYSkgLyBkLCBjeSA9IHkgKyBieTtcbiAgICB2YXIgY2lyY2xlID0gZDNfZ2VvbV92b3Jvbm9pQ2lyY2xlUG9vbC5wb3AoKSB8fCBuZXcgZDNfZ2VvbV92b3Jvbm9pQ2lyY2xlKCk7XG4gICAgY2lyY2xlLmFyYyA9IGFyYztcbiAgICBjaXJjbGUuc2l0ZSA9IGNTaXRlO1xuICAgIGNpcmNsZS54ID0geCArIGJ4O1xuICAgIGNpcmNsZS55ID0gY3kgKyBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSk7XG4gICAgY2lyY2xlLmN5ID0gY3k7XG4gICAgYXJjLmNpcmNsZSA9IGNpcmNsZTtcbiAgICB2YXIgYmVmb3JlID0gbnVsbCwgbm9kZSA9IGQzX2dlb21fdm9yb25vaUNpcmNsZXMuXztcbiAgICB3aGlsZSAobm9kZSkge1xuICAgICAgaWYgKGNpcmNsZS55IDwgbm9kZS55IHx8IGNpcmNsZS55ID09PSBub2RlLnkgJiYgY2lyY2xlLnggPD0gbm9kZS54KSB7XG4gICAgICAgIGlmIChub2RlLkwpIG5vZGUgPSBub2RlLkw7IGVsc2Uge1xuICAgICAgICAgIGJlZm9yZSA9IG5vZGUuUDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG5vZGUuUikgbm9kZSA9IG5vZGUuUjsgZWxzZSB7XG4gICAgICAgICAgYmVmb3JlID0gbm9kZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBkM19nZW9tX3Zvcm9ub2lDaXJjbGVzLmluc2VydChiZWZvcmUsIGNpcmNsZSk7XG4gICAgaWYgKCFiZWZvcmUpIGQzX2dlb21fdm9yb25vaUZpcnN0Q2lyY2xlID0gY2lyY2xlO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb21fdm9yb25vaURldGFjaENpcmNsZShhcmMpIHtcbiAgICB2YXIgY2lyY2xlID0gYXJjLmNpcmNsZTtcbiAgICBpZiAoY2lyY2xlKSB7XG4gICAgICBpZiAoIWNpcmNsZS5QKSBkM19nZW9tX3Zvcm9ub2lGaXJzdENpcmNsZSA9IGNpcmNsZS5OO1xuICAgICAgZDNfZ2VvbV92b3Jvbm9pQ2lyY2xlcy5yZW1vdmUoY2lyY2xlKTtcbiAgICAgIGQzX2dlb21fdm9yb25vaUNpcmNsZVBvb2wucHVzaChjaXJjbGUpO1xuICAgICAgZDNfZ2VvbV92b3Jvbm9pUmVkQmxhY2tOb2RlKGNpcmNsZSk7XG4gICAgICBhcmMuY2lyY2xlID0gbnVsbDtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvbV92b3Jvbm9pQ2xpcEVkZ2VzKGV4dGVudCkge1xuICAgIHZhciBlZGdlcyA9IGQzX2dlb21fdm9yb25vaUVkZ2VzLCBjbGlwID0gZDNfZ2VvbV9jbGlwTGluZShleHRlbnRbMF1bMF0sIGV4dGVudFswXVsxXSwgZXh0ZW50WzFdWzBdLCBleHRlbnRbMV1bMV0pLCBpID0gZWRnZXMubGVuZ3RoLCBlO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIGUgPSBlZGdlc1tpXTtcbiAgICAgIGlmICghZDNfZ2VvbV92b3Jvbm9pQ29ubmVjdEVkZ2UoZSwgZXh0ZW50KSB8fCAhY2xpcChlKSB8fCBhYnMoZS5hLnggLSBlLmIueCkgPCDOtSAmJiBhYnMoZS5hLnkgLSBlLmIueSkgPCDOtSkge1xuICAgICAgICBlLmEgPSBlLmIgPSBudWxsO1xuICAgICAgICBlZGdlcy5zcGxpY2UoaSwgMSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb21fdm9yb25vaUNvbm5lY3RFZGdlKGVkZ2UsIGV4dGVudCkge1xuICAgIHZhciB2YiA9IGVkZ2UuYjtcbiAgICBpZiAodmIpIHJldHVybiB0cnVlO1xuICAgIHZhciB2YSA9IGVkZ2UuYSwgeDAgPSBleHRlbnRbMF1bMF0sIHgxID0gZXh0ZW50WzFdWzBdLCB5MCA9IGV4dGVudFswXVsxXSwgeTEgPSBleHRlbnRbMV1bMV0sIGxTaXRlID0gZWRnZS5sLCByU2l0ZSA9IGVkZ2UuciwgbHggPSBsU2l0ZS54LCBseSA9IGxTaXRlLnksIHJ4ID0gclNpdGUueCwgcnkgPSByU2l0ZS55LCBmeCA9IChseCArIHJ4KSAvIDIsIGZ5ID0gKGx5ICsgcnkpIC8gMiwgZm0sIGZiO1xuICAgIGlmIChyeSA9PT0gbHkpIHtcbiAgICAgIGlmIChmeCA8IHgwIHx8IGZ4ID49IHgxKSByZXR1cm47XG4gICAgICBpZiAobHggPiByeCkge1xuICAgICAgICBpZiAoIXZhKSB2YSA9IHtcbiAgICAgICAgICB4OiBmeCxcbiAgICAgICAgICB5OiB5MFxuICAgICAgICB9OyBlbHNlIGlmICh2YS55ID49IHkxKSByZXR1cm47XG4gICAgICAgIHZiID0ge1xuICAgICAgICAgIHg6IGZ4LFxuICAgICAgICAgIHk6IHkxXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIXZhKSB2YSA9IHtcbiAgICAgICAgICB4OiBmeCxcbiAgICAgICAgICB5OiB5MVxuICAgICAgICB9OyBlbHNlIGlmICh2YS55IDwgeTApIHJldHVybjtcbiAgICAgICAgdmIgPSB7XG4gICAgICAgICAgeDogZngsXG4gICAgICAgICAgeTogeTBcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm0gPSAobHggLSByeCkgLyAocnkgLSBseSk7XG4gICAgICBmYiA9IGZ5IC0gZm0gKiBmeDtcbiAgICAgIGlmIChmbSA8IC0xIHx8IGZtID4gMSkge1xuICAgICAgICBpZiAobHggPiByeCkge1xuICAgICAgICAgIGlmICghdmEpIHZhID0ge1xuICAgICAgICAgICAgeDogKHkwIC0gZmIpIC8gZm0sXG4gICAgICAgICAgICB5OiB5MFxuICAgICAgICAgIH07IGVsc2UgaWYgKHZhLnkgPj0geTEpIHJldHVybjtcbiAgICAgICAgICB2YiA9IHtcbiAgICAgICAgICAgIHg6ICh5MSAtIGZiKSAvIGZtLFxuICAgICAgICAgICAgeTogeTFcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICghdmEpIHZhID0ge1xuICAgICAgICAgICAgeDogKHkxIC0gZmIpIC8gZm0sXG4gICAgICAgICAgICB5OiB5MVxuICAgICAgICAgIH07IGVsc2UgaWYgKHZhLnkgPCB5MCkgcmV0dXJuO1xuICAgICAgICAgIHZiID0ge1xuICAgICAgICAgICAgeDogKHkwIC0gZmIpIC8gZm0sXG4gICAgICAgICAgICB5OiB5MFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChseSA8IHJ5KSB7XG4gICAgICAgICAgaWYgKCF2YSkgdmEgPSB7XG4gICAgICAgICAgICB4OiB4MCxcbiAgICAgICAgICAgIHk6IGZtICogeDAgKyBmYlxuICAgICAgICAgIH07IGVsc2UgaWYgKHZhLnggPj0geDEpIHJldHVybjtcbiAgICAgICAgICB2YiA9IHtcbiAgICAgICAgICAgIHg6IHgxLFxuICAgICAgICAgICAgeTogZm0gKiB4MSArIGZiXG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoIXZhKSB2YSA9IHtcbiAgICAgICAgICAgIHg6IHgxLFxuICAgICAgICAgICAgeTogZm0gKiB4MSArIGZiXG4gICAgICAgICAgfTsgZWxzZSBpZiAodmEueCA8IHgwKSByZXR1cm47XG4gICAgICAgICAgdmIgPSB7XG4gICAgICAgICAgICB4OiB4MCxcbiAgICAgICAgICAgIHk6IGZtICogeDAgKyBmYlxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgZWRnZS5hID0gdmE7XG4gICAgZWRnZS5iID0gdmI7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvbV92b3Jvbm9pRWRnZShsU2l0ZSwgclNpdGUpIHtcbiAgICB0aGlzLmwgPSBsU2l0ZTtcbiAgICB0aGlzLnIgPSByU2l0ZTtcbiAgICB0aGlzLmEgPSB0aGlzLmIgPSBudWxsO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb21fdm9yb25vaUNyZWF0ZUVkZ2UobFNpdGUsIHJTaXRlLCB2YSwgdmIpIHtcbiAgICB2YXIgZWRnZSA9IG5ldyBkM19nZW9tX3Zvcm9ub2lFZGdlKGxTaXRlLCByU2l0ZSk7XG4gICAgZDNfZ2VvbV92b3Jvbm9pRWRnZXMucHVzaChlZGdlKTtcbiAgICBpZiAodmEpIGQzX2dlb21fdm9yb25vaVNldEVkZ2VFbmQoZWRnZSwgbFNpdGUsIHJTaXRlLCB2YSk7XG4gICAgaWYgKHZiKSBkM19nZW9tX3Zvcm9ub2lTZXRFZGdlRW5kKGVkZ2UsIHJTaXRlLCBsU2l0ZSwgdmIpO1xuICAgIGQzX2dlb21fdm9yb25vaUNlbGxzW2xTaXRlLmldLmVkZ2VzLnB1c2gobmV3IGQzX2dlb21fdm9yb25vaUhhbGZFZGdlKGVkZ2UsIGxTaXRlLCByU2l0ZSkpO1xuICAgIGQzX2dlb21fdm9yb25vaUNlbGxzW3JTaXRlLmldLmVkZ2VzLnB1c2gobmV3IGQzX2dlb21fdm9yb25vaUhhbGZFZGdlKGVkZ2UsIHJTaXRlLCBsU2l0ZSkpO1xuICAgIHJldHVybiBlZGdlO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb21fdm9yb25vaUNyZWF0ZUJvcmRlckVkZ2UobFNpdGUsIHZhLCB2Yikge1xuICAgIHZhciBlZGdlID0gbmV3IGQzX2dlb21fdm9yb25vaUVkZ2UobFNpdGUsIG51bGwpO1xuICAgIGVkZ2UuYSA9IHZhO1xuICAgIGVkZ2UuYiA9IHZiO1xuICAgIGQzX2dlb21fdm9yb25vaUVkZ2VzLnB1c2goZWRnZSk7XG4gICAgcmV0dXJuIGVkZ2U7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvbV92b3Jvbm9pU2V0RWRnZUVuZChlZGdlLCBsU2l0ZSwgclNpdGUsIHZlcnRleCkge1xuICAgIGlmICghZWRnZS5hICYmICFlZGdlLmIpIHtcbiAgICAgIGVkZ2UuYSA9IHZlcnRleDtcbiAgICAgIGVkZ2UubCA9IGxTaXRlO1xuICAgICAgZWRnZS5yID0gclNpdGU7XG4gICAgfSBlbHNlIGlmIChlZGdlLmwgPT09IHJTaXRlKSB7XG4gICAgICBlZGdlLmIgPSB2ZXJ0ZXg7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVkZ2UuYSA9IHZlcnRleDtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvbV92b3Jvbm9pSGFsZkVkZ2UoZWRnZSwgbFNpdGUsIHJTaXRlKSB7XG4gICAgdmFyIHZhID0gZWRnZS5hLCB2YiA9IGVkZ2UuYjtcbiAgICB0aGlzLmVkZ2UgPSBlZGdlO1xuICAgIHRoaXMuc2l0ZSA9IGxTaXRlO1xuICAgIHRoaXMuYW5nbGUgPSByU2l0ZSA/IE1hdGguYXRhbjIoclNpdGUueSAtIGxTaXRlLnksIHJTaXRlLnggLSBsU2l0ZS54KSA6IGVkZ2UubCA9PT0gbFNpdGUgPyBNYXRoLmF0YW4yKHZiLnggLSB2YS54LCB2YS55IC0gdmIueSkgOiBNYXRoLmF0YW4yKHZhLnggLSB2Yi54LCB2Yi55IC0gdmEueSk7XG4gIH1cbiAgZDNfZ2VvbV92b3Jvbm9pSGFsZkVkZ2UucHJvdG90eXBlID0ge1xuICAgIHN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmVkZ2UubCA9PT0gdGhpcy5zaXRlID8gdGhpcy5lZGdlLmEgOiB0aGlzLmVkZ2UuYjtcbiAgICB9LFxuICAgIGVuZDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5lZGdlLmwgPT09IHRoaXMuc2l0ZSA/IHRoaXMuZWRnZS5iIDogdGhpcy5lZGdlLmE7XG4gICAgfVxuICB9O1xuICBmdW5jdGlvbiBkM19nZW9tX3Zvcm9ub2lSZWRCbGFja1RyZWUoKSB7XG4gICAgdGhpcy5fID0gbnVsbDtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9tX3Zvcm9ub2lSZWRCbGFja05vZGUobm9kZSkge1xuICAgIG5vZGUuVSA9IG5vZGUuQyA9IG5vZGUuTCA9IG5vZGUuUiA9IG5vZGUuUCA9IG5vZGUuTiA9IG51bGw7XG4gIH1cbiAgZDNfZ2VvbV92b3Jvbm9pUmVkQmxhY2tUcmVlLnByb3RvdHlwZSA9IHtcbiAgICBpbnNlcnQ6IGZ1bmN0aW9uKGFmdGVyLCBub2RlKSB7XG4gICAgICB2YXIgcGFyZW50LCBncmFuZHBhLCB1bmNsZTtcbiAgICAgIGlmIChhZnRlcikge1xuICAgICAgICBub2RlLlAgPSBhZnRlcjtcbiAgICAgICAgbm9kZS5OID0gYWZ0ZXIuTjtcbiAgICAgICAgaWYgKGFmdGVyLk4pIGFmdGVyLk4uUCA9IG5vZGU7XG4gICAgICAgIGFmdGVyLk4gPSBub2RlO1xuICAgICAgICBpZiAoYWZ0ZXIuUikge1xuICAgICAgICAgIGFmdGVyID0gYWZ0ZXIuUjtcbiAgICAgICAgICB3aGlsZSAoYWZ0ZXIuTCkgYWZ0ZXIgPSBhZnRlci5MO1xuICAgICAgICAgIGFmdGVyLkwgPSBub2RlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFmdGVyLlIgPSBub2RlO1xuICAgICAgICB9XG4gICAgICAgIHBhcmVudCA9IGFmdGVyO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl8pIHtcbiAgICAgICAgYWZ0ZXIgPSBkM19nZW9tX3Zvcm9ub2lSZWRCbGFja0ZpcnN0KHRoaXMuXyk7XG4gICAgICAgIG5vZGUuUCA9IG51bGw7XG4gICAgICAgIG5vZGUuTiA9IGFmdGVyO1xuICAgICAgICBhZnRlci5QID0gYWZ0ZXIuTCA9IG5vZGU7XG4gICAgICAgIHBhcmVudCA9IGFmdGVyO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9kZS5QID0gbm9kZS5OID0gbnVsbDtcbiAgICAgICAgdGhpcy5fID0gbm9kZTtcbiAgICAgICAgcGFyZW50ID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIG5vZGUuTCA9IG5vZGUuUiA9IG51bGw7XG4gICAgICBub2RlLlUgPSBwYXJlbnQ7XG4gICAgICBub2RlLkMgPSB0cnVlO1xuICAgICAgYWZ0ZXIgPSBub2RlO1xuICAgICAgd2hpbGUgKHBhcmVudCAmJiBwYXJlbnQuQykge1xuICAgICAgICBncmFuZHBhID0gcGFyZW50LlU7XG4gICAgICAgIGlmIChwYXJlbnQgPT09IGdyYW5kcGEuTCkge1xuICAgICAgICAgIHVuY2xlID0gZ3JhbmRwYS5SO1xuICAgICAgICAgIGlmICh1bmNsZSAmJiB1bmNsZS5DKSB7XG4gICAgICAgICAgICBwYXJlbnQuQyA9IHVuY2xlLkMgPSBmYWxzZTtcbiAgICAgICAgICAgIGdyYW5kcGEuQyA9IHRydWU7XG4gICAgICAgICAgICBhZnRlciA9IGdyYW5kcGE7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChhZnRlciA9PT0gcGFyZW50LlIpIHtcbiAgICAgICAgICAgICAgZDNfZ2VvbV92b3Jvbm9pUmVkQmxhY2tSb3RhdGVMZWZ0KHRoaXMsIHBhcmVudCk7XG4gICAgICAgICAgICAgIGFmdGVyID0gcGFyZW50O1xuICAgICAgICAgICAgICBwYXJlbnQgPSBhZnRlci5VO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFyZW50LkMgPSBmYWxzZTtcbiAgICAgICAgICAgIGdyYW5kcGEuQyA9IHRydWU7XG4gICAgICAgICAgICBkM19nZW9tX3Zvcm9ub2lSZWRCbGFja1JvdGF0ZVJpZ2h0KHRoaXMsIGdyYW5kcGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB1bmNsZSA9IGdyYW5kcGEuTDtcbiAgICAgICAgICBpZiAodW5jbGUgJiYgdW5jbGUuQykge1xuICAgICAgICAgICAgcGFyZW50LkMgPSB1bmNsZS5DID0gZmFsc2U7XG4gICAgICAgICAgICBncmFuZHBhLkMgPSB0cnVlO1xuICAgICAgICAgICAgYWZ0ZXIgPSBncmFuZHBhO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoYWZ0ZXIgPT09IHBhcmVudC5MKSB7XG4gICAgICAgICAgICAgIGQzX2dlb21fdm9yb25vaVJlZEJsYWNrUm90YXRlUmlnaHQodGhpcywgcGFyZW50KTtcbiAgICAgICAgICAgICAgYWZ0ZXIgPSBwYXJlbnQ7XG4gICAgICAgICAgICAgIHBhcmVudCA9IGFmdGVyLlU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJlbnQuQyA9IGZhbHNlO1xuICAgICAgICAgICAgZ3JhbmRwYS5DID0gdHJ1ZTtcbiAgICAgICAgICAgIGQzX2dlb21fdm9yb25vaVJlZEJsYWNrUm90YXRlTGVmdCh0aGlzLCBncmFuZHBhKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcGFyZW50ID0gYWZ0ZXIuVTtcbiAgICAgIH1cbiAgICAgIHRoaXMuXy5DID0gZmFsc2U7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIGlmIChub2RlLk4pIG5vZGUuTi5QID0gbm9kZS5QO1xuICAgICAgaWYgKG5vZGUuUCkgbm9kZS5QLk4gPSBub2RlLk47XG4gICAgICBub2RlLk4gPSBub2RlLlAgPSBudWxsO1xuICAgICAgdmFyIHBhcmVudCA9IG5vZGUuVSwgc2libGluZywgbGVmdCA9IG5vZGUuTCwgcmlnaHQgPSBub2RlLlIsIG5leHQsIHJlZDtcbiAgICAgIGlmICghbGVmdCkgbmV4dCA9IHJpZ2h0OyBlbHNlIGlmICghcmlnaHQpIG5leHQgPSBsZWZ0OyBlbHNlIG5leHQgPSBkM19nZW9tX3Zvcm9ub2lSZWRCbGFja0ZpcnN0KHJpZ2h0KTtcbiAgICAgIGlmIChwYXJlbnQpIHtcbiAgICAgICAgaWYgKHBhcmVudC5MID09PSBub2RlKSBwYXJlbnQuTCA9IG5leHQ7IGVsc2UgcGFyZW50LlIgPSBuZXh0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fID0gbmV4dDtcbiAgICAgIH1cbiAgICAgIGlmIChsZWZ0ICYmIHJpZ2h0KSB7XG4gICAgICAgIHJlZCA9IG5leHQuQztcbiAgICAgICAgbmV4dC5DID0gbm9kZS5DO1xuICAgICAgICBuZXh0LkwgPSBsZWZ0O1xuICAgICAgICBsZWZ0LlUgPSBuZXh0O1xuICAgICAgICBpZiAobmV4dCAhPT0gcmlnaHQpIHtcbiAgICAgICAgICBwYXJlbnQgPSBuZXh0LlU7XG4gICAgICAgICAgbmV4dC5VID0gbm9kZS5VO1xuICAgICAgICAgIG5vZGUgPSBuZXh0LlI7XG4gICAgICAgICAgcGFyZW50LkwgPSBub2RlO1xuICAgICAgICAgIG5leHQuUiA9IHJpZ2h0O1xuICAgICAgICAgIHJpZ2h0LlUgPSBuZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5leHQuVSA9IHBhcmVudDtcbiAgICAgICAgICBwYXJlbnQgPSBuZXh0O1xuICAgICAgICAgIG5vZGUgPSBuZXh0LlI7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlZCA9IG5vZGUuQztcbiAgICAgICAgbm9kZSA9IG5leHQ7XG4gICAgICB9XG4gICAgICBpZiAobm9kZSkgbm9kZS5VID0gcGFyZW50O1xuICAgICAgaWYgKHJlZCkgcmV0dXJuO1xuICAgICAgaWYgKG5vZGUgJiYgbm9kZS5DKSB7XG4gICAgICAgIG5vZGUuQyA9IGZhbHNlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBkbyB7XG4gICAgICAgIGlmIChub2RlID09PSB0aGlzLl8pIGJyZWFrO1xuICAgICAgICBpZiAobm9kZSA9PT0gcGFyZW50LkwpIHtcbiAgICAgICAgICBzaWJsaW5nID0gcGFyZW50LlI7XG4gICAgICAgICAgaWYgKHNpYmxpbmcuQykge1xuICAgICAgICAgICAgc2libGluZy5DID0gZmFsc2U7XG4gICAgICAgICAgICBwYXJlbnQuQyA9IHRydWU7XG4gICAgICAgICAgICBkM19nZW9tX3Zvcm9ub2lSZWRCbGFja1JvdGF0ZUxlZnQodGhpcywgcGFyZW50KTtcbiAgICAgICAgICAgIHNpYmxpbmcgPSBwYXJlbnQuUjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHNpYmxpbmcuTCAmJiBzaWJsaW5nLkwuQyB8fCBzaWJsaW5nLlIgJiYgc2libGluZy5SLkMpIHtcbiAgICAgICAgICAgIGlmICghc2libGluZy5SIHx8ICFzaWJsaW5nLlIuQykge1xuICAgICAgICAgICAgICBzaWJsaW5nLkwuQyA9IGZhbHNlO1xuICAgICAgICAgICAgICBzaWJsaW5nLkMgPSB0cnVlO1xuICAgICAgICAgICAgICBkM19nZW9tX3Zvcm9ub2lSZWRCbGFja1JvdGF0ZVJpZ2h0KHRoaXMsIHNpYmxpbmcpO1xuICAgICAgICAgICAgICBzaWJsaW5nID0gcGFyZW50LlI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzaWJsaW5nLkMgPSBwYXJlbnQuQztcbiAgICAgICAgICAgIHBhcmVudC5DID0gc2libGluZy5SLkMgPSBmYWxzZTtcbiAgICAgICAgICAgIGQzX2dlb21fdm9yb25vaVJlZEJsYWNrUm90YXRlTGVmdCh0aGlzLCBwYXJlbnQpO1xuICAgICAgICAgICAgbm9kZSA9IHRoaXMuXztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzaWJsaW5nID0gcGFyZW50Lkw7XG4gICAgICAgICAgaWYgKHNpYmxpbmcuQykge1xuICAgICAgICAgICAgc2libGluZy5DID0gZmFsc2U7XG4gICAgICAgICAgICBwYXJlbnQuQyA9IHRydWU7XG4gICAgICAgICAgICBkM19nZW9tX3Zvcm9ub2lSZWRCbGFja1JvdGF0ZVJpZ2h0KHRoaXMsIHBhcmVudCk7XG4gICAgICAgICAgICBzaWJsaW5nID0gcGFyZW50Lkw7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzaWJsaW5nLkwgJiYgc2libGluZy5MLkMgfHwgc2libGluZy5SICYmIHNpYmxpbmcuUi5DKSB7XG4gICAgICAgICAgICBpZiAoIXNpYmxpbmcuTCB8fCAhc2libGluZy5MLkMpIHtcbiAgICAgICAgICAgICAgc2libGluZy5SLkMgPSBmYWxzZTtcbiAgICAgICAgICAgICAgc2libGluZy5DID0gdHJ1ZTtcbiAgICAgICAgICAgICAgZDNfZ2VvbV92b3Jvbm9pUmVkQmxhY2tSb3RhdGVMZWZ0KHRoaXMsIHNpYmxpbmcpO1xuICAgICAgICAgICAgICBzaWJsaW5nID0gcGFyZW50Lkw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzaWJsaW5nLkMgPSBwYXJlbnQuQztcbiAgICAgICAgICAgIHBhcmVudC5DID0gc2libGluZy5MLkMgPSBmYWxzZTtcbiAgICAgICAgICAgIGQzX2dlb21fdm9yb25vaVJlZEJsYWNrUm90YXRlUmlnaHQodGhpcywgcGFyZW50KTtcbiAgICAgICAgICAgIG5vZGUgPSB0aGlzLl87XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc2libGluZy5DID0gdHJ1ZTtcbiAgICAgICAgbm9kZSA9IHBhcmVudDtcbiAgICAgICAgcGFyZW50ID0gcGFyZW50LlU7XG4gICAgICB9IHdoaWxlICghbm9kZS5DKTtcbiAgICAgIGlmIChub2RlKSBub2RlLkMgPSBmYWxzZTtcbiAgICB9XG4gIH07XG4gIGZ1bmN0aW9uIGQzX2dlb21fdm9yb25vaVJlZEJsYWNrUm90YXRlTGVmdCh0cmVlLCBub2RlKSB7XG4gICAgdmFyIHAgPSBub2RlLCBxID0gbm9kZS5SLCBwYXJlbnQgPSBwLlU7XG4gICAgaWYgKHBhcmVudCkge1xuICAgICAgaWYgKHBhcmVudC5MID09PSBwKSBwYXJlbnQuTCA9IHE7IGVsc2UgcGFyZW50LlIgPSBxO1xuICAgIH0gZWxzZSB7XG4gICAgICB0cmVlLl8gPSBxO1xuICAgIH1cbiAgICBxLlUgPSBwYXJlbnQ7XG4gICAgcC5VID0gcTtcbiAgICBwLlIgPSBxLkw7XG4gICAgaWYgKHAuUikgcC5SLlUgPSBwO1xuICAgIHEuTCA9IHA7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvbV92b3Jvbm9pUmVkQmxhY2tSb3RhdGVSaWdodCh0cmVlLCBub2RlKSB7XG4gICAgdmFyIHAgPSBub2RlLCBxID0gbm9kZS5MLCBwYXJlbnQgPSBwLlU7XG4gICAgaWYgKHBhcmVudCkge1xuICAgICAgaWYgKHBhcmVudC5MID09PSBwKSBwYXJlbnQuTCA9IHE7IGVsc2UgcGFyZW50LlIgPSBxO1xuICAgIH0gZWxzZSB7XG4gICAgICB0cmVlLl8gPSBxO1xuICAgIH1cbiAgICBxLlUgPSBwYXJlbnQ7XG4gICAgcC5VID0gcTtcbiAgICBwLkwgPSBxLlI7XG4gICAgaWYgKHAuTCkgcC5MLlUgPSBwO1xuICAgIHEuUiA9IHA7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvbV92b3Jvbm9pUmVkQmxhY2tGaXJzdChub2RlKSB7XG4gICAgd2hpbGUgKG5vZGUuTCkgbm9kZSA9IG5vZGUuTDtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9tX3Zvcm9ub2koc2l0ZXMsIGJib3gpIHtcbiAgICB2YXIgc2l0ZSA9IHNpdGVzLnNvcnQoZDNfZ2VvbV92b3Jvbm9pVmVydGV4T3JkZXIpLnBvcCgpLCB4MCwgeTAsIGNpcmNsZTtcbiAgICBkM19nZW9tX3Zvcm9ub2lFZGdlcyA9IFtdO1xuICAgIGQzX2dlb21fdm9yb25vaUNlbGxzID0gbmV3IEFycmF5KHNpdGVzLmxlbmd0aCk7XG4gICAgZDNfZ2VvbV92b3Jvbm9pQmVhY2hlcyA9IG5ldyBkM19nZW9tX3Zvcm9ub2lSZWRCbGFja1RyZWUoKTtcbiAgICBkM19nZW9tX3Zvcm9ub2lDaXJjbGVzID0gbmV3IGQzX2dlb21fdm9yb25vaVJlZEJsYWNrVHJlZSgpO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBjaXJjbGUgPSBkM19nZW9tX3Zvcm9ub2lGaXJzdENpcmNsZTtcbiAgICAgIGlmIChzaXRlICYmICghY2lyY2xlIHx8IHNpdGUueSA8IGNpcmNsZS55IHx8IHNpdGUueSA9PT0gY2lyY2xlLnkgJiYgc2l0ZS54IDwgY2lyY2xlLngpKSB7XG4gICAgICAgIGlmIChzaXRlLnggIT09IHgwIHx8IHNpdGUueSAhPT0geTApIHtcbiAgICAgICAgICBkM19nZW9tX3Zvcm9ub2lDZWxsc1tzaXRlLmldID0gbmV3IGQzX2dlb21fdm9yb25vaUNlbGwoc2l0ZSk7XG4gICAgICAgICAgZDNfZ2VvbV92b3Jvbm9pQWRkQmVhY2goc2l0ZSk7XG4gICAgICAgICAgeDAgPSBzaXRlLngsIHkwID0gc2l0ZS55O1xuICAgICAgICB9XG4gICAgICAgIHNpdGUgPSBzaXRlcy5wb3AoKTtcbiAgICAgIH0gZWxzZSBpZiAoY2lyY2xlKSB7XG4gICAgICAgIGQzX2dlb21fdm9yb25vaVJlbW92ZUJlYWNoKGNpcmNsZS5hcmMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChiYm94KSBkM19nZW9tX3Zvcm9ub2lDbGlwRWRnZXMoYmJveCksIGQzX2dlb21fdm9yb25vaUNsb3NlQ2VsbHMoYmJveCk7XG4gICAgdmFyIGRpYWdyYW0gPSB7XG4gICAgICBjZWxsczogZDNfZ2VvbV92b3Jvbm9pQ2VsbHMsXG4gICAgICBlZGdlczogZDNfZ2VvbV92b3Jvbm9pRWRnZXNcbiAgICB9O1xuICAgIGQzX2dlb21fdm9yb25vaUJlYWNoZXMgPSBkM19nZW9tX3Zvcm9ub2lDaXJjbGVzID0gZDNfZ2VvbV92b3Jvbm9pRWRnZXMgPSBkM19nZW9tX3Zvcm9ub2lDZWxscyA9IG51bGw7XG4gICAgcmV0dXJuIGRpYWdyYW07XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvbV92b3Jvbm9pVmVydGV4T3JkZXIoYSwgYikge1xuICAgIHJldHVybiBiLnkgLSBhLnkgfHwgYi54IC0gYS54O1xuICB9XG4gIGQzLmdlb20udm9yb25vaSA9IGZ1bmN0aW9uKHBvaW50cykge1xuICAgIHZhciB4ID0gZDNfZ2VvbV9wb2ludFgsIHkgPSBkM19nZW9tX3BvaW50WSwgZnggPSB4LCBmeSA9IHksIGNsaXBFeHRlbnQgPSBkM19nZW9tX3Zvcm9ub2lDbGlwRXh0ZW50O1xuICAgIGlmIChwb2ludHMpIHJldHVybiB2b3Jvbm9pKHBvaW50cyk7XG4gICAgZnVuY3Rpb24gdm9yb25vaShkYXRhKSB7XG4gICAgICB2YXIgcG9seWdvbnMgPSBuZXcgQXJyYXkoZGF0YS5sZW5ndGgpLCB4MCA9IGNsaXBFeHRlbnRbMF1bMF0sIHkwID0gY2xpcEV4dGVudFswXVsxXSwgeDEgPSBjbGlwRXh0ZW50WzFdWzBdLCB5MSA9IGNsaXBFeHRlbnRbMV1bMV07XG4gICAgICBkM19nZW9tX3Zvcm9ub2koc2l0ZXMoZGF0YSksIGNsaXBFeHRlbnQpLmNlbGxzLmZvckVhY2goZnVuY3Rpb24oY2VsbCwgaSkge1xuICAgICAgICB2YXIgZWRnZXMgPSBjZWxsLmVkZ2VzLCBzaXRlID0gY2VsbC5zaXRlLCBwb2x5Z29uID0gcG9seWdvbnNbaV0gPSBlZGdlcy5sZW5ndGggPyBlZGdlcy5tYXAoZnVuY3Rpb24oZSkge1xuICAgICAgICAgIHZhciBzID0gZS5zdGFydCgpO1xuICAgICAgICAgIHJldHVybiBbIHMueCwgcy55IF07XG4gICAgICAgIH0pIDogc2l0ZS54ID49IHgwICYmIHNpdGUueCA8PSB4MSAmJiBzaXRlLnkgPj0geTAgJiYgc2l0ZS55IDw9IHkxID8gWyBbIHgwLCB5MSBdLCBbIHgxLCB5MSBdLCBbIHgxLCB5MCBdLCBbIHgwLCB5MCBdIF0gOiBbXTtcbiAgICAgICAgcG9seWdvbi5wb2ludCA9IGRhdGFbaV07XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBwb2x5Z29ucztcbiAgICB9XG4gICAgZnVuY3Rpb24gc2l0ZXMoZGF0YSkge1xuICAgICAgcmV0dXJuIGRhdGEubWFwKGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB4OiBNYXRoLnJvdW5kKGZ4KGQsIGkpIC8gzrUpICogzrUsXG4gICAgICAgICAgeTogTWF0aC5yb3VuZChmeShkLCBpKSAvIM61KSAqIM61LFxuICAgICAgICAgIGk6IGlcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICB2b3Jvbm9pLmxpbmtzID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuIGQzX2dlb21fdm9yb25vaShzaXRlcyhkYXRhKSkuZWRnZXMuZmlsdGVyKGZ1bmN0aW9uKGVkZ2UpIHtcbiAgICAgICAgcmV0dXJuIGVkZ2UubCAmJiBlZGdlLnI7XG4gICAgICB9KS5tYXAoZnVuY3Rpb24oZWRnZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHNvdXJjZTogZGF0YVtlZGdlLmwuaV0sXG4gICAgICAgICAgdGFyZ2V0OiBkYXRhW2VkZ2Uuci5pXVxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgfTtcbiAgICB2b3Jvbm9pLnRyaWFuZ2xlcyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciB0cmlhbmdsZXMgPSBbXTtcbiAgICAgIGQzX2dlb21fdm9yb25vaShzaXRlcyhkYXRhKSkuY2VsbHMuZm9yRWFjaChmdW5jdGlvbihjZWxsLCBpKSB7XG4gICAgICAgIHZhciBzaXRlID0gY2VsbC5zaXRlLCBlZGdlcyA9IGNlbGwuZWRnZXMuc29ydChkM19nZW9tX3Zvcm9ub2lIYWxmRWRnZU9yZGVyKSwgaiA9IC0xLCBtID0gZWRnZXMubGVuZ3RoLCBlMCwgczAsIGUxID0gZWRnZXNbbSAtIDFdLmVkZ2UsIHMxID0gZTEubCA9PT0gc2l0ZSA/IGUxLnIgOiBlMS5sO1xuICAgICAgICB3aGlsZSAoKytqIDwgbSkge1xuICAgICAgICAgIGUwID0gZTE7XG4gICAgICAgICAgczAgPSBzMTtcbiAgICAgICAgICBlMSA9IGVkZ2VzW2pdLmVkZ2U7XG4gICAgICAgICAgczEgPSBlMS5sID09PSBzaXRlID8gZTEuciA6IGUxLmw7XG4gICAgICAgICAgaWYgKGkgPCBzMC5pICYmIGkgPCBzMS5pICYmIGQzX2dlb21fdm9yb25vaVRyaWFuZ2xlQXJlYShzaXRlLCBzMCwgczEpIDwgMCkge1xuICAgICAgICAgICAgdHJpYW5nbGVzLnB1c2goWyBkYXRhW2ldLCBkYXRhW3MwLmldLCBkYXRhW3MxLmldIF0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gdHJpYW5nbGVzO1xuICAgIH07XG4gICAgdm9yb25vaS54ID0gZnVuY3Rpb24oXykge1xuICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoZnggPSBkM19mdW5jdG9yKHggPSBfKSwgdm9yb25vaSkgOiB4O1xuICAgIH07XG4gICAgdm9yb25vaS55ID0gZnVuY3Rpb24oXykge1xuICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoZnkgPSBkM19mdW5jdG9yKHkgPSBfKSwgdm9yb25vaSkgOiB5O1xuICAgIH07XG4gICAgdm9yb25vaS5jbGlwRXh0ZW50ID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gY2xpcEV4dGVudCA9PT0gZDNfZ2VvbV92b3Jvbm9pQ2xpcEV4dGVudCA/IG51bGwgOiBjbGlwRXh0ZW50O1xuICAgICAgY2xpcEV4dGVudCA9IF8gPT0gbnVsbCA/IGQzX2dlb21fdm9yb25vaUNsaXBFeHRlbnQgOiBfO1xuICAgICAgcmV0dXJuIHZvcm9ub2k7XG4gICAgfTtcbiAgICB2b3Jvbm9pLnNpemUgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBjbGlwRXh0ZW50ID09PSBkM19nZW9tX3Zvcm9ub2lDbGlwRXh0ZW50ID8gbnVsbCA6IGNsaXBFeHRlbnQgJiYgY2xpcEV4dGVudFsxXTtcbiAgICAgIHJldHVybiB2b3Jvbm9pLmNsaXBFeHRlbnQoXyAmJiBbIFsgMCwgMCBdLCBfIF0pO1xuICAgIH07XG4gICAgcmV0dXJuIHZvcm9ub2k7XG4gIH07XG4gIHZhciBkM19nZW9tX3Zvcm9ub2lDbGlwRXh0ZW50ID0gWyBbIC0xZTYsIC0xZTYgXSwgWyAxZTYsIDFlNiBdIF07XG4gIGZ1bmN0aW9uIGQzX2dlb21fdm9yb25vaVRyaWFuZ2xlQXJlYShhLCBiLCBjKSB7XG4gICAgcmV0dXJuIChhLnggLSBjLngpICogKGIueSAtIGEueSkgLSAoYS54IC0gYi54KSAqIChjLnkgLSBhLnkpO1xuICB9XG4gIGQzLmdlb20uZGVsYXVuYXkgPSBmdW5jdGlvbih2ZXJ0aWNlcykge1xuICAgIHJldHVybiBkMy5nZW9tLnZvcm9ub2koKS50cmlhbmdsZXModmVydGljZXMpO1xuICB9O1xuICBkMy5nZW9tLnF1YWR0cmVlID0gZnVuY3Rpb24ocG9pbnRzLCB4MSwgeTEsIHgyLCB5Mikge1xuICAgIHZhciB4ID0gZDNfZ2VvbV9wb2ludFgsIHkgPSBkM19nZW9tX3BvaW50WSwgY29tcGF0O1xuICAgIGlmIChjb21wYXQgPSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICB4ID0gZDNfZ2VvbV9xdWFkdHJlZUNvbXBhdFg7XG4gICAgICB5ID0gZDNfZ2VvbV9xdWFkdHJlZUNvbXBhdFk7XG4gICAgICBpZiAoY29tcGF0ID09PSAzKSB7XG4gICAgICAgIHkyID0geTE7XG4gICAgICAgIHgyID0geDE7XG4gICAgICAgIHkxID0geDEgPSAwO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHF1YWR0cmVlKHBvaW50cyk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHF1YWR0cmVlKGRhdGEpIHtcbiAgICAgIHZhciBkLCBmeCA9IGQzX2Z1bmN0b3IoeCksIGZ5ID0gZDNfZnVuY3Rvcih5KSwgeHMsIHlzLCBpLCBuLCB4MV8sIHkxXywgeDJfLCB5Ml87XG4gICAgICBpZiAoeDEgIT0gbnVsbCkge1xuICAgICAgICB4MV8gPSB4MSwgeTFfID0geTEsIHgyXyA9IHgyLCB5Ml8gPSB5MjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHgyXyA9IHkyXyA9IC0oeDFfID0geTFfID0gSW5maW5pdHkpO1xuICAgICAgICB4cyA9IFtdLCB5cyA9IFtdO1xuICAgICAgICBuID0gZGF0YS5sZW5ndGg7XG4gICAgICAgIGlmIChjb21wYXQpIGZvciAoaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgICAgICBkID0gZGF0YVtpXTtcbiAgICAgICAgICBpZiAoZC54IDwgeDFfKSB4MV8gPSBkLng7XG4gICAgICAgICAgaWYgKGQueSA8IHkxXykgeTFfID0gZC55O1xuICAgICAgICAgIGlmIChkLnggPiB4Ml8pIHgyXyA9IGQueDtcbiAgICAgICAgICBpZiAoZC55ID4geTJfKSB5Ml8gPSBkLnk7XG4gICAgICAgICAgeHMucHVzaChkLngpO1xuICAgICAgICAgIHlzLnB1c2goZC55KTtcbiAgICAgICAgfSBlbHNlIGZvciAoaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgICAgICB2YXIgeF8gPSArZngoZCA9IGRhdGFbaV0sIGkpLCB5XyA9ICtmeShkLCBpKTtcbiAgICAgICAgICBpZiAoeF8gPCB4MV8pIHgxXyA9IHhfO1xuICAgICAgICAgIGlmICh5XyA8IHkxXykgeTFfID0geV87XG4gICAgICAgICAgaWYgKHhfID4geDJfKSB4Ml8gPSB4XztcbiAgICAgICAgICBpZiAoeV8gPiB5Ml8pIHkyXyA9IHlfO1xuICAgICAgICAgIHhzLnB1c2goeF8pO1xuICAgICAgICAgIHlzLnB1c2goeV8pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgZHggPSB4Ml8gLSB4MV8sIGR5ID0geTJfIC0geTFfO1xuICAgICAgaWYgKGR4ID4gZHkpIHkyXyA9IHkxXyArIGR4OyBlbHNlIHgyXyA9IHgxXyArIGR5O1xuICAgICAgZnVuY3Rpb24gaW5zZXJ0KG4sIGQsIHgsIHksIHgxLCB5MSwgeDIsIHkyKSB7XG4gICAgICAgIGlmIChpc05hTih4KSB8fCBpc05hTih5KSkgcmV0dXJuO1xuICAgICAgICBpZiAobi5sZWFmKSB7XG4gICAgICAgICAgdmFyIG54ID0gbi54LCBueSA9IG4ueTtcbiAgICAgICAgICBpZiAobnggIT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKGFicyhueCAtIHgpICsgYWJzKG55IC0geSkgPCAuMDEpIHtcbiAgICAgICAgICAgICAgaW5zZXJ0Q2hpbGQobiwgZCwgeCwgeSwgeDEsIHkxLCB4MiwgeTIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdmFyIG5Qb2ludCA9IG4ucG9pbnQ7XG4gICAgICAgICAgICAgIG4ueCA9IG4ueSA9IG4ucG9pbnQgPSBudWxsO1xuICAgICAgICAgICAgICBpbnNlcnRDaGlsZChuLCBuUG9pbnQsIG54LCBueSwgeDEsIHkxLCB4MiwgeTIpO1xuICAgICAgICAgICAgICBpbnNlcnRDaGlsZChuLCBkLCB4LCB5LCB4MSwgeTEsIHgyLCB5Mik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG4ueCA9IHgsIG4ueSA9IHksIG4ucG9pbnQgPSBkO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbnNlcnRDaGlsZChuLCBkLCB4LCB5LCB4MSwgeTEsIHgyLCB5Mik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIGluc2VydENoaWxkKG4sIGQsIHgsIHksIHgxLCB5MSwgeDIsIHkyKSB7XG4gICAgICAgIHZhciB4bSA9ICh4MSArIHgyKSAqIC41LCB5bSA9ICh5MSArIHkyKSAqIC41LCByaWdodCA9IHggPj0geG0sIGJlbG93ID0geSA+PSB5bSwgaSA9IGJlbG93IDw8IDEgfCByaWdodDtcbiAgICAgICAgbi5sZWFmID0gZmFsc2U7XG4gICAgICAgIG4gPSBuLm5vZGVzW2ldIHx8IChuLm5vZGVzW2ldID0gZDNfZ2VvbV9xdWFkdHJlZU5vZGUoKSk7XG4gICAgICAgIGlmIChyaWdodCkgeDEgPSB4bTsgZWxzZSB4MiA9IHhtO1xuICAgICAgICBpZiAoYmVsb3cpIHkxID0geW07IGVsc2UgeTIgPSB5bTtcbiAgICAgICAgaW5zZXJ0KG4sIGQsIHgsIHksIHgxLCB5MSwgeDIsIHkyKTtcbiAgICAgIH1cbiAgICAgIHZhciByb290ID0gZDNfZ2VvbV9xdWFkdHJlZU5vZGUoKTtcbiAgICAgIHJvb3QuYWRkID0gZnVuY3Rpb24oZCkge1xuICAgICAgICBpbnNlcnQocm9vdCwgZCwgK2Z4KGQsICsraSksICtmeShkLCBpKSwgeDFfLCB5MV8sIHgyXywgeTJfKTtcbiAgICAgIH07XG4gICAgICByb290LnZpc2l0ID0gZnVuY3Rpb24oZikge1xuICAgICAgICBkM19nZW9tX3F1YWR0cmVlVmlzaXQoZiwgcm9vdCwgeDFfLCB5MV8sIHgyXywgeTJfKTtcbiAgICAgIH07XG4gICAgICByb290LmZpbmQgPSBmdW5jdGlvbihwb2ludCkge1xuICAgICAgICByZXR1cm4gZDNfZ2VvbV9xdWFkdHJlZUZpbmQocm9vdCwgcG9pbnRbMF0sIHBvaW50WzFdLCB4MV8sIHkxXywgeDJfLCB5Ml8pO1xuICAgICAgfTtcbiAgICAgIGkgPSAtMTtcbiAgICAgIGlmICh4MSA9PSBudWxsKSB7XG4gICAgICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgICAgaW5zZXJ0KHJvb3QsIGRhdGFbaV0sIHhzW2ldLCB5c1tpXSwgeDFfLCB5MV8sIHgyXywgeTJfKTtcbiAgICAgICAgfVxuICAgICAgICAtLWk7XG4gICAgICB9IGVsc2UgZGF0YS5mb3JFYWNoKHJvb3QuYWRkKTtcbiAgICAgIHhzID0geXMgPSBkYXRhID0gZCA9IG51bGw7XG4gICAgICByZXR1cm4gcm9vdDtcbiAgICB9XG4gICAgcXVhZHRyZWUueCA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHggPSBfLCBxdWFkdHJlZSkgOiB4O1xuICAgIH07XG4gICAgcXVhZHRyZWUueSA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHkgPSBfLCBxdWFkdHJlZSkgOiB5O1xuICAgIH07XG4gICAgcXVhZHRyZWUuZXh0ZW50ID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4geDEgPT0gbnVsbCA/IG51bGwgOiBbIFsgeDEsIHkxIF0sIFsgeDIsIHkyIF0gXTtcbiAgICAgIGlmIChfID09IG51bGwpIHgxID0geTEgPSB4MiA9IHkyID0gbnVsbDsgZWxzZSB4MSA9ICtfWzBdWzBdLCB5MSA9ICtfWzBdWzFdLCB4MiA9ICtfWzFdWzBdLCBcbiAgICAgIHkyID0gK19bMV1bMV07XG4gICAgICByZXR1cm4gcXVhZHRyZWU7XG4gICAgfTtcbiAgICBxdWFkdHJlZS5zaXplID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4geDEgPT0gbnVsbCA/IG51bGwgOiBbIHgyIC0geDEsIHkyIC0geTEgXTtcbiAgICAgIGlmIChfID09IG51bGwpIHgxID0geTEgPSB4MiA9IHkyID0gbnVsbDsgZWxzZSB4MSA9IHkxID0gMCwgeDIgPSArX1swXSwgeTIgPSArX1sxXTtcbiAgICAgIHJldHVybiBxdWFkdHJlZTtcbiAgICB9O1xuICAgIHJldHVybiBxdWFkdHJlZTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfZ2VvbV9xdWFkdHJlZUNvbXBhdFgoZCkge1xuICAgIHJldHVybiBkLng7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvbV9xdWFkdHJlZUNvbXBhdFkoZCkge1xuICAgIHJldHVybiBkLnk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvbV9xdWFkdHJlZU5vZGUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxlYWY6IHRydWUsXG4gICAgICBub2RlczogW10sXG4gICAgICBwb2ludDogbnVsbCxcbiAgICAgIHg6IG51bGwsXG4gICAgICB5OiBudWxsXG4gICAgfTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9tX3F1YWR0cmVlVmlzaXQoZiwgbm9kZSwgeDEsIHkxLCB4MiwgeTIpIHtcbiAgICBpZiAoIWYobm9kZSwgeDEsIHkxLCB4MiwgeTIpKSB7XG4gICAgICB2YXIgc3ggPSAoeDEgKyB4MikgKiAuNSwgc3kgPSAoeTEgKyB5MikgKiAuNSwgY2hpbGRyZW4gPSBub2RlLm5vZGVzO1xuICAgICAgaWYgKGNoaWxkcmVuWzBdKSBkM19nZW9tX3F1YWR0cmVlVmlzaXQoZiwgY2hpbGRyZW5bMF0sIHgxLCB5MSwgc3gsIHN5KTtcbiAgICAgIGlmIChjaGlsZHJlblsxXSkgZDNfZ2VvbV9xdWFkdHJlZVZpc2l0KGYsIGNoaWxkcmVuWzFdLCBzeCwgeTEsIHgyLCBzeSk7XG4gICAgICBpZiAoY2hpbGRyZW5bMl0pIGQzX2dlb21fcXVhZHRyZWVWaXNpdChmLCBjaGlsZHJlblsyXSwgeDEsIHN5LCBzeCwgeTIpO1xuICAgICAgaWYgKGNoaWxkcmVuWzNdKSBkM19nZW9tX3F1YWR0cmVlVmlzaXQoZiwgY2hpbGRyZW5bM10sIHN4LCBzeSwgeDIsIHkyKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvbV9xdWFkdHJlZUZpbmQocm9vdCwgeCwgeSwgeDAsIHkwLCB4MywgeTMpIHtcbiAgICB2YXIgbWluRGlzdGFuY2UyID0gSW5maW5pdHksIGNsb3Nlc3RQb2ludDtcbiAgICAoZnVuY3Rpb24gZmluZChub2RlLCB4MSwgeTEsIHgyLCB5Mikge1xuICAgICAgaWYgKHgxID4geDMgfHwgeTEgPiB5MyB8fCB4MiA8IHgwIHx8IHkyIDwgeTApIHJldHVybjtcbiAgICAgIGlmIChwb2ludCA9IG5vZGUucG9pbnQpIHtcbiAgICAgICAgdmFyIHBvaW50LCBkeCA9IHggLSBwb2ludFswXSwgZHkgPSB5IC0gcG9pbnRbMV0sIGRpc3RhbmNlMiA9IGR4ICogZHggKyBkeSAqIGR5O1xuICAgICAgICBpZiAoZGlzdGFuY2UyIDwgbWluRGlzdGFuY2UyKSB7XG4gICAgICAgICAgdmFyIGRpc3RhbmNlID0gTWF0aC5zcXJ0KG1pbkRpc3RhbmNlMiA9IGRpc3RhbmNlMik7XG4gICAgICAgICAgeDAgPSB4IC0gZGlzdGFuY2UsIHkwID0geSAtIGRpc3RhbmNlO1xuICAgICAgICAgIHgzID0geCArIGRpc3RhbmNlLCB5MyA9IHkgKyBkaXN0YW5jZTtcbiAgICAgICAgICBjbG9zZXN0UG9pbnQgPSBwb2ludDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIGNoaWxkcmVuID0gbm9kZS5ub2RlcywgeG0gPSAoeDEgKyB4MikgKiAuNSwgeW0gPSAoeTEgKyB5MikgKiAuNSwgcmlnaHQgPSB4ID49IHhtLCBiZWxvdyA9IHkgPj0geW07XG4gICAgICBmb3IgKHZhciBpID0gYmVsb3cgPDwgMSB8IHJpZ2h0LCBqID0gaSArIDQ7IGkgPCBqOyArK2kpIHtcbiAgICAgICAgaWYgKG5vZGUgPSBjaGlsZHJlbltpICYgM10pIHN3aXRjaCAoaSAmIDMpIHtcbiAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICBmaW5kKG5vZGUsIHgxLCB5MSwgeG0sIHltKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIGZpbmQobm9kZSwgeG0sIHkxLCB4MiwgeW0pO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgZmluZChub2RlLCB4MSwgeW0sIHhtLCB5Mik7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICBmaW5kKG5vZGUsIHhtLCB5bSwgeDIsIHkyKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pKHJvb3QsIHgwLCB5MCwgeDMsIHkzKTtcbiAgICByZXR1cm4gY2xvc2VzdFBvaW50O1xuICB9XG4gIGQzLmludGVycG9sYXRlUmdiID0gZDNfaW50ZXJwb2xhdGVSZ2I7XG4gIGZ1bmN0aW9uIGQzX2ludGVycG9sYXRlUmdiKGEsIGIpIHtcbiAgICBhID0gZDMucmdiKGEpO1xuICAgIGIgPSBkMy5yZ2IoYik7XG4gICAgdmFyIGFyID0gYS5yLCBhZyA9IGEuZywgYWIgPSBhLmIsIGJyID0gYi5yIC0gYXIsIGJnID0gYi5nIC0gYWcsIGJiID0gYi5iIC0gYWI7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICAgIHJldHVybiBcIiNcIiArIGQzX3JnYl9oZXgoTWF0aC5yb3VuZChhciArIGJyICogdCkpICsgZDNfcmdiX2hleChNYXRoLnJvdW5kKGFnICsgYmcgKiB0KSkgKyBkM19yZ2JfaGV4KE1hdGgucm91bmQoYWIgKyBiYiAqIHQpKTtcbiAgICB9O1xuICB9XG4gIGQzLmludGVycG9sYXRlT2JqZWN0ID0gZDNfaW50ZXJwb2xhdGVPYmplY3Q7XG4gIGZ1bmN0aW9uIGQzX2ludGVycG9sYXRlT2JqZWN0KGEsIGIpIHtcbiAgICB2YXIgaSA9IHt9LCBjID0ge30sIGs7XG4gICAgZm9yIChrIGluIGEpIHtcbiAgICAgIGlmIChrIGluIGIpIHtcbiAgICAgICAgaVtrXSA9IGQzX2ludGVycG9sYXRlKGFba10sIGJba10pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY1trXSA9IGFba107XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAoayBpbiBiKSB7XG4gICAgICBpZiAoIShrIGluIGEpKSB7XG4gICAgICAgIGNba10gPSBiW2tdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgICAgZm9yIChrIGluIGkpIGNba10gPSBpW2tdKHQpO1xuICAgICAgcmV0dXJuIGM7XG4gICAgfTtcbiAgfVxuICBkMy5pbnRlcnBvbGF0ZU51bWJlciA9IGQzX2ludGVycG9sYXRlTnVtYmVyO1xuICBmdW5jdGlvbiBkM19pbnRlcnBvbGF0ZU51bWJlcihhLCBiKSB7XG4gICAgYSA9ICthLCBiID0gK2I7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICAgIHJldHVybiBhICogKDEgLSB0KSArIGIgKiB0O1xuICAgIH07XG4gIH1cbiAgZDMuaW50ZXJwb2xhdGVTdHJpbmcgPSBkM19pbnRlcnBvbGF0ZVN0cmluZztcbiAgZnVuY3Rpb24gZDNfaW50ZXJwb2xhdGVTdHJpbmcoYSwgYikge1xuICAgIHZhciBiaSA9IGQzX2ludGVycG9sYXRlX251bWJlckEubGFzdEluZGV4ID0gZDNfaW50ZXJwb2xhdGVfbnVtYmVyQi5sYXN0SW5kZXggPSAwLCBhbSwgYm0sIGJzLCBpID0gLTEsIHMgPSBbXSwgcSA9IFtdO1xuICAgIGEgPSBhICsgXCJcIiwgYiA9IGIgKyBcIlwiO1xuICAgIHdoaWxlICgoYW0gPSBkM19pbnRlcnBvbGF0ZV9udW1iZXJBLmV4ZWMoYSkpICYmIChibSA9IGQzX2ludGVycG9sYXRlX251bWJlckIuZXhlYyhiKSkpIHtcbiAgICAgIGlmICgoYnMgPSBibS5pbmRleCkgPiBiaSkge1xuICAgICAgICBicyA9IGIuc2xpY2UoYmksIGJzKTtcbiAgICAgICAgaWYgKHNbaV0pIHNbaV0gKz0gYnM7IGVsc2Ugc1srK2ldID0gYnM7XG4gICAgICB9XG4gICAgICBpZiAoKGFtID0gYW1bMF0pID09PSAoYm0gPSBibVswXSkpIHtcbiAgICAgICAgaWYgKHNbaV0pIHNbaV0gKz0gYm07IGVsc2Ugc1srK2ldID0gYm07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzWysraV0gPSBudWxsO1xuICAgICAgICBxLnB1c2goe1xuICAgICAgICAgIGk6IGksXG4gICAgICAgICAgeDogZDNfaW50ZXJwb2xhdGVOdW1iZXIoYW0sIGJtKVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGJpID0gZDNfaW50ZXJwb2xhdGVfbnVtYmVyQi5sYXN0SW5kZXg7XG4gICAgfVxuICAgIGlmIChiaSA8IGIubGVuZ3RoKSB7XG4gICAgICBicyA9IGIuc2xpY2UoYmkpO1xuICAgICAgaWYgKHNbaV0pIHNbaV0gKz0gYnM7IGVsc2Ugc1srK2ldID0gYnM7XG4gICAgfVxuICAgIHJldHVybiBzLmxlbmd0aCA8IDIgPyBxWzBdID8gKGIgPSBxWzBdLngsIGZ1bmN0aW9uKHQpIHtcbiAgICAgIHJldHVybiBiKHQpICsgXCJcIjtcbiAgICB9KSA6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGI7XG4gICAgfSA6IChiID0gcS5sZW5ndGgsIGZ1bmN0aW9uKHQpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBvOyBpIDwgYjsgKytpKSBzWyhvID0gcVtpXSkuaV0gPSBvLngodCk7XG4gICAgICByZXR1cm4gcy5qb2luKFwiXCIpO1xuICAgIH0pO1xuICB9XG4gIHZhciBkM19pbnRlcnBvbGF0ZV9udW1iZXJBID0gL1stK10/KD86XFxkK1xcLj9cXGQqfFxcLj9cXGQrKSg/OltlRV1bLStdP1xcZCspPy9nLCBkM19pbnRlcnBvbGF0ZV9udW1iZXJCID0gbmV3IFJlZ0V4cChkM19pbnRlcnBvbGF0ZV9udW1iZXJBLnNvdXJjZSwgXCJnXCIpO1xuICBkMy5pbnRlcnBvbGF0ZSA9IGQzX2ludGVycG9sYXRlO1xuICBmdW5jdGlvbiBkM19pbnRlcnBvbGF0ZShhLCBiKSB7XG4gICAgdmFyIGkgPSBkMy5pbnRlcnBvbGF0b3JzLmxlbmd0aCwgZjtcbiAgICB3aGlsZSAoLS1pID49IDAgJiYgIShmID0gZDMuaW50ZXJwb2xhdG9yc1tpXShhLCBiKSkpIDtcbiAgICByZXR1cm4gZjtcbiAgfVxuICBkMy5pbnRlcnBvbGF0b3JzID0gWyBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIHQgPSB0eXBlb2YgYjtcbiAgICByZXR1cm4gKHQgPT09IFwic3RyaW5nXCIgPyBkM19yZ2JfbmFtZXMuaGFzKGIpIHx8IC9eKCN8cmdiXFwofGhzbFxcKCkvLnRlc3QoYikgPyBkM19pbnRlcnBvbGF0ZVJnYiA6IGQzX2ludGVycG9sYXRlU3RyaW5nIDogYiBpbnN0YW5jZW9mIGQzX2NvbG9yID8gZDNfaW50ZXJwb2xhdGVSZ2IgOiBBcnJheS5pc0FycmF5KGIpID8gZDNfaW50ZXJwb2xhdGVBcnJheSA6IHQgPT09IFwib2JqZWN0XCIgJiYgaXNOYU4oYikgPyBkM19pbnRlcnBvbGF0ZU9iamVjdCA6IGQzX2ludGVycG9sYXRlTnVtYmVyKShhLCBiKTtcbiAgfSBdO1xuICBkMy5pbnRlcnBvbGF0ZUFycmF5ID0gZDNfaW50ZXJwb2xhdGVBcnJheTtcbiAgZnVuY3Rpb24gZDNfaW50ZXJwb2xhdGVBcnJheShhLCBiKSB7XG4gICAgdmFyIHggPSBbXSwgYyA9IFtdLCBuYSA9IGEubGVuZ3RoLCBuYiA9IGIubGVuZ3RoLCBuMCA9IE1hdGgubWluKGEubGVuZ3RoLCBiLmxlbmd0aCksIGk7XG4gICAgZm9yIChpID0gMDsgaSA8IG4wOyArK2kpIHgucHVzaChkM19pbnRlcnBvbGF0ZShhW2ldLCBiW2ldKSk7XG4gICAgZm9yICg7aSA8IG5hOyArK2kpIGNbaV0gPSBhW2ldO1xuICAgIGZvciAoO2kgPCBuYjsgKytpKSBjW2ldID0gYltpXTtcbiAgICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgICAgZm9yIChpID0gMDsgaSA8IG4wOyArK2kpIGNbaV0gPSB4W2ldKHQpO1xuICAgICAgcmV0dXJuIGM7XG4gICAgfTtcbiAgfVxuICB2YXIgZDNfZWFzZV9kZWZhdWx0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzX2lkZW50aXR5O1xuICB9O1xuICB2YXIgZDNfZWFzZSA9IGQzLm1hcCh7XG4gICAgbGluZWFyOiBkM19lYXNlX2RlZmF1bHQsXG4gICAgcG9seTogZDNfZWFzZV9wb2x5LFxuICAgIHF1YWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGQzX2Vhc2VfcXVhZDtcbiAgICB9LFxuICAgIGN1YmljOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBkM19lYXNlX2N1YmljO1xuICAgIH0sXG4gICAgc2luOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBkM19lYXNlX3NpbjtcbiAgICB9LFxuICAgIGV4cDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZDNfZWFzZV9leHA7XG4gICAgfSxcbiAgICBjaXJjbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGQzX2Vhc2VfY2lyY2xlO1xuICAgIH0sXG4gICAgZWxhc3RpYzogZDNfZWFzZV9lbGFzdGljLFxuICAgIGJhY2s6IGQzX2Vhc2VfYmFjayxcbiAgICBib3VuY2U6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGQzX2Vhc2VfYm91bmNlO1xuICAgIH1cbiAgfSk7XG4gIHZhciBkM19lYXNlX21vZGUgPSBkMy5tYXAoe1xuICAgIFwiaW5cIjogZDNfaWRlbnRpdHksXG4gICAgb3V0OiBkM19lYXNlX3JldmVyc2UsXG4gICAgXCJpbi1vdXRcIjogZDNfZWFzZV9yZWZsZWN0LFxuICAgIFwib3V0LWluXCI6IGZ1bmN0aW9uKGYpIHtcbiAgICAgIHJldHVybiBkM19lYXNlX3JlZmxlY3QoZDNfZWFzZV9yZXZlcnNlKGYpKTtcbiAgICB9XG4gIH0pO1xuICBkMy5lYXNlID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBpID0gbmFtZS5pbmRleE9mKFwiLVwiKSwgdCA9IGkgPj0gMCA/IG5hbWUuc2xpY2UoMCwgaSkgOiBuYW1lLCBtID0gaSA+PSAwID8gbmFtZS5zbGljZShpICsgMSkgOiBcImluXCI7XG4gICAgdCA9IGQzX2Vhc2UuZ2V0KHQpIHx8IGQzX2Vhc2VfZGVmYXVsdDtcbiAgICBtID0gZDNfZWFzZV9tb2RlLmdldChtKSB8fCBkM19pZGVudGl0eTtcbiAgICByZXR1cm4gZDNfZWFzZV9jbGFtcChtKHQuYXBwbHkobnVsbCwgZDNfYXJyYXlTbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpKSk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX2Vhc2VfY2xhbXAoZikge1xuICAgIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgICByZXR1cm4gdCA8PSAwID8gMCA6IHQgPj0gMSA/IDEgOiBmKHQpO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZDNfZWFzZV9yZXZlcnNlKGYpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgICAgcmV0dXJuIDEgLSBmKDEgLSB0KTtcbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIGQzX2Vhc2VfcmVmbGVjdChmKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICAgIHJldHVybiAuNSAqICh0IDwgLjUgPyBmKDIgKiB0KSA6IDIgLSBmKDIgLSAyICogdCkpO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZDNfZWFzZV9xdWFkKHQpIHtcbiAgICByZXR1cm4gdCAqIHQ7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZWFzZV9jdWJpYyh0KSB7XG4gICAgcmV0dXJuIHQgKiB0ICogdDtcbiAgfVxuICBmdW5jdGlvbiBkM19lYXNlX2N1YmljSW5PdXQodCkge1xuICAgIGlmICh0IDw9IDApIHJldHVybiAwO1xuICAgIGlmICh0ID49IDEpIHJldHVybiAxO1xuICAgIHZhciB0MiA9IHQgKiB0LCB0MyA9IHQyICogdDtcbiAgICByZXR1cm4gNCAqICh0IDwgLjUgPyB0MyA6IDMgKiAodCAtIHQyKSArIHQzIC0gLjc1KTtcbiAgfVxuICBmdW5jdGlvbiBkM19lYXNlX3BvbHkoZSkge1xuICAgIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgICByZXR1cm4gTWF0aC5wb3codCwgZSk7XG4gICAgfTtcbiAgfVxuICBmdW5jdGlvbiBkM19lYXNlX3Npbih0KSB7XG4gICAgcmV0dXJuIDEgLSBNYXRoLmNvcyh0ICogaGFsZs+AKTtcbiAgfVxuICBmdW5jdGlvbiBkM19lYXNlX2V4cCh0KSB7XG4gICAgcmV0dXJuIE1hdGgucG93KDIsIDEwICogKHQgLSAxKSk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZWFzZV9jaXJjbGUodCkge1xuICAgIHJldHVybiAxIC0gTWF0aC5zcXJ0KDEgLSB0ICogdCk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZWFzZV9lbGFzdGljKGEsIHApIHtcbiAgICB2YXIgcztcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHAgPSAuNDU7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGgpIHMgPSBwIC8gz4QgKiBNYXRoLmFzaW4oMSAvIGEpOyBlbHNlIGEgPSAxLCBzID0gcCAvIDQ7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICAgIHJldHVybiAxICsgYSAqIE1hdGgucG93KDIsIC0xMCAqIHQpICogTWF0aC5zaW4oKHQgLSBzKSAqIM+EIC8gcCk7XG4gICAgfTtcbiAgfVxuICBmdW5jdGlvbiBkM19lYXNlX2JhY2socykge1xuICAgIGlmICghcykgcyA9IDEuNzAxNTg7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICAgIHJldHVybiB0ICogdCAqICgocyArIDEpICogdCAtIHMpO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZDNfZWFzZV9ib3VuY2UodCkge1xuICAgIHJldHVybiB0IDwgMSAvIDIuNzUgPyA3LjU2MjUgKiB0ICogdCA6IHQgPCAyIC8gMi43NSA/IDcuNTYyNSAqICh0IC09IDEuNSAvIDIuNzUpICogdCArIC43NSA6IHQgPCAyLjUgLyAyLjc1ID8gNy41NjI1ICogKHQgLT0gMi4yNSAvIDIuNzUpICogdCArIC45Mzc1IDogNy41NjI1ICogKHQgLT0gMi42MjUgLyAyLjc1KSAqIHQgKyAuOTg0Mzc1O1xuICB9XG4gIGQzLmludGVycG9sYXRlSGNsID0gZDNfaW50ZXJwb2xhdGVIY2w7XG4gIGZ1bmN0aW9uIGQzX2ludGVycG9sYXRlSGNsKGEsIGIpIHtcbiAgICBhID0gZDMuaGNsKGEpO1xuICAgIGIgPSBkMy5oY2woYik7XG4gICAgdmFyIGFoID0gYS5oLCBhYyA9IGEuYywgYWwgPSBhLmwsIGJoID0gYi5oIC0gYWgsIGJjID0gYi5jIC0gYWMsIGJsID0gYi5sIC0gYWw7XG4gICAgaWYgKGlzTmFOKGJjKSkgYmMgPSAwLCBhYyA9IGlzTmFOKGFjKSA/IGIuYyA6IGFjO1xuICAgIGlmIChpc05hTihiaCkpIGJoID0gMCwgYWggPSBpc05hTihhaCkgPyBiLmggOiBhaDsgZWxzZSBpZiAoYmggPiAxODApIGJoIC09IDM2MDsgZWxzZSBpZiAoYmggPCAtMTgwKSBiaCArPSAzNjA7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICAgIHJldHVybiBkM19oY2xfbGFiKGFoICsgYmggKiB0LCBhYyArIGJjICogdCwgYWwgKyBibCAqIHQpICsgXCJcIjtcbiAgICB9O1xuICB9XG4gIGQzLmludGVycG9sYXRlSHNsID0gZDNfaW50ZXJwb2xhdGVIc2w7XG4gIGZ1bmN0aW9uIGQzX2ludGVycG9sYXRlSHNsKGEsIGIpIHtcbiAgICBhID0gZDMuaHNsKGEpO1xuICAgIGIgPSBkMy5oc2woYik7XG4gICAgdmFyIGFoID0gYS5oLCBhcyA9IGEucywgYWwgPSBhLmwsIGJoID0gYi5oIC0gYWgsIGJzID0gYi5zIC0gYXMsIGJsID0gYi5sIC0gYWw7XG4gICAgaWYgKGlzTmFOKGJzKSkgYnMgPSAwLCBhcyA9IGlzTmFOKGFzKSA/IGIucyA6IGFzO1xuICAgIGlmIChpc05hTihiaCkpIGJoID0gMCwgYWggPSBpc05hTihhaCkgPyBiLmggOiBhaDsgZWxzZSBpZiAoYmggPiAxODApIGJoIC09IDM2MDsgZWxzZSBpZiAoYmggPCAtMTgwKSBiaCArPSAzNjA7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICAgIHJldHVybiBkM19oc2xfcmdiKGFoICsgYmggKiB0LCBhcyArIGJzICogdCwgYWwgKyBibCAqIHQpICsgXCJcIjtcbiAgICB9O1xuICB9XG4gIGQzLmludGVycG9sYXRlTGFiID0gZDNfaW50ZXJwb2xhdGVMYWI7XG4gIGZ1bmN0aW9uIGQzX2ludGVycG9sYXRlTGFiKGEsIGIpIHtcbiAgICBhID0gZDMubGFiKGEpO1xuICAgIGIgPSBkMy5sYWIoYik7XG4gICAgdmFyIGFsID0gYS5sLCBhYSA9IGEuYSwgYWIgPSBhLmIsIGJsID0gYi5sIC0gYWwsIGJhID0gYi5hIC0gYWEsIGJiID0gYi5iIC0gYWI7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICAgIHJldHVybiBkM19sYWJfcmdiKGFsICsgYmwgKiB0LCBhYSArIGJhICogdCwgYWIgKyBiYiAqIHQpICsgXCJcIjtcbiAgICB9O1xuICB9XG4gIGQzLmludGVycG9sYXRlUm91bmQgPSBkM19pbnRlcnBvbGF0ZVJvdW5kO1xuICBmdW5jdGlvbiBkM19pbnRlcnBvbGF0ZVJvdW5kKGEsIGIpIHtcbiAgICBiIC09IGE7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICAgIHJldHVybiBNYXRoLnJvdW5kKGEgKyBiICogdCk7XG4gICAgfTtcbiAgfVxuICBkMy50cmFuc2Zvcm0gPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICB2YXIgZyA9IGQzX2RvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhkMy5ucy5wcmVmaXguc3ZnLCBcImdcIik7XG4gICAgcmV0dXJuIChkMy50cmFuc2Zvcm0gPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAgIGlmIChzdHJpbmcgIT0gbnVsbCkge1xuICAgICAgICBnLnNldEF0dHJpYnV0ZShcInRyYW5zZm9ybVwiLCBzdHJpbmcpO1xuICAgICAgICB2YXIgdCA9IGcudHJhbnNmb3JtLmJhc2VWYWwuY29uc29saWRhdGUoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgZDNfdHJhbnNmb3JtKHQgPyB0Lm1hdHJpeCA6IGQzX3RyYW5zZm9ybUlkZW50aXR5KTtcbiAgICB9KShzdHJpbmcpO1xuICB9O1xuICBmdW5jdGlvbiBkM190cmFuc2Zvcm0obSkge1xuICAgIHZhciByMCA9IFsgbS5hLCBtLmIgXSwgcjEgPSBbIG0uYywgbS5kIF0sIGt4ID0gZDNfdHJhbnNmb3JtTm9ybWFsaXplKHIwKSwga3ogPSBkM190cmFuc2Zvcm1Eb3QocjAsIHIxKSwga3kgPSBkM190cmFuc2Zvcm1Ob3JtYWxpemUoZDNfdHJhbnNmb3JtQ29tYmluZShyMSwgcjAsIC1reikpIHx8IDA7XG4gICAgaWYgKHIwWzBdICogcjFbMV0gPCByMVswXSAqIHIwWzFdKSB7XG4gICAgICByMFswXSAqPSAtMTtcbiAgICAgIHIwWzFdICo9IC0xO1xuICAgICAga3ggKj0gLTE7XG4gICAgICBreiAqPSAtMTtcbiAgICB9XG4gICAgdGhpcy5yb3RhdGUgPSAoa3ggPyBNYXRoLmF0YW4yKHIwWzFdLCByMFswXSkgOiBNYXRoLmF0YW4yKC1yMVswXSwgcjFbMV0pKSAqIGQzX2RlZ3JlZXM7XG4gICAgdGhpcy50cmFuc2xhdGUgPSBbIG0uZSwgbS5mIF07XG4gICAgdGhpcy5zY2FsZSA9IFsga3gsIGt5IF07XG4gICAgdGhpcy5za2V3ID0ga3kgPyBNYXRoLmF0YW4yKGt6LCBreSkgKiBkM19kZWdyZWVzIDogMDtcbiAgfVxuICBkM190cmFuc2Zvcm0ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwidHJhbnNsYXRlKFwiICsgdGhpcy50cmFuc2xhdGUgKyBcIilyb3RhdGUoXCIgKyB0aGlzLnJvdGF0ZSArIFwiKXNrZXdYKFwiICsgdGhpcy5za2V3ICsgXCIpc2NhbGUoXCIgKyB0aGlzLnNjYWxlICsgXCIpXCI7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3RyYW5zZm9ybURvdChhLCBiKSB7XG4gICAgcmV0dXJuIGFbMF0gKiBiWzBdICsgYVsxXSAqIGJbMV07XG4gIH1cbiAgZnVuY3Rpb24gZDNfdHJhbnNmb3JtTm9ybWFsaXplKGEpIHtcbiAgICB2YXIgayA9IE1hdGguc3FydChkM190cmFuc2Zvcm1Eb3QoYSwgYSkpO1xuICAgIGlmIChrKSB7XG4gICAgICBhWzBdIC89IGs7XG4gICAgICBhWzFdIC89IGs7XG4gICAgfVxuICAgIHJldHVybiBrO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3RyYW5zZm9ybUNvbWJpbmUoYSwgYiwgaykge1xuICAgIGFbMF0gKz0gayAqIGJbMF07XG4gICAgYVsxXSArPSBrICogYlsxXTtcbiAgICByZXR1cm4gYTtcbiAgfVxuICB2YXIgZDNfdHJhbnNmb3JtSWRlbnRpdHkgPSB7XG4gICAgYTogMSxcbiAgICBiOiAwLFxuICAgIGM6IDAsXG4gICAgZDogMSxcbiAgICBlOiAwLFxuICAgIGY6IDBcbiAgfTtcbiAgZDMuaW50ZXJwb2xhdGVUcmFuc2Zvcm0gPSBkM19pbnRlcnBvbGF0ZVRyYW5zZm9ybTtcbiAgZnVuY3Rpb24gZDNfaW50ZXJwb2xhdGVUcmFuc2Zvcm0oYSwgYikge1xuICAgIHZhciBzID0gW10sIHEgPSBbXSwgbiwgQSA9IGQzLnRyYW5zZm9ybShhKSwgQiA9IGQzLnRyYW5zZm9ybShiKSwgdGEgPSBBLnRyYW5zbGF0ZSwgdGIgPSBCLnRyYW5zbGF0ZSwgcmEgPSBBLnJvdGF0ZSwgcmIgPSBCLnJvdGF0ZSwgd2EgPSBBLnNrZXcsIHdiID0gQi5za2V3LCBrYSA9IEEuc2NhbGUsIGtiID0gQi5zY2FsZTtcbiAgICBpZiAodGFbMF0gIT0gdGJbMF0gfHwgdGFbMV0gIT0gdGJbMV0pIHtcbiAgICAgIHMucHVzaChcInRyYW5zbGF0ZShcIiwgbnVsbCwgXCIsXCIsIG51bGwsIFwiKVwiKTtcbiAgICAgIHEucHVzaCh7XG4gICAgICAgIGk6IDEsXG4gICAgICAgIHg6IGQzX2ludGVycG9sYXRlTnVtYmVyKHRhWzBdLCB0YlswXSlcbiAgICAgIH0sIHtcbiAgICAgICAgaTogMyxcbiAgICAgICAgeDogZDNfaW50ZXJwb2xhdGVOdW1iZXIodGFbMV0sIHRiWzFdKVxuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0YlswXSB8fCB0YlsxXSkge1xuICAgICAgcy5wdXNoKFwidHJhbnNsYXRlKFwiICsgdGIgKyBcIilcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHMucHVzaChcIlwiKTtcbiAgICB9XG4gICAgaWYgKHJhICE9IHJiKSB7XG4gICAgICBpZiAocmEgLSByYiA+IDE4MCkgcmIgKz0gMzYwOyBlbHNlIGlmIChyYiAtIHJhID4gMTgwKSByYSArPSAzNjA7XG4gICAgICBxLnB1c2goe1xuICAgICAgICBpOiBzLnB1c2gocy5wb3AoKSArIFwicm90YXRlKFwiLCBudWxsLCBcIilcIikgLSAyLFxuICAgICAgICB4OiBkM19pbnRlcnBvbGF0ZU51bWJlcihyYSwgcmIpXG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHJiKSB7XG4gICAgICBzLnB1c2gocy5wb3AoKSArIFwicm90YXRlKFwiICsgcmIgKyBcIilcIik7XG4gICAgfVxuICAgIGlmICh3YSAhPSB3Yikge1xuICAgICAgcS5wdXNoKHtcbiAgICAgICAgaTogcy5wdXNoKHMucG9wKCkgKyBcInNrZXdYKFwiLCBudWxsLCBcIilcIikgLSAyLFxuICAgICAgICB4OiBkM19pbnRlcnBvbGF0ZU51bWJlcih3YSwgd2IpXG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHdiKSB7XG4gICAgICBzLnB1c2gocy5wb3AoKSArIFwic2tld1goXCIgKyB3YiArIFwiKVwiKTtcbiAgICB9XG4gICAgaWYgKGthWzBdICE9IGtiWzBdIHx8IGthWzFdICE9IGtiWzFdKSB7XG4gICAgICBuID0gcy5wdXNoKHMucG9wKCkgKyBcInNjYWxlKFwiLCBudWxsLCBcIixcIiwgbnVsbCwgXCIpXCIpO1xuICAgICAgcS5wdXNoKHtcbiAgICAgICAgaTogbiAtIDQsXG4gICAgICAgIHg6IGQzX2ludGVycG9sYXRlTnVtYmVyKGthWzBdLCBrYlswXSlcbiAgICAgIH0sIHtcbiAgICAgICAgaTogbiAtIDIsXG4gICAgICAgIHg6IGQzX2ludGVycG9sYXRlTnVtYmVyKGthWzFdLCBrYlsxXSlcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoa2JbMF0gIT0gMSB8fCBrYlsxXSAhPSAxKSB7XG4gICAgICBzLnB1c2gocy5wb3AoKSArIFwic2NhbGUoXCIgKyBrYiArIFwiKVwiKTtcbiAgICB9XG4gICAgbiA9IHEubGVuZ3RoO1xuICAgIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgICB2YXIgaSA9IC0xLCBvO1xuICAgICAgd2hpbGUgKCsraSA8IG4pIHNbKG8gPSBxW2ldKS5pXSA9IG8ueCh0KTtcbiAgICAgIHJldHVybiBzLmpvaW4oXCJcIik7XG4gICAgfTtcbiAgfVxuICBmdW5jdGlvbiBkM191bmludGVycG9sYXRlTnVtYmVyKGEsIGIpIHtcbiAgICBiID0gKGIgLT0gYSA9ICthKSB8fCAxIC8gYjtcbiAgICByZXR1cm4gZnVuY3Rpb24oeCkge1xuICAgICAgcmV0dXJuICh4IC0gYSkgLyBiO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZDNfdW5pbnRlcnBvbGF0ZUNsYW1wKGEsIGIpIHtcbiAgICBiID0gKGIgLT0gYSA9ICthKSB8fCAxIC8gYjtcbiAgICByZXR1cm4gZnVuY3Rpb24oeCkge1xuICAgICAgcmV0dXJuIE1hdGgubWF4KDAsIE1hdGgubWluKDEsICh4IC0gYSkgLyBiKSk7XG4gICAgfTtcbiAgfVxuICBkMy5sYXlvdXQgPSB7fTtcbiAgZDMubGF5b3V0LmJ1bmRsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihsaW5rcykge1xuICAgICAgdmFyIHBhdGhzID0gW10sIGkgPSAtMSwgbiA9IGxpbmtzLmxlbmd0aDtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSBwYXRocy5wdXNoKGQzX2xheW91dF9idW5kbGVQYXRoKGxpbmtzW2ldKSk7XG4gICAgICByZXR1cm4gcGF0aHM7XG4gICAgfTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfbGF5b3V0X2J1bmRsZVBhdGgobGluaykge1xuICAgIHZhciBzdGFydCA9IGxpbmsuc291cmNlLCBlbmQgPSBsaW5rLnRhcmdldCwgbGNhID0gZDNfbGF5b3V0X2J1bmRsZUxlYXN0Q29tbW9uQW5jZXN0b3Ioc3RhcnQsIGVuZCksIHBvaW50cyA9IFsgc3RhcnQgXTtcbiAgICB3aGlsZSAoc3RhcnQgIT09IGxjYSkge1xuICAgICAgc3RhcnQgPSBzdGFydC5wYXJlbnQ7XG4gICAgICBwb2ludHMucHVzaChzdGFydCk7XG4gICAgfVxuICAgIHZhciBrID0gcG9pbnRzLmxlbmd0aDtcbiAgICB3aGlsZSAoZW5kICE9PSBsY2EpIHtcbiAgICAgIHBvaW50cy5zcGxpY2UoaywgMCwgZW5kKTtcbiAgICAgIGVuZCA9IGVuZC5wYXJlbnQ7XG4gICAgfVxuICAgIHJldHVybiBwb2ludHM7XG4gIH1cbiAgZnVuY3Rpb24gZDNfbGF5b3V0X2J1bmRsZUFuY2VzdG9ycyhub2RlKSB7XG4gICAgdmFyIGFuY2VzdG9ycyA9IFtdLCBwYXJlbnQgPSBub2RlLnBhcmVudDtcbiAgICB3aGlsZSAocGFyZW50ICE9IG51bGwpIHtcbiAgICAgIGFuY2VzdG9ycy5wdXNoKG5vZGUpO1xuICAgICAgbm9kZSA9IHBhcmVudDtcbiAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnQ7XG4gICAgfVxuICAgIGFuY2VzdG9ycy5wdXNoKG5vZGUpO1xuICAgIHJldHVybiBhbmNlc3RvcnM7XG4gIH1cbiAgZnVuY3Rpb24gZDNfbGF5b3V0X2J1bmRsZUxlYXN0Q29tbW9uQW5jZXN0b3IoYSwgYikge1xuICAgIGlmIChhID09PSBiKSByZXR1cm4gYTtcbiAgICB2YXIgYU5vZGVzID0gZDNfbGF5b3V0X2J1bmRsZUFuY2VzdG9ycyhhKSwgYk5vZGVzID0gZDNfbGF5b3V0X2J1bmRsZUFuY2VzdG9ycyhiKSwgYU5vZGUgPSBhTm9kZXMucG9wKCksIGJOb2RlID0gYk5vZGVzLnBvcCgpLCBzaGFyZWROb2RlID0gbnVsbDtcbiAgICB3aGlsZSAoYU5vZGUgPT09IGJOb2RlKSB7XG4gICAgICBzaGFyZWROb2RlID0gYU5vZGU7XG4gICAgICBhTm9kZSA9IGFOb2Rlcy5wb3AoKTtcbiAgICAgIGJOb2RlID0gYk5vZGVzLnBvcCgpO1xuICAgIH1cbiAgICByZXR1cm4gc2hhcmVkTm9kZTtcbiAgfVxuICBkMy5sYXlvdXQuY2hvcmQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2hvcmQgPSB7fSwgY2hvcmRzLCBncm91cHMsIG1hdHJpeCwgbiwgcGFkZGluZyA9IDAsIHNvcnRHcm91cHMsIHNvcnRTdWJncm91cHMsIHNvcnRDaG9yZHM7XG4gICAgZnVuY3Rpb24gcmVsYXlvdXQoKSB7XG4gICAgICB2YXIgc3ViZ3JvdXBzID0ge30sIGdyb3VwU3VtcyA9IFtdLCBncm91cEluZGV4ID0gZDMucmFuZ2UobiksIHN1Ymdyb3VwSW5kZXggPSBbXSwgaywgeCwgeDAsIGksIGo7XG4gICAgICBjaG9yZHMgPSBbXTtcbiAgICAgIGdyb3VwcyA9IFtdO1xuICAgICAgayA9IDAsIGkgPSAtMTtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgIHggPSAwLCBqID0gLTE7XG4gICAgICAgIHdoaWxlICgrK2ogPCBuKSB7XG4gICAgICAgICAgeCArPSBtYXRyaXhbaV1bal07XG4gICAgICAgIH1cbiAgICAgICAgZ3JvdXBTdW1zLnB1c2goeCk7XG4gICAgICAgIHN1Ymdyb3VwSW5kZXgucHVzaChkMy5yYW5nZShuKSk7XG4gICAgICAgIGsgKz0geDtcbiAgICAgIH1cbiAgICAgIGlmIChzb3J0R3JvdXBzKSB7XG4gICAgICAgIGdyb3VwSW5kZXguc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgcmV0dXJuIHNvcnRHcm91cHMoZ3JvdXBTdW1zW2FdLCBncm91cFN1bXNbYl0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmIChzb3J0U3ViZ3JvdXBzKSB7XG4gICAgICAgIHN1Ymdyb3VwSW5kZXguZm9yRWFjaChmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgICAgZC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBzb3J0U3ViZ3JvdXBzKG1hdHJpeFtpXVthXSwgbWF0cml4W2ldW2JdKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBrID0gKM+EIC0gcGFkZGluZyAqIG4pIC8gaztcbiAgICAgIHggPSAwLCBpID0gLTE7XG4gICAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgICB4MCA9IHgsIGogPSAtMTtcbiAgICAgICAgd2hpbGUgKCsraiA8IG4pIHtcbiAgICAgICAgICB2YXIgZGkgPSBncm91cEluZGV4W2ldLCBkaiA9IHN1Ymdyb3VwSW5kZXhbZGldW2pdLCB2ID0gbWF0cml4W2RpXVtkal0sIGEwID0geCwgYTEgPSB4ICs9IHYgKiBrO1xuICAgICAgICAgIHN1Ymdyb3Vwc1tkaSArIFwiLVwiICsgZGpdID0ge1xuICAgICAgICAgICAgaW5kZXg6IGRpLFxuICAgICAgICAgICAgc3ViaW5kZXg6IGRqLFxuICAgICAgICAgICAgc3RhcnRBbmdsZTogYTAsXG4gICAgICAgICAgICBlbmRBbmdsZTogYTEsXG4gICAgICAgICAgICB2YWx1ZTogdlxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgZ3JvdXBzW2RpXSA9IHtcbiAgICAgICAgICBpbmRleDogZGksXG4gICAgICAgICAgc3RhcnRBbmdsZTogeDAsXG4gICAgICAgICAgZW5kQW5nbGU6IHgsXG4gICAgICAgICAgdmFsdWU6ICh4IC0geDApIC8ga1xuICAgICAgICB9O1xuICAgICAgICB4ICs9IHBhZGRpbmc7XG4gICAgICB9XG4gICAgICBpID0gLTE7XG4gICAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgICBqID0gaSAtIDE7XG4gICAgICAgIHdoaWxlICgrK2ogPCBuKSB7XG4gICAgICAgICAgdmFyIHNvdXJjZSA9IHN1Ymdyb3Vwc1tpICsgXCItXCIgKyBqXSwgdGFyZ2V0ID0gc3ViZ3JvdXBzW2ogKyBcIi1cIiArIGldO1xuICAgICAgICAgIGlmIChzb3VyY2UudmFsdWUgfHwgdGFyZ2V0LnZhbHVlKSB7XG4gICAgICAgICAgICBjaG9yZHMucHVzaChzb3VyY2UudmFsdWUgPCB0YXJnZXQudmFsdWUgPyB7XG4gICAgICAgICAgICAgIHNvdXJjZTogdGFyZ2V0LFxuICAgICAgICAgICAgICB0YXJnZXQ6IHNvdXJjZVxuICAgICAgICAgICAgfSA6IHtcbiAgICAgICAgICAgICAgc291cmNlOiBzb3VyY2UsXG4gICAgICAgICAgICAgIHRhcmdldDogdGFyZ2V0XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChzb3J0Q2hvcmRzKSByZXNvcnQoKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmVzb3J0KCkge1xuICAgICAgY2hvcmRzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICByZXR1cm4gc29ydENob3JkcygoYS5zb3VyY2UudmFsdWUgKyBhLnRhcmdldC52YWx1ZSkgLyAyLCAoYi5zb3VyY2UudmFsdWUgKyBiLnRhcmdldC52YWx1ZSkgLyAyKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBjaG9yZC5tYXRyaXggPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBtYXRyaXg7XG4gICAgICBuID0gKG1hdHJpeCA9IHgpICYmIG1hdHJpeC5sZW5ndGg7XG4gICAgICBjaG9yZHMgPSBncm91cHMgPSBudWxsO1xuICAgICAgcmV0dXJuIGNob3JkO1xuICAgIH07XG4gICAgY2hvcmQucGFkZGluZyA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHBhZGRpbmc7XG4gICAgICBwYWRkaW5nID0geDtcbiAgICAgIGNob3JkcyA9IGdyb3VwcyA9IG51bGw7XG4gICAgICByZXR1cm4gY2hvcmQ7XG4gICAgfTtcbiAgICBjaG9yZC5zb3J0R3JvdXBzID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gc29ydEdyb3VwcztcbiAgICAgIHNvcnRHcm91cHMgPSB4O1xuICAgICAgY2hvcmRzID0gZ3JvdXBzID0gbnVsbDtcbiAgICAgIHJldHVybiBjaG9yZDtcbiAgICB9O1xuICAgIGNob3JkLnNvcnRTdWJncm91cHMgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBzb3J0U3ViZ3JvdXBzO1xuICAgICAgc29ydFN1Ymdyb3VwcyA9IHg7XG4gICAgICBjaG9yZHMgPSBudWxsO1xuICAgICAgcmV0dXJuIGNob3JkO1xuICAgIH07XG4gICAgY2hvcmQuc29ydENob3JkcyA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHNvcnRDaG9yZHM7XG4gICAgICBzb3J0Q2hvcmRzID0geDtcbiAgICAgIGlmIChjaG9yZHMpIHJlc29ydCgpO1xuICAgICAgcmV0dXJuIGNob3JkO1xuICAgIH07XG4gICAgY2hvcmQuY2hvcmRzID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIWNob3JkcykgcmVsYXlvdXQoKTtcbiAgICAgIHJldHVybiBjaG9yZHM7XG4gICAgfTtcbiAgICBjaG9yZC5ncm91cHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghZ3JvdXBzKSByZWxheW91dCgpO1xuICAgICAgcmV0dXJuIGdyb3VwcztcbiAgICB9O1xuICAgIHJldHVybiBjaG9yZDtcbiAgfTtcbiAgZDMubGF5b3V0LmZvcmNlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZvcmNlID0ge30sIGV2ZW50ID0gZDMuZGlzcGF0Y2goXCJzdGFydFwiLCBcInRpY2tcIiwgXCJlbmRcIiksIHNpemUgPSBbIDEsIDEgXSwgZHJhZywgYWxwaGEsIGZyaWN0aW9uID0gLjksIGxpbmtEaXN0YW5jZSA9IGQzX2xheW91dF9mb3JjZUxpbmtEaXN0YW5jZSwgbGlua1N0cmVuZ3RoID0gZDNfbGF5b3V0X2ZvcmNlTGlua1N0cmVuZ3RoLCBjaGFyZ2UgPSAtMzAsIGNoYXJnZURpc3RhbmNlMiA9IGQzX2xheW91dF9mb3JjZUNoYXJnZURpc3RhbmNlMiwgZ3Jhdml0eSA9IC4xLCB0aGV0YTIgPSAuNjQsIG5vZGVzID0gW10sIGxpbmtzID0gW10sIGRpc3RhbmNlcywgc3RyZW5ndGhzLCBjaGFyZ2VzO1xuICAgIGZ1bmN0aW9uIHJlcHVsc2Uobm9kZSkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKHF1YWQsIHgxLCBfLCB4Mikge1xuICAgICAgICBpZiAocXVhZC5wb2ludCAhPT0gbm9kZSkge1xuICAgICAgICAgIHZhciBkeCA9IHF1YWQuY3ggLSBub2RlLngsIGR5ID0gcXVhZC5jeSAtIG5vZGUueSwgZHcgPSB4MiAtIHgxLCBkbiA9IGR4ICogZHggKyBkeSAqIGR5O1xuICAgICAgICAgIGlmIChkdyAqIGR3IC8gdGhldGEyIDwgZG4pIHtcbiAgICAgICAgICAgIGlmIChkbiA8IGNoYXJnZURpc3RhbmNlMikge1xuICAgICAgICAgICAgICB2YXIgayA9IHF1YWQuY2hhcmdlIC8gZG47XG4gICAgICAgICAgICAgIG5vZGUucHggLT0gZHggKiBrO1xuICAgICAgICAgICAgICBub2RlLnB5IC09IGR5ICogaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAocXVhZC5wb2ludCAmJiBkbiAmJiBkbiA8IGNoYXJnZURpc3RhbmNlMikge1xuICAgICAgICAgICAgdmFyIGsgPSBxdWFkLnBvaW50Q2hhcmdlIC8gZG47XG4gICAgICAgICAgICBub2RlLnB4IC09IGR4ICogaztcbiAgICAgICAgICAgIG5vZGUucHkgLT0gZHkgKiBrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gIXF1YWQuY2hhcmdlO1xuICAgICAgfTtcbiAgICB9XG4gICAgZm9yY2UudGljayA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKChhbHBoYSAqPSAuOTkpIDwgLjAwNSkge1xuICAgICAgICBldmVudC5lbmQoe1xuICAgICAgICAgIHR5cGU6IFwiZW5kXCIsXG4gICAgICAgICAgYWxwaGE6IGFscGhhID0gMFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICB2YXIgbiA9IG5vZGVzLmxlbmd0aCwgbSA9IGxpbmtzLmxlbmd0aCwgcSwgaSwgbywgcywgdCwgbCwgaywgeCwgeTtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBtOyArK2kpIHtcbiAgICAgICAgbyA9IGxpbmtzW2ldO1xuICAgICAgICBzID0gby5zb3VyY2U7XG4gICAgICAgIHQgPSBvLnRhcmdldDtcbiAgICAgICAgeCA9IHQueCAtIHMueDtcbiAgICAgICAgeSA9IHQueSAtIHMueTtcbiAgICAgICAgaWYgKGwgPSB4ICogeCArIHkgKiB5KSB7XG4gICAgICAgICAgbCA9IGFscGhhICogc3RyZW5ndGhzW2ldICogKChsID0gTWF0aC5zcXJ0KGwpKSAtIGRpc3RhbmNlc1tpXSkgLyBsO1xuICAgICAgICAgIHggKj0gbDtcbiAgICAgICAgICB5ICo9IGw7XG4gICAgICAgICAgdC54IC09IHggKiAoayA9IHMud2VpZ2h0IC8gKHQud2VpZ2h0ICsgcy53ZWlnaHQpKTtcbiAgICAgICAgICB0LnkgLT0geSAqIGs7XG4gICAgICAgICAgcy54ICs9IHggKiAoayA9IDEgLSBrKTtcbiAgICAgICAgICBzLnkgKz0geSAqIGs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChrID0gYWxwaGEgKiBncmF2aXR5KSB7XG4gICAgICAgIHggPSBzaXplWzBdIC8gMjtcbiAgICAgICAgeSA9IHNpemVbMV0gLyAyO1xuICAgICAgICBpID0gLTE7XG4gICAgICAgIGlmIChrKSB3aGlsZSAoKytpIDwgbikge1xuICAgICAgICAgIG8gPSBub2Rlc1tpXTtcbiAgICAgICAgICBvLnggKz0gKHggLSBvLngpICogaztcbiAgICAgICAgICBvLnkgKz0gKHkgLSBvLnkpICogaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGNoYXJnZSkge1xuICAgICAgICBkM19sYXlvdXRfZm9yY2VBY2N1bXVsYXRlKHEgPSBkMy5nZW9tLnF1YWR0cmVlKG5vZGVzKSwgYWxwaGEsIGNoYXJnZXMpO1xuICAgICAgICBpID0gLTE7XG4gICAgICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgICAgaWYgKCEobyA9IG5vZGVzW2ldKS5maXhlZCkge1xuICAgICAgICAgICAgcS52aXNpdChyZXB1bHNlKG8pKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGkgPSAtMTtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgIG8gPSBub2Rlc1tpXTtcbiAgICAgICAgaWYgKG8uZml4ZWQpIHtcbiAgICAgICAgICBvLnggPSBvLnB4O1xuICAgICAgICAgIG8ueSA9IG8ucHk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgby54IC09IChvLnB4IC0gKG8ucHggPSBvLngpKSAqIGZyaWN0aW9uO1xuICAgICAgICAgIG8ueSAtPSAoby5weSAtIChvLnB5ID0gby55KSkgKiBmcmljdGlvbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZXZlbnQudGljayh7XG4gICAgICAgIHR5cGU6IFwidGlja1wiLFxuICAgICAgICBhbHBoYTogYWxwaGFcbiAgICAgIH0pO1xuICAgIH07XG4gICAgZm9yY2Uubm9kZXMgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBub2RlcztcbiAgICAgIG5vZGVzID0geDtcbiAgICAgIHJldHVybiBmb3JjZTtcbiAgICB9O1xuICAgIGZvcmNlLmxpbmtzID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gbGlua3M7XG4gICAgICBsaW5rcyA9IHg7XG4gICAgICByZXR1cm4gZm9yY2U7XG4gICAgfTtcbiAgICBmb3JjZS5zaXplID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gc2l6ZTtcbiAgICAgIHNpemUgPSB4O1xuICAgICAgcmV0dXJuIGZvcmNlO1xuICAgIH07XG4gICAgZm9yY2UubGlua0Rpc3RhbmNlID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gbGlua0Rpc3RhbmNlO1xuICAgICAgbGlua0Rpc3RhbmNlID0gdHlwZW9mIHggPT09IFwiZnVuY3Rpb25cIiA/IHggOiAreDtcbiAgICAgIHJldHVybiBmb3JjZTtcbiAgICB9O1xuICAgIGZvcmNlLmRpc3RhbmNlID0gZm9yY2UubGlua0Rpc3RhbmNlO1xuICAgIGZvcmNlLmxpbmtTdHJlbmd0aCA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGxpbmtTdHJlbmd0aDtcbiAgICAgIGxpbmtTdHJlbmd0aCA9IHR5cGVvZiB4ID09PSBcImZ1bmN0aW9uXCIgPyB4IDogK3g7XG4gICAgICByZXR1cm4gZm9yY2U7XG4gICAgfTtcbiAgICBmb3JjZS5mcmljdGlvbiA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGZyaWN0aW9uO1xuICAgICAgZnJpY3Rpb24gPSAreDtcbiAgICAgIHJldHVybiBmb3JjZTtcbiAgICB9O1xuICAgIGZvcmNlLmNoYXJnZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGNoYXJnZTtcbiAgICAgIGNoYXJnZSA9IHR5cGVvZiB4ID09PSBcImZ1bmN0aW9uXCIgPyB4IDogK3g7XG4gICAgICByZXR1cm4gZm9yY2U7XG4gICAgfTtcbiAgICBmb3JjZS5jaGFyZ2VEaXN0YW5jZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIE1hdGguc3FydChjaGFyZ2VEaXN0YW5jZTIpO1xuICAgICAgY2hhcmdlRGlzdGFuY2UyID0geCAqIHg7XG4gICAgICByZXR1cm4gZm9yY2U7XG4gICAgfTtcbiAgICBmb3JjZS5ncmF2aXR5ID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gZ3Jhdml0eTtcbiAgICAgIGdyYXZpdHkgPSAreDtcbiAgICAgIHJldHVybiBmb3JjZTtcbiAgICB9O1xuICAgIGZvcmNlLnRoZXRhID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gTWF0aC5zcXJ0KHRoZXRhMik7XG4gICAgICB0aGV0YTIgPSB4ICogeDtcbiAgICAgIHJldHVybiBmb3JjZTtcbiAgICB9O1xuICAgIGZvcmNlLmFscGhhID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gYWxwaGE7XG4gICAgICB4ID0gK3g7XG4gICAgICBpZiAoYWxwaGEpIHtcbiAgICAgICAgaWYgKHggPiAwKSBhbHBoYSA9IHg7IGVsc2UgYWxwaGEgPSAwO1xuICAgICAgfSBlbHNlIGlmICh4ID4gMCkge1xuICAgICAgICBldmVudC5zdGFydCh7XG4gICAgICAgICAgdHlwZTogXCJzdGFydFwiLFxuICAgICAgICAgIGFscGhhOiBhbHBoYSA9IHhcbiAgICAgICAgfSk7XG4gICAgICAgIGQzLnRpbWVyKGZvcmNlLnRpY2spO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZvcmNlO1xuICAgIH07XG4gICAgZm9yY2Uuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBpLCBuID0gbm9kZXMubGVuZ3RoLCBtID0gbGlua3MubGVuZ3RoLCB3ID0gc2l6ZVswXSwgaCA9IHNpemVbMV0sIG5laWdoYm9ycywgbztcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgICAgKG8gPSBub2Rlc1tpXSkuaW5kZXggPSBpO1xuICAgICAgICBvLndlaWdodCA9IDA7XG4gICAgICB9XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbTsgKytpKSB7XG4gICAgICAgIG8gPSBsaW5rc1tpXTtcbiAgICAgICAgaWYgKHR5cGVvZiBvLnNvdXJjZSA9PSBcIm51bWJlclwiKSBvLnNvdXJjZSA9IG5vZGVzW28uc291cmNlXTtcbiAgICAgICAgaWYgKHR5cGVvZiBvLnRhcmdldCA9PSBcIm51bWJlclwiKSBvLnRhcmdldCA9IG5vZGVzW28udGFyZ2V0XTtcbiAgICAgICAgKytvLnNvdXJjZS53ZWlnaHQ7XG4gICAgICAgICsrby50YXJnZXQud2VpZ2h0O1xuICAgICAgfVxuICAgICAgZm9yIChpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgICBvID0gbm9kZXNbaV07XG4gICAgICAgIGlmIChpc05hTihvLngpKSBvLnggPSBwb3NpdGlvbihcInhcIiwgdyk7XG4gICAgICAgIGlmIChpc05hTihvLnkpKSBvLnkgPSBwb3NpdGlvbihcInlcIiwgaCk7XG4gICAgICAgIGlmIChpc05hTihvLnB4KSkgby5weCA9IG8ueDtcbiAgICAgICAgaWYgKGlzTmFOKG8ucHkpKSBvLnB5ID0gby55O1xuICAgICAgfVxuICAgICAgZGlzdGFuY2VzID0gW107XG4gICAgICBpZiAodHlwZW9mIGxpbmtEaXN0YW5jZSA9PT0gXCJmdW5jdGlvblwiKSBmb3IgKGkgPSAwOyBpIDwgbTsgKytpKSBkaXN0YW5jZXNbaV0gPSArbGlua0Rpc3RhbmNlLmNhbGwodGhpcywgbGlua3NbaV0sIGkpOyBlbHNlIGZvciAoaSA9IDA7IGkgPCBtOyArK2kpIGRpc3RhbmNlc1tpXSA9IGxpbmtEaXN0YW5jZTtcbiAgICAgIHN0cmVuZ3RocyA9IFtdO1xuICAgICAgaWYgKHR5cGVvZiBsaW5rU3RyZW5ndGggPT09IFwiZnVuY3Rpb25cIikgZm9yIChpID0gMDsgaSA8IG07ICsraSkgc3RyZW5ndGhzW2ldID0gK2xpbmtTdHJlbmd0aC5jYWxsKHRoaXMsIGxpbmtzW2ldLCBpKTsgZWxzZSBmb3IgKGkgPSAwOyBpIDwgbTsgKytpKSBzdHJlbmd0aHNbaV0gPSBsaW5rU3RyZW5ndGg7XG4gICAgICBjaGFyZ2VzID0gW107XG4gICAgICBpZiAodHlwZW9mIGNoYXJnZSA9PT0gXCJmdW5jdGlvblwiKSBmb3IgKGkgPSAwOyBpIDwgbjsgKytpKSBjaGFyZ2VzW2ldID0gK2NoYXJnZS5jYWxsKHRoaXMsIG5vZGVzW2ldLCBpKTsgZWxzZSBmb3IgKGkgPSAwOyBpIDwgbjsgKytpKSBjaGFyZ2VzW2ldID0gY2hhcmdlO1xuICAgICAgZnVuY3Rpb24gcG9zaXRpb24oZGltZW5zaW9uLCBzaXplKSB7XG4gICAgICAgIGlmICghbmVpZ2hib3JzKSB7XG4gICAgICAgICAgbmVpZ2hib3JzID0gbmV3IEFycmF5KG4pO1xuICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBuOyArK2opIHtcbiAgICAgICAgICAgIG5laWdoYm9yc1tqXSA9IFtdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgICAgICAgICB2YXIgbyA9IGxpbmtzW2pdO1xuICAgICAgICAgICAgbmVpZ2hib3JzW28uc291cmNlLmluZGV4XS5wdXNoKG8udGFyZ2V0KTtcbiAgICAgICAgICAgIG5laWdoYm9yc1tvLnRhcmdldC5pbmRleF0ucHVzaChvLnNvdXJjZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBjYW5kaWRhdGVzID0gbmVpZ2hib3JzW2ldLCBqID0gLTEsIG0gPSBjYW5kaWRhdGVzLmxlbmd0aCwgeDtcbiAgICAgICAgd2hpbGUgKCsraiA8IG0pIGlmICghaXNOYU4oeCA9IGNhbmRpZGF0ZXNbal1bZGltZW5zaW9uXSkpIHJldHVybiB4O1xuICAgICAgICByZXR1cm4gTWF0aC5yYW5kb20oKSAqIHNpemU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZm9yY2UucmVzdW1lKCk7XG4gICAgfTtcbiAgICBmb3JjZS5yZXN1bWUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBmb3JjZS5hbHBoYSguMSk7XG4gICAgfTtcbiAgICBmb3JjZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZm9yY2UuYWxwaGEoMCk7XG4gICAgfTtcbiAgICBmb3JjZS5kcmFnID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIWRyYWcpIGRyYWcgPSBkMy5iZWhhdmlvci5kcmFnKCkub3JpZ2luKGQzX2lkZW50aXR5KS5vbihcImRyYWdzdGFydC5mb3JjZVwiLCBkM19sYXlvdXRfZm9yY2VEcmFnc3RhcnQpLm9uKFwiZHJhZy5mb3JjZVwiLCBkcmFnbW92ZSkub24oXCJkcmFnZW5kLmZvcmNlXCIsIGQzX2xheW91dF9mb3JjZURyYWdlbmQpO1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gZHJhZztcbiAgICAgIHRoaXMub24oXCJtb3VzZW92ZXIuZm9yY2VcIiwgZDNfbGF5b3V0X2ZvcmNlTW91c2VvdmVyKS5vbihcIm1vdXNlb3V0LmZvcmNlXCIsIGQzX2xheW91dF9mb3JjZU1vdXNlb3V0KS5jYWxsKGRyYWcpO1xuICAgIH07XG4gICAgZnVuY3Rpb24gZHJhZ21vdmUoZCkge1xuICAgICAgZC5weCA9IGQzLmV2ZW50LngsIGQucHkgPSBkMy5ldmVudC55O1xuICAgICAgZm9yY2UucmVzdW1lKCk7XG4gICAgfVxuICAgIHJldHVybiBkMy5yZWJpbmQoZm9yY2UsIGV2ZW50LCBcIm9uXCIpO1xuICB9O1xuICBmdW5jdGlvbiBkM19sYXlvdXRfZm9yY2VEcmFnc3RhcnQoZCkge1xuICAgIGQuZml4ZWQgfD0gMjtcbiAgfVxuICBmdW5jdGlvbiBkM19sYXlvdXRfZm9yY2VEcmFnZW5kKGQpIHtcbiAgICBkLmZpeGVkICY9IH42O1xuICB9XG4gIGZ1bmN0aW9uIGQzX2xheW91dF9mb3JjZU1vdXNlb3ZlcihkKSB7XG4gICAgZC5maXhlZCB8PSA0O1xuICAgIGQucHggPSBkLngsIGQucHkgPSBkLnk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfbGF5b3V0X2ZvcmNlTW91c2VvdXQoZCkge1xuICAgIGQuZml4ZWQgJj0gfjQ7XG4gIH1cbiAgZnVuY3Rpb24gZDNfbGF5b3V0X2ZvcmNlQWNjdW11bGF0ZShxdWFkLCBhbHBoYSwgY2hhcmdlcykge1xuICAgIHZhciBjeCA9IDAsIGN5ID0gMDtcbiAgICBxdWFkLmNoYXJnZSA9IDA7XG4gICAgaWYgKCFxdWFkLmxlYWYpIHtcbiAgICAgIHZhciBub2RlcyA9IHF1YWQubm9kZXMsIG4gPSBub2Rlcy5sZW5ndGgsIGkgPSAtMSwgYztcbiAgICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgIGMgPSBub2Rlc1tpXTtcbiAgICAgICAgaWYgKGMgPT0gbnVsbCkgY29udGludWU7XG4gICAgICAgIGQzX2xheW91dF9mb3JjZUFjY3VtdWxhdGUoYywgYWxwaGEsIGNoYXJnZXMpO1xuICAgICAgICBxdWFkLmNoYXJnZSArPSBjLmNoYXJnZTtcbiAgICAgICAgY3ggKz0gYy5jaGFyZ2UgKiBjLmN4O1xuICAgICAgICBjeSArPSBjLmNoYXJnZSAqIGMuY3k7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChxdWFkLnBvaW50KSB7XG4gICAgICBpZiAoIXF1YWQubGVhZikge1xuICAgICAgICBxdWFkLnBvaW50LnggKz0gTWF0aC5yYW5kb20oKSAtIC41O1xuICAgICAgICBxdWFkLnBvaW50LnkgKz0gTWF0aC5yYW5kb20oKSAtIC41O1xuICAgICAgfVxuICAgICAgdmFyIGsgPSBhbHBoYSAqIGNoYXJnZXNbcXVhZC5wb2ludC5pbmRleF07XG4gICAgICBxdWFkLmNoYXJnZSArPSBxdWFkLnBvaW50Q2hhcmdlID0gaztcbiAgICAgIGN4ICs9IGsgKiBxdWFkLnBvaW50Lng7XG4gICAgICBjeSArPSBrICogcXVhZC5wb2ludC55O1xuICAgIH1cbiAgICBxdWFkLmN4ID0gY3ggLyBxdWFkLmNoYXJnZTtcbiAgICBxdWFkLmN5ID0gY3kgLyBxdWFkLmNoYXJnZTtcbiAgfVxuICB2YXIgZDNfbGF5b3V0X2ZvcmNlTGlua0Rpc3RhbmNlID0gMjAsIGQzX2xheW91dF9mb3JjZUxpbmtTdHJlbmd0aCA9IDEsIGQzX2xheW91dF9mb3JjZUNoYXJnZURpc3RhbmNlMiA9IEluZmluaXR5O1xuICBkMy5sYXlvdXQuaGllcmFyY2h5ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNvcnQgPSBkM19sYXlvdXRfaGllcmFyY2h5U29ydCwgY2hpbGRyZW4gPSBkM19sYXlvdXRfaGllcmFyY2h5Q2hpbGRyZW4sIHZhbHVlID0gZDNfbGF5b3V0X2hpZXJhcmNoeVZhbHVlO1xuICAgIGZ1bmN0aW9uIGhpZXJhcmNoeShyb290KSB7XG4gICAgICB2YXIgc3RhY2sgPSBbIHJvb3QgXSwgbm9kZXMgPSBbXSwgbm9kZTtcbiAgICAgIHJvb3QuZGVwdGggPSAwO1xuICAgICAgd2hpbGUgKChub2RlID0gc3RhY2sucG9wKCkpICE9IG51bGwpIHtcbiAgICAgICAgbm9kZXMucHVzaChub2RlKTtcbiAgICAgICAgaWYgKChjaGlsZHMgPSBjaGlsZHJlbi5jYWxsKGhpZXJhcmNoeSwgbm9kZSwgbm9kZS5kZXB0aCkpICYmIChuID0gY2hpbGRzLmxlbmd0aCkpIHtcbiAgICAgICAgICB2YXIgbiwgY2hpbGRzLCBjaGlsZDtcbiAgICAgICAgICB3aGlsZSAoLS1uID49IDApIHtcbiAgICAgICAgICAgIHN0YWNrLnB1c2goY2hpbGQgPSBjaGlsZHNbbl0pO1xuICAgICAgICAgICAgY2hpbGQucGFyZW50ID0gbm9kZTtcbiAgICAgICAgICAgIGNoaWxkLmRlcHRoID0gbm9kZS5kZXB0aCArIDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh2YWx1ZSkgbm9kZS52YWx1ZSA9IDA7XG4gICAgICAgICAgbm9kZS5jaGlsZHJlbiA9IGNoaWxkcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAodmFsdWUpIG5vZGUudmFsdWUgPSArdmFsdWUuY2FsbChoaWVyYXJjaHksIG5vZGUsIG5vZGUuZGVwdGgpIHx8IDA7XG4gICAgICAgICAgZGVsZXRlIG5vZGUuY2hpbGRyZW47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGQzX2xheW91dF9oaWVyYXJjaHlWaXNpdEFmdGVyKHJvb3QsIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgdmFyIGNoaWxkcywgcGFyZW50O1xuICAgICAgICBpZiAoc29ydCAmJiAoY2hpbGRzID0gbm9kZS5jaGlsZHJlbikpIGNoaWxkcy5zb3J0KHNvcnQpO1xuICAgICAgICBpZiAodmFsdWUgJiYgKHBhcmVudCA9IG5vZGUucGFyZW50KSkgcGFyZW50LnZhbHVlICs9IG5vZGUudmFsdWU7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBub2RlcztcbiAgICB9XG4gICAgaGllcmFyY2h5LnNvcnQgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBzb3J0O1xuICAgICAgc29ydCA9IHg7XG4gICAgICByZXR1cm4gaGllcmFyY2h5O1xuICAgIH07XG4gICAgaGllcmFyY2h5LmNoaWxkcmVuID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gY2hpbGRyZW47XG4gICAgICBjaGlsZHJlbiA9IHg7XG4gICAgICByZXR1cm4gaGllcmFyY2h5O1xuICAgIH07XG4gICAgaGllcmFyY2h5LnZhbHVlID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdmFsdWU7XG4gICAgICB2YWx1ZSA9IHg7XG4gICAgICByZXR1cm4gaGllcmFyY2h5O1xuICAgIH07XG4gICAgaGllcmFyY2h5LnJldmFsdWUgPSBmdW5jdGlvbihyb290KSB7XG4gICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgZDNfbGF5b3V0X2hpZXJhcmNoeVZpc2l0QmVmb3JlKHJvb3QsIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICBpZiAobm9kZS5jaGlsZHJlbikgbm9kZS52YWx1ZSA9IDA7XG4gICAgICAgIH0pO1xuICAgICAgICBkM19sYXlvdXRfaGllcmFyY2h5VmlzaXRBZnRlcihyb290LCBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgdmFyIHBhcmVudDtcbiAgICAgICAgICBpZiAoIW5vZGUuY2hpbGRyZW4pIG5vZGUudmFsdWUgPSArdmFsdWUuY2FsbChoaWVyYXJjaHksIG5vZGUsIG5vZGUuZGVwdGgpIHx8IDA7XG4gICAgICAgICAgaWYgKHBhcmVudCA9IG5vZGUucGFyZW50KSBwYXJlbnQudmFsdWUgKz0gbm9kZS52YWx1ZTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcm9vdDtcbiAgICB9O1xuICAgIHJldHVybiBoaWVyYXJjaHk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX2xheW91dF9oaWVyYXJjaHlSZWJpbmQob2JqZWN0LCBoaWVyYXJjaHkpIHtcbiAgICBkMy5yZWJpbmQob2JqZWN0LCBoaWVyYXJjaHksIFwic29ydFwiLCBcImNoaWxkcmVuXCIsIFwidmFsdWVcIik7XG4gICAgb2JqZWN0Lm5vZGVzID0gb2JqZWN0O1xuICAgIG9iamVjdC5saW5rcyA9IGQzX2xheW91dF9oaWVyYXJjaHlMaW5rcztcbiAgICByZXR1cm4gb2JqZWN0O1xuICB9XG4gIGZ1bmN0aW9uIGQzX2xheW91dF9oaWVyYXJjaHlWaXNpdEJlZm9yZShub2RlLCBjYWxsYmFjaykge1xuICAgIHZhciBub2RlcyA9IFsgbm9kZSBdO1xuICAgIHdoaWxlICgobm9kZSA9IG5vZGVzLnBvcCgpKSAhPSBudWxsKSB7XG4gICAgICBjYWxsYmFjayhub2RlKTtcbiAgICAgIGlmICgoY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuKSAmJiAobiA9IGNoaWxkcmVuLmxlbmd0aCkpIHtcbiAgICAgICAgdmFyIG4sIGNoaWxkcmVuO1xuICAgICAgICB3aGlsZSAoLS1uID49IDApIG5vZGVzLnB1c2goY2hpbGRyZW5bbl0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBkM19sYXlvdXRfaGllcmFyY2h5VmlzaXRBZnRlcihub2RlLCBjYWxsYmFjaykge1xuICAgIHZhciBub2RlcyA9IFsgbm9kZSBdLCBub2RlczIgPSBbXTtcbiAgICB3aGlsZSAoKG5vZGUgPSBub2Rlcy5wb3AoKSkgIT0gbnVsbCkge1xuICAgICAgbm9kZXMyLnB1c2gobm9kZSk7XG4gICAgICBpZiAoKGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbikgJiYgKG4gPSBjaGlsZHJlbi5sZW5ndGgpKSB7XG4gICAgICAgIHZhciBpID0gLTEsIG4sIGNoaWxkcmVuO1xuICAgICAgICB3aGlsZSAoKytpIDwgbikgbm9kZXMucHVzaChjaGlsZHJlbltpXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHdoaWxlICgobm9kZSA9IG5vZGVzMi5wb3AoKSkgIT0gbnVsbCkge1xuICAgICAgY2FsbGJhY2sobm9kZSk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIGQzX2xheW91dF9oaWVyYXJjaHlDaGlsZHJlbihkKSB7XG4gICAgcmV0dXJuIGQuY2hpbGRyZW47XG4gIH1cbiAgZnVuY3Rpb24gZDNfbGF5b3V0X2hpZXJhcmNoeVZhbHVlKGQpIHtcbiAgICByZXR1cm4gZC52YWx1ZTtcbiAgfVxuICBmdW5jdGlvbiBkM19sYXlvdXRfaGllcmFyY2h5U29ydChhLCBiKSB7XG4gICAgcmV0dXJuIGIudmFsdWUgLSBhLnZhbHVlO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2xheW91dF9oaWVyYXJjaHlMaW5rcyhub2Rlcykge1xuICAgIHJldHVybiBkMy5tZXJnZShub2Rlcy5tYXAoZnVuY3Rpb24ocGFyZW50KSB7XG4gICAgICByZXR1cm4gKHBhcmVudC5jaGlsZHJlbiB8fCBbXSkubWFwKGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc291cmNlOiBwYXJlbnQsXG4gICAgICAgICAgdGFyZ2V0OiBjaGlsZFxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgfSkpO1xuICB9XG4gIGQzLmxheW91dC5wYXJ0aXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaGllcmFyY2h5ID0gZDMubGF5b3V0LmhpZXJhcmNoeSgpLCBzaXplID0gWyAxLCAxIF07XG4gICAgZnVuY3Rpb24gcG9zaXRpb24obm9kZSwgeCwgZHgsIGR5KSB7XG4gICAgICB2YXIgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuO1xuICAgICAgbm9kZS54ID0geDtcbiAgICAgIG5vZGUueSA9IG5vZGUuZGVwdGggKiBkeTtcbiAgICAgIG5vZGUuZHggPSBkeDtcbiAgICAgIG5vZGUuZHkgPSBkeTtcbiAgICAgIGlmIChjaGlsZHJlbiAmJiAobiA9IGNoaWxkcmVuLmxlbmd0aCkpIHtcbiAgICAgICAgdmFyIGkgPSAtMSwgbiwgYywgZDtcbiAgICAgICAgZHggPSBub2RlLnZhbHVlID8gZHggLyBub2RlLnZhbHVlIDogMDtcbiAgICAgICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgICAgICBwb3NpdGlvbihjID0gY2hpbGRyZW5baV0sIHgsIGQgPSBjLnZhbHVlICogZHgsIGR5KTtcbiAgICAgICAgICB4ICs9IGQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gZGVwdGgobm9kZSkge1xuICAgICAgdmFyIGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbiwgZCA9IDA7XG4gICAgICBpZiAoY2hpbGRyZW4gJiYgKG4gPSBjaGlsZHJlbi5sZW5ndGgpKSB7XG4gICAgICAgIHZhciBpID0gLTEsIG47XG4gICAgICAgIHdoaWxlICgrK2kgPCBuKSBkID0gTWF0aC5tYXgoZCwgZGVwdGgoY2hpbGRyZW5baV0pKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAxICsgZDtcbiAgICB9XG4gICAgZnVuY3Rpb24gcGFydGl0aW9uKGQsIGkpIHtcbiAgICAgIHZhciBub2RlcyA9IGhpZXJhcmNoeS5jYWxsKHRoaXMsIGQsIGkpO1xuICAgICAgcG9zaXRpb24obm9kZXNbMF0sIDAsIHNpemVbMF0sIHNpemVbMV0gLyBkZXB0aChub2Rlc1swXSkpO1xuICAgICAgcmV0dXJuIG5vZGVzO1xuICAgIH1cbiAgICBwYXJ0aXRpb24uc2l6ZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHNpemU7XG4gICAgICBzaXplID0geDtcbiAgICAgIHJldHVybiBwYXJ0aXRpb247XG4gICAgfTtcbiAgICByZXR1cm4gZDNfbGF5b3V0X2hpZXJhcmNoeVJlYmluZChwYXJ0aXRpb24sIGhpZXJhcmNoeSk7XG4gIH07XG4gIGQzLmxheW91dC5waWUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWUgPSBOdW1iZXIsIHNvcnQgPSBkM19sYXlvdXRfcGllU29ydEJ5VmFsdWUsIHN0YXJ0QW5nbGUgPSAwLCBlbmRBbmdsZSA9IM+ELCBwYWRBbmdsZSA9IDA7XG4gICAgZnVuY3Rpb24gcGllKGRhdGEpIHtcbiAgICAgIHZhciBuID0gZGF0YS5sZW5ndGgsIHZhbHVlcyA9IGRhdGEubWFwKGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgcmV0dXJuICt2YWx1ZS5jYWxsKHBpZSwgZCwgaSk7XG4gICAgICB9KSwgYSA9ICsodHlwZW9mIHN0YXJ0QW5nbGUgPT09IFwiZnVuY3Rpb25cIiA/IHN0YXJ0QW5nbGUuYXBwbHkodGhpcywgYXJndW1lbnRzKSA6IHN0YXJ0QW5nbGUpLCBkYSA9ICh0eXBlb2YgZW5kQW5nbGUgPT09IFwiZnVuY3Rpb25cIiA/IGVuZEFuZ2xlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgOiBlbmRBbmdsZSkgLSBhLCBwID0gTWF0aC5taW4oTWF0aC5hYnMoZGEpIC8gbiwgKyh0eXBlb2YgcGFkQW5nbGUgPT09IFwiZnVuY3Rpb25cIiA/IHBhZEFuZ2xlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgOiBwYWRBbmdsZSkpLCBwYSA9IHAgKiAoZGEgPCAwID8gLTEgOiAxKSwgayA9IChkYSAtIG4gKiBwYSkgLyBkMy5zdW0odmFsdWVzKSwgaW5kZXggPSBkMy5yYW5nZShuKSwgYXJjcyA9IFtdLCB2O1xuICAgICAgaWYgKHNvcnQgIT0gbnVsbCkgaW5kZXguc29ydChzb3J0ID09PSBkM19sYXlvdXRfcGllU29ydEJ5VmFsdWUgPyBmdW5jdGlvbihpLCBqKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZXNbal0gLSB2YWx1ZXNbaV07XG4gICAgICB9IDogZnVuY3Rpb24oaSwgaikge1xuICAgICAgICByZXR1cm4gc29ydChkYXRhW2ldLCBkYXRhW2pdKTtcbiAgICAgIH0pO1xuICAgICAgaW5kZXguZm9yRWFjaChmdW5jdGlvbihpKSB7XG4gICAgICAgIGFyY3NbaV0gPSB7XG4gICAgICAgICAgZGF0YTogZGF0YVtpXSxcbiAgICAgICAgICB2YWx1ZTogdiA9IHZhbHVlc1tpXSxcbiAgICAgICAgICBzdGFydEFuZ2xlOiBhLFxuICAgICAgICAgIGVuZEFuZ2xlOiBhICs9IHYgKiBrICsgcGEsXG4gICAgICAgICAgcGFkQW5nbGU6IHBcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGFyY3M7XG4gICAgfVxuICAgIHBpZS52YWx1ZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHZhbHVlO1xuICAgICAgdmFsdWUgPSBfO1xuICAgICAgcmV0dXJuIHBpZTtcbiAgICB9O1xuICAgIHBpZS5zb3J0ID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gc29ydDtcbiAgICAgIHNvcnQgPSBfO1xuICAgICAgcmV0dXJuIHBpZTtcbiAgICB9O1xuICAgIHBpZS5zdGFydEFuZ2xlID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gc3RhcnRBbmdsZTtcbiAgICAgIHN0YXJ0QW5nbGUgPSBfO1xuICAgICAgcmV0dXJuIHBpZTtcbiAgICB9O1xuICAgIHBpZS5lbmRBbmdsZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGVuZEFuZ2xlO1xuICAgICAgZW5kQW5nbGUgPSBfO1xuICAgICAgcmV0dXJuIHBpZTtcbiAgICB9O1xuICAgIHBpZS5wYWRBbmdsZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHBhZEFuZ2xlO1xuICAgICAgcGFkQW5nbGUgPSBfO1xuICAgICAgcmV0dXJuIHBpZTtcbiAgICB9O1xuICAgIHJldHVybiBwaWU7XG4gIH07XG4gIHZhciBkM19sYXlvdXRfcGllU29ydEJ5VmFsdWUgPSB7fTtcbiAgZDMubGF5b3V0LnN0YWNrID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlcyA9IGQzX2lkZW50aXR5LCBvcmRlciA9IGQzX2xheW91dF9zdGFja09yZGVyRGVmYXVsdCwgb2Zmc2V0ID0gZDNfbGF5b3V0X3N0YWNrT2Zmc2V0WmVybywgb3V0ID0gZDNfbGF5b3V0X3N0YWNrT3V0LCB4ID0gZDNfbGF5b3V0X3N0YWNrWCwgeSA9IGQzX2xheW91dF9zdGFja1k7XG4gICAgZnVuY3Rpb24gc3RhY2soZGF0YSwgaW5kZXgpIHtcbiAgICAgIGlmICghKG4gPSBkYXRhLmxlbmd0aCkpIHJldHVybiBkYXRhO1xuICAgICAgdmFyIHNlcmllcyA9IGRhdGEubWFwKGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlcy5jYWxsKHN0YWNrLCBkLCBpKTtcbiAgICAgIH0pO1xuICAgICAgdmFyIHBvaW50cyA9IHNlcmllcy5tYXAoZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gZC5tYXAoZnVuY3Rpb24odiwgaSkge1xuICAgICAgICAgIHJldHVybiBbIHguY2FsbChzdGFjaywgdiwgaSksIHkuY2FsbChzdGFjaywgdiwgaSkgXTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHZhciBvcmRlcnMgPSBvcmRlci5jYWxsKHN0YWNrLCBwb2ludHMsIGluZGV4KTtcbiAgICAgIHNlcmllcyA9IGQzLnBlcm11dGUoc2VyaWVzLCBvcmRlcnMpO1xuICAgICAgcG9pbnRzID0gZDMucGVybXV0ZShwb2ludHMsIG9yZGVycyk7XG4gICAgICB2YXIgb2Zmc2V0cyA9IG9mZnNldC5jYWxsKHN0YWNrLCBwb2ludHMsIGluZGV4KTtcbiAgICAgIHZhciBtID0gc2VyaWVzWzBdLmxlbmd0aCwgbiwgaSwgaiwgbztcbiAgICAgIGZvciAoaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICAgICAgb3V0LmNhbGwoc3RhY2ssIHNlcmllc1swXVtqXSwgbyA9IG9mZnNldHNbal0sIHBvaW50c1swXVtqXVsxXSk7XG4gICAgICAgIGZvciAoaSA9IDE7IGkgPCBuOyArK2kpIHtcbiAgICAgICAgICBvdXQuY2FsbChzdGFjaywgc2VyaWVzW2ldW2pdLCBvICs9IHBvaW50c1tpIC0gMV1bal1bMV0sIHBvaW50c1tpXVtqXVsxXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbiAgICBzdGFjay52YWx1ZXMgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB2YWx1ZXM7XG4gICAgICB2YWx1ZXMgPSB4O1xuICAgICAgcmV0dXJuIHN0YWNrO1xuICAgIH07XG4gICAgc3RhY2sub3JkZXIgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBvcmRlcjtcbiAgICAgIG9yZGVyID0gdHlwZW9mIHggPT09IFwiZnVuY3Rpb25cIiA/IHggOiBkM19sYXlvdXRfc3RhY2tPcmRlcnMuZ2V0KHgpIHx8IGQzX2xheW91dF9zdGFja09yZGVyRGVmYXVsdDtcbiAgICAgIHJldHVybiBzdGFjaztcbiAgICB9O1xuICAgIHN0YWNrLm9mZnNldCA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIG9mZnNldDtcbiAgICAgIG9mZnNldCA9IHR5cGVvZiB4ID09PSBcImZ1bmN0aW9uXCIgPyB4IDogZDNfbGF5b3V0X3N0YWNrT2Zmc2V0cy5nZXQoeCkgfHwgZDNfbGF5b3V0X3N0YWNrT2Zmc2V0WmVybztcbiAgICAgIHJldHVybiBzdGFjaztcbiAgICB9O1xuICAgIHN0YWNrLnggPSBmdW5jdGlvbih6KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB4O1xuICAgICAgeCA9IHo7XG4gICAgICByZXR1cm4gc3RhY2s7XG4gICAgfTtcbiAgICBzdGFjay55ID0gZnVuY3Rpb24oeikge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4geTtcbiAgICAgIHkgPSB6O1xuICAgICAgcmV0dXJuIHN0YWNrO1xuICAgIH07XG4gICAgc3RhY2sub3V0ID0gZnVuY3Rpb24oeikge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gb3V0O1xuICAgICAgb3V0ID0gejtcbiAgICAgIHJldHVybiBzdGFjaztcbiAgICB9O1xuICAgIHJldHVybiBzdGFjaztcbiAgfTtcbiAgZnVuY3Rpb24gZDNfbGF5b3V0X3N0YWNrWChkKSB7XG4gICAgcmV0dXJuIGQueDtcbiAgfVxuICBmdW5jdGlvbiBkM19sYXlvdXRfc3RhY2tZKGQpIHtcbiAgICByZXR1cm4gZC55O1xuICB9XG4gIGZ1bmN0aW9uIGQzX2xheW91dF9zdGFja091dChkLCB5MCwgeSkge1xuICAgIGQueTAgPSB5MDtcbiAgICBkLnkgPSB5O1xuICB9XG4gIHZhciBkM19sYXlvdXRfc3RhY2tPcmRlcnMgPSBkMy5tYXAoe1xuICAgIFwiaW5zaWRlLW91dFwiOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgbiA9IGRhdGEubGVuZ3RoLCBpLCBqLCBtYXggPSBkYXRhLm1hcChkM19sYXlvdXRfc3RhY2tNYXhJbmRleCksIHN1bXMgPSBkYXRhLm1hcChkM19sYXlvdXRfc3RhY2tSZWR1Y2VTdW0pLCBpbmRleCA9IGQzLnJhbmdlKG4pLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICByZXR1cm4gbWF4W2FdIC0gbWF4W2JdO1xuICAgICAgfSksIHRvcCA9IDAsIGJvdHRvbSA9IDAsIHRvcHMgPSBbXSwgYm90dG9tcyA9IFtdO1xuICAgICAgZm9yIChpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgICBqID0gaW5kZXhbaV07XG4gICAgICAgIGlmICh0b3AgPCBib3R0b20pIHtcbiAgICAgICAgICB0b3AgKz0gc3Vtc1tqXTtcbiAgICAgICAgICB0b3BzLnB1c2goaik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYm90dG9tICs9IHN1bXNbal07XG4gICAgICAgICAgYm90dG9tcy5wdXNoKGopO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gYm90dG9tcy5yZXZlcnNlKCkuY29uY2F0KHRvcHMpO1xuICAgIH0sXG4gICAgcmV2ZXJzZTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuIGQzLnJhbmdlKGRhdGEubGVuZ3RoKS5yZXZlcnNlKCk7XG4gICAgfSxcbiAgICBcImRlZmF1bHRcIjogZDNfbGF5b3V0X3N0YWNrT3JkZXJEZWZhdWx0XG4gIH0pO1xuICB2YXIgZDNfbGF5b3V0X3N0YWNrT2Zmc2V0cyA9IGQzLm1hcCh7XG4gICAgc2lsaG91ZXR0ZTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIG4gPSBkYXRhLmxlbmd0aCwgbSA9IGRhdGFbMF0ubGVuZ3RoLCBzdW1zID0gW10sIG1heCA9IDAsIGksIGosIG8sIHkwID0gW107XG4gICAgICBmb3IgKGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgICAgIGZvciAoaSA9IDAsIG8gPSAwOyBpIDwgbjsgaSsrKSBvICs9IGRhdGFbaV1bal1bMV07XG4gICAgICAgIGlmIChvID4gbWF4KSBtYXggPSBvO1xuICAgICAgICBzdW1zLnB1c2gobyk7XG4gICAgICB9XG4gICAgICBmb3IgKGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgICAgIHkwW2pdID0gKG1heCAtIHN1bXNbal0pIC8gMjtcbiAgICAgIH1cbiAgICAgIHJldHVybiB5MDtcbiAgICB9LFxuICAgIHdpZ2dsZTogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIG4gPSBkYXRhLmxlbmd0aCwgeCA9IGRhdGFbMF0sIG0gPSB4Lmxlbmd0aCwgaSwgaiwgaywgczEsIHMyLCBzMywgZHgsIG8sIG8wLCB5MCA9IFtdO1xuICAgICAgeTBbMF0gPSBvID0gbzAgPSAwO1xuICAgICAgZm9yIChqID0gMTsgaiA8IG07ICsraikge1xuICAgICAgICBmb3IgKGkgPSAwLCBzMSA9IDA7IGkgPCBuOyArK2kpIHMxICs9IGRhdGFbaV1bal1bMV07XG4gICAgICAgIGZvciAoaSA9IDAsIHMyID0gMCwgZHggPSB4W2pdWzBdIC0geFtqIC0gMV1bMF07IGkgPCBuOyArK2kpIHtcbiAgICAgICAgICBmb3IgKGsgPSAwLCBzMyA9IChkYXRhW2ldW2pdWzFdIC0gZGF0YVtpXVtqIC0gMV1bMV0pIC8gKDIgKiBkeCk7IGsgPCBpOyArK2spIHtcbiAgICAgICAgICAgIHMzICs9IChkYXRhW2tdW2pdWzFdIC0gZGF0YVtrXVtqIC0gMV1bMV0pIC8gZHg7XG4gICAgICAgICAgfVxuICAgICAgICAgIHMyICs9IHMzICogZGF0YVtpXVtqXVsxXTtcbiAgICAgICAgfVxuICAgICAgICB5MFtqXSA9IG8gLT0gczEgPyBzMiAvIHMxICogZHggOiAwO1xuICAgICAgICBpZiAobyA8IG8wKSBvMCA9IG87XG4gICAgICB9XG4gICAgICBmb3IgKGogPSAwOyBqIDwgbTsgKytqKSB5MFtqXSAtPSBvMDtcbiAgICAgIHJldHVybiB5MDtcbiAgICB9LFxuICAgIGV4cGFuZDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIG4gPSBkYXRhLmxlbmd0aCwgbSA9IGRhdGFbMF0ubGVuZ3RoLCBrID0gMSAvIG4sIGksIGosIG8sIHkwID0gW107XG4gICAgICBmb3IgKGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgICAgIGZvciAoaSA9IDAsIG8gPSAwOyBpIDwgbjsgaSsrKSBvICs9IGRhdGFbaV1bal1bMV07XG4gICAgICAgIGlmIChvKSBmb3IgKGkgPSAwOyBpIDwgbjsgaSsrKSBkYXRhW2ldW2pdWzFdIC89IG87IGVsc2UgZm9yIChpID0gMDsgaSA8IG47IGkrKykgZGF0YVtpXVtqXVsxXSA9IGs7XG4gICAgICB9XG4gICAgICBmb3IgKGogPSAwOyBqIDwgbTsgKytqKSB5MFtqXSA9IDA7XG4gICAgICByZXR1cm4geTA7XG4gICAgfSxcbiAgICB6ZXJvOiBkM19sYXlvdXRfc3RhY2tPZmZzZXRaZXJvXG4gIH0pO1xuICBmdW5jdGlvbiBkM19sYXlvdXRfc3RhY2tPcmRlckRlZmF1bHQoZGF0YSkge1xuICAgIHJldHVybiBkMy5yYW5nZShkYXRhLmxlbmd0aCk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfbGF5b3V0X3N0YWNrT2Zmc2V0WmVybyhkYXRhKSB7XG4gICAgdmFyIGogPSAtMSwgbSA9IGRhdGFbMF0ubGVuZ3RoLCB5MCA9IFtdO1xuICAgIHdoaWxlICgrK2ogPCBtKSB5MFtqXSA9IDA7XG4gICAgcmV0dXJuIHkwO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2xheW91dF9zdGFja01heEluZGV4KGFycmF5KSB7XG4gICAgdmFyIGkgPSAxLCBqID0gMCwgdiA9IGFycmF5WzBdWzFdLCBrLCBuID0gYXJyYXkubGVuZ3RoO1xuICAgIGZvciAoO2kgPCBuOyArK2kpIHtcbiAgICAgIGlmICgoayA9IGFycmF5W2ldWzFdKSA+IHYpIHtcbiAgICAgICAgaiA9IGk7XG4gICAgICAgIHYgPSBrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gajtcbiAgfVxuICBmdW5jdGlvbiBkM19sYXlvdXRfc3RhY2tSZWR1Y2VTdW0oZCkge1xuICAgIHJldHVybiBkLnJlZHVjZShkM19sYXlvdXRfc3RhY2tTdW0sIDApO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2xheW91dF9zdGFja1N1bShwLCBkKSB7XG4gICAgcmV0dXJuIHAgKyBkWzFdO1xuICB9XG4gIGQzLmxheW91dC5oaXN0b2dyYW0gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZnJlcXVlbmN5ID0gdHJ1ZSwgdmFsdWVyID0gTnVtYmVyLCByYW5nZXIgPSBkM19sYXlvdXRfaGlzdG9ncmFtUmFuZ2UsIGJpbm5lciA9IGQzX2xheW91dF9oaXN0b2dyYW1CaW5TdHVyZ2VzO1xuICAgIGZ1bmN0aW9uIGhpc3RvZ3JhbShkYXRhLCBpKSB7XG4gICAgICB2YXIgYmlucyA9IFtdLCB2YWx1ZXMgPSBkYXRhLm1hcCh2YWx1ZXIsIHRoaXMpLCByYW5nZSA9IHJhbmdlci5jYWxsKHRoaXMsIHZhbHVlcywgaSksIHRocmVzaG9sZHMgPSBiaW5uZXIuY2FsbCh0aGlzLCByYW5nZSwgdmFsdWVzLCBpKSwgYmluLCBpID0gLTEsIG4gPSB2YWx1ZXMubGVuZ3RoLCBtID0gdGhyZXNob2xkcy5sZW5ndGggLSAxLCBrID0gZnJlcXVlbmN5ID8gMSA6IDEgLyBuLCB4O1xuICAgICAgd2hpbGUgKCsraSA8IG0pIHtcbiAgICAgICAgYmluID0gYmluc1tpXSA9IFtdO1xuICAgICAgICBiaW4uZHggPSB0aHJlc2hvbGRzW2kgKyAxXSAtIChiaW4ueCA9IHRocmVzaG9sZHNbaV0pO1xuICAgICAgICBiaW4ueSA9IDA7XG4gICAgICB9XG4gICAgICBpZiAobSA+IDApIHtcbiAgICAgICAgaSA9IC0xO1xuICAgICAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgICAgIHggPSB2YWx1ZXNbaV07XG4gICAgICAgICAgaWYgKHggPj0gcmFuZ2VbMF0gJiYgeCA8PSByYW5nZVsxXSkge1xuICAgICAgICAgICAgYmluID0gYmluc1tkMy5iaXNlY3QodGhyZXNob2xkcywgeCwgMSwgbSkgLSAxXTtcbiAgICAgICAgICAgIGJpbi55ICs9IGs7XG4gICAgICAgICAgICBiaW4ucHVzaChkYXRhW2ldKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBiaW5zO1xuICAgIH1cbiAgICBoaXN0b2dyYW0udmFsdWUgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB2YWx1ZXI7XG4gICAgICB2YWx1ZXIgPSB4O1xuICAgICAgcmV0dXJuIGhpc3RvZ3JhbTtcbiAgICB9O1xuICAgIGhpc3RvZ3JhbS5yYW5nZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHJhbmdlcjtcbiAgICAgIHJhbmdlciA9IGQzX2Z1bmN0b3IoeCk7XG4gICAgICByZXR1cm4gaGlzdG9ncmFtO1xuICAgIH07XG4gICAgaGlzdG9ncmFtLmJpbnMgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBiaW5uZXI7XG4gICAgICBiaW5uZXIgPSB0eXBlb2YgeCA9PT0gXCJudW1iZXJcIiA/IGZ1bmN0aW9uKHJhbmdlKSB7XG4gICAgICAgIHJldHVybiBkM19sYXlvdXRfaGlzdG9ncmFtQmluRml4ZWQocmFuZ2UsIHgpO1xuICAgICAgfSA6IGQzX2Z1bmN0b3IoeCk7XG4gICAgICByZXR1cm4gaGlzdG9ncmFtO1xuICAgIH07XG4gICAgaGlzdG9ncmFtLmZyZXF1ZW5jeSA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGZyZXF1ZW5jeTtcbiAgICAgIGZyZXF1ZW5jeSA9ICEheDtcbiAgICAgIHJldHVybiBoaXN0b2dyYW07XG4gICAgfTtcbiAgICByZXR1cm4gaGlzdG9ncmFtO1xuICB9O1xuICBmdW5jdGlvbiBkM19sYXlvdXRfaGlzdG9ncmFtQmluU3R1cmdlcyhyYW5nZSwgdmFsdWVzKSB7XG4gICAgcmV0dXJuIGQzX2xheW91dF9oaXN0b2dyYW1CaW5GaXhlZChyYW5nZSwgTWF0aC5jZWlsKE1hdGgubG9nKHZhbHVlcy5sZW5ndGgpIC8gTWF0aC5MTjIgKyAxKSk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfbGF5b3V0X2hpc3RvZ3JhbUJpbkZpeGVkKHJhbmdlLCBuKSB7XG4gICAgdmFyIHggPSAtMSwgYiA9ICtyYW5nZVswXSwgbSA9IChyYW5nZVsxXSAtIGIpIC8gbiwgZiA9IFtdO1xuICAgIHdoaWxlICgrK3ggPD0gbikgZlt4XSA9IG0gKiB4ICsgYjtcbiAgICByZXR1cm4gZjtcbiAgfVxuICBmdW5jdGlvbiBkM19sYXlvdXRfaGlzdG9ncmFtUmFuZ2UodmFsdWVzKSB7XG4gICAgcmV0dXJuIFsgZDMubWluKHZhbHVlcyksIGQzLm1heCh2YWx1ZXMpIF07XG4gIH1cbiAgZDMubGF5b3V0LnBhY2sgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaGllcmFyY2h5ID0gZDMubGF5b3V0LmhpZXJhcmNoeSgpLnNvcnQoZDNfbGF5b3V0X3BhY2tTb3J0KSwgcGFkZGluZyA9IDAsIHNpemUgPSBbIDEsIDEgXSwgcmFkaXVzO1xuICAgIGZ1bmN0aW9uIHBhY2soZCwgaSkge1xuICAgICAgdmFyIG5vZGVzID0gaGllcmFyY2h5LmNhbGwodGhpcywgZCwgaSksIHJvb3QgPSBub2Rlc1swXSwgdyA9IHNpemVbMF0sIGggPSBzaXplWzFdLCByID0gcmFkaXVzID09IG51bGwgPyBNYXRoLnNxcnQgOiB0eXBlb2YgcmFkaXVzID09PSBcImZ1bmN0aW9uXCIgPyByYWRpdXMgOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHJhZGl1cztcbiAgICAgIH07XG4gICAgICByb290LnggPSByb290LnkgPSAwO1xuICAgICAgZDNfbGF5b3V0X2hpZXJhcmNoeVZpc2l0QWZ0ZXIocm9vdCwgZnVuY3Rpb24oZCkge1xuICAgICAgICBkLnIgPSArcihkLnZhbHVlKTtcbiAgICAgIH0pO1xuICAgICAgZDNfbGF5b3V0X2hpZXJhcmNoeVZpc2l0QWZ0ZXIocm9vdCwgZDNfbGF5b3V0X3BhY2tTaWJsaW5ncyk7XG4gICAgICBpZiAocGFkZGluZykge1xuICAgICAgICB2YXIgZHIgPSBwYWRkaW5nICogKHJhZGl1cyA/IDEgOiBNYXRoLm1heCgyICogcm9vdC5yIC8gdywgMiAqIHJvb3QuciAvIGgpKSAvIDI7XG4gICAgICAgIGQzX2xheW91dF9oaWVyYXJjaHlWaXNpdEFmdGVyKHJvb3QsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICBkLnIgKz0gZHI7XG4gICAgICAgIH0pO1xuICAgICAgICBkM19sYXlvdXRfaGllcmFyY2h5VmlzaXRBZnRlcihyb290LCBkM19sYXlvdXRfcGFja1NpYmxpbmdzKTtcbiAgICAgICAgZDNfbGF5b3V0X2hpZXJhcmNoeVZpc2l0QWZ0ZXIocm9vdCwgZnVuY3Rpb24oZCkge1xuICAgICAgICAgIGQuciAtPSBkcjtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBkM19sYXlvdXRfcGFja1RyYW5zZm9ybShyb290LCB3IC8gMiwgaCAvIDIsIHJhZGl1cyA/IDEgOiAxIC8gTWF0aC5tYXgoMiAqIHJvb3QuciAvIHcsIDIgKiByb290LnIgLyBoKSk7XG4gICAgICByZXR1cm4gbm9kZXM7XG4gICAgfVxuICAgIHBhY2suc2l6ZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHNpemU7XG4gICAgICBzaXplID0gXztcbiAgICAgIHJldHVybiBwYWNrO1xuICAgIH07XG4gICAgcGFjay5yYWRpdXMgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiByYWRpdXM7XG4gICAgICByYWRpdXMgPSBfID09IG51bGwgfHwgdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiArXztcbiAgICAgIHJldHVybiBwYWNrO1xuICAgIH07XG4gICAgcGFjay5wYWRkaW5nID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gcGFkZGluZztcbiAgICAgIHBhZGRpbmcgPSArXztcbiAgICAgIHJldHVybiBwYWNrO1xuICAgIH07XG4gICAgcmV0dXJuIGQzX2xheW91dF9oaWVyYXJjaHlSZWJpbmQocGFjaywgaGllcmFyY2h5KTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfbGF5b3V0X3BhY2tTb3J0KGEsIGIpIHtcbiAgICByZXR1cm4gYS52YWx1ZSAtIGIudmFsdWU7XG4gIH1cbiAgZnVuY3Rpb24gZDNfbGF5b3V0X3BhY2tJbnNlcnQoYSwgYikge1xuICAgIHZhciBjID0gYS5fcGFja19uZXh0O1xuICAgIGEuX3BhY2tfbmV4dCA9IGI7XG4gICAgYi5fcGFja19wcmV2ID0gYTtcbiAgICBiLl9wYWNrX25leHQgPSBjO1xuICAgIGMuX3BhY2tfcHJldiA9IGI7XG4gIH1cbiAgZnVuY3Rpb24gZDNfbGF5b3V0X3BhY2tTcGxpY2UoYSwgYikge1xuICAgIGEuX3BhY2tfbmV4dCA9IGI7XG4gICAgYi5fcGFja19wcmV2ID0gYTtcbiAgfVxuICBmdW5jdGlvbiBkM19sYXlvdXRfcGFja0ludGVyc2VjdHMoYSwgYikge1xuICAgIHZhciBkeCA9IGIueCAtIGEueCwgZHkgPSBiLnkgLSBhLnksIGRyID0gYS5yICsgYi5yO1xuICAgIHJldHVybiAuOTk5ICogZHIgKiBkciA+IGR4ICogZHggKyBkeSAqIGR5O1xuICB9XG4gIGZ1bmN0aW9uIGQzX2xheW91dF9wYWNrU2libGluZ3Mobm9kZSkge1xuICAgIGlmICghKG5vZGVzID0gbm9kZS5jaGlsZHJlbikgfHwgIShuID0gbm9kZXMubGVuZ3RoKSkgcmV0dXJuO1xuICAgIHZhciBub2RlcywgeE1pbiA9IEluZmluaXR5LCB4TWF4ID0gLUluZmluaXR5LCB5TWluID0gSW5maW5pdHksIHlNYXggPSAtSW5maW5pdHksIGEsIGIsIGMsIGksIGosIGssIG47XG4gICAgZnVuY3Rpb24gYm91bmQobm9kZSkge1xuICAgICAgeE1pbiA9IE1hdGgubWluKG5vZGUueCAtIG5vZGUuciwgeE1pbik7XG4gICAgICB4TWF4ID0gTWF0aC5tYXgobm9kZS54ICsgbm9kZS5yLCB4TWF4KTtcbiAgICAgIHlNaW4gPSBNYXRoLm1pbihub2RlLnkgLSBub2RlLnIsIHlNaW4pO1xuICAgICAgeU1heCA9IE1hdGgubWF4KG5vZGUueSArIG5vZGUuciwgeU1heCk7XG4gICAgfVxuICAgIG5vZGVzLmZvckVhY2goZDNfbGF5b3V0X3BhY2tMaW5rKTtcbiAgICBhID0gbm9kZXNbMF07XG4gICAgYS54ID0gLWEucjtcbiAgICBhLnkgPSAwO1xuICAgIGJvdW5kKGEpO1xuICAgIGlmIChuID4gMSkge1xuICAgICAgYiA9IG5vZGVzWzFdO1xuICAgICAgYi54ID0gYi5yO1xuICAgICAgYi55ID0gMDtcbiAgICAgIGJvdW5kKGIpO1xuICAgICAgaWYgKG4gPiAyKSB7XG4gICAgICAgIGMgPSBub2Rlc1syXTtcbiAgICAgICAgZDNfbGF5b3V0X3BhY2tQbGFjZShhLCBiLCBjKTtcbiAgICAgICAgYm91bmQoYyk7XG4gICAgICAgIGQzX2xheW91dF9wYWNrSW5zZXJ0KGEsIGMpO1xuICAgICAgICBhLl9wYWNrX3ByZXYgPSBjO1xuICAgICAgICBkM19sYXlvdXRfcGFja0luc2VydChjLCBiKTtcbiAgICAgICAgYiA9IGEuX3BhY2tfbmV4dDtcbiAgICAgICAgZm9yIChpID0gMzsgaSA8IG47IGkrKykge1xuICAgICAgICAgIGQzX2xheW91dF9wYWNrUGxhY2UoYSwgYiwgYyA9IG5vZGVzW2ldKTtcbiAgICAgICAgICB2YXIgaXNlY3QgPSAwLCBzMSA9IDEsIHMyID0gMTtcbiAgICAgICAgICBmb3IgKGogPSBiLl9wYWNrX25leHQ7IGogIT09IGI7IGogPSBqLl9wYWNrX25leHQsIHMxKyspIHtcbiAgICAgICAgICAgIGlmIChkM19sYXlvdXRfcGFja0ludGVyc2VjdHMoaiwgYykpIHtcbiAgICAgICAgICAgICAgaXNlY3QgPSAxO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGlzZWN0ID09IDEpIHtcbiAgICAgICAgICAgIGZvciAoayA9IGEuX3BhY2tfcHJldjsgayAhPT0gai5fcGFja19wcmV2OyBrID0gay5fcGFja19wcmV2LCBzMisrKSB7XG4gICAgICAgICAgICAgIGlmIChkM19sYXlvdXRfcGFja0ludGVyc2VjdHMoaywgYykpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaXNlY3QpIHtcbiAgICAgICAgICAgIGlmIChzMSA8IHMyIHx8IHMxID09IHMyICYmIGIuciA8IGEucikgZDNfbGF5b3V0X3BhY2tTcGxpY2UoYSwgYiA9IGopOyBlbHNlIGQzX2xheW91dF9wYWNrU3BsaWNlKGEgPSBrLCBiKTtcbiAgICAgICAgICAgIGktLTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZDNfbGF5b3V0X3BhY2tJbnNlcnQoYSwgYyk7XG4gICAgICAgICAgICBiID0gYztcbiAgICAgICAgICAgIGJvdW5kKGMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB2YXIgY3ggPSAoeE1pbiArIHhNYXgpIC8gMiwgY3kgPSAoeU1pbiArIHlNYXgpIC8gMiwgY3IgPSAwO1xuICAgIGZvciAoaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICAgIGMgPSBub2Rlc1tpXTtcbiAgICAgIGMueCAtPSBjeDtcbiAgICAgIGMueSAtPSBjeTtcbiAgICAgIGNyID0gTWF0aC5tYXgoY3IsIGMuciArIE1hdGguc3FydChjLnggKiBjLnggKyBjLnkgKiBjLnkpKTtcbiAgICB9XG4gICAgbm9kZS5yID0gY3I7XG4gICAgbm9kZXMuZm9yRWFjaChkM19sYXlvdXRfcGFja1VubGluayk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfbGF5b3V0X3BhY2tMaW5rKG5vZGUpIHtcbiAgICBub2RlLl9wYWNrX25leHQgPSBub2RlLl9wYWNrX3ByZXYgPSBub2RlO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2xheW91dF9wYWNrVW5saW5rKG5vZGUpIHtcbiAgICBkZWxldGUgbm9kZS5fcGFja19uZXh0O1xuICAgIGRlbGV0ZSBub2RlLl9wYWNrX3ByZXY7XG4gIH1cbiAgZnVuY3Rpb24gZDNfbGF5b3V0X3BhY2tUcmFuc2Zvcm0obm9kZSwgeCwgeSwgaykge1xuICAgIHZhciBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW47XG4gICAgbm9kZS54ID0geCArPSBrICogbm9kZS54O1xuICAgIG5vZGUueSA9IHkgKz0gayAqIG5vZGUueTtcbiAgICBub2RlLnIgKj0gaztcbiAgICBpZiAoY2hpbGRyZW4pIHtcbiAgICAgIHZhciBpID0gLTEsIG4gPSBjaGlsZHJlbi5sZW5ndGg7XG4gICAgICB3aGlsZSAoKytpIDwgbikgZDNfbGF5b3V0X3BhY2tUcmFuc2Zvcm0oY2hpbGRyZW5baV0sIHgsIHksIGspO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBkM19sYXlvdXRfcGFja1BsYWNlKGEsIGIsIGMpIHtcbiAgICB2YXIgZGIgPSBhLnIgKyBjLnIsIGR4ID0gYi54IC0gYS54LCBkeSA9IGIueSAtIGEueTtcbiAgICBpZiAoZGIgJiYgKGR4IHx8IGR5KSkge1xuICAgICAgdmFyIGRhID0gYi5yICsgYy5yLCBkYyA9IGR4ICogZHggKyBkeSAqIGR5O1xuICAgICAgZGEgKj0gZGE7XG4gICAgICBkYiAqPSBkYjtcbiAgICAgIHZhciB4ID0gLjUgKyAoZGIgLSBkYSkgLyAoMiAqIGRjKSwgeSA9IE1hdGguc3FydChNYXRoLm1heCgwLCAyICogZGEgKiAoZGIgKyBkYykgLSAoZGIgLT0gZGMpICogZGIgLSBkYSAqIGRhKSkgLyAoMiAqIGRjKTtcbiAgICAgIGMueCA9IGEueCArIHggKiBkeCArIHkgKiBkeTtcbiAgICAgIGMueSA9IGEueSArIHggKiBkeSAtIHkgKiBkeDtcbiAgICB9IGVsc2Uge1xuICAgICAgYy54ID0gYS54ICsgZGI7XG4gICAgICBjLnkgPSBhLnk7XG4gICAgfVxuICB9XG4gIGQzLmxheW91dC50cmVlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGhpZXJhcmNoeSA9IGQzLmxheW91dC5oaWVyYXJjaHkoKS5zb3J0KG51bGwpLnZhbHVlKG51bGwpLCBzZXBhcmF0aW9uID0gZDNfbGF5b3V0X3RyZWVTZXBhcmF0aW9uLCBzaXplID0gWyAxLCAxIF0sIG5vZGVTaXplID0gbnVsbDtcbiAgICBmdW5jdGlvbiB0cmVlKGQsIGkpIHtcbiAgICAgIHZhciBub2RlcyA9IGhpZXJhcmNoeS5jYWxsKHRoaXMsIGQsIGkpLCByb290MCA9IG5vZGVzWzBdLCByb290MSA9IHdyYXBUcmVlKHJvb3QwKTtcbiAgICAgIGQzX2xheW91dF9oaWVyYXJjaHlWaXNpdEFmdGVyKHJvb3QxLCBmaXJzdFdhbGspLCByb290MS5wYXJlbnQubSA9IC1yb290MS56O1xuICAgICAgZDNfbGF5b3V0X2hpZXJhcmNoeVZpc2l0QmVmb3JlKHJvb3QxLCBzZWNvbmRXYWxrKTtcbiAgICAgIGlmIChub2RlU2l6ZSkgZDNfbGF5b3V0X2hpZXJhcmNoeVZpc2l0QmVmb3JlKHJvb3QwLCBzaXplTm9kZSk7IGVsc2Uge1xuICAgICAgICB2YXIgbGVmdCA9IHJvb3QwLCByaWdodCA9IHJvb3QwLCBib3R0b20gPSByb290MDtcbiAgICAgICAgZDNfbGF5b3V0X2hpZXJhcmNoeVZpc2l0QmVmb3JlKHJvb3QwLCBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgICAgaWYgKG5vZGUueCA8IGxlZnQueCkgbGVmdCA9IG5vZGU7XG4gICAgICAgICAgaWYgKG5vZGUueCA+IHJpZ2h0LngpIHJpZ2h0ID0gbm9kZTtcbiAgICAgICAgICBpZiAobm9kZS5kZXB0aCA+IGJvdHRvbS5kZXB0aCkgYm90dG9tID0gbm9kZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciB0eCA9IHNlcGFyYXRpb24obGVmdCwgcmlnaHQpIC8gMiAtIGxlZnQueCwga3ggPSBzaXplWzBdIC8gKHJpZ2h0LnggKyBzZXBhcmF0aW9uKHJpZ2h0LCBsZWZ0KSAvIDIgKyB0eCksIGt5ID0gc2l6ZVsxXSAvIChib3R0b20uZGVwdGggfHwgMSk7XG4gICAgICAgIGQzX2xheW91dF9oaWVyYXJjaHlWaXNpdEJlZm9yZShyb290MCwgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgIG5vZGUueCA9IChub2RlLnggKyB0eCkgKiBreDtcbiAgICAgICAgICBub2RlLnkgPSBub2RlLmRlcHRoICoga3k7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5vZGVzO1xuICAgIH1cbiAgICBmdW5jdGlvbiB3cmFwVHJlZShyb290MCkge1xuICAgICAgdmFyIHJvb3QxID0ge1xuICAgICAgICBBOiBudWxsLFxuICAgICAgICBjaGlsZHJlbjogWyByb290MCBdXG4gICAgICB9LCBxdWV1ZSA9IFsgcm9vdDEgXSwgbm9kZTE7XG4gICAgICB3aGlsZSAoKG5vZGUxID0gcXVldWUucG9wKCkpICE9IG51bGwpIHtcbiAgICAgICAgZm9yICh2YXIgY2hpbGRyZW4gPSBub2RlMS5jaGlsZHJlbiwgY2hpbGQsIGkgPSAwLCBuID0gY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgICAgICAgcXVldWUucHVzaCgoY2hpbGRyZW5baV0gPSBjaGlsZCA9IHtcbiAgICAgICAgICAgIF86IGNoaWxkcmVuW2ldLFxuICAgICAgICAgICAgcGFyZW50OiBub2RlMSxcbiAgICAgICAgICAgIGNoaWxkcmVuOiAoY2hpbGQgPSBjaGlsZHJlbltpXS5jaGlsZHJlbikgJiYgY2hpbGQuc2xpY2UoKSB8fCBbXSxcbiAgICAgICAgICAgIEE6IG51bGwsXG4gICAgICAgICAgICBhOiBudWxsLFxuICAgICAgICAgICAgejogMCxcbiAgICAgICAgICAgIG06IDAsXG4gICAgICAgICAgICBjOiAwLFxuICAgICAgICAgICAgczogMCxcbiAgICAgICAgICAgIHQ6IG51bGwsXG4gICAgICAgICAgICBpOiBpXG4gICAgICAgICAgfSkuYSA9IGNoaWxkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJvb3QxLmNoaWxkcmVuWzBdO1xuICAgIH1cbiAgICBmdW5jdGlvbiBmaXJzdFdhbGsodikge1xuICAgICAgdmFyIGNoaWxkcmVuID0gdi5jaGlsZHJlbiwgc2libGluZ3MgPSB2LnBhcmVudC5jaGlsZHJlbiwgdyA9IHYuaSA/IHNpYmxpbmdzW3YuaSAtIDFdIDogbnVsbDtcbiAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgZDNfbGF5b3V0X3RyZWVTaGlmdCh2KTtcbiAgICAgICAgdmFyIG1pZHBvaW50ID0gKGNoaWxkcmVuWzBdLnogKyBjaGlsZHJlbltjaGlsZHJlbi5sZW5ndGggLSAxXS56KSAvIDI7XG4gICAgICAgIGlmICh3KSB7XG4gICAgICAgICAgdi56ID0gdy56ICsgc2VwYXJhdGlvbih2Ll8sIHcuXyk7XG4gICAgICAgICAgdi5tID0gdi56IC0gbWlkcG9pbnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdi56ID0gbWlkcG9pbnQ7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodykge1xuICAgICAgICB2LnogPSB3LnogKyBzZXBhcmF0aW9uKHYuXywgdy5fKTtcbiAgICAgIH1cbiAgICAgIHYucGFyZW50LkEgPSBhcHBvcnRpb24odiwgdywgdi5wYXJlbnQuQSB8fCBzaWJsaW5nc1swXSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHNlY29uZFdhbGsodikge1xuICAgICAgdi5fLnggPSB2LnogKyB2LnBhcmVudC5tO1xuICAgICAgdi5tICs9IHYucGFyZW50Lm07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGFwcG9ydGlvbih2LCB3LCBhbmNlc3Rvcikge1xuICAgICAgaWYgKHcpIHtcbiAgICAgICAgdmFyIHZpcCA9IHYsIHZvcCA9IHYsIHZpbSA9IHcsIHZvbSA9IHZpcC5wYXJlbnQuY2hpbGRyZW5bMF0sIHNpcCA9IHZpcC5tLCBzb3AgPSB2b3AubSwgc2ltID0gdmltLm0sIHNvbSA9IHZvbS5tLCBzaGlmdDtcbiAgICAgICAgd2hpbGUgKHZpbSA9IGQzX2xheW91dF90cmVlUmlnaHQodmltKSwgdmlwID0gZDNfbGF5b3V0X3RyZWVMZWZ0KHZpcCksIHZpbSAmJiB2aXApIHtcbiAgICAgICAgICB2b20gPSBkM19sYXlvdXRfdHJlZUxlZnQodm9tKTtcbiAgICAgICAgICB2b3AgPSBkM19sYXlvdXRfdHJlZVJpZ2h0KHZvcCk7XG4gICAgICAgICAgdm9wLmEgPSB2O1xuICAgICAgICAgIHNoaWZ0ID0gdmltLnogKyBzaW0gLSB2aXAueiAtIHNpcCArIHNlcGFyYXRpb24odmltLl8sIHZpcC5fKTtcbiAgICAgICAgICBpZiAoc2hpZnQgPiAwKSB7XG4gICAgICAgICAgICBkM19sYXlvdXRfdHJlZU1vdmUoZDNfbGF5b3V0X3RyZWVBbmNlc3Rvcih2aW0sIHYsIGFuY2VzdG9yKSwgdiwgc2hpZnQpO1xuICAgICAgICAgICAgc2lwICs9IHNoaWZ0O1xuICAgICAgICAgICAgc29wICs9IHNoaWZ0O1xuICAgICAgICAgIH1cbiAgICAgICAgICBzaW0gKz0gdmltLm07XG4gICAgICAgICAgc2lwICs9IHZpcC5tO1xuICAgICAgICAgIHNvbSArPSB2b20ubTtcbiAgICAgICAgICBzb3AgKz0gdm9wLm07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZpbSAmJiAhZDNfbGF5b3V0X3RyZWVSaWdodCh2b3ApKSB7XG4gICAgICAgICAgdm9wLnQgPSB2aW07XG4gICAgICAgICAgdm9wLm0gKz0gc2ltIC0gc29wO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2aXAgJiYgIWQzX2xheW91dF90cmVlTGVmdCh2b20pKSB7XG4gICAgICAgICAgdm9tLnQgPSB2aXA7XG4gICAgICAgICAgdm9tLm0gKz0gc2lwIC0gc29tO1xuICAgICAgICAgIGFuY2VzdG9yID0gdjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGFuY2VzdG9yO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzaXplTm9kZShub2RlKSB7XG4gICAgICBub2RlLnggKj0gc2l6ZVswXTtcbiAgICAgIG5vZGUueSA9IG5vZGUuZGVwdGggKiBzaXplWzFdO1xuICAgIH1cbiAgICB0cmVlLnNlcGFyYXRpb24gPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBzZXBhcmF0aW9uO1xuICAgICAgc2VwYXJhdGlvbiA9IHg7XG4gICAgICByZXR1cm4gdHJlZTtcbiAgICB9O1xuICAgIHRyZWUuc2l6ZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIG5vZGVTaXplID8gbnVsbCA6IHNpemU7XG4gICAgICBub2RlU2l6ZSA9IChzaXplID0geCkgPT0gbnVsbCA/IHNpemVOb2RlIDogbnVsbDtcbiAgICAgIHJldHVybiB0cmVlO1xuICAgIH07XG4gICAgdHJlZS5ub2RlU2l6ZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIG5vZGVTaXplID8gc2l6ZSA6IG51bGw7XG4gICAgICBub2RlU2l6ZSA9IChzaXplID0geCkgPT0gbnVsbCA/IG51bGwgOiBzaXplTm9kZTtcbiAgICAgIHJldHVybiB0cmVlO1xuICAgIH07XG4gICAgcmV0dXJuIGQzX2xheW91dF9oaWVyYXJjaHlSZWJpbmQodHJlZSwgaGllcmFyY2h5KTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfbGF5b3V0X3RyZWVTZXBhcmF0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gYS5wYXJlbnQgPT0gYi5wYXJlbnQgPyAxIDogMjtcbiAgfVxuICBmdW5jdGlvbiBkM19sYXlvdXRfdHJlZUxlZnQodikge1xuICAgIHZhciBjaGlsZHJlbiA9IHYuY2hpbGRyZW47XG4gICAgcmV0dXJuIGNoaWxkcmVuLmxlbmd0aCA/IGNoaWxkcmVuWzBdIDogdi50O1xuICB9XG4gIGZ1bmN0aW9uIGQzX2xheW91dF90cmVlUmlnaHQodikge1xuICAgIHZhciBjaGlsZHJlbiA9IHYuY2hpbGRyZW4sIG47XG4gICAgcmV0dXJuIChuID0gY2hpbGRyZW4ubGVuZ3RoKSA/IGNoaWxkcmVuW24gLSAxXSA6IHYudDtcbiAgfVxuICBmdW5jdGlvbiBkM19sYXlvdXRfdHJlZU1vdmUod20sIHdwLCBzaGlmdCkge1xuICAgIHZhciBjaGFuZ2UgPSBzaGlmdCAvICh3cC5pIC0gd20uaSk7XG4gICAgd3AuYyAtPSBjaGFuZ2U7XG4gICAgd3AucyArPSBzaGlmdDtcbiAgICB3bS5jICs9IGNoYW5nZTtcbiAgICB3cC56ICs9IHNoaWZ0O1xuICAgIHdwLm0gKz0gc2hpZnQ7XG4gIH1cbiAgZnVuY3Rpb24gZDNfbGF5b3V0X3RyZWVTaGlmdCh2KSB7XG4gICAgdmFyIHNoaWZ0ID0gMCwgY2hhbmdlID0gMCwgY2hpbGRyZW4gPSB2LmNoaWxkcmVuLCBpID0gY2hpbGRyZW4ubGVuZ3RoLCB3O1xuICAgIHdoaWxlICgtLWkgPj0gMCkge1xuICAgICAgdyA9IGNoaWxkcmVuW2ldO1xuICAgICAgdy56ICs9IHNoaWZ0O1xuICAgICAgdy5tICs9IHNoaWZ0O1xuICAgICAgc2hpZnQgKz0gdy5zICsgKGNoYW5nZSArPSB3LmMpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBkM19sYXlvdXRfdHJlZUFuY2VzdG9yKHZpbSwgdiwgYW5jZXN0b3IpIHtcbiAgICByZXR1cm4gdmltLmEucGFyZW50ID09PSB2LnBhcmVudCA/IHZpbS5hIDogYW5jZXN0b3I7XG4gIH1cbiAgZDMubGF5b3V0LmNsdXN0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaGllcmFyY2h5ID0gZDMubGF5b3V0LmhpZXJhcmNoeSgpLnNvcnQobnVsbCkudmFsdWUobnVsbCksIHNlcGFyYXRpb24gPSBkM19sYXlvdXRfdHJlZVNlcGFyYXRpb24sIHNpemUgPSBbIDEsIDEgXSwgbm9kZVNpemUgPSBmYWxzZTtcbiAgICBmdW5jdGlvbiBjbHVzdGVyKGQsIGkpIHtcbiAgICAgIHZhciBub2RlcyA9IGhpZXJhcmNoeS5jYWxsKHRoaXMsIGQsIGkpLCByb290ID0gbm9kZXNbMF0sIHByZXZpb3VzTm9kZSwgeCA9IDA7XG4gICAgICBkM19sYXlvdXRfaGllcmFyY2h5VmlzaXRBZnRlcihyb290LCBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW47XG4gICAgICAgIGlmIChjaGlsZHJlbiAmJiBjaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgICBub2RlLnggPSBkM19sYXlvdXRfY2x1c3RlclgoY2hpbGRyZW4pO1xuICAgICAgICAgIG5vZGUueSA9IGQzX2xheW91dF9jbHVzdGVyWShjaGlsZHJlbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbm9kZS54ID0gcHJldmlvdXNOb2RlID8geCArPSBzZXBhcmF0aW9uKG5vZGUsIHByZXZpb3VzTm9kZSkgOiAwO1xuICAgICAgICAgIG5vZGUueSA9IDA7XG4gICAgICAgICAgcHJldmlvdXNOb2RlID0gbm9kZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB2YXIgbGVmdCA9IGQzX2xheW91dF9jbHVzdGVyTGVmdChyb290KSwgcmlnaHQgPSBkM19sYXlvdXRfY2x1c3RlclJpZ2h0KHJvb3QpLCB4MCA9IGxlZnQueCAtIHNlcGFyYXRpb24obGVmdCwgcmlnaHQpIC8gMiwgeDEgPSByaWdodC54ICsgc2VwYXJhdGlvbihyaWdodCwgbGVmdCkgLyAyO1xuICAgICAgZDNfbGF5b3V0X2hpZXJhcmNoeVZpc2l0QWZ0ZXIocm9vdCwgbm9kZVNpemUgPyBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgIG5vZGUueCA9IChub2RlLnggLSByb290LngpICogc2l6ZVswXTtcbiAgICAgICAgbm9kZS55ID0gKHJvb3QueSAtIG5vZGUueSkgKiBzaXplWzFdO1xuICAgICAgfSA6IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgbm9kZS54ID0gKG5vZGUueCAtIHgwKSAvICh4MSAtIHgwKSAqIHNpemVbMF07XG4gICAgICAgIG5vZGUueSA9ICgxIC0gKHJvb3QueSA/IG5vZGUueSAvIHJvb3QueSA6IDEpKSAqIHNpemVbMV07XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBub2RlcztcbiAgICB9XG4gICAgY2x1c3Rlci5zZXBhcmF0aW9uID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gc2VwYXJhdGlvbjtcbiAgICAgIHNlcGFyYXRpb24gPSB4O1xuICAgICAgcmV0dXJuIGNsdXN0ZXI7XG4gICAgfTtcbiAgICBjbHVzdGVyLnNpemUgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBub2RlU2l6ZSA/IG51bGwgOiBzaXplO1xuICAgICAgbm9kZVNpemUgPSAoc2l6ZSA9IHgpID09IG51bGw7XG4gICAgICByZXR1cm4gY2x1c3RlcjtcbiAgICB9O1xuICAgIGNsdXN0ZXIubm9kZVNpemUgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBub2RlU2l6ZSA/IHNpemUgOiBudWxsO1xuICAgICAgbm9kZVNpemUgPSAoc2l6ZSA9IHgpICE9IG51bGw7XG4gICAgICByZXR1cm4gY2x1c3RlcjtcbiAgICB9O1xuICAgIHJldHVybiBkM19sYXlvdXRfaGllcmFyY2h5UmViaW5kKGNsdXN0ZXIsIGhpZXJhcmNoeSk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX2xheW91dF9jbHVzdGVyWShjaGlsZHJlbikge1xuICAgIHJldHVybiAxICsgZDMubWF4KGNoaWxkcmVuLCBmdW5jdGlvbihjaGlsZCkge1xuICAgICAgcmV0dXJuIGNoaWxkLnk7XG4gICAgfSk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfbGF5b3V0X2NsdXN0ZXJYKGNoaWxkcmVuKSB7XG4gICAgcmV0dXJuIGNoaWxkcmVuLnJlZHVjZShmdW5jdGlvbih4LCBjaGlsZCkge1xuICAgICAgcmV0dXJuIHggKyBjaGlsZC54O1xuICAgIH0sIDApIC8gY2hpbGRyZW4ubGVuZ3RoO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2xheW91dF9jbHVzdGVyTGVmdChub2RlKSB7XG4gICAgdmFyIGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbjtcbiAgICByZXR1cm4gY2hpbGRyZW4gJiYgY2hpbGRyZW4ubGVuZ3RoID8gZDNfbGF5b3V0X2NsdXN0ZXJMZWZ0KGNoaWxkcmVuWzBdKSA6IG5vZGU7XG4gIH1cbiAgZnVuY3Rpb24gZDNfbGF5b3V0X2NsdXN0ZXJSaWdodChub2RlKSB7XG4gICAgdmFyIGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbiwgbjtcbiAgICByZXR1cm4gY2hpbGRyZW4gJiYgKG4gPSBjaGlsZHJlbi5sZW5ndGgpID8gZDNfbGF5b3V0X2NsdXN0ZXJSaWdodChjaGlsZHJlbltuIC0gMV0pIDogbm9kZTtcbiAgfVxuICBkMy5sYXlvdXQudHJlZW1hcCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBoaWVyYXJjaHkgPSBkMy5sYXlvdXQuaGllcmFyY2h5KCksIHJvdW5kID0gTWF0aC5yb3VuZCwgc2l6ZSA9IFsgMSwgMSBdLCBwYWRkaW5nID0gbnVsbCwgcGFkID0gZDNfbGF5b3V0X3RyZWVtYXBQYWROdWxsLCBzdGlja3kgPSBmYWxzZSwgc3RpY2tpZXMsIG1vZGUgPSBcInNxdWFyaWZ5XCIsIHJhdGlvID0gLjUgKiAoMSArIE1hdGguc3FydCg1KSk7XG4gICAgZnVuY3Rpb24gc2NhbGUoY2hpbGRyZW4sIGspIHtcbiAgICAgIHZhciBpID0gLTEsIG4gPSBjaGlsZHJlbi5sZW5ndGgsIGNoaWxkLCBhcmVhO1xuICAgICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgICAgYXJlYSA9IChjaGlsZCA9IGNoaWxkcmVuW2ldKS52YWx1ZSAqIChrIDwgMCA/IDAgOiBrKTtcbiAgICAgICAgY2hpbGQuYXJlYSA9IGlzTmFOKGFyZWEpIHx8IGFyZWEgPD0gMCA/IDAgOiBhcmVhO1xuICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBzcXVhcmlmeShub2RlKSB7XG4gICAgICB2YXIgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuO1xuICAgICAgaWYgKGNoaWxkcmVuICYmIGNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICB2YXIgcmVjdCA9IHBhZChub2RlKSwgcm93ID0gW10sIHJlbWFpbmluZyA9IGNoaWxkcmVuLnNsaWNlKCksIGNoaWxkLCBiZXN0ID0gSW5maW5pdHksIHNjb3JlLCB1ID0gbW9kZSA9PT0gXCJzbGljZVwiID8gcmVjdC5keCA6IG1vZGUgPT09IFwiZGljZVwiID8gcmVjdC5keSA6IG1vZGUgPT09IFwic2xpY2UtZGljZVwiID8gbm9kZS5kZXB0aCAmIDEgPyByZWN0LmR5IDogcmVjdC5keCA6IE1hdGgubWluKHJlY3QuZHgsIHJlY3QuZHkpLCBuO1xuICAgICAgICBzY2FsZShyZW1haW5pbmcsIHJlY3QuZHggKiByZWN0LmR5IC8gbm9kZS52YWx1ZSk7XG4gICAgICAgIHJvdy5hcmVhID0gMDtcbiAgICAgICAgd2hpbGUgKChuID0gcmVtYWluaW5nLmxlbmd0aCkgPiAwKSB7XG4gICAgICAgICAgcm93LnB1c2goY2hpbGQgPSByZW1haW5pbmdbbiAtIDFdKTtcbiAgICAgICAgICByb3cuYXJlYSArPSBjaGlsZC5hcmVhO1xuICAgICAgICAgIGlmIChtb2RlICE9PSBcInNxdWFyaWZ5XCIgfHwgKHNjb3JlID0gd29yc3Qocm93LCB1KSkgPD0gYmVzdCkge1xuICAgICAgICAgICAgcmVtYWluaW5nLnBvcCgpO1xuICAgICAgICAgICAgYmVzdCA9IHNjb3JlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByb3cuYXJlYSAtPSByb3cucG9wKCkuYXJlYTtcbiAgICAgICAgICAgIHBvc2l0aW9uKHJvdywgdSwgcmVjdCwgZmFsc2UpO1xuICAgICAgICAgICAgdSA9IE1hdGgubWluKHJlY3QuZHgsIHJlY3QuZHkpO1xuICAgICAgICAgICAgcm93Lmxlbmd0aCA9IHJvdy5hcmVhID0gMDtcbiAgICAgICAgICAgIGJlc3QgPSBJbmZpbml0eTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJvdy5sZW5ndGgpIHtcbiAgICAgICAgICBwb3NpdGlvbihyb3csIHUsIHJlY3QsIHRydWUpO1xuICAgICAgICAgIHJvdy5sZW5ndGggPSByb3cuYXJlYSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgY2hpbGRyZW4uZm9yRWFjaChzcXVhcmlmeSk7XG4gICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHN0aWNraWZ5KG5vZGUpIHtcbiAgICAgIHZhciBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW47XG4gICAgICBpZiAoY2hpbGRyZW4gJiYgY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgIHZhciByZWN0ID0gcGFkKG5vZGUpLCByZW1haW5pbmcgPSBjaGlsZHJlbi5zbGljZSgpLCBjaGlsZCwgcm93ID0gW107XG4gICAgICAgIHNjYWxlKHJlbWFpbmluZywgcmVjdC5keCAqIHJlY3QuZHkgLyBub2RlLnZhbHVlKTtcbiAgICAgICAgcm93LmFyZWEgPSAwO1xuICAgICAgICB3aGlsZSAoY2hpbGQgPSByZW1haW5pbmcucG9wKCkpIHtcbiAgICAgICAgICByb3cucHVzaChjaGlsZCk7XG4gICAgICAgICAgcm93LmFyZWEgKz0gY2hpbGQuYXJlYTtcbiAgICAgICAgICBpZiAoY2hpbGQueiAhPSBudWxsKSB7XG4gICAgICAgICAgICBwb3NpdGlvbihyb3csIGNoaWxkLnogPyByZWN0LmR4IDogcmVjdC5keSwgcmVjdCwgIXJlbWFpbmluZy5sZW5ndGgpO1xuICAgICAgICAgICAgcm93Lmxlbmd0aCA9IHJvdy5hcmVhID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2hpbGRyZW4uZm9yRWFjaChzdGlja2lmeSk7XG4gICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHdvcnN0KHJvdywgdSkge1xuICAgICAgdmFyIHMgPSByb3cuYXJlYSwgciwgcm1heCA9IDAsIHJtaW4gPSBJbmZpbml0eSwgaSA9IC0xLCBuID0gcm93Lmxlbmd0aDtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgIGlmICghKHIgPSByb3dbaV0uYXJlYSkpIGNvbnRpbnVlO1xuICAgICAgICBpZiAociA8IHJtaW4pIHJtaW4gPSByO1xuICAgICAgICBpZiAociA+IHJtYXgpIHJtYXggPSByO1xuICAgICAgfVxuICAgICAgcyAqPSBzO1xuICAgICAgdSAqPSB1O1xuICAgICAgcmV0dXJuIHMgPyBNYXRoLm1heCh1ICogcm1heCAqIHJhdGlvIC8gcywgcyAvICh1ICogcm1pbiAqIHJhdGlvKSkgOiBJbmZpbml0eTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcG9zaXRpb24ocm93LCB1LCByZWN0LCBmbHVzaCkge1xuICAgICAgdmFyIGkgPSAtMSwgbiA9IHJvdy5sZW5ndGgsIHggPSByZWN0LngsIHkgPSByZWN0LnksIHYgPSB1ID8gcm91bmQocm93LmFyZWEgLyB1KSA6IDAsIG87XG4gICAgICBpZiAodSA9PSByZWN0LmR4KSB7XG4gICAgICAgIGlmIChmbHVzaCB8fCB2ID4gcmVjdC5keSkgdiA9IHJlY3QuZHk7XG4gICAgICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgICAgbyA9IHJvd1tpXTtcbiAgICAgICAgICBvLnggPSB4O1xuICAgICAgICAgIG8ueSA9IHk7XG4gICAgICAgICAgby5keSA9IHY7XG4gICAgICAgICAgeCArPSBvLmR4ID0gTWF0aC5taW4ocmVjdC54ICsgcmVjdC5keCAtIHgsIHYgPyByb3VuZChvLmFyZWEgLyB2KSA6IDApO1xuICAgICAgICB9XG4gICAgICAgIG8ueiA9IHRydWU7XG4gICAgICAgIG8uZHggKz0gcmVjdC54ICsgcmVjdC5keCAtIHg7XG4gICAgICAgIHJlY3QueSArPSB2O1xuICAgICAgICByZWN0LmR5IC09IHY7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZmx1c2ggfHwgdiA+IHJlY3QuZHgpIHYgPSByZWN0LmR4O1xuICAgICAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgICAgIG8gPSByb3dbaV07XG4gICAgICAgICAgby54ID0geDtcbiAgICAgICAgICBvLnkgPSB5O1xuICAgICAgICAgIG8uZHggPSB2O1xuICAgICAgICAgIHkgKz0gby5keSA9IE1hdGgubWluKHJlY3QueSArIHJlY3QuZHkgLSB5LCB2ID8gcm91bmQoby5hcmVhIC8gdikgOiAwKTtcbiAgICAgICAgfVxuICAgICAgICBvLnogPSBmYWxzZTtcbiAgICAgICAgby5keSArPSByZWN0LnkgKyByZWN0LmR5IC0geTtcbiAgICAgICAgcmVjdC54ICs9IHY7XG4gICAgICAgIHJlY3QuZHggLT0gdjtcbiAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gdHJlZW1hcChkKSB7XG4gICAgICB2YXIgbm9kZXMgPSBzdGlja2llcyB8fCBoaWVyYXJjaHkoZCksIHJvb3QgPSBub2Rlc1swXTtcbiAgICAgIHJvb3QueCA9IDA7XG4gICAgICByb290LnkgPSAwO1xuICAgICAgcm9vdC5keCA9IHNpemVbMF07XG4gICAgICByb290LmR5ID0gc2l6ZVsxXTtcbiAgICAgIGlmIChzdGlja2llcykgaGllcmFyY2h5LnJldmFsdWUocm9vdCk7XG4gICAgICBzY2FsZShbIHJvb3QgXSwgcm9vdC5keCAqIHJvb3QuZHkgLyByb290LnZhbHVlKTtcbiAgICAgIChzdGlja2llcyA/IHN0aWNraWZ5IDogc3F1YXJpZnkpKHJvb3QpO1xuICAgICAgaWYgKHN0aWNreSkgc3RpY2tpZXMgPSBub2RlcztcbiAgICAgIHJldHVybiBub2RlcztcbiAgICB9XG4gICAgdHJlZW1hcC5zaXplID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gc2l6ZTtcbiAgICAgIHNpemUgPSB4O1xuICAgICAgcmV0dXJuIHRyZWVtYXA7XG4gICAgfTtcbiAgICB0cmVlbWFwLnBhZGRpbmcgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBwYWRkaW5nO1xuICAgICAgZnVuY3Rpb24gcGFkRnVuY3Rpb24obm9kZSkge1xuICAgICAgICB2YXIgcCA9IHguY2FsbCh0cmVlbWFwLCBub2RlLCBub2RlLmRlcHRoKTtcbiAgICAgICAgcmV0dXJuIHAgPT0gbnVsbCA/IGQzX2xheW91dF90cmVlbWFwUGFkTnVsbChub2RlKSA6IGQzX2xheW91dF90cmVlbWFwUGFkKG5vZGUsIHR5cGVvZiBwID09PSBcIm51bWJlclwiID8gWyBwLCBwLCBwLCBwIF0gOiBwKTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIHBhZENvbnN0YW50KG5vZGUpIHtcbiAgICAgICAgcmV0dXJuIGQzX2xheW91dF90cmVlbWFwUGFkKG5vZGUsIHgpO1xuICAgICAgfVxuICAgICAgdmFyIHR5cGU7XG4gICAgICBwYWQgPSAocGFkZGluZyA9IHgpID09IG51bGwgPyBkM19sYXlvdXRfdHJlZW1hcFBhZE51bGwgOiAodHlwZSA9IHR5cGVvZiB4KSA9PT0gXCJmdW5jdGlvblwiID8gcGFkRnVuY3Rpb24gOiB0eXBlID09PSBcIm51bWJlclwiID8gKHggPSBbIHgsIHgsIHgsIHggXSwgXG4gICAgICBwYWRDb25zdGFudCkgOiBwYWRDb25zdGFudDtcbiAgICAgIHJldHVybiB0cmVlbWFwO1xuICAgIH07XG4gICAgdHJlZW1hcC5yb3VuZCA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHJvdW5kICE9IE51bWJlcjtcbiAgICAgIHJvdW5kID0geCA/IE1hdGgucm91bmQgOiBOdW1iZXI7XG4gICAgICByZXR1cm4gdHJlZW1hcDtcbiAgICB9O1xuICAgIHRyZWVtYXAuc3RpY2t5ID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gc3RpY2t5O1xuICAgICAgc3RpY2t5ID0geDtcbiAgICAgIHN0aWNraWVzID0gbnVsbDtcbiAgICAgIHJldHVybiB0cmVlbWFwO1xuICAgIH07XG4gICAgdHJlZW1hcC5yYXRpbyA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHJhdGlvO1xuICAgICAgcmF0aW8gPSB4O1xuICAgICAgcmV0dXJuIHRyZWVtYXA7XG4gICAgfTtcbiAgICB0cmVlbWFwLm1vZGUgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBtb2RlO1xuICAgICAgbW9kZSA9IHggKyBcIlwiO1xuICAgICAgcmV0dXJuIHRyZWVtYXA7XG4gICAgfTtcbiAgICByZXR1cm4gZDNfbGF5b3V0X2hpZXJhcmNoeVJlYmluZCh0cmVlbWFwLCBoaWVyYXJjaHkpO1xuICB9O1xuICBmdW5jdGlvbiBkM19sYXlvdXRfdHJlZW1hcFBhZE51bGwobm9kZSkge1xuICAgIHJldHVybiB7XG4gICAgICB4OiBub2RlLngsXG4gICAgICB5OiBub2RlLnksXG4gICAgICBkeDogbm9kZS5keCxcbiAgICAgIGR5OiBub2RlLmR5XG4gICAgfTtcbiAgfVxuICBmdW5jdGlvbiBkM19sYXlvdXRfdHJlZW1hcFBhZChub2RlLCBwYWRkaW5nKSB7XG4gICAgdmFyIHggPSBub2RlLnggKyBwYWRkaW5nWzNdLCB5ID0gbm9kZS55ICsgcGFkZGluZ1swXSwgZHggPSBub2RlLmR4IC0gcGFkZGluZ1sxXSAtIHBhZGRpbmdbM10sIGR5ID0gbm9kZS5keSAtIHBhZGRpbmdbMF0gLSBwYWRkaW5nWzJdO1xuICAgIGlmIChkeCA8IDApIHtcbiAgICAgIHggKz0gZHggLyAyO1xuICAgICAgZHggPSAwO1xuICAgIH1cbiAgICBpZiAoZHkgPCAwKSB7XG4gICAgICB5ICs9IGR5IC8gMjtcbiAgICAgIGR5ID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IHgsXG4gICAgICB5OiB5LFxuICAgICAgZHg6IGR4LFxuICAgICAgZHk6IGR5XG4gICAgfTtcbiAgfVxuICBkMy5yYW5kb20gPSB7XG4gICAgbm9ybWFsOiBmdW5jdGlvbijCtSwgz4MpIHtcbiAgICAgIHZhciBuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgIGlmIChuIDwgMikgz4MgPSAxO1xuICAgICAgaWYgKG4gPCAxKSDCtSA9IDA7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB4LCB5LCByO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgeCA9IE1hdGgucmFuZG9tKCkgKiAyIC0gMTtcbiAgICAgICAgICB5ID0gTWF0aC5yYW5kb20oKSAqIDIgLSAxO1xuICAgICAgICAgIHIgPSB4ICogeCArIHkgKiB5O1xuICAgICAgICB9IHdoaWxlICghciB8fCByID4gMSk7XG4gICAgICAgIHJldHVybiDCtSArIM+DICogeCAqIE1hdGguc3FydCgtMiAqIE1hdGgubG9nKHIpIC8gcik7XG4gICAgICB9O1xuICAgIH0sXG4gICAgbG9nTm9ybWFsOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciByYW5kb20gPSBkMy5yYW5kb20ubm9ybWFsLmFwcGx5KGQzLCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gTWF0aC5leHAocmFuZG9tKCkpO1xuICAgICAgfTtcbiAgICB9LFxuICAgIGJhdGVzOiBmdW5jdGlvbihtKSB7XG4gICAgICB2YXIgcmFuZG9tID0gZDMucmFuZG9tLmlyd2luSGFsbChtKTtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHJhbmRvbSgpIC8gbTtcbiAgICAgIH07XG4gICAgfSxcbiAgICBpcndpbkhhbGw6IGZ1bmN0aW9uKG0pIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgZm9yICh2YXIgcyA9IDAsIGogPSAwOyBqIDwgbTsgaisrKSBzICs9IE1hdGgucmFuZG9tKCk7XG4gICAgICAgIHJldHVybiBzO1xuICAgICAgfTtcbiAgICB9XG4gIH07XG4gIGQzLnNjYWxlID0ge307XG4gIGZ1bmN0aW9uIGQzX3NjYWxlRXh0ZW50KGRvbWFpbikge1xuICAgIHZhciBzdGFydCA9IGRvbWFpblswXSwgc3RvcCA9IGRvbWFpbltkb21haW4ubGVuZ3RoIC0gMV07XG4gICAgcmV0dXJuIHN0YXJ0IDwgc3RvcCA/IFsgc3RhcnQsIHN0b3AgXSA6IFsgc3RvcCwgc3RhcnQgXTtcbiAgfVxuICBmdW5jdGlvbiBkM19zY2FsZVJhbmdlKHNjYWxlKSB7XG4gICAgcmV0dXJuIHNjYWxlLnJhbmdlRXh0ZW50ID8gc2NhbGUucmFuZ2VFeHRlbnQoKSA6IGQzX3NjYWxlRXh0ZW50KHNjYWxlLnJhbmdlKCkpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3NjYWxlX2JpbGluZWFyKGRvbWFpbiwgcmFuZ2UsIHVuaW50ZXJwb2xhdGUsIGludGVycG9sYXRlKSB7XG4gICAgdmFyIHUgPSB1bmludGVycG9sYXRlKGRvbWFpblswXSwgZG9tYWluWzFdKSwgaSA9IGludGVycG9sYXRlKHJhbmdlWzBdLCByYW5nZVsxXSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHgpIHtcbiAgICAgIHJldHVybiBpKHUoeCkpO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZDNfc2NhbGVfbmljZShkb21haW4sIG5pY2UpIHtcbiAgICB2YXIgaTAgPSAwLCBpMSA9IGRvbWFpbi5sZW5ndGggLSAxLCB4MCA9IGRvbWFpbltpMF0sIHgxID0gZG9tYWluW2kxXSwgZHg7XG4gICAgaWYgKHgxIDwgeDApIHtcbiAgICAgIGR4ID0gaTAsIGkwID0gaTEsIGkxID0gZHg7XG4gICAgICBkeCA9IHgwLCB4MCA9IHgxLCB4MSA9IGR4O1xuICAgIH1cbiAgICBkb21haW5baTBdID0gbmljZS5mbG9vcih4MCk7XG4gICAgZG9tYWluW2kxXSA9IG5pY2UuY2VpbCh4MSk7XG4gICAgcmV0dXJuIGRvbWFpbjtcbiAgfVxuICBmdW5jdGlvbiBkM19zY2FsZV9uaWNlU3RlcChzdGVwKSB7XG4gICAgcmV0dXJuIHN0ZXAgPyB7XG4gICAgICBmbG9vcjogZnVuY3Rpb24oeCkge1xuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcih4IC8gc3RlcCkgKiBzdGVwO1xuICAgICAgfSxcbiAgICAgIGNlaWw6IGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguY2VpbCh4IC8gc3RlcCkgKiBzdGVwO1xuICAgICAgfVxuICAgIH0gOiBkM19zY2FsZV9uaWNlSWRlbnRpdHk7XG4gIH1cbiAgdmFyIGQzX3NjYWxlX25pY2VJZGVudGl0eSA9IHtcbiAgICBmbG9vcjogZDNfaWRlbnRpdHksXG4gICAgY2VpbDogZDNfaWRlbnRpdHlcbiAgfTtcbiAgZnVuY3Rpb24gZDNfc2NhbGVfcG9seWxpbmVhcihkb21haW4sIHJhbmdlLCB1bmludGVycG9sYXRlLCBpbnRlcnBvbGF0ZSkge1xuICAgIHZhciB1ID0gW10sIGkgPSBbXSwgaiA9IDAsIGsgPSBNYXRoLm1pbihkb21haW4ubGVuZ3RoLCByYW5nZS5sZW5ndGgpIC0gMTtcbiAgICBpZiAoZG9tYWluW2tdIDwgZG9tYWluWzBdKSB7XG4gICAgICBkb21haW4gPSBkb21haW4uc2xpY2UoKS5yZXZlcnNlKCk7XG4gICAgICByYW5nZSA9IHJhbmdlLnNsaWNlKCkucmV2ZXJzZSgpO1xuICAgIH1cbiAgICB3aGlsZSAoKytqIDw9IGspIHtcbiAgICAgIHUucHVzaCh1bmludGVycG9sYXRlKGRvbWFpbltqIC0gMV0sIGRvbWFpbltqXSkpO1xuICAgICAgaS5wdXNoKGludGVycG9sYXRlKHJhbmdlW2ogLSAxXSwgcmFuZ2Vbal0pKTtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHgpIHtcbiAgICAgIHZhciBqID0gZDMuYmlzZWN0KGRvbWFpbiwgeCwgMSwgaykgLSAxO1xuICAgICAgcmV0dXJuIGlbal0odVtqXSh4KSk7XG4gICAgfTtcbiAgfVxuICBkMy5zY2FsZS5saW5lYXIgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDNfc2NhbGVfbGluZWFyKFsgMCwgMSBdLCBbIDAsIDEgXSwgZDNfaW50ZXJwb2xhdGUsIGZhbHNlKTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfc2NhbGVfbGluZWFyKGRvbWFpbiwgcmFuZ2UsIGludGVycG9sYXRlLCBjbGFtcCkge1xuICAgIHZhciBvdXRwdXQsIGlucHV0O1xuICAgIGZ1bmN0aW9uIHJlc2NhbGUoKSB7XG4gICAgICB2YXIgbGluZWFyID0gTWF0aC5taW4oZG9tYWluLmxlbmd0aCwgcmFuZ2UubGVuZ3RoKSA+IDIgPyBkM19zY2FsZV9wb2x5bGluZWFyIDogZDNfc2NhbGVfYmlsaW5lYXIsIHVuaW50ZXJwb2xhdGUgPSBjbGFtcCA/IGQzX3VuaW50ZXJwb2xhdGVDbGFtcCA6IGQzX3VuaW50ZXJwb2xhdGVOdW1iZXI7XG4gICAgICBvdXRwdXQgPSBsaW5lYXIoZG9tYWluLCByYW5nZSwgdW5pbnRlcnBvbGF0ZSwgaW50ZXJwb2xhdGUpO1xuICAgICAgaW5wdXQgPSBsaW5lYXIocmFuZ2UsIGRvbWFpbiwgdW5pbnRlcnBvbGF0ZSwgZDNfaW50ZXJwb2xhdGUpO1xuICAgICAgcmV0dXJuIHNjYWxlO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzY2FsZSh4KSB7XG4gICAgICByZXR1cm4gb3V0cHV0KHgpO1xuICAgIH1cbiAgICBzY2FsZS5pbnZlcnQgPSBmdW5jdGlvbih5KSB7XG4gICAgICByZXR1cm4gaW5wdXQoeSk7XG4gICAgfTtcbiAgICBzY2FsZS5kb21haW4gPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBkb21haW47XG4gICAgICBkb21haW4gPSB4Lm1hcChOdW1iZXIpO1xuICAgICAgcmV0dXJuIHJlc2NhbGUoKTtcbiAgICB9O1xuICAgIHNjYWxlLnJhbmdlID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gcmFuZ2U7XG4gICAgICByYW5nZSA9IHg7XG4gICAgICByZXR1cm4gcmVzY2FsZSgpO1xuICAgIH07XG4gICAgc2NhbGUucmFuZ2VSb3VuZCA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIHJldHVybiBzY2FsZS5yYW5nZSh4KS5pbnRlcnBvbGF0ZShkM19pbnRlcnBvbGF0ZVJvdW5kKTtcbiAgICB9O1xuICAgIHNjYWxlLmNsYW1wID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gY2xhbXA7XG4gICAgICBjbGFtcCA9IHg7XG4gICAgICByZXR1cm4gcmVzY2FsZSgpO1xuICAgIH07XG4gICAgc2NhbGUuaW50ZXJwb2xhdGUgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBpbnRlcnBvbGF0ZTtcbiAgICAgIGludGVycG9sYXRlID0geDtcbiAgICAgIHJldHVybiByZXNjYWxlKCk7XG4gICAgfTtcbiAgICBzY2FsZS50aWNrcyA9IGZ1bmN0aW9uKG0pIHtcbiAgICAgIHJldHVybiBkM19zY2FsZV9saW5lYXJUaWNrcyhkb21haW4sIG0pO1xuICAgIH07XG4gICAgc2NhbGUudGlja0Zvcm1hdCA9IGZ1bmN0aW9uKG0sIGZvcm1hdCkge1xuICAgICAgcmV0dXJuIGQzX3NjYWxlX2xpbmVhclRpY2tGb3JtYXQoZG9tYWluLCBtLCBmb3JtYXQpO1xuICAgIH07XG4gICAgc2NhbGUubmljZSA9IGZ1bmN0aW9uKG0pIHtcbiAgICAgIGQzX3NjYWxlX2xpbmVhck5pY2UoZG9tYWluLCBtKTtcbiAgICAgIHJldHVybiByZXNjYWxlKCk7XG4gICAgfTtcbiAgICBzY2FsZS5jb3B5ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZDNfc2NhbGVfbGluZWFyKGRvbWFpbiwgcmFuZ2UsIGludGVycG9sYXRlLCBjbGFtcCk7XG4gICAgfTtcbiAgICByZXR1cm4gcmVzY2FsZSgpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3NjYWxlX2xpbmVhclJlYmluZChzY2FsZSwgbGluZWFyKSB7XG4gICAgcmV0dXJuIGQzLnJlYmluZChzY2FsZSwgbGluZWFyLCBcInJhbmdlXCIsIFwicmFuZ2VSb3VuZFwiLCBcImludGVycG9sYXRlXCIsIFwiY2xhbXBcIik7XG4gIH1cbiAgZnVuY3Rpb24gZDNfc2NhbGVfbGluZWFyTmljZShkb21haW4sIG0pIHtcbiAgICByZXR1cm4gZDNfc2NhbGVfbmljZShkb21haW4sIGQzX3NjYWxlX25pY2VTdGVwKGQzX3NjYWxlX2xpbmVhclRpY2tSYW5nZShkb21haW4sIG0pWzJdKSk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfc2NhbGVfbGluZWFyVGlja1JhbmdlKGRvbWFpbiwgbSkge1xuICAgIGlmIChtID09IG51bGwpIG0gPSAxMDtcbiAgICB2YXIgZXh0ZW50ID0gZDNfc2NhbGVFeHRlbnQoZG9tYWluKSwgc3BhbiA9IGV4dGVudFsxXSAtIGV4dGVudFswXSwgc3RlcCA9IE1hdGgucG93KDEwLCBNYXRoLmZsb29yKE1hdGgubG9nKHNwYW4gLyBtKSAvIE1hdGguTE4xMCkpLCBlcnIgPSBtIC8gc3BhbiAqIHN0ZXA7XG4gICAgaWYgKGVyciA8PSAuMTUpIHN0ZXAgKj0gMTA7IGVsc2UgaWYgKGVyciA8PSAuMzUpIHN0ZXAgKj0gNTsgZWxzZSBpZiAoZXJyIDw9IC43NSkgc3RlcCAqPSAyO1xuICAgIGV4dGVudFswXSA9IE1hdGguY2VpbChleHRlbnRbMF0gLyBzdGVwKSAqIHN0ZXA7XG4gICAgZXh0ZW50WzFdID0gTWF0aC5mbG9vcihleHRlbnRbMV0gLyBzdGVwKSAqIHN0ZXAgKyBzdGVwICogLjU7XG4gICAgZXh0ZW50WzJdID0gc3RlcDtcbiAgICByZXR1cm4gZXh0ZW50O1xuICB9XG4gIGZ1bmN0aW9uIGQzX3NjYWxlX2xpbmVhclRpY2tzKGRvbWFpbiwgbSkge1xuICAgIHJldHVybiBkMy5yYW5nZS5hcHBseShkMywgZDNfc2NhbGVfbGluZWFyVGlja1JhbmdlKGRvbWFpbiwgbSkpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3NjYWxlX2xpbmVhclRpY2tGb3JtYXQoZG9tYWluLCBtLCBmb3JtYXQpIHtcbiAgICB2YXIgcmFuZ2UgPSBkM19zY2FsZV9saW5lYXJUaWNrUmFuZ2UoZG9tYWluLCBtKTtcbiAgICBpZiAoZm9ybWF0KSB7XG4gICAgICB2YXIgbWF0Y2ggPSBkM19mb3JtYXRfcmUuZXhlYyhmb3JtYXQpO1xuICAgICAgbWF0Y2guc2hpZnQoKTtcbiAgICAgIGlmIChtYXRjaFs4XSA9PT0gXCJzXCIpIHtcbiAgICAgICAgdmFyIHByZWZpeCA9IGQzLmZvcm1hdFByZWZpeChNYXRoLm1heChhYnMocmFuZ2VbMF0pLCBhYnMocmFuZ2VbMV0pKSk7XG4gICAgICAgIGlmICghbWF0Y2hbN10pIG1hdGNoWzddID0gXCIuXCIgKyBkM19zY2FsZV9saW5lYXJQcmVjaXNpb24ocHJlZml4LnNjYWxlKHJhbmdlWzJdKSk7XG4gICAgICAgIG1hdGNoWzhdID0gXCJmXCI7XG4gICAgICAgIGZvcm1hdCA9IGQzLmZvcm1hdChtYXRjaC5qb2luKFwiXCIpKTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICByZXR1cm4gZm9ybWF0KHByZWZpeC5zY2FsZShkKSkgKyBwcmVmaXguc3ltYm9sO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKCFtYXRjaFs3XSkgbWF0Y2hbN10gPSBcIi5cIiArIGQzX3NjYWxlX2xpbmVhckZvcm1hdFByZWNpc2lvbihtYXRjaFs4XSwgcmFuZ2UpO1xuICAgICAgZm9ybWF0ID0gbWF0Y2guam9pbihcIlwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9ybWF0ID0gXCIsLlwiICsgZDNfc2NhbGVfbGluZWFyUHJlY2lzaW9uKHJhbmdlWzJdKSArIFwiZlwiO1xuICAgIH1cbiAgICByZXR1cm4gZDMuZm9ybWF0KGZvcm1hdCk7XG4gIH1cbiAgdmFyIGQzX3NjYWxlX2xpbmVhckZvcm1hdFNpZ25pZmljYW50ID0ge1xuICAgIHM6IDEsXG4gICAgZzogMSxcbiAgICBwOiAxLFxuICAgIHI6IDEsXG4gICAgZTogMVxuICB9O1xuICBmdW5jdGlvbiBkM19zY2FsZV9saW5lYXJQcmVjaXNpb24odmFsdWUpIHtcbiAgICByZXR1cm4gLU1hdGguZmxvb3IoTWF0aC5sb2codmFsdWUpIC8gTWF0aC5MTjEwICsgLjAxKTtcbiAgfVxuICBmdW5jdGlvbiBkM19zY2FsZV9saW5lYXJGb3JtYXRQcmVjaXNpb24odHlwZSwgcmFuZ2UpIHtcbiAgICB2YXIgcCA9IGQzX3NjYWxlX2xpbmVhclByZWNpc2lvbihyYW5nZVsyXSk7XG4gICAgcmV0dXJuIHR5cGUgaW4gZDNfc2NhbGVfbGluZWFyRm9ybWF0U2lnbmlmaWNhbnQgPyBNYXRoLmFicyhwIC0gZDNfc2NhbGVfbGluZWFyUHJlY2lzaW9uKE1hdGgubWF4KGFicyhyYW5nZVswXSksIGFicyhyYW5nZVsxXSkpKSkgKyArKHR5cGUgIT09IFwiZVwiKSA6IHAgLSAodHlwZSA9PT0gXCIlXCIpICogMjtcbiAgfVxuICBkMy5zY2FsZS5sb2cgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDNfc2NhbGVfbG9nKGQzLnNjYWxlLmxpbmVhcigpLmRvbWFpbihbIDAsIDEgXSksIDEwLCB0cnVlLCBbIDEsIDEwIF0pO1xuICB9O1xuICBmdW5jdGlvbiBkM19zY2FsZV9sb2cobGluZWFyLCBiYXNlLCBwb3NpdGl2ZSwgZG9tYWluKSB7XG4gICAgZnVuY3Rpb24gbG9nKHgpIHtcbiAgICAgIHJldHVybiAocG9zaXRpdmUgPyBNYXRoLmxvZyh4IDwgMCA/IDAgOiB4KSA6IC1NYXRoLmxvZyh4ID4gMCA/IDAgOiAteCkpIC8gTWF0aC5sb2coYmFzZSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHBvdyh4KSB7XG4gICAgICByZXR1cm4gcG9zaXRpdmUgPyBNYXRoLnBvdyhiYXNlLCB4KSA6IC1NYXRoLnBvdyhiYXNlLCAteCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHNjYWxlKHgpIHtcbiAgICAgIHJldHVybiBsaW5lYXIobG9nKHgpKTtcbiAgICB9XG4gICAgc2NhbGUuaW52ZXJ0ID0gZnVuY3Rpb24oeCkge1xuICAgICAgcmV0dXJuIHBvdyhsaW5lYXIuaW52ZXJ0KHgpKTtcbiAgICB9O1xuICAgIHNjYWxlLmRvbWFpbiA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGRvbWFpbjtcbiAgICAgIHBvc2l0aXZlID0geFswXSA+PSAwO1xuICAgICAgbGluZWFyLmRvbWFpbigoZG9tYWluID0geC5tYXAoTnVtYmVyKSkubWFwKGxvZykpO1xuICAgICAgcmV0dXJuIHNjYWxlO1xuICAgIH07XG4gICAgc2NhbGUuYmFzZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGJhc2U7XG4gICAgICBiYXNlID0gK187XG4gICAgICBsaW5lYXIuZG9tYWluKGRvbWFpbi5tYXAobG9nKSk7XG4gICAgICByZXR1cm4gc2NhbGU7XG4gICAgfTtcbiAgICBzY2FsZS5uaWNlID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbmljZWQgPSBkM19zY2FsZV9uaWNlKGRvbWFpbi5tYXAobG9nKSwgcG9zaXRpdmUgPyBNYXRoIDogZDNfc2NhbGVfbG9nTmljZU5lZ2F0aXZlKTtcbiAgICAgIGxpbmVhci5kb21haW4obmljZWQpO1xuICAgICAgZG9tYWluID0gbmljZWQubWFwKHBvdyk7XG4gICAgICByZXR1cm4gc2NhbGU7XG4gICAgfTtcbiAgICBzY2FsZS50aWNrcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGV4dGVudCA9IGQzX3NjYWxlRXh0ZW50KGRvbWFpbiksIHRpY2tzID0gW10sIHUgPSBleHRlbnRbMF0sIHYgPSBleHRlbnRbMV0sIGkgPSBNYXRoLmZsb29yKGxvZyh1KSksIGogPSBNYXRoLmNlaWwobG9nKHYpKSwgbiA9IGJhc2UgJSAxID8gMiA6IGJhc2U7XG4gICAgICBpZiAoaXNGaW5pdGUoaiAtIGkpKSB7XG4gICAgICAgIGlmIChwb3NpdGl2ZSkge1xuICAgICAgICAgIGZvciAoO2kgPCBqOyBpKyspIGZvciAodmFyIGsgPSAxOyBrIDwgbjsgaysrKSB0aWNrcy5wdXNoKHBvdyhpKSAqIGspO1xuICAgICAgICAgIHRpY2tzLnB1c2gocG93KGkpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aWNrcy5wdXNoKHBvdyhpKSk7XG4gICAgICAgICAgZm9yICg7aSsrIDwgajsgKSBmb3IgKHZhciBrID0gbiAtIDE7IGsgPiAwOyBrLS0pIHRpY2tzLnB1c2gocG93KGkpICogayk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gMDsgdGlja3NbaV0gPCB1OyBpKyspIHt9XG4gICAgICAgIGZvciAoaiA9IHRpY2tzLmxlbmd0aDsgdGlja3NbaiAtIDFdID4gdjsgai0tKSB7fVxuICAgICAgICB0aWNrcyA9IHRpY2tzLnNsaWNlKGksIGopO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRpY2tzO1xuICAgIH07XG4gICAgc2NhbGUudGlja0Zvcm1hdCA9IGZ1bmN0aW9uKG4sIGZvcm1hdCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gZDNfc2NhbGVfbG9nRm9ybWF0O1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSBmb3JtYXQgPSBkM19zY2FsZV9sb2dGb3JtYXQ7IGVsc2UgaWYgKHR5cGVvZiBmb3JtYXQgIT09IFwiZnVuY3Rpb25cIikgZm9ybWF0ID0gZDMuZm9ybWF0KGZvcm1hdCk7XG4gICAgICB2YXIgayA9IE1hdGgubWF4KC4xLCBuIC8gc2NhbGUudGlja3MoKS5sZW5ndGgpLCBmID0gcG9zaXRpdmUgPyAoZSA9IDFlLTEyLCBNYXRoLmNlaWwpIDogKGUgPSAtMWUtMTIsIFxuICAgICAgTWF0aC5mbG9vciksIGU7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gZCAvIHBvdyhmKGxvZyhkKSArIGUpKSA8PSBrID8gZm9ybWF0KGQpIDogXCJcIjtcbiAgICAgIH07XG4gICAgfTtcbiAgICBzY2FsZS5jb3B5ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZDNfc2NhbGVfbG9nKGxpbmVhci5jb3B5KCksIGJhc2UsIHBvc2l0aXZlLCBkb21haW4pO1xuICAgIH07XG4gICAgcmV0dXJuIGQzX3NjYWxlX2xpbmVhclJlYmluZChzY2FsZSwgbGluZWFyKTtcbiAgfVxuICB2YXIgZDNfc2NhbGVfbG9nRm9ybWF0ID0gZDMuZm9ybWF0KFwiLjBlXCIpLCBkM19zY2FsZV9sb2dOaWNlTmVnYXRpdmUgPSB7XG4gICAgZmxvb3I6IGZ1bmN0aW9uKHgpIHtcbiAgICAgIHJldHVybiAtTWF0aC5jZWlsKC14KTtcbiAgICB9LFxuICAgIGNlaWw6IGZ1bmN0aW9uKHgpIHtcbiAgICAgIHJldHVybiAtTWF0aC5mbG9vcigteCk7XG4gICAgfVxuICB9O1xuICBkMy5zY2FsZS5wb3cgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDNfc2NhbGVfcG93KGQzLnNjYWxlLmxpbmVhcigpLCAxLCBbIDAsIDEgXSk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3NjYWxlX3BvdyhsaW5lYXIsIGV4cG9uZW50LCBkb21haW4pIHtcbiAgICB2YXIgcG93cCA9IGQzX3NjYWxlX3Bvd1BvdyhleHBvbmVudCksIHBvd2IgPSBkM19zY2FsZV9wb3dQb3coMSAvIGV4cG9uZW50KTtcbiAgICBmdW5jdGlvbiBzY2FsZSh4KSB7XG4gICAgICByZXR1cm4gbGluZWFyKHBvd3AoeCkpO1xuICAgIH1cbiAgICBzY2FsZS5pbnZlcnQgPSBmdW5jdGlvbih4KSB7XG4gICAgICByZXR1cm4gcG93YihsaW5lYXIuaW52ZXJ0KHgpKTtcbiAgICB9O1xuICAgIHNjYWxlLmRvbWFpbiA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGRvbWFpbjtcbiAgICAgIGxpbmVhci5kb21haW4oKGRvbWFpbiA9IHgubWFwKE51bWJlcikpLm1hcChwb3dwKSk7XG4gICAgICByZXR1cm4gc2NhbGU7XG4gICAgfTtcbiAgICBzY2FsZS50aWNrcyA9IGZ1bmN0aW9uKG0pIHtcbiAgICAgIHJldHVybiBkM19zY2FsZV9saW5lYXJUaWNrcyhkb21haW4sIG0pO1xuICAgIH07XG4gICAgc2NhbGUudGlja0Zvcm1hdCA9IGZ1bmN0aW9uKG0sIGZvcm1hdCkge1xuICAgICAgcmV0dXJuIGQzX3NjYWxlX2xpbmVhclRpY2tGb3JtYXQoZG9tYWluLCBtLCBmb3JtYXQpO1xuICAgIH07XG4gICAgc2NhbGUubmljZSA9IGZ1bmN0aW9uKG0pIHtcbiAgICAgIHJldHVybiBzY2FsZS5kb21haW4oZDNfc2NhbGVfbGluZWFyTmljZShkb21haW4sIG0pKTtcbiAgICB9O1xuICAgIHNjYWxlLmV4cG9uZW50ID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gZXhwb25lbnQ7XG4gICAgICBwb3dwID0gZDNfc2NhbGVfcG93UG93KGV4cG9uZW50ID0geCk7XG4gICAgICBwb3diID0gZDNfc2NhbGVfcG93UG93KDEgLyBleHBvbmVudCk7XG4gICAgICBsaW5lYXIuZG9tYWluKGRvbWFpbi5tYXAocG93cCkpO1xuICAgICAgcmV0dXJuIHNjYWxlO1xuICAgIH07XG4gICAgc2NhbGUuY29weSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGQzX3NjYWxlX3BvdyhsaW5lYXIuY29weSgpLCBleHBvbmVudCwgZG9tYWluKTtcbiAgICB9O1xuICAgIHJldHVybiBkM19zY2FsZV9saW5lYXJSZWJpbmQoc2NhbGUsIGxpbmVhcik7XG4gIH1cbiAgZnVuY3Rpb24gZDNfc2NhbGVfcG93UG93KGUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oeCkge1xuICAgICAgcmV0dXJuIHggPCAwID8gLU1hdGgucG93KC14LCBlKSA6IE1hdGgucG93KHgsIGUpO1xuICAgIH07XG4gIH1cbiAgZDMuc2NhbGUuc3FydCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkMy5zY2FsZS5wb3coKS5leHBvbmVudCguNSk7XG4gIH07XG4gIGQzLnNjYWxlLm9yZGluYWwgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDNfc2NhbGVfb3JkaW5hbChbXSwge1xuICAgICAgdDogXCJyYW5nZVwiLFxuICAgICAgYTogWyBbXSBdXG4gICAgfSk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3NjYWxlX29yZGluYWwoZG9tYWluLCByYW5nZXIpIHtcbiAgICB2YXIgaW5kZXgsIHJhbmdlLCByYW5nZUJhbmQ7XG4gICAgZnVuY3Rpb24gc2NhbGUoeCkge1xuICAgICAgcmV0dXJuIHJhbmdlWygoaW5kZXguZ2V0KHgpIHx8IChyYW5nZXIudCA9PT0gXCJyYW5nZVwiID8gaW5kZXguc2V0KHgsIGRvbWFpbi5wdXNoKHgpKSA6IE5hTikpIC0gMSkgJSByYW5nZS5sZW5ndGhdO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzdGVwcyhzdGFydCwgc3RlcCkge1xuICAgICAgcmV0dXJuIGQzLnJhbmdlKGRvbWFpbi5sZW5ndGgpLm1hcChmdW5jdGlvbihpKSB7XG4gICAgICAgIHJldHVybiBzdGFydCArIHN0ZXAgKiBpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHNjYWxlLmRvbWFpbiA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGRvbWFpbjtcbiAgICAgIGRvbWFpbiA9IFtdO1xuICAgICAgaW5kZXggPSBuZXcgZDNfTWFwKCk7XG4gICAgICB2YXIgaSA9IC0xLCBuID0geC5sZW5ndGgsIHhpO1xuICAgICAgd2hpbGUgKCsraSA8IG4pIGlmICghaW5kZXguaGFzKHhpID0geFtpXSkpIGluZGV4LnNldCh4aSwgZG9tYWluLnB1c2goeGkpKTtcbiAgICAgIHJldHVybiBzY2FsZVtyYW5nZXIudF0uYXBwbHkoc2NhbGUsIHJhbmdlci5hKTtcbiAgICB9O1xuICAgIHNjYWxlLnJhbmdlID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gcmFuZ2U7XG4gICAgICByYW5nZSA9IHg7XG4gICAgICByYW5nZUJhbmQgPSAwO1xuICAgICAgcmFuZ2VyID0ge1xuICAgICAgICB0OiBcInJhbmdlXCIsXG4gICAgICAgIGE6IGFyZ3VtZW50c1xuICAgICAgfTtcbiAgICAgIHJldHVybiBzY2FsZTtcbiAgICB9O1xuICAgIHNjYWxlLnJhbmdlUG9pbnRzID0gZnVuY3Rpb24oeCwgcGFkZGluZykge1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSBwYWRkaW5nID0gMDtcbiAgICAgIHZhciBzdGFydCA9IHhbMF0sIHN0b3AgPSB4WzFdLCBzdGVwID0gZG9tYWluLmxlbmd0aCA8IDIgPyAoc3RhcnQgPSAoc3RhcnQgKyBzdG9wKSAvIDIsIFxuICAgICAgMCkgOiAoc3RvcCAtIHN0YXJ0KSAvIChkb21haW4ubGVuZ3RoIC0gMSArIHBhZGRpbmcpO1xuICAgICAgcmFuZ2UgPSBzdGVwcyhzdGFydCArIHN0ZXAgKiBwYWRkaW5nIC8gMiwgc3RlcCk7XG4gICAgICByYW5nZUJhbmQgPSAwO1xuICAgICAgcmFuZ2VyID0ge1xuICAgICAgICB0OiBcInJhbmdlUG9pbnRzXCIsXG4gICAgICAgIGE6IGFyZ3VtZW50c1xuICAgICAgfTtcbiAgICAgIHJldHVybiBzY2FsZTtcbiAgICB9O1xuICAgIHNjYWxlLnJhbmdlUm91bmRQb2ludHMgPSBmdW5jdGlvbih4LCBwYWRkaW5nKSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHBhZGRpbmcgPSAwO1xuICAgICAgdmFyIHN0YXJ0ID0geFswXSwgc3RvcCA9IHhbMV0sIHN0ZXAgPSBkb21haW4ubGVuZ3RoIDwgMiA/IChzdGFydCA9IHN0b3AgPSBNYXRoLnJvdW5kKChzdGFydCArIHN0b3ApIC8gMiksIFxuICAgICAgMCkgOiAoc3RvcCAtIHN0YXJ0KSAvIChkb21haW4ubGVuZ3RoIC0gMSArIHBhZGRpbmcpIHwgMDtcbiAgICAgIHJhbmdlID0gc3RlcHMoc3RhcnQgKyBNYXRoLnJvdW5kKHN0ZXAgKiBwYWRkaW5nIC8gMiArIChzdG9wIC0gc3RhcnQgLSAoZG9tYWluLmxlbmd0aCAtIDEgKyBwYWRkaW5nKSAqIHN0ZXApIC8gMiksIHN0ZXApO1xuICAgICAgcmFuZ2VCYW5kID0gMDtcbiAgICAgIHJhbmdlciA9IHtcbiAgICAgICAgdDogXCJyYW5nZVJvdW5kUG9pbnRzXCIsXG4gICAgICAgIGE6IGFyZ3VtZW50c1xuICAgICAgfTtcbiAgICAgIHJldHVybiBzY2FsZTtcbiAgICB9O1xuICAgIHNjYWxlLnJhbmdlQmFuZHMgPSBmdW5jdGlvbih4LCBwYWRkaW5nLCBvdXRlclBhZGRpbmcpIHtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikgcGFkZGluZyA9IDA7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIG91dGVyUGFkZGluZyA9IHBhZGRpbmc7XG4gICAgICB2YXIgcmV2ZXJzZSA9IHhbMV0gPCB4WzBdLCBzdGFydCA9IHhbcmV2ZXJzZSAtIDBdLCBzdG9wID0geFsxIC0gcmV2ZXJzZV0sIHN0ZXAgPSAoc3RvcCAtIHN0YXJ0KSAvIChkb21haW4ubGVuZ3RoIC0gcGFkZGluZyArIDIgKiBvdXRlclBhZGRpbmcpO1xuICAgICAgcmFuZ2UgPSBzdGVwcyhzdGFydCArIHN0ZXAgKiBvdXRlclBhZGRpbmcsIHN0ZXApO1xuICAgICAgaWYgKHJldmVyc2UpIHJhbmdlLnJldmVyc2UoKTtcbiAgICAgIHJhbmdlQmFuZCA9IHN0ZXAgKiAoMSAtIHBhZGRpbmcpO1xuICAgICAgcmFuZ2VyID0ge1xuICAgICAgICB0OiBcInJhbmdlQmFuZHNcIixcbiAgICAgICAgYTogYXJndW1lbnRzXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHNjYWxlO1xuICAgIH07XG4gICAgc2NhbGUucmFuZ2VSb3VuZEJhbmRzID0gZnVuY3Rpb24oeCwgcGFkZGluZywgb3V0ZXJQYWRkaW5nKSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHBhZGRpbmcgPSAwO1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzKSBvdXRlclBhZGRpbmcgPSBwYWRkaW5nO1xuICAgICAgdmFyIHJldmVyc2UgPSB4WzFdIDwgeFswXSwgc3RhcnQgPSB4W3JldmVyc2UgLSAwXSwgc3RvcCA9IHhbMSAtIHJldmVyc2VdLCBzdGVwID0gTWF0aC5mbG9vcigoc3RvcCAtIHN0YXJ0KSAvIChkb21haW4ubGVuZ3RoIC0gcGFkZGluZyArIDIgKiBvdXRlclBhZGRpbmcpKTtcbiAgICAgIHJhbmdlID0gc3RlcHMoc3RhcnQgKyBNYXRoLnJvdW5kKChzdG9wIC0gc3RhcnQgLSAoZG9tYWluLmxlbmd0aCAtIHBhZGRpbmcpICogc3RlcCkgLyAyKSwgc3RlcCk7XG4gICAgICBpZiAocmV2ZXJzZSkgcmFuZ2UucmV2ZXJzZSgpO1xuICAgICAgcmFuZ2VCYW5kID0gTWF0aC5yb3VuZChzdGVwICogKDEgLSBwYWRkaW5nKSk7XG4gICAgICByYW5nZXIgPSB7XG4gICAgICAgIHQ6IFwicmFuZ2VSb3VuZEJhbmRzXCIsXG4gICAgICAgIGE6IGFyZ3VtZW50c1xuICAgICAgfTtcbiAgICAgIHJldHVybiBzY2FsZTtcbiAgICB9O1xuICAgIHNjYWxlLnJhbmdlQmFuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJhbmdlQmFuZDtcbiAgICB9O1xuICAgIHNjYWxlLnJhbmdlRXh0ZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZDNfc2NhbGVFeHRlbnQocmFuZ2VyLmFbMF0pO1xuICAgIH07XG4gICAgc2NhbGUuY29weSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGQzX3NjYWxlX29yZGluYWwoZG9tYWluLCByYW5nZXIpO1xuICAgIH07XG4gICAgcmV0dXJuIHNjYWxlLmRvbWFpbihkb21haW4pO1xuICB9XG4gIGQzLnNjYWxlLmNhdGVnb3J5MTAgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDMuc2NhbGUub3JkaW5hbCgpLnJhbmdlKGQzX2NhdGVnb3J5MTApO1xuICB9O1xuICBkMy5zY2FsZS5jYXRlZ29yeTIwID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzLnNjYWxlLm9yZGluYWwoKS5yYW5nZShkM19jYXRlZ29yeTIwKTtcbiAgfTtcbiAgZDMuc2NhbGUuY2F0ZWdvcnkyMGIgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDMuc2NhbGUub3JkaW5hbCgpLnJhbmdlKGQzX2NhdGVnb3J5MjBiKTtcbiAgfTtcbiAgZDMuc2NhbGUuY2F0ZWdvcnkyMGMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDMuc2NhbGUub3JkaW5hbCgpLnJhbmdlKGQzX2NhdGVnb3J5MjBjKTtcbiAgfTtcbiAgdmFyIGQzX2NhdGVnb3J5MTAgPSBbIDIwNjIyNjAsIDE2NzQ0MjA2LCAyOTI0NTg4LCAxNDAzNDcyOCwgOTcyNTg4NSwgOTE5NzEzMSwgMTQ5MDczMzAsIDgzNTU3MTEsIDEyMzY5MTg2LCAxNTU2MTc1IF0ubWFwKGQzX3JnYlN0cmluZyk7XG4gIHZhciBkM19jYXRlZ29yeTIwID0gWyAyMDYyMjYwLCAxMTQ1NDQ0MCwgMTY3NDQyMDYsIDE2NzU5NjcyLCAyOTI0NTg4LCAxMDAxODY5OCwgMTQwMzQ3MjgsIDE2NzUwNzQyLCA5NzI1ODg1LCAxMjk1NTg2MSwgOTE5NzEzMSwgMTI4ODUxNDAsIDE0OTA3MzMwLCAxNjIzNDE5NCwgODM1NTcxMSwgMTMwOTI4MDcsIDEyMzY5MTg2LCAxNDQwODU4OSwgMTU1NjE3NSwgMTA0MTA3MjUgXS5tYXAoZDNfcmdiU3RyaW5nKTtcbiAgdmFyIGQzX2NhdGVnb3J5MjBiID0gWyAzNzUwNzc3LCA1Mzk1NjE5LCA3MDQwNzE5LCAxMDI2NDI4NiwgNjUxOTA5NywgOTIxNjU5NCwgMTE5MTUxMTUsIDEzNTU2NjM2LCA5MjAyOTkzLCAxMjQyNjgwOSwgMTUxODY1MTQsIDE1MTkwOTMyLCA4NjY2MTY5LCAxMTM1NjQ5MCwgMTQwNDk2NDMsIDE1MTc3MzcyLCA4MDc3NjgzLCAxMDgzNDMyNCwgMTM1Mjg1MDksIDE0NTg5NjU0IF0ubWFwKGQzX3JnYlN0cmluZyk7XG4gIHZhciBkM19jYXRlZ29yeTIwYyA9IFsgMzI0NDczMywgNzA1NzExMCwgMTA0MDY2MjUsIDEzMDMyNDMxLCAxNTA5NTA1MywgMTY2MTY3NjQsIDE2NjI1MjU5LCAxNjYzNDAxOCwgMzI1MzA3NiwgNzY1MjQ3MCwgMTA2MDcwMDMsIDEzMTAxNTA0LCA3Njk1MjgxLCAxMDM5NDMxMiwgMTIzNjkzNzIsIDE0MzQyODkxLCA2NTEzNTA3LCA5ODY4OTUwLCAxMjQzNDg3NywgMTQyNzcwODEgXS5tYXAoZDNfcmdiU3RyaW5nKTtcbiAgZDMuc2NhbGUucXVhbnRpbGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDNfc2NhbGVfcXVhbnRpbGUoW10sIFtdKTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfc2NhbGVfcXVhbnRpbGUoZG9tYWluLCByYW5nZSkge1xuICAgIHZhciB0aHJlc2hvbGRzO1xuICAgIGZ1bmN0aW9uIHJlc2NhbGUoKSB7XG4gICAgICB2YXIgayA9IDAsIHEgPSByYW5nZS5sZW5ndGg7XG4gICAgICB0aHJlc2hvbGRzID0gW107XG4gICAgICB3aGlsZSAoKytrIDwgcSkgdGhyZXNob2xkc1trIC0gMV0gPSBkMy5xdWFudGlsZShkb21haW4sIGsgLyBxKTtcbiAgICAgIHJldHVybiBzY2FsZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gc2NhbGUoeCkge1xuICAgICAgaWYgKCFpc05hTih4ID0gK3gpKSByZXR1cm4gcmFuZ2VbZDMuYmlzZWN0KHRocmVzaG9sZHMsIHgpXTtcbiAgICB9XG4gICAgc2NhbGUuZG9tYWluID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gZG9tYWluO1xuICAgICAgZG9tYWluID0geC5tYXAoZDNfbnVtYmVyKS5maWx0ZXIoZDNfbnVtZXJpYykuc29ydChkM19hc2NlbmRpbmcpO1xuICAgICAgcmV0dXJuIHJlc2NhbGUoKTtcbiAgICB9O1xuICAgIHNjYWxlLnJhbmdlID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gcmFuZ2U7XG4gICAgICByYW5nZSA9IHg7XG4gICAgICByZXR1cm4gcmVzY2FsZSgpO1xuICAgIH07XG4gICAgc2NhbGUucXVhbnRpbGVzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhyZXNob2xkcztcbiAgICB9O1xuICAgIHNjYWxlLmludmVydEV4dGVudCA9IGZ1bmN0aW9uKHkpIHtcbiAgICAgIHkgPSByYW5nZS5pbmRleE9mKHkpO1xuICAgICAgcmV0dXJuIHkgPCAwID8gWyBOYU4sIE5hTiBdIDogWyB5ID4gMCA/IHRocmVzaG9sZHNbeSAtIDFdIDogZG9tYWluWzBdLCB5IDwgdGhyZXNob2xkcy5sZW5ndGggPyB0aHJlc2hvbGRzW3ldIDogZG9tYWluW2RvbWFpbi5sZW5ndGggLSAxXSBdO1xuICAgIH07XG4gICAgc2NhbGUuY29weSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGQzX3NjYWxlX3F1YW50aWxlKGRvbWFpbiwgcmFuZ2UpO1xuICAgIH07XG4gICAgcmV0dXJuIHJlc2NhbGUoKTtcbiAgfVxuICBkMy5zY2FsZS5xdWFudGl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkM19zY2FsZV9xdWFudGl6ZSgwLCAxLCBbIDAsIDEgXSk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3NjYWxlX3F1YW50aXplKHgwLCB4MSwgcmFuZ2UpIHtcbiAgICB2YXIga3gsIGk7XG4gICAgZnVuY3Rpb24gc2NhbGUoeCkge1xuICAgICAgcmV0dXJuIHJhbmdlW01hdGgubWF4KDAsIE1hdGgubWluKGksIE1hdGguZmxvb3Ioa3ggKiAoeCAtIHgwKSkpKV07XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlc2NhbGUoKSB7XG4gICAgICBreCA9IHJhbmdlLmxlbmd0aCAvICh4MSAtIHgwKTtcbiAgICAgIGkgPSByYW5nZS5sZW5ndGggLSAxO1xuICAgICAgcmV0dXJuIHNjYWxlO1xuICAgIH1cbiAgICBzY2FsZS5kb21haW4gPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBbIHgwLCB4MSBdO1xuICAgICAgeDAgPSAreFswXTtcbiAgICAgIHgxID0gK3hbeC5sZW5ndGggLSAxXTtcbiAgICAgIHJldHVybiByZXNjYWxlKCk7XG4gICAgfTtcbiAgICBzY2FsZS5yYW5nZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHJhbmdlO1xuICAgICAgcmFuZ2UgPSB4O1xuICAgICAgcmV0dXJuIHJlc2NhbGUoKTtcbiAgICB9O1xuICAgIHNjYWxlLmludmVydEV4dGVudCA9IGZ1bmN0aW9uKHkpIHtcbiAgICAgIHkgPSByYW5nZS5pbmRleE9mKHkpO1xuICAgICAgeSA9IHkgPCAwID8gTmFOIDogeSAvIGt4ICsgeDA7XG4gICAgICByZXR1cm4gWyB5LCB5ICsgMSAvIGt4IF07XG4gICAgfTtcbiAgICBzY2FsZS5jb3B5ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZDNfc2NhbGVfcXVhbnRpemUoeDAsIHgxLCByYW5nZSk7XG4gICAgfTtcbiAgICByZXR1cm4gcmVzY2FsZSgpO1xuICB9XG4gIGQzLnNjYWxlLnRocmVzaG9sZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkM19zY2FsZV90aHJlc2hvbGQoWyAuNSBdLCBbIDAsIDEgXSk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3NjYWxlX3RocmVzaG9sZChkb21haW4sIHJhbmdlKSB7XG4gICAgZnVuY3Rpb24gc2NhbGUoeCkge1xuICAgICAgaWYgKHggPD0geCkgcmV0dXJuIHJhbmdlW2QzLmJpc2VjdChkb21haW4sIHgpXTtcbiAgICB9XG4gICAgc2NhbGUuZG9tYWluID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gZG9tYWluO1xuICAgICAgZG9tYWluID0gXztcbiAgICAgIHJldHVybiBzY2FsZTtcbiAgICB9O1xuICAgIHNjYWxlLnJhbmdlID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gcmFuZ2U7XG4gICAgICByYW5nZSA9IF87XG4gICAgICByZXR1cm4gc2NhbGU7XG4gICAgfTtcbiAgICBzY2FsZS5pbnZlcnRFeHRlbnQgPSBmdW5jdGlvbih5KSB7XG4gICAgICB5ID0gcmFuZ2UuaW5kZXhPZih5KTtcbiAgICAgIHJldHVybiBbIGRvbWFpblt5IC0gMV0sIGRvbWFpblt5XSBdO1xuICAgIH07XG4gICAgc2NhbGUuY29weSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGQzX3NjYWxlX3RocmVzaG9sZChkb21haW4sIHJhbmdlKTtcbiAgICB9O1xuICAgIHJldHVybiBzY2FsZTtcbiAgfVxuICBkMy5zY2FsZS5pZGVudGl0eSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkM19zY2FsZV9pZGVudGl0eShbIDAsIDEgXSk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3NjYWxlX2lkZW50aXR5KGRvbWFpbikge1xuICAgIGZ1bmN0aW9uIGlkZW50aXR5KHgpIHtcbiAgICAgIHJldHVybiAreDtcbiAgICB9XG4gICAgaWRlbnRpdHkuaW52ZXJ0ID0gaWRlbnRpdHk7XG4gICAgaWRlbnRpdHkuZG9tYWluID0gaWRlbnRpdHkucmFuZ2UgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBkb21haW47XG4gICAgICBkb21haW4gPSB4Lm1hcChpZGVudGl0eSk7XG4gICAgICByZXR1cm4gaWRlbnRpdHk7XG4gICAgfTtcbiAgICBpZGVudGl0eS50aWNrcyA9IGZ1bmN0aW9uKG0pIHtcbiAgICAgIHJldHVybiBkM19zY2FsZV9saW5lYXJUaWNrcyhkb21haW4sIG0pO1xuICAgIH07XG4gICAgaWRlbnRpdHkudGlja0Zvcm1hdCA9IGZ1bmN0aW9uKG0sIGZvcm1hdCkge1xuICAgICAgcmV0dXJuIGQzX3NjYWxlX2xpbmVhclRpY2tGb3JtYXQoZG9tYWluLCBtLCBmb3JtYXQpO1xuICAgIH07XG4gICAgaWRlbnRpdHkuY29weSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGQzX3NjYWxlX2lkZW50aXR5KGRvbWFpbik7XG4gICAgfTtcbiAgICByZXR1cm4gaWRlbnRpdHk7XG4gIH1cbiAgZDMuc3ZnID0ge307XG4gIGZ1bmN0aW9uIGQzX3plcm8oKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cbiAgZDMuc3ZnLmFyYyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpbm5lclJhZGl1cyA9IGQzX3N2Z19hcmNJbm5lclJhZGl1cywgb3V0ZXJSYWRpdXMgPSBkM19zdmdfYXJjT3V0ZXJSYWRpdXMsIGNvcm5lclJhZGl1cyA9IGQzX3plcm8sIHBhZFJhZGl1cyA9IGQzX3N2Z19hcmNBdXRvLCBzdGFydEFuZ2xlID0gZDNfc3ZnX2FyY1N0YXJ0QW5nbGUsIGVuZEFuZ2xlID0gZDNfc3ZnX2FyY0VuZEFuZ2xlLCBwYWRBbmdsZSA9IGQzX3N2Z19hcmNQYWRBbmdsZTtcbiAgICBmdW5jdGlvbiBhcmMoKSB7XG4gICAgICB2YXIgcjAgPSBNYXRoLm1heCgwLCAraW5uZXJSYWRpdXMuYXBwbHkodGhpcywgYXJndW1lbnRzKSksIHIxID0gTWF0aC5tYXgoMCwgK291dGVyUmFkaXVzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpLCBhMCA9IHN0YXJ0QW5nbGUuYXBwbHkodGhpcywgYXJndW1lbnRzKSAtIGhhbGbPgCwgYTEgPSBlbmRBbmdsZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpIC0gaGFsZs+ALCBkYSA9IE1hdGguYWJzKGExIC0gYTApLCBjdyA9IGEwID4gYTEgPyAwIDogMTtcbiAgICAgIGlmIChyMSA8IHIwKSByYyA9IHIxLCByMSA9IHIwLCByMCA9IHJjO1xuICAgICAgaWYgKGRhID49IM+EzrUpIHJldHVybiBjaXJjbGVTZWdtZW50KHIxLCBjdykgKyAocjAgPyBjaXJjbGVTZWdtZW50KHIwLCAxIC0gY3cpIDogXCJcIikgKyBcIlpcIjtcbiAgICAgIHZhciByYywgY3IsIHJwLCBhcCwgcDAgPSAwLCBwMSA9IDAsIHgwLCB5MCwgeDEsIHkxLCB4MiwgeTIsIHgzLCB5MywgcGF0aCA9IFtdO1xuICAgICAgaWYgKGFwID0gKCtwYWRBbmdsZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IDApIC8gMikge1xuICAgICAgICBycCA9IHBhZFJhZGl1cyA9PT0gZDNfc3ZnX2FyY0F1dG8gPyBNYXRoLnNxcnQocjAgKiByMCArIHIxICogcjEpIDogK3BhZFJhZGl1cy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICBpZiAoIWN3KSBwMSAqPSAtMTtcbiAgICAgICAgaWYgKHIxKSBwMSA9IGQzX2FzaW4ocnAgLyByMSAqIE1hdGguc2luKGFwKSk7XG4gICAgICAgIGlmIChyMCkgcDAgPSBkM19hc2luKHJwIC8gcjAgKiBNYXRoLnNpbihhcCkpO1xuICAgICAgfVxuICAgICAgaWYgKHIxKSB7XG4gICAgICAgIHgwID0gcjEgKiBNYXRoLmNvcyhhMCArIHAxKTtcbiAgICAgICAgeTAgPSByMSAqIE1hdGguc2luKGEwICsgcDEpO1xuICAgICAgICB4MSA9IHIxICogTWF0aC5jb3MoYTEgLSBwMSk7XG4gICAgICAgIHkxID0gcjEgKiBNYXRoLnNpbihhMSAtIHAxKTtcbiAgICAgICAgdmFyIGwxID0gTWF0aC5hYnMoYTEgLSBhMCAtIDIgKiBwMSkgPD0gz4AgPyAwIDogMTtcbiAgICAgICAgaWYgKHAxICYmIGQzX3N2Z19hcmNTd2VlcCh4MCwgeTAsIHgxLCB5MSkgPT09IGN3IF4gbDEpIHtcbiAgICAgICAgICB2YXIgaDEgPSAoYTAgKyBhMSkgLyAyO1xuICAgICAgICAgIHgwID0gcjEgKiBNYXRoLmNvcyhoMSk7XG4gICAgICAgICAgeTAgPSByMSAqIE1hdGguc2luKGgxKTtcbiAgICAgICAgICB4MSA9IHkxID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgeDAgPSB5MCA9IDA7XG4gICAgICB9XG4gICAgICBpZiAocjApIHtcbiAgICAgICAgeDIgPSByMCAqIE1hdGguY29zKGExIC0gcDApO1xuICAgICAgICB5MiA9IHIwICogTWF0aC5zaW4oYTEgLSBwMCk7XG4gICAgICAgIHgzID0gcjAgKiBNYXRoLmNvcyhhMCArIHAwKTtcbiAgICAgICAgeTMgPSByMCAqIE1hdGguc2luKGEwICsgcDApO1xuICAgICAgICB2YXIgbDAgPSBNYXRoLmFicyhhMCAtIGExICsgMiAqIHAwKSA8PSDPgCA/IDAgOiAxO1xuICAgICAgICBpZiAocDAgJiYgZDNfc3ZnX2FyY1N3ZWVwKHgyLCB5MiwgeDMsIHkzKSA9PT0gMSAtIGN3IF4gbDApIHtcbiAgICAgICAgICB2YXIgaDAgPSAoYTAgKyBhMSkgLyAyO1xuICAgICAgICAgIHgyID0gcjAgKiBNYXRoLmNvcyhoMCk7XG4gICAgICAgICAgeTIgPSByMCAqIE1hdGguc2luKGgwKTtcbiAgICAgICAgICB4MyA9IHkzID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgeDIgPSB5MiA9IDA7XG4gICAgICB9XG4gICAgICBpZiAoKHJjID0gTWF0aC5taW4oTWF0aC5hYnMocjEgLSByMCkgLyAyLCArY29ybmVyUmFkaXVzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpKSA+IC4wMDEpIHtcbiAgICAgICAgY3IgPSByMCA8IHIxIF4gY3cgPyAwIDogMTtcbiAgICAgICAgdmFyIG9jID0geDMgPT0gbnVsbCA/IFsgeDIsIHkyIF0gOiB4MSA9PSBudWxsID8gWyB4MCwgeTAgXSA6IGQzX2dlb21fcG9seWdvbkludGVyc2VjdChbIHgwLCB5MCBdLCBbIHgzLCB5MyBdLCBbIHgxLCB5MSBdLCBbIHgyLCB5MiBdKSwgYXggPSB4MCAtIG9jWzBdLCBheSA9IHkwIC0gb2NbMV0sIGJ4ID0geDEgLSBvY1swXSwgYnkgPSB5MSAtIG9jWzFdLCBrYyA9IDEgLyBNYXRoLnNpbihNYXRoLmFjb3MoKGF4ICogYnggKyBheSAqIGJ5KSAvIChNYXRoLnNxcnQoYXggKiBheCArIGF5ICogYXkpICogTWF0aC5zcXJ0KGJ4ICogYnggKyBieSAqIGJ5KSkpIC8gMiksIGxjID0gTWF0aC5zcXJ0KG9jWzBdICogb2NbMF0gKyBvY1sxXSAqIG9jWzFdKTtcbiAgICAgICAgaWYgKHgxICE9IG51bGwpIHtcbiAgICAgICAgICB2YXIgcmMxID0gTWF0aC5taW4ocmMsIChyMSAtIGxjKSAvIChrYyArIDEpKSwgdDMwID0gZDNfc3ZnX2FyY0Nvcm5lclRhbmdlbnRzKHgzID09IG51bGwgPyBbIHgyLCB5MiBdIDogWyB4MywgeTMgXSwgWyB4MCwgeTAgXSwgcjEsIHJjMSwgY3cpLCB0MTIgPSBkM19zdmdfYXJjQ29ybmVyVGFuZ2VudHMoWyB4MSwgeTEgXSwgWyB4MiwgeTIgXSwgcjEsIHJjMSwgY3cpO1xuICAgICAgICAgIGlmIChyYyA9PT0gcmMxKSB7XG4gICAgICAgICAgICBwYXRoLnB1c2goXCJNXCIsIHQzMFswXSwgXCJBXCIsIHJjMSwgXCIsXCIsIHJjMSwgXCIgMCAwLFwiLCBjciwgXCIgXCIsIHQzMFsxXSwgXCJBXCIsIHIxLCBcIixcIiwgcjEsIFwiIDAgXCIsIDEgLSBjdyBeIGQzX3N2Z19hcmNTd2VlcCh0MzBbMV1bMF0sIHQzMFsxXVsxXSwgdDEyWzFdWzBdLCB0MTJbMV1bMV0pLCBcIixcIiwgY3csIFwiIFwiLCB0MTJbMV0sIFwiQVwiLCByYzEsIFwiLFwiLCByYzEsIFwiIDAgMCxcIiwgY3IsIFwiIFwiLCB0MTJbMF0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXRoLnB1c2goXCJNXCIsIHQzMFswXSwgXCJBXCIsIHJjMSwgXCIsXCIsIHJjMSwgXCIgMCAxLFwiLCBjciwgXCIgXCIsIHQxMlswXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBhdGgucHVzaChcIk1cIiwgeDAsIFwiLFwiLCB5MCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHgzICE9IG51bGwpIHtcbiAgICAgICAgICB2YXIgcmMwID0gTWF0aC5taW4ocmMsIChyMCAtIGxjKSAvIChrYyAtIDEpKSwgdDAzID0gZDNfc3ZnX2FyY0Nvcm5lclRhbmdlbnRzKFsgeDAsIHkwIF0sIFsgeDMsIHkzIF0sIHIwLCAtcmMwLCBjdyksIHQyMSA9IGQzX3N2Z19hcmNDb3JuZXJUYW5nZW50cyhbIHgyLCB5MiBdLCB4MSA9PSBudWxsID8gWyB4MCwgeTAgXSA6IFsgeDEsIHkxIF0sIHIwLCAtcmMwLCBjdyk7XG4gICAgICAgICAgaWYgKHJjID09PSByYzApIHtcbiAgICAgICAgICAgIHBhdGgucHVzaChcIkxcIiwgdDIxWzBdLCBcIkFcIiwgcmMwLCBcIixcIiwgcmMwLCBcIiAwIDAsXCIsIGNyLCBcIiBcIiwgdDIxWzFdLCBcIkFcIiwgcjAsIFwiLFwiLCByMCwgXCIgMCBcIiwgY3cgXiBkM19zdmdfYXJjU3dlZXAodDIxWzFdWzBdLCB0MjFbMV1bMV0sIHQwM1sxXVswXSwgdDAzWzFdWzFdKSwgXCIsXCIsIDEgLSBjdywgXCIgXCIsIHQwM1sxXSwgXCJBXCIsIHJjMCwgXCIsXCIsIHJjMCwgXCIgMCAwLFwiLCBjciwgXCIgXCIsIHQwM1swXSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhdGgucHVzaChcIkxcIiwgdDIxWzBdLCBcIkFcIiwgcmMwLCBcIixcIiwgcmMwLCBcIiAwIDAsXCIsIGNyLCBcIiBcIiwgdDAzWzBdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGF0aC5wdXNoKFwiTFwiLCB4MiwgXCIsXCIsIHkyKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGF0aC5wdXNoKFwiTVwiLCB4MCwgXCIsXCIsIHkwKTtcbiAgICAgICAgaWYgKHgxICE9IG51bGwpIHBhdGgucHVzaChcIkFcIiwgcjEsIFwiLFwiLCByMSwgXCIgMCBcIiwgbDEsIFwiLFwiLCBjdywgXCIgXCIsIHgxLCBcIixcIiwgeTEpO1xuICAgICAgICBwYXRoLnB1c2goXCJMXCIsIHgyLCBcIixcIiwgeTIpO1xuICAgICAgICBpZiAoeDMgIT0gbnVsbCkgcGF0aC5wdXNoKFwiQVwiLCByMCwgXCIsXCIsIHIwLCBcIiAwIFwiLCBsMCwgXCIsXCIsIDEgLSBjdywgXCIgXCIsIHgzLCBcIixcIiwgeTMpO1xuICAgICAgfVxuICAgICAgcGF0aC5wdXNoKFwiWlwiKTtcbiAgICAgIHJldHVybiBwYXRoLmpvaW4oXCJcIik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNpcmNsZVNlZ21lbnQocjEsIGN3KSB7XG4gICAgICByZXR1cm4gXCJNMCxcIiArIHIxICsgXCJBXCIgKyByMSArIFwiLFwiICsgcjEgKyBcIiAwIDEsXCIgKyBjdyArIFwiIDAsXCIgKyAtcjEgKyBcIkFcIiArIHIxICsgXCIsXCIgKyByMSArIFwiIDAgMSxcIiArIGN3ICsgXCIgMCxcIiArIHIxO1xuICAgIH1cbiAgICBhcmMuaW5uZXJSYWRpdXMgPSBmdW5jdGlvbih2KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBpbm5lclJhZGl1cztcbiAgICAgIGlubmVyUmFkaXVzID0gZDNfZnVuY3Rvcih2KTtcbiAgICAgIHJldHVybiBhcmM7XG4gICAgfTtcbiAgICBhcmMub3V0ZXJSYWRpdXMgPSBmdW5jdGlvbih2KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBvdXRlclJhZGl1cztcbiAgICAgIG91dGVyUmFkaXVzID0gZDNfZnVuY3Rvcih2KTtcbiAgICAgIHJldHVybiBhcmM7XG4gICAgfTtcbiAgICBhcmMuY29ybmVyUmFkaXVzID0gZnVuY3Rpb24odikge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gY29ybmVyUmFkaXVzO1xuICAgICAgY29ybmVyUmFkaXVzID0gZDNfZnVuY3Rvcih2KTtcbiAgICAgIHJldHVybiBhcmM7XG4gICAgfTtcbiAgICBhcmMucGFkUmFkaXVzID0gZnVuY3Rpb24odikge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gcGFkUmFkaXVzO1xuICAgICAgcGFkUmFkaXVzID0gdiA9PSBkM19zdmdfYXJjQXV0byA/IGQzX3N2Z19hcmNBdXRvIDogZDNfZnVuY3Rvcih2KTtcbiAgICAgIHJldHVybiBhcmM7XG4gICAgfTtcbiAgICBhcmMuc3RhcnRBbmdsZSA9IGZ1bmN0aW9uKHYpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHN0YXJ0QW5nbGU7XG4gICAgICBzdGFydEFuZ2xlID0gZDNfZnVuY3Rvcih2KTtcbiAgICAgIHJldHVybiBhcmM7XG4gICAgfTtcbiAgICBhcmMuZW5kQW5nbGUgPSBmdW5jdGlvbih2KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBlbmRBbmdsZTtcbiAgICAgIGVuZEFuZ2xlID0gZDNfZnVuY3Rvcih2KTtcbiAgICAgIHJldHVybiBhcmM7XG4gICAgfTtcbiAgICBhcmMucGFkQW5nbGUgPSBmdW5jdGlvbih2KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBwYWRBbmdsZTtcbiAgICAgIHBhZEFuZ2xlID0gZDNfZnVuY3Rvcih2KTtcbiAgICAgIHJldHVybiBhcmM7XG4gICAgfTtcbiAgICBhcmMuY2VudHJvaWQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciByID0gKCtpbm5lclJhZGl1cy5hcHBseSh0aGlzLCBhcmd1bWVudHMpICsgK291dGVyUmFkaXVzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpIC8gMiwgYSA9ICgrc3RhcnRBbmdsZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpICsgK2VuZEFuZ2xlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpIC8gMiAtIGhhbGbPgDtcbiAgICAgIHJldHVybiBbIE1hdGguY29zKGEpICogciwgTWF0aC5zaW4oYSkgKiByIF07XG4gICAgfTtcbiAgICByZXR1cm4gYXJjO1xuICB9O1xuICB2YXIgZDNfc3ZnX2FyY0F1dG8gPSBcImF1dG9cIjtcbiAgZnVuY3Rpb24gZDNfc3ZnX2FyY0lubmVyUmFkaXVzKGQpIHtcbiAgICByZXR1cm4gZC5pbm5lclJhZGl1cztcbiAgfVxuICBmdW5jdGlvbiBkM19zdmdfYXJjT3V0ZXJSYWRpdXMoZCkge1xuICAgIHJldHVybiBkLm91dGVyUmFkaXVzO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3N2Z19hcmNTdGFydEFuZ2xlKGQpIHtcbiAgICByZXR1cm4gZC5zdGFydEFuZ2xlO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3N2Z19hcmNFbmRBbmdsZShkKSB7XG4gICAgcmV0dXJuIGQuZW5kQW5nbGU7XG4gIH1cbiAgZnVuY3Rpb24gZDNfc3ZnX2FyY1BhZEFuZ2xlKGQpIHtcbiAgICByZXR1cm4gZCAmJiBkLnBhZEFuZ2xlO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3N2Z19hcmNTd2VlcCh4MCwgeTAsIHgxLCB5MSkge1xuICAgIHJldHVybiAoeDAgLSB4MSkgKiB5MCAtICh5MCAtIHkxKSAqIHgwID4gMCA/IDAgOiAxO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3N2Z19hcmNDb3JuZXJUYW5nZW50cyhwMCwgcDEsIHIxLCByYywgY3cpIHtcbiAgICB2YXIgeDAxID0gcDBbMF0gLSBwMVswXSwgeTAxID0gcDBbMV0gLSBwMVsxXSwgbG8gPSAoY3cgPyByYyA6IC1yYykgLyBNYXRoLnNxcnQoeDAxICogeDAxICsgeTAxICogeTAxKSwgb3ggPSBsbyAqIHkwMSwgb3kgPSAtbG8gKiB4MDEsIHgxID0gcDBbMF0gKyBveCwgeTEgPSBwMFsxXSArIG95LCB4MiA9IHAxWzBdICsgb3gsIHkyID0gcDFbMV0gKyBveSwgeDMgPSAoeDEgKyB4MikgLyAyLCB5MyA9ICh5MSArIHkyKSAvIDIsIGR4ID0geDIgLSB4MSwgZHkgPSB5MiAtIHkxLCBkMiA9IGR4ICogZHggKyBkeSAqIGR5LCByID0gcjEgLSByYywgRCA9IHgxICogeTIgLSB4MiAqIHkxLCBkID0gKGR5IDwgMCA/IC0xIDogMSkgKiBNYXRoLnNxcnQociAqIHIgKiBkMiAtIEQgKiBEKSwgY3gwID0gKEQgKiBkeSAtIGR4ICogZCkgLyBkMiwgY3kwID0gKC1EICogZHggLSBkeSAqIGQpIC8gZDIsIGN4MSA9IChEICogZHkgKyBkeCAqIGQpIC8gZDIsIGN5MSA9ICgtRCAqIGR4ICsgZHkgKiBkKSAvIGQyLCBkeDAgPSBjeDAgLSB4MywgZHkwID0gY3kwIC0geTMsIGR4MSA9IGN4MSAtIHgzLCBkeTEgPSBjeTEgLSB5MztcbiAgICBpZiAoZHgwICogZHgwICsgZHkwICogZHkwID4gZHgxICogZHgxICsgZHkxICogZHkxKSBjeDAgPSBjeDEsIGN5MCA9IGN5MTtcbiAgICByZXR1cm4gWyBbIGN4MCAtIG94LCBjeTAgLSBveSBdLCBbIGN4MCAqIHIxIC8gciwgY3kwICogcjEgLyByIF0gXTtcbiAgfVxuICBmdW5jdGlvbiBkM19zdmdfbGluZShwcm9qZWN0aW9uKSB7XG4gICAgdmFyIHggPSBkM19nZW9tX3BvaW50WCwgeSA9IGQzX2dlb21fcG9pbnRZLCBkZWZpbmVkID0gZDNfdHJ1ZSwgaW50ZXJwb2xhdGUgPSBkM19zdmdfbGluZUxpbmVhciwgaW50ZXJwb2xhdGVLZXkgPSBpbnRlcnBvbGF0ZS5rZXksIHRlbnNpb24gPSAuNztcbiAgICBmdW5jdGlvbiBsaW5lKGRhdGEpIHtcbiAgICAgIHZhciBzZWdtZW50cyA9IFtdLCBwb2ludHMgPSBbXSwgaSA9IC0xLCBuID0gZGF0YS5sZW5ndGgsIGQsIGZ4ID0gZDNfZnVuY3Rvcih4KSwgZnkgPSBkM19mdW5jdG9yKHkpO1xuICAgICAgZnVuY3Rpb24gc2VnbWVudCgpIHtcbiAgICAgICAgc2VnbWVudHMucHVzaChcIk1cIiwgaW50ZXJwb2xhdGUocHJvamVjdGlvbihwb2ludHMpLCB0ZW5zaW9uKSk7XG4gICAgICB9XG4gICAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgICBpZiAoZGVmaW5lZC5jYWxsKHRoaXMsIGQgPSBkYXRhW2ldLCBpKSkge1xuICAgICAgICAgIHBvaW50cy5wdXNoKFsgK2Z4LmNhbGwodGhpcywgZCwgaSksICtmeS5jYWxsKHRoaXMsIGQsIGkpIF0pO1xuICAgICAgICB9IGVsc2UgaWYgKHBvaW50cy5sZW5ndGgpIHtcbiAgICAgICAgICBzZWdtZW50KCk7XG4gICAgICAgICAgcG9pbnRzID0gW107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChwb2ludHMubGVuZ3RoKSBzZWdtZW50KCk7XG4gICAgICByZXR1cm4gc2VnbWVudHMubGVuZ3RoID8gc2VnbWVudHMuam9pbihcIlwiKSA6IG51bGw7XG4gICAgfVxuICAgIGxpbmUueCA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHg7XG4gICAgICB4ID0gXztcbiAgICAgIHJldHVybiBsaW5lO1xuICAgIH07XG4gICAgbGluZS55ID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4geTtcbiAgICAgIHkgPSBfO1xuICAgICAgcmV0dXJuIGxpbmU7XG4gICAgfTtcbiAgICBsaW5lLmRlZmluZWQgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBkZWZpbmVkO1xuICAgICAgZGVmaW5lZCA9IF87XG4gICAgICByZXR1cm4gbGluZTtcbiAgICB9O1xuICAgIGxpbmUuaW50ZXJwb2xhdGUgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBpbnRlcnBvbGF0ZUtleTtcbiAgICAgIGlmICh0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiKSBpbnRlcnBvbGF0ZUtleSA9IGludGVycG9sYXRlID0gXzsgZWxzZSBpbnRlcnBvbGF0ZUtleSA9IChpbnRlcnBvbGF0ZSA9IGQzX3N2Z19saW5lSW50ZXJwb2xhdG9ycy5nZXQoXykgfHwgZDNfc3ZnX2xpbmVMaW5lYXIpLmtleTtcbiAgICAgIHJldHVybiBsaW5lO1xuICAgIH07XG4gICAgbGluZS50ZW5zaW9uID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGVuc2lvbjtcbiAgICAgIHRlbnNpb24gPSBfO1xuICAgICAgcmV0dXJuIGxpbmU7XG4gICAgfTtcbiAgICByZXR1cm4gbGluZTtcbiAgfVxuICBkMy5zdmcubGluZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkM19zdmdfbGluZShkM19pZGVudGl0eSk7XG4gIH07XG4gIHZhciBkM19zdmdfbGluZUludGVycG9sYXRvcnMgPSBkMy5tYXAoe1xuICAgIGxpbmVhcjogZDNfc3ZnX2xpbmVMaW5lYXIsXG4gICAgXCJsaW5lYXItY2xvc2VkXCI6IGQzX3N2Z19saW5lTGluZWFyQ2xvc2VkLFxuICAgIHN0ZXA6IGQzX3N2Z19saW5lU3RlcCxcbiAgICBcInN0ZXAtYmVmb3JlXCI6IGQzX3N2Z19saW5lU3RlcEJlZm9yZSxcbiAgICBcInN0ZXAtYWZ0ZXJcIjogZDNfc3ZnX2xpbmVTdGVwQWZ0ZXIsXG4gICAgYmFzaXM6IGQzX3N2Z19saW5lQmFzaXMsXG4gICAgXCJiYXNpcy1vcGVuXCI6IGQzX3N2Z19saW5lQmFzaXNPcGVuLFxuICAgIFwiYmFzaXMtY2xvc2VkXCI6IGQzX3N2Z19saW5lQmFzaXNDbG9zZWQsXG4gICAgYnVuZGxlOiBkM19zdmdfbGluZUJ1bmRsZSxcbiAgICBjYXJkaW5hbDogZDNfc3ZnX2xpbmVDYXJkaW5hbCxcbiAgICBcImNhcmRpbmFsLW9wZW5cIjogZDNfc3ZnX2xpbmVDYXJkaW5hbE9wZW4sXG4gICAgXCJjYXJkaW5hbC1jbG9zZWRcIjogZDNfc3ZnX2xpbmVDYXJkaW5hbENsb3NlZCxcbiAgICBtb25vdG9uZTogZDNfc3ZnX2xpbmVNb25vdG9uZVxuICB9KTtcbiAgZDNfc3ZnX2xpbmVJbnRlcnBvbGF0b3JzLmZvckVhY2goZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgIHZhbHVlLmtleSA9IGtleTtcbiAgICB2YWx1ZS5jbG9zZWQgPSAvLWNsb3NlZCQvLnRlc3Qoa2V5KTtcbiAgfSk7XG4gIGZ1bmN0aW9uIGQzX3N2Z19saW5lTGluZWFyKHBvaW50cykge1xuICAgIHJldHVybiBwb2ludHMuam9pbihcIkxcIik7XG4gIH1cbiAgZnVuY3Rpb24gZDNfc3ZnX2xpbmVMaW5lYXJDbG9zZWQocG9pbnRzKSB7XG4gICAgcmV0dXJuIGQzX3N2Z19saW5lTGluZWFyKHBvaW50cykgKyBcIlpcIjtcbiAgfVxuICBmdW5jdGlvbiBkM19zdmdfbGluZVN0ZXAocG9pbnRzKSB7XG4gICAgdmFyIGkgPSAwLCBuID0gcG9pbnRzLmxlbmd0aCwgcCA9IHBvaW50c1swXSwgcGF0aCA9IFsgcFswXSwgXCIsXCIsIHBbMV0gXTtcbiAgICB3aGlsZSAoKytpIDwgbikgcGF0aC5wdXNoKFwiSFwiLCAocFswXSArIChwID0gcG9pbnRzW2ldKVswXSkgLyAyLCBcIlZcIiwgcFsxXSk7XG4gICAgaWYgKG4gPiAxKSBwYXRoLnB1c2goXCJIXCIsIHBbMF0pO1xuICAgIHJldHVybiBwYXRoLmpvaW4oXCJcIik7XG4gIH1cbiAgZnVuY3Rpb24gZDNfc3ZnX2xpbmVTdGVwQmVmb3JlKHBvaW50cykge1xuICAgIHZhciBpID0gMCwgbiA9IHBvaW50cy5sZW5ndGgsIHAgPSBwb2ludHNbMF0sIHBhdGggPSBbIHBbMF0sIFwiLFwiLCBwWzFdIF07XG4gICAgd2hpbGUgKCsraSA8IG4pIHBhdGgucHVzaChcIlZcIiwgKHAgPSBwb2ludHNbaV0pWzFdLCBcIkhcIiwgcFswXSk7XG4gICAgcmV0dXJuIHBhdGguam9pbihcIlwiKTtcbiAgfVxuICBmdW5jdGlvbiBkM19zdmdfbGluZVN0ZXBBZnRlcihwb2ludHMpIHtcbiAgICB2YXIgaSA9IDAsIG4gPSBwb2ludHMubGVuZ3RoLCBwID0gcG9pbnRzWzBdLCBwYXRoID0gWyBwWzBdLCBcIixcIiwgcFsxXSBdO1xuICAgIHdoaWxlICgrK2kgPCBuKSBwYXRoLnB1c2goXCJIXCIsIChwID0gcG9pbnRzW2ldKVswXSwgXCJWXCIsIHBbMV0pO1xuICAgIHJldHVybiBwYXRoLmpvaW4oXCJcIik7XG4gIH1cbiAgZnVuY3Rpb24gZDNfc3ZnX2xpbmVDYXJkaW5hbE9wZW4ocG9pbnRzLCB0ZW5zaW9uKSB7XG4gICAgcmV0dXJuIHBvaW50cy5sZW5ndGggPCA0ID8gZDNfc3ZnX2xpbmVMaW5lYXIocG9pbnRzKSA6IHBvaW50c1sxXSArIGQzX3N2Z19saW5lSGVybWl0ZShwb2ludHMuc2xpY2UoMSwgLTEpLCBkM19zdmdfbGluZUNhcmRpbmFsVGFuZ2VudHMocG9pbnRzLCB0ZW5zaW9uKSk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfc3ZnX2xpbmVDYXJkaW5hbENsb3NlZChwb2ludHMsIHRlbnNpb24pIHtcbiAgICByZXR1cm4gcG9pbnRzLmxlbmd0aCA8IDMgPyBkM19zdmdfbGluZUxpbmVhcihwb2ludHMpIDogcG9pbnRzWzBdICsgZDNfc3ZnX2xpbmVIZXJtaXRlKChwb2ludHMucHVzaChwb2ludHNbMF0pLCBcbiAgICBwb2ludHMpLCBkM19zdmdfbGluZUNhcmRpbmFsVGFuZ2VudHMoWyBwb2ludHNbcG9pbnRzLmxlbmd0aCAtIDJdIF0uY29uY2F0KHBvaW50cywgWyBwb2ludHNbMV0gXSksIHRlbnNpb24pKTtcbiAgfVxuICBmdW5jdGlvbiBkM19zdmdfbGluZUNhcmRpbmFsKHBvaW50cywgdGVuc2lvbikge1xuICAgIHJldHVybiBwb2ludHMubGVuZ3RoIDwgMyA/IGQzX3N2Z19saW5lTGluZWFyKHBvaW50cykgOiBwb2ludHNbMF0gKyBkM19zdmdfbGluZUhlcm1pdGUocG9pbnRzLCBkM19zdmdfbGluZUNhcmRpbmFsVGFuZ2VudHMocG9pbnRzLCB0ZW5zaW9uKSk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfc3ZnX2xpbmVIZXJtaXRlKHBvaW50cywgdGFuZ2VudHMpIHtcbiAgICBpZiAodGFuZ2VudHMubGVuZ3RoIDwgMSB8fCBwb2ludHMubGVuZ3RoICE9IHRhbmdlbnRzLmxlbmd0aCAmJiBwb2ludHMubGVuZ3RoICE9IHRhbmdlbnRzLmxlbmd0aCArIDIpIHtcbiAgICAgIHJldHVybiBkM19zdmdfbGluZUxpbmVhcihwb2ludHMpO1xuICAgIH1cbiAgICB2YXIgcXVhZCA9IHBvaW50cy5sZW5ndGggIT0gdGFuZ2VudHMubGVuZ3RoLCBwYXRoID0gXCJcIiwgcDAgPSBwb2ludHNbMF0sIHAgPSBwb2ludHNbMV0sIHQwID0gdGFuZ2VudHNbMF0sIHQgPSB0MCwgcGkgPSAxO1xuICAgIGlmIChxdWFkKSB7XG4gICAgICBwYXRoICs9IFwiUVwiICsgKHBbMF0gLSB0MFswXSAqIDIgLyAzKSArIFwiLFwiICsgKHBbMV0gLSB0MFsxXSAqIDIgLyAzKSArIFwiLFwiICsgcFswXSArIFwiLFwiICsgcFsxXTtcbiAgICAgIHAwID0gcG9pbnRzWzFdO1xuICAgICAgcGkgPSAyO1xuICAgIH1cbiAgICBpZiAodGFuZ2VudHMubGVuZ3RoID4gMSkge1xuICAgICAgdCA9IHRhbmdlbnRzWzFdO1xuICAgICAgcCA9IHBvaW50c1twaV07XG4gICAgICBwaSsrO1xuICAgICAgcGF0aCArPSBcIkNcIiArIChwMFswXSArIHQwWzBdKSArIFwiLFwiICsgKHAwWzFdICsgdDBbMV0pICsgXCIsXCIgKyAocFswXSAtIHRbMF0pICsgXCIsXCIgKyAocFsxXSAtIHRbMV0pICsgXCIsXCIgKyBwWzBdICsgXCIsXCIgKyBwWzFdO1xuICAgICAgZm9yICh2YXIgaSA9IDI7IGkgPCB0YW5nZW50cy5sZW5ndGg7IGkrKywgcGkrKykge1xuICAgICAgICBwID0gcG9pbnRzW3BpXTtcbiAgICAgICAgdCA9IHRhbmdlbnRzW2ldO1xuICAgICAgICBwYXRoICs9IFwiU1wiICsgKHBbMF0gLSB0WzBdKSArIFwiLFwiICsgKHBbMV0gLSB0WzFdKSArIFwiLFwiICsgcFswXSArIFwiLFwiICsgcFsxXTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHF1YWQpIHtcbiAgICAgIHZhciBscCA9IHBvaW50c1twaV07XG4gICAgICBwYXRoICs9IFwiUVwiICsgKHBbMF0gKyB0WzBdICogMiAvIDMpICsgXCIsXCIgKyAocFsxXSArIHRbMV0gKiAyIC8gMykgKyBcIixcIiArIGxwWzBdICsgXCIsXCIgKyBscFsxXTtcbiAgICB9XG4gICAgcmV0dXJuIHBhdGg7XG4gIH1cbiAgZnVuY3Rpb24gZDNfc3ZnX2xpbmVDYXJkaW5hbFRhbmdlbnRzKHBvaW50cywgdGVuc2lvbikge1xuICAgIHZhciB0YW5nZW50cyA9IFtdLCBhID0gKDEgLSB0ZW5zaW9uKSAvIDIsIHAwLCBwMSA9IHBvaW50c1swXSwgcDIgPSBwb2ludHNbMV0sIGkgPSAxLCBuID0gcG9pbnRzLmxlbmd0aDtcbiAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgcDAgPSBwMTtcbiAgICAgIHAxID0gcDI7XG4gICAgICBwMiA9IHBvaW50c1tpXTtcbiAgICAgIHRhbmdlbnRzLnB1c2goWyBhICogKHAyWzBdIC0gcDBbMF0pLCBhICogKHAyWzFdIC0gcDBbMV0pIF0pO1xuICAgIH1cbiAgICByZXR1cm4gdGFuZ2VudHM7XG4gIH1cbiAgZnVuY3Rpb24gZDNfc3ZnX2xpbmVCYXNpcyhwb2ludHMpIHtcbiAgICBpZiAocG9pbnRzLmxlbmd0aCA8IDMpIHJldHVybiBkM19zdmdfbGluZUxpbmVhcihwb2ludHMpO1xuICAgIHZhciBpID0gMSwgbiA9IHBvaW50cy5sZW5ndGgsIHBpID0gcG9pbnRzWzBdLCB4MCA9IHBpWzBdLCB5MCA9IHBpWzFdLCBweCA9IFsgeDAsIHgwLCB4MCwgKHBpID0gcG9pbnRzWzFdKVswXSBdLCBweSA9IFsgeTAsIHkwLCB5MCwgcGlbMV0gXSwgcGF0aCA9IFsgeDAsIFwiLFwiLCB5MCwgXCJMXCIsIGQzX3N2Z19saW5lRG90NChkM19zdmdfbGluZUJhc2lzQmV6aWVyMywgcHgpLCBcIixcIiwgZDNfc3ZnX2xpbmVEb3Q0KGQzX3N2Z19saW5lQmFzaXNCZXppZXIzLCBweSkgXTtcbiAgICBwb2ludHMucHVzaChwb2ludHNbbiAtIDFdKTtcbiAgICB3aGlsZSAoKytpIDw9IG4pIHtcbiAgICAgIHBpID0gcG9pbnRzW2ldO1xuICAgICAgcHguc2hpZnQoKTtcbiAgICAgIHB4LnB1c2gocGlbMF0pO1xuICAgICAgcHkuc2hpZnQoKTtcbiAgICAgIHB5LnB1c2gocGlbMV0pO1xuICAgICAgZDNfc3ZnX2xpbmVCYXNpc0JlemllcihwYXRoLCBweCwgcHkpO1xuICAgIH1cbiAgICBwb2ludHMucG9wKCk7XG4gICAgcGF0aC5wdXNoKFwiTFwiLCBwaSk7XG4gICAgcmV0dXJuIHBhdGguam9pbihcIlwiKTtcbiAgfVxuICBmdW5jdGlvbiBkM19zdmdfbGluZUJhc2lzT3Blbihwb2ludHMpIHtcbiAgICBpZiAocG9pbnRzLmxlbmd0aCA8IDQpIHJldHVybiBkM19zdmdfbGluZUxpbmVhcihwb2ludHMpO1xuICAgIHZhciBwYXRoID0gW10sIGkgPSAtMSwgbiA9IHBvaW50cy5sZW5ndGgsIHBpLCBweCA9IFsgMCBdLCBweSA9IFsgMCBdO1xuICAgIHdoaWxlICgrK2kgPCAzKSB7XG4gICAgICBwaSA9IHBvaW50c1tpXTtcbiAgICAgIHB4LnB1c2gocGlbMF0pO1xuICAgICAgcHkucHVzaChwaVsxXSk7XG4gICAgfVxuICAgIHBhdGgucHVzaChkM19zdmdfbGluZURvdDQoZDNfc3ZnX2xpbmVCYXNpc0JlemllcjMsIHB4KSArIFwiLFwiICsgZDNfc3ZnX2xpbmVEb3Q0KGQzX3N2Z19saW5lQmFzaXNCZXppZXIzLCBweSkpO1xuICAgIC0taTtcbiAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgcGkgPSBwb2ludHNbaV07XG4gICAgICBweC5zaGlmdCgpO1xuICAgICAgcHgucHVzaChwaVswXSk7XG4gICAgICBweS5zaGlmdCgpO1xuICAgICAgcHkucHVzaChwaVsxXSk7XG4gICAgICBkM19zdmdfbGluZUJhc2lzQmV6aWVyKHBhdGgsIHB4LCBweSk7XG4gICAgfVxuICAgIHJldHVybiBwYXRoLmpvaW4oXCJcIik7XG4gIH1cbiAgZnVuY3Rpb24gZDNfc3ZnX2xpbmVCYXNpc0Nsb3NlZChwb2ludHMpIHtcbiAgICB2YXIgcGF0aCwgaSA9IC0xLCBuID0gcG9pbnRzLmxlbmd0aCwgbSA9IG4gKyA0LCBwaSwgcHggPSBbXSwgcHkgPSBbXTtcbiAgICB3aGlsZSAoKytpIDwgNCkge1xuICAgICAgcGkgPSBwb2ludHNbaSAlIG5dO1xuICAgICAgcHgucHVzaChwaVswXSk7XG4gICAgICBweS5wdXNoKHBpWzFdKTtcbiAgICB9XG4gICAgcGF0aCA9IFsgZDNfc3ZnX2xpbmVEb3Q0KGQzX3N2Z19saW5lQmFzaXNCZXppZXIzLCBweCksIFwiLFwiLCBkM19zdmdfbGluZURvdDQoZDNfc3ZnX2xpbmVCYXNpc0JlemllcjMsIHB5KSBdO1xuICAgIC0taTtcbiAgICB3aGlsZSAoKytpIDwgbSkge1xuICAgICAgcGkgPSBwb2ludHNbaSAlIG5dO1xuICAgICAgcHguc2hpZnQoKTtcbiAgICAgIHB4LnB1c2gocGlbMF0pO1xuICAgICAgcHkuc2hpZnQoKTtcbiAgICAgIHB5LnB1c2gocGlbMV0pO1xuICAgICAgZDNfc3ZnX2xpbmVCYXNpc0JlemllcihwYXRoLCBweCwgcHkpO1xuICAgIH1cbiAgICByZXR1cm4gcGF0aC5qb2luKFwiXCIpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3N2Z19saW5lQnVuZGxlKHBvaW50cywgdGVuc2lvbikge1xuICAgIHZhciBuID0gcG9pbnRzLmxlbmd0aCAtIDE7XG4gICAgaWYgKG4pIHtcbiAgICAgIHZhciB4MCA9IHBvaW50c1swXVswXSwgeTAgPSBwb2ludHNbMF1bMV0sIGR4ID0gcG9pbnRzW25dWzBdIC0geDAsIGR5ID0gcG9pbnRzW25dWzFdIC0geTAsIGkgPSAtMSwgcCwgdDtcbiAgICAgIHdoaWxlICgrK2kgPD0gbikge1xuICAgICAgICBwID0gcG9pbnRzW2ldO1xuICAgICAgICB0ID0gaSAvIG47XG4gICAgICAgIHBbMF0gPSB0ZW5zaW9uICogcFswXSArICgxIC0gdGVuc2lvbikgKiAoeDAgKyB0ICogZHgpO1xuICAgICAgICBwWzFdID0gdGVuc2lvbiAqIHBbMV0gKyAoMSAtIHRlbnNpb24pICogKHkwICsgdCAqIGR5KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGQzX3N2Z19saW5lQmFzaXMocG9pbnRzKTtcbiAgfVxuICBmdW5jdGlvbiBkM19zdmdfbGluZURvdDQoYSwgYikge1xuICAgIHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdICsgYVsyXSAqIGJbMl0gKyBhWzNdICogYlszXTtcbiAgfVxuICB2YXIgZDNfc3ZnX2xpbmVCYXNpc0JlemllcjEgPSBbIDAsIDIgLyAzLCAxIC8gMywgMCBdLCBkM19zdmdfbGluZUJhc2lzQmV6aWVyMiA9IFsgMCwgMSAvIDMsIDIgLyAzLCAwIF0sIGQzX3N2Z19saW5lQmFzaXNCZXppZXIzID0gWyAwLCAxIC8gNiwgMiAvIDMsIDEgLyA2IF07XG4gIGZ1bmN0aW9uIGQzX3N2Z19saW5lQmFzaXNCZXppZXIocGF0aCwgeCwgeSkge1xuICAgIHBhdGgucHVzaChcIkNcIiwgZDNfc3ZnX2xpbmVEb3Q0KGQzX3N2Z19saW5lQmFzaXNCZXppZXIxLCB4KSwgXCIsXCIsIGQzX3N2Z19saW5lRG90NChkM19zdmdfbGluZUJhc2lzQmV6aWVyMSwgeSksIFwiLFwiLCBkM19zdmdfbGluZURvdDQoZDNfc3ZnX2xpbmVCYXNpc0JlemllcjIsIHgpLCBcIixcIiwgZDNfc3ZnX2xpbmVEb3Q0KGQzX3N2Z19saW5lQmFzaXNCZXppZXIyLCB5KSwgXCIsXCIsIGQzX3N2Z19saW5lRG90NChkM19zdmdfbGluZUJhc2lzQmV6aWVyMywgeCksIFwiLFwiLCBkM19zdmdfbGluZURvdDQoZDNfc3ZnX2xpbmVCYXNpc0JlemllcjMsIHkpKTtcbiAgfVxuICBmdW5jdGlvbiBkM19zdmdfbGluZVNsb3BlKHAwLCBwMSkge1xuICAgIHJldHVybiAocDFbMV0gLSBwMFsxXSkgLyAocDFbMF0gLSBwMFswXSk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfc3ZnX2xpbmVGaW5pdGVEaWZmZXJlbmNlcyhwb2ludHMpIHtcbiAgICB2YXIgaSA9IDAsIGogPSBwb2ludHMubGVuZ3RoIC0gMSwgbSA9IFtdLCBwMCA9IHBvaW50c1swXSwgcDEgPSBwb2ludHNbMV0sIGQgPSBtWzBdID0gZDNfc3ZnX2xpbmVTbG9wZShwMCwgcDEpO1xuICAgIHdoaWxlICgrK2kgPCBqKSB7XG4gICAgICBtW2ldID0gKGQgKyAoZCA9IGQzX3N2Z19saW5lU2xvcGUocDAgPSBwMSwgcDEgPSBwb2ludHNbaSArIDFdKSkpIC8gMjtcbiAgICB9XG4gICAgbVtpXSA9IGQ7XG4gICAgcmV0dXJuIG07XG4gIH1cbiAgZnVuY3Rpb24gZDNfc3ZnX2xpbmVNb25vdG9uZVRhbmdlbnRzKHBvaW50cykge1xuICAgIHZhciB0YW5nZW50cyA9IFtdLCBkLCBhLCBiLCBzLCBtID0gZDNfc3ZnX2xpbmVGaW5pdGVEaWZmZXJlbmNlcyhwb2ludHMpLCBpID0gLTEsIGogPSBwb2ludHMubGVuZ3RoIC0gMTtcbiAgICB3aGlsZSAoKytpIDwgaikge1xuICAgICAgZCA9IGQzX3N2Z19saW5lU2xvcGUocG9pbnRzW2ldLCBwb2ludHNbaSArIDFdKTtcbiAgICAgIGlmIChhYnMoZCkgPCDOtSkge1xuICAgICAgICBtW2ldID0gbVtpICsgMV0gPSAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYSA9IG1baV0gLyBkO1xuICAgICAgICBiID0gbVtpICsgMV0gLyBkO1xuICAgICAgICBzID0gYSAqIGEgKyBiICogYjtcbiAgICAgICAgaWYgKHMgPiA5KSB7XG4gICAgICAgICAgcyA9IGQgKiAzIC8gTWF0aC5zcXJ0KHMpO1xuICAgICAgICAgIG1baV0gPSBzICogYTtcbiAgICAgICAgICBtW2kgKyAxXSA9IHMgKiBiO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGkgPSAtMTtcbiAgICB3aGlsZSAoKytpIDw9IGopIHtcbiAgICAgIHMgPSAocG9pbnRzW01hdGgubWluKGosIGkgKyAxKV1bMF0gLSBwb2ludHNbTWF0aC5tYXgoMCwgaSAtIDEpXVswXSkgLyAoNiAqICgxICsgbVtpXSAqIG1baV0pKTtcbiAgICAgIHRhbmdlbnRzLnB1c2goWyBzIHx8IDAsIG1baV0gKiBzIHx8IDAgXSk7XG4gICAgfVxuICAgIHJldHVybiB0YW5nZW50cztcbiAgfVxuICBmdW5jdGlvbiBkM19zdmdfbGluZU1vbm90b25lKHBvaW50cykge1xuICAgIHJldHVybiBwb2ludHMubGVuZ3RoIDwgMyA/IGQzX3N2Z19saW5lTGluZWFyKHBvaW50cykgOiBwb2ludHNbMF0gKyBkM19zdmdfbGluZUhlcm1pdGUocG9pbnRzLCBkM19zdmdfbGluZU1vbm90b25lVGFuZ2VudHMocG9pbnRzKSk7XG4gIH1cbiAgZDMuc3ZnLmxpbmUucmFkaWFsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxpbmUgPSBkM19zdmdfbGluZShkM19zdmdfbGluZVJhZGlhbCk7XG4gICAgbGluZS5yYWRpdXMgPSBsaW5lLngsIGRlbGV0ZSBsaW5lLng7XG4gICAgbGluZS5hbmdsZSA9IGxpbmUueSwgZGVsZXRlIGxpbmUueTtcbiAgICByZXR1cm4gbGluZTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfc3ZnX2xpbmVSYWRpYWwocG9pbnRzKSB7XG4gICAgdmFyIHBvaW50LCBpID0gLTEsIG4gPSBwb2ludHMubGVuZ3RoLCByLCBhO1xuICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICBwb2ludCA9IHBvaW50c1tpXTtcbiAgICAgIHIgPSBwb2ludFswXTtcbiAgICAgIGEgPSBwb2ludFsxXSAtIGhhbGbPgDtcbiAgICAgIHBvaW50WzBdID0gciAqIE1hdGguY29zKGEpO1xuICAgICAgcG9pbnRbMV0gPSByICogTWF0aC5zaW4oYSk7XG4gICAgfVxuICAgIHJldHVybiBwb2ludHM7XG4gIH1cbiAgZnVuY3Rpb24gZDNfc3ZnX2FyZWEocHJvamVjdGlvbikge1xuICAgIHZhciB4MCA9IGQzX2dlb21fcG9pbnRYLCB4MSA9IGQzX2dlb21fcG9pbnRYLCB5MCA9IDAsIHkxID0gZDNfZ2VvbV9wb2ludFksIGRlZmluZWQgPSBkM190cnVlLCBpbnRlcnBvbGF0ZSA9IGQzX3N2Z19saW5lTGluZWFyLCBpbnRlcnBvbGF0ZUtleSA9IGludGVycG9sYXRlLmtleSwgaW50ZXJwb2xhdGVSZXZlcnNlID0gaW50ZXJwb2xhdGUsIEwgPSBcIkxcIiwgdGVuc2lvbiA9IC43O1xuICAgIGZ1bmN0aW9uIGFyZWEoZGF0YSkge1xuICAgICAgdmFyIHNlZ21lbnRzID0gW10sIHBvaW50czAgPSBbXSwgcG9pbnRzMSA9IFtdLCBpID0gLTEsIG4gPSBkYXRhLmxlbmd0aCwgZCwgZngwID0gZDNfZnVuY3Rvcih4MCksIGZ5MCA9IGQzX2Z1bmN0b3IoeTApLCBmeDEgPSB4MCA9PT0geDEgPyBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgICB9IDogZDNfZnVuY3Rvcih4MSksIGZ5MSA9IHkwID09PSB5MSA/IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4geTtcbiAgICAgIH0gOiBkM19mdW5jdG9yKHkxKSwgeCwgeTtcbiAgICAgIGZ1bmN0aW9uIHNlZ21lbnQoKSB7XG4gICAgICAgIHNlZ21lbnRzLnB1c2goXCJNXCIsIGludGVycG9sYXRlKHByb2plY3Rpb24ocG9pbnRzMSksIHRlbnNpb24pLCBMLCBpbnRlcnBvbGF0ZVJldmVyc2UocHJvamVjdGlvbihwb2ludHMwLnJldmVyc2UoKSksIHRlbnNpb24pLCBcIlpcIik7XG4gICAgICB9XG4gICAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgICBpZiAoZGVmaW5lZC5jYWxsKHRoaXMsIGQgPSBkYXRhW2ldLCBpKSkge1xuICAgICAgICAgIHBvaW50czAucHVzaChbIHggPSArZngwLmNhbGwodGhpcywgZCwgaSksIHkgPSArZnkwLmNhbGwodGhpcywgZCwgaSkgXSk7XG4gICAgICAgICAgcG9pbnRzMS5wdXNoKFsgK2Z4MS5jYWxsKHRoaXMsIGQsIGkpLCArZnkxLmNhbGwodGhpcywgZCwgaSkgXSk7XG4gICAgICAgIH0gZWxzZSBpZiAocG9pbnRzMC5sZW5ndGgpIHtcbiAgICAgICAgICBzZWdtZW50KCk7XG4gICAgICAgICAgcG9pbnRzMCA9IFtdO1xuICAgICAgICAgIHBvaW50czEgPSBbXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHBvaW50czAubGVuZ3RoKSBzZWdtZW50KCk7XG4gICAgICByZXR1cm4gc2VnbWVudHMubGVuZ3RoID8gc2VnbWVudHMuam9pbihcIlwiKSA6IG51bGw7XG4gICAgfVxuICAgIGFyZWEueCA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHgxO1xuICAgICAgeDAgPSB4MSA9IF87XG4gICAgICByZXR1cm4gYXJlYTtcbiAgICB9O1xuICAgIGFyZWEueDAgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB4MDtcbiAgICAgIHgwID0gXztcbiAgICAgIHJldHVybiBhcmVhO1xuICAgIH07XG4gICAgYXJlYS54MSA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHgxO1xuICAgICAgeDEgPSBfO1xuICAgICAgcmV0dXJuIGFyZWE7XG4gICAgfTtcbiAgICBhcmVhLnkgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB5MTtcbiAgICAgIHkwID0geTEgPSBfO1xuICAgICAgcmV0dXJuIGFyZWE7XG4gICAgfTtcbiAgICBhcmVhLnkwID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4geTA7XG4gICAgICB5MCA9IF87XG4gICAgICByZXR1cm4gYXJlYTtcbiAgICB9O1xuICAgIGFyZWEueTEgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB5MTtcbiAgICAgIHkxID0gXztcbiAgICAgIHJldHVybiBhcmVhO1xuICAgIH07XG4gICAgYXJlYS5kZWZpbmVkID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gZGVmaW5lZDtcbiAgICAgIGRlZmluZWQgPSBfO1xuICAgICAgcmV0dXJuIGFyZWE7XG4gICAgfTtcbiAgICBhcmVhLmludGVycG9sYXRlID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gaW50ZXJwb2xhdGVLZXk7XG4gICAgICBpZiAodHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIikgaW50ZXJwb2xhdGVLZXkgPSBpbnRlcnBvbGF0ZSA9IF87IGVsc2UgaW50ZXJwb2xhdGVLZXkgPSAoaW50ZXJwb2xhdGUgPSBkM19zdmdfbGluZUludGVycG9sYXRvcnMuZ2V0KF8pIHx8IGQzX3N2Z19saW5lTGluZWFyKS5rZXk7XG4gICAgICBpbnRlcnBvbGF0ZVJldmVyc2UgPSBpbnRlcnBvbGF0ZS5yZXZlcnNlIHx8IGludGVycG9sYXRlO1xuICAgICAgTCA9IGludGVycG9sYXRlLmNsb3NlZCA/IFwiTVwiIDogXCJMXCI7XG4gICAgICByZXR1cm4gYXJlYTtcbiAgICB9O1xuICAgIGFyZWEudGVuc2lvbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRlbnNpb247XG4gICAgICB0ZW5zaW9uID0gXztcbiAgICAgIHJldHVybiBhcmVhO1xuICAgIH07XG4gICAgcmV0dXJuIGFyZWE7XG4gIH1cbiAgZDNfc3ZnX2xpbmVTdGVwQmVmb3JlLnJldmVyc2UgPSBkM19zdmdfbGluZVN0ZXBBZnRlcjtcbiAgZDNfc3ZnX2xpbmVTdGVwQWZ0ZXIucmV2ZXJzZSA9IGQzX3N2Z19saW5lU3RlcEJlZm9yZTtcbiAgZDMuc3ZnLmFyZWEgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDNfc3ZnX2FyZWEoZDNfaWRlbnRpdHkpO1xuICB9O1xuICBkMy5zdmcuYXJlYS5yYWRpYWwgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJlYSA9IGQzX3N2Z19hcmVhKGQzX3N2Z19saW5lUmFkaWFsKTtcbiAgICBhcmVhLnJhZGl1cyA9IGFyZWEueCwgZGVsZXRlIGFyZWEueDtcbiAgICBhcmVhLmlubmVyUmFkaXVzID0gYXJlYS54MCwgZGVsZXRlIGFyZWEueDA7XG4gICAgYXJlYS5vdXRlclJhZGl1cyA9IGFyZWEueDEsIGRlbGV0ZSBhcmVhLngxO1xuICAgIGFyZWEuYW5nbGUgPSBhcmVhLnksIGRlbGV0ZSBhcmVhLnk7XG4gICAgYXJlYS5zdGFydEFuZ2xlID0gYXJlYS55MCwgZGVsZXRlIGFyZWEueTA7XG4gICAgYXJlYS5lbmRBbmdsZSA9IGFyZWEueTEsIGRlbGV0ZSBhcmVhLnkxO1xuICAgIHJldHVybiBhcmVhO1xuICB9O1xuICBkMy5zdmcuY2hvcmQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc291cmNlID0gZDNfc291cmNlLCB0YXJnZXQgPSBkM190YXJnZXQsIHJhZGl1cyA9IGQzX3N2Z19jaG9yZFJhZGl1cywgc3RhcnRBbmdsZSA9IGQzX3N2Z19hcmNTdGFydEFuZ2xlLCBlbmRBbmdsZSA9IGQzX3N2Z19hcmNFbmRBbmdsZTtcbiAgICBmdW5jdGlvbiBjaG9yZChkLCBpKSB7XG4gICAgICB2YXIgcyA9IHN1Ymdyb3VwKHRoaXMsIHNvdXJjZSwgZCwgaSksIHQgPSBzdWJncm91cCh0aGlzLCB0YXJnZXQsIGQsIGkpO1xuICAgICAgcmV0dXJuIFwiTVwiICsgcy5wMCArIGFyYyhzLnIsIHMucDEsIHMuYTEgLSBzLmEwKSArIChlcXVhbHMocywgdCkgPyBjdXJ2ZShzLnIsIHMucDEsIHMuciwgcy5wMCkgOiBjdXJ2ZShzLnIsIHMucDEsIHQuciwgdC5wMCkgKyBhcmModC5yLCB0LnAxLCB0LmExIC0gdC5hMCkgKyBjdXJ2ZSh0LnIsIHQucDEsIHMuciwgcy5wMCkpICsgXCJaXCI7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHN1Ymdyb3VwKHNlbGYsIGYsIGQsIGkpIHtcbiAgICAgIHZhciBzdWJncm91cCA9IGYuY2FsbChzZWxmLCBkLCBpKSwgciA9IHJhZGl1cy5jYWxsKHNlbGYsIHN1Ymdyb3VwLCBpKSwgYTAgPSBzdGFydEFuZ2xlLmNhbGwoc2VsZiwgc3ViZ3JvdXAsIGkpIC0gaGFsZs+ALCBhMSA9IGVuZEFuZ2xlLmNhbGwoc2VsZiwgc3ViZ3JvdXAsIGkpIC0gaGFsZs+AO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcjogcixcbiAgICAgICAgYTA6IGEwLFxuICAgICAgICBhMTogYTEsXG4gICAgICAgIHAwOiBbIHIgKiBNYXRoLmNvcyhhMCksIHIgKiBNYXRoLnNpbihhMCkgXSxcbiAgICAgICAgcDE6IFsgciAqIE1hdGguY29zKGExKSwgciAqIE1hdGguc2luKGExKSBdXG4gICAgICB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiBlcXVhbHMoYSwgYikge1xuICAgICAgcmV0dXJuIGEuYTAgPT0gYi5hMCAmJiBhLmExID09IGIuYTE7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGFyYyhyLCBwLCBhKSB7XG4gICAgICByZXR1cm4gXCJBXCIgKyByICsgXCIsXCIgKyByICsgXCIgMCBcIiArICsoYSA+IM+AKSArIFwiLDEgXCIgKyBwO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjdXJ2ZShyMCwgcDAsIHIxLCBwMSkge1xuICAgICAgcmV0dXJuIFwiUSAwLDAgXCIgKyBwMTtcbiAgICB9XG4gICAgY2hvcmQucmFkaXVzID0gZnVuY3Rpb24odikge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gcmFkaXVzO1xuICAgICAgcmFkaXVzID0gZDNfZnVuY3Rvcih2KTtcbiAgICAgIHJldHVybiBjaG9yZDtcbiAgICB9O1xuICAgIGNob3JkLnNvdXJjZSA9IGZ1bmN0aW9uKHYpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHNvdXJjZTtcbiAgICAgIHNvdXJjZSA9IGQzX2Z1bmN0b3Iodik7XG4gICAgICByZXR1cm4gY2hvcmQ7XG4gICAgfTtcbiAgICBjaG9yZC50YXJnZXQgPSBmdW5jdGlvbih2KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0YXJnZXQ7XG4gICAgICB0YXJnZXQgPSBkM19mdW5jdG9yKHYpO1xuICAgICAgcmV0dXJuIGNob3JkO1xuICAgIH07XG4gICAgY2hvcmQuc3RhcnRBbmdsZSA9IGZ1bmN0aW9uKHYpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHN0YXJ0QW5nbGU7XG4gICAgICBzdGFydEFuZ2xlID0gZDNfZnVuY3Rvcih2KTtcbiAgICAgIHJldHVybiBjaG9yZDtcbiAgICB9O1xuICAgIGNob3JkLmVuZEFuZ2xlID0gZnVuY3Rpb24odikge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gZW5kQW5nbGU7XG4gICAgICBlbmRBbmdsZSA9IGQzX2Z1bmN0b3Iodik7XG4gICAgICByZXR1cm4gY2hvcmQ7XG4gICAgfTtcbiAgICByZXR1cm4gY2hvcmQ7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3N2Z19jaG9yZFJhZGl1cyhkKSB7XG4gICAgcmV0dXJuIGQucmFkaXVzO1xuICB9XG4gIGQzLnN2Zy5kaWFnb25hbCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzb3VyY2UgPSBkM19zb3VyY2UsIHRhcmdldCA9IGQzX3RhcmdldCwgcHJvamVjdGlvbiA9IGQzX3N2Z19kaWFnb25hbFByb2plY3Rpb247XG4gICAgZnVuY3Rpb24gZGlhZ29uYWwoZCwgaSkge1xuICAgICAgdmFyIHAwID0gc291cmNlLmNhbGwodGhpcywgZCwgaSksIHAzID0gdGFyZ2V0LmNhbGwodGhpcywgZCwgaSksIG0gPSAocDAueSArIHAzLnkpIC8gMiwgcCA9IFsgcDAsIHtcbiAgICAgICAgeDogcDAueCxcbiAgICAgICAgeTogbVxuICAgICAgfSwge1xuICAgICAgICB4OiBwMy54LFxuICAgICAgICB5OiBtXG4gICAgICB9LCBwMyBdO1xuICAgICAgcCA9IHAubWFwKHByb2plY3Rpb24pO1xuICAgICAgcmV0dXJuIFwiTVwiICsgcFswXSArIFwiQ1wiICsgcFsxXSArIFwiIFwiICsgcFsyXSArIFwiIFwiICsgcFszXTtcbiAgICB9XG4gICAgZGlhZ29uYWwuc291cmNlID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gc291cmNlO1xuICAgICAgc291cmNlID0gZDNfZnVuY3Rvcih4KTtcbiAgICAgIHJldHVybiBkaWFnb25hbDtcbiAgICB9O1xuICAgIGRpYWdvbmFsLnRhcmdldCA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRhcmdldDtcbiAgICAgIHRhcmdldCA9IGQzX2Z1bmN0b3IoeCk7XG4gICAgICByZXR1cm4gZGlhZ29uYWw7XG4gICAgfTtcbiAgICBkaWFnb25hbC5wcm9qZWN0aW9uID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gcHJvamVjdGlvbjtcbiAgICAgIHByb2plY3Rpb24gPSB4O1xuICAgICAgcmV0dXJuIGRpYWdvbmFsO1xuICAgIH07XG4gICAgcmV0dXJuIGRpYWdvbmFsO1xuICB9O1xuICBmdW5jdGlvbiBkM19zdmdfZGlhZ29uYWxQcm9qZWN0aW9uKGQpIHtcbiAgICByZXR1cm4gWyBkLngsIGQueSBdO1xuICB9XG4gIGQzLnN2Zy5kaWFnb25hbC5yYWRpYWwgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGlhZ29uYWwgPSBkMy5zdmcuZGlhZ29uYWwoKSwgcHJvamVjdGlvbiA9IGQzX3N2Z19kaWFnb25hbFByb2plY3Rpb24sIHByb2plY3Rpb25fID0gZGlhZ29uYWwucHJvamVjdGlvbjtcbiAgICBkaWFnb25hbC5wcm9qZWN0aW9uID0gZnVuY3Rpb24oeCkge1xuICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyBwcm9qZWN0aW9uXyhkM19zdmdfZGlhZ29uYWxSYWRpYWxQcm9qZWN0aW9uKHByb2plY3Rpb24gPSB4KSkgOiBwcm9qZWN0aW9uO1xuICAgIH07XG4gICAgcmV0dXJuIGRpYWdvbmFsO1xuICB9O1xuICBmdW5jdGlvbiBkM19zdmdfZGlhZ29uYWxSYWRpYWxQcm9qZWN0aW9uKHByb2plY3Rpb24pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZCA9IHByb2plY3Rpb24uYXBwbHkodGhpcywgYXJndW1lbnRzKSwgciA9IGRbMF0sIGEgPSBkWzFdIC0gaGFsZs+AO1xuICAgICAgcmV0dXJuIFsgciAqIE1hdGguY29zKGEpLCByICogTWF0aC5zaW4oYSkgXTtcbiAgICB9O1xuICB9XG4gIGQzLnN2Zy5zeW1ib2wgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdHlwZSA9IGQzX3N2Z19zeW1ib2xUeXBlLCBzaXplID0gZDNfc3ZnX3N5bWJvbFNpemU7XG4gICAgZnVuY3Rpb24gc3ltYm9sKGQsIGkpIHtcbiAgICAgIHJldHVybiAoZDNfc3ZnX3N5bWJvbHMuZ2V0KHR5cGUuY2FsbCh0aGlzLCBkLCBpKSkgfHwgZDNfc3ZnX3N5bWJvbENpcmNsZSkoc2l6ZS5jYWxsKHRoaXMsIGQsIGkpKTtcbiAgICB9XG4gICAgc3ltYm9sLnR5cGUgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0eXBlO1xuICAgICAgdHlwZSA9IGQzX2Z1bmN0b3IoeCk7XG4gICAgICByZXR1cm4gc3ltYm9sO1xuICAgIH07XG4gICAgc3ltYm9sLnNpemUgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBzaXplO1xuICAgICAgc2l6ZSA9IGQzX2Z1bmN0b3IoeCk7XG4gICAgICByZXR1cm4gc3ltYm9sO1xuICAgIH07XG4gICAgcmV0dXJuIHN5bWJvbDtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfc3ZnX3N5bWJvbFNpemUoKSB7XG4gICAgcmV0dXJuIDY0O1xuICB9XG4gIGZ1bmN0aW9uIGQzX3N2Z19zeW1ib2xUeXBlKCkge1xuICAgIHJldHVybiBcImNpcmNsZVwiO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3N2Z19zeW1ib2xDaXJjbGUoc2l6ZSkge1xuICAgIHZhciByID0gTWF0aC5zcXJ0KHNpemUgLyDPgCk7XG4gICAgcmV0dXJuIFwiTTAsXCIgKyByICsgXCJBXCIgKyByICsgXCIsXCIgKyByICsgXCIgMCAxLDEgMCxcIiArIC1yICsgXCJBXCIgKyByICsgXCIsXCIgKyByICsgXCIgMCAxLDEgMCxcIiArIHIgKyBcIlpcIjtcbiAgfVxuICB2YXIgZDNfc3ZnX3N5bWJvbHMgPSBkMy5tYXAoe1xuICAgIGNpcmNsZTogZDNfc3ZnX3N5bWJvbENpcmNsZSxcbiAgICBjcm9zczogZnVuY3Rpb24oc2l6ZSkge1xuICAgICAgdmFyIHIgPSBNYXRoLnNxcnQoc2l6ZSAvIDUpIC8gMjtcbiAgICAgIHJldHVybiBcIk1cIiArIC0zICogciArIFwiLFwiICsgLXIgKyBcIkhcIiArIC1yICsgXCJWXCIgKyAtMyAqIHIgKyBcIkhcIiArIHIgKyBcIlZcIiArIC1yICsgXCJIXCIgKyAzICogciArIFwiVlwiICsgciArIFwiSFwiICsgciArIFwiVlwiICsgMyAqIHIgKyBcIkhcIiArIC1yICsgXCJWXCIgKyByICsgXCJIXCIgKyAtMyAqIHIgKyBcIlpcIjtcbiAgICB9LFxuICAgIGRpYW1vbmQ6IGZ1bmN0aW9uKHNpemUpIHtcbiAgICAgIHZhciByeSA9IE1hdGguc3FydChzaXplIC8gKDIgKiBkM19zdmdfc3ltYm9sVGFuMzApKSwgcnggPSByeSAqIGQzX3N2Z19zeW1ib2xUYW4zMDtcbiAgICAgIHJldHVybiBcIk0wLFwiICsgLXJ5ICsgXCJMXCIgKyByeCArIFwiLDBcIiArIFwiIDAsXCIgKyByeSArIFwiIFwiICsgLXJ4ICsgXCIsMFwiICsgXCJaXCI7XG4gICAgfSxcbiAgICBzcXVhcmU6IGZ1bmN0aW9uKHNpemUpIHtcbiAgICAgIHZhciByID0gTWF0aC5zcXJ0KHNpemUpIC8gMjtcbiAgICAgIHJldHVybiBcIk1cIiArIC1yICsgXCIsXCIgKyAtciArIFwiTFwiICsgciArIFwiLFwiICsgLXIgKyBcIiBcIiArIHIgKyBcIixcIiArIHIgKyBcIiBcIiArIC1yICsgXCIsXCIgKyByICsgXCJaXCI7XG4gICAgfSxcbiAgICBcInRyaWFuZ2xlLWRvd25cIjogZnVuY3Rpb24oc2l6ZSkge1xuICAgICAgdmFyIHJ4ID0gTWF0aC5zcXJ0KHNpemUgLyBkM19zdmdfc3ltYm9sU3FydDMpLCByeSA9IHJ4ICogZDNfc3ZnX3N5bWJvbFNxcnQzIC8gMjtcbiAgICAgIHJldHVybiBcIk0wLFwiICsgcnkgKyBcIkxcIiArIHJ4ICsgXCIsXCIgKyAtcnkgKyBcIiBcIiArIC1yeCArIFwiLFwiICsgLXJ5ICsgXCJaXCI7XG4gICAgfSxcbiAgICBcInRyaWFuZ2xlLXVwXCI6IGZ1bmN0aW9uKHNpemUpIHtcbiAgICAgIHZhciByeCA9IE1hdGguc3FydChzaXplIC8gZDNfc3ZnX3N5bWJvbFNxcnQzKSwgcnkgPSByeCAqIGQzX3N2Z19zeW1ib2xTcXJ0MyAvIDI7XG4gICAgICByZXR1cm4gXCJNMCxcIiArIC1yeSArIFwiTFwiICsgcnggKyBcIixcIiArIHJ5ICsgXCIgXCIgKyAtcnggKyBcIixcIiArIHJ5ICsgXCJaXCI7XG4gICAgfVxuICB9KTtcbiAgZDMuc3ZnLnN5bWJvbFR5cGVzID0gZDNfc3ZnX3N5bWJvbHMua2V5cygpO1xuICB2YXIgZDNfc3ZnX3N5bWJvbFNxcnQzID0gTWF0aC5zcXJ0KDMpLCBkM19zdmdfc3ltYm9sVGFuMzAgPSBNYXRoLnRhbigzMCAqIGQzX3JhZGlhbnMpO1xuICBkM19zZWxlY3Rpb25Qcm90b3R5cGUudHJhbnNpdGlvbiA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaWQgPSBkM190cmFuc2l0aW9uSW5oZXJpdElkIHx8ICsrZDNfdHJhbnNpdGlvbklkLCBucyA9IGQzX3RyYW5zaXRpb25OYW1lc3BhY2UobmFtZSksIHN1Ymdyb3VwcyA9IFtdLCBzdWJncm91cCwgbm9kZSwgdHJhbnNpdGlvbiA9IGQzX3RyYW5zaXRpb25Jbmhlcml0IHx8IHtcbiAgICAgIHRpbWU6IERhdGUubm93KCksXG4gICAgICBlYXNlOiBkM19lYXNlX2N1YmljSW5PdXQsXG4gICAgICBkZWxheTogMCxcbiAgICAgIGR1cmF0aW9uOiAyNTBcbiAgICB9O1xuICAgIGZvciAodmFyIGogPSAtMSwgbSA9IHRoaXMubGVuZ3RoOyArK2ogPCBtOyApIHtcbiAgICAgIHN1Ymdyb3Vwcy5wdXNoKHN1Ymdyb3VwID0gW10pO1xuICAgICAgZm9yICh2YXIgZ3JvdXAgPSB0aGlzW2pdLCBpID0gLTEsIG4gPSBncm91cC5sZW5ndGg7ICsraSA8IG47ICkge1xuICAgICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSBkM190cmFuc2l0aW9uTm9kZShub2RlLCBpLCBucywgaWQsIHRyYW5zaXRpb24pO1xuICAgICAgICBzdWJncm91cC5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZDNfdHJhbnNpdGlvbihzdWJncm91cHMsIG5zLCBpZCk7XG4gIH07XG4gIGQzX3NlbGVjdGlvblByb3RvdHlwZS5pbnRlcnJ1cHQgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChuYW1lID09IG51bGwgPyBkM19zZWxlY3Rpb25faW50ZXJydXB0IDogZDNfc2VsZWN0aW9uX2ludGVycnVwdE5TKGQzX3RyYW5zaXRpb25OYW1lc3BhY2UobmFtZSkpKTtcbiAgfTtcbiAgdmFyIGQzX3NlbGVjdGlvbl9pbnRlcnJ1cHQgPSBkM19zZWxlY3Rpb25faW50ZXJydXB0TlMoZDNfdHJhbnNpdGlvbk5hbWVzcGFjZSgpKTtcbiAgZnVuY3Rpb24gZDNfc2VsZWN0aW9uX2ludGVycnVwdE5TKG5zKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGxvY2ssIGFjdGl2ZTtcbiAgICAgIGlmICgobG9jayA9IHRoaXNbbnNdKSAmJiAoYWN0aXZlID0gbG9ja1tsb2NrLmFjdGl2ZV0pKSB7XG4gICAgICAgIGlmICgtLWxvY2suY291bnQpIHtcbiAgICAgICAgICBkZWxldGUgbG9ja1tsb2NrLmFjdGl2ZV07XG4gICAgICAgICAgbG9jay5hY3RpdmUgKz0gLjU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVsZXRlIHRoaXNbbnNdO1xuICAgICAgICB9XG4gICAgICAgIGFjdGl2ZS5ldmVudCAmJiBhY3RpdmUuZXZlbnQuaW50ZXJydXB0LmNhbGwodGhpcywgdGhpcy5fX2RhdGFfXywgYWN0aXZlLmluZGV4KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIGQzX3RyYW5zaXRpb24oZ3JvdXBzLCBucywgaWQpIHtcbiAgICBkM19zdWJjbGFzcyhncm91cHMsIGQzX3RyYW5zaXRpb25Qcm90b3R5cGUpO1xuICAgIGdyb3Vwcy5uYW1lc3BhY2UgPSBucztcbiAgICBncm91cHMuaWQgPSBpZDtcbiAgICByZXR1cm4gZ3JvdXBzO1xuICB9XG4gIHZhciBkM190cmFuc2l0aW9uUHJvdG90eXBlID0gW10sIGQzX3RyYW5zaXRpb25JZCA9IDAsIGQzX3RyYW5zaXRpb25Jbmhlcml0SWQsIGQzX3RyYW5zaXRpb25Jbmhlcml0O1xuICBkM190cmFuc2l0aW9uUHJvdG90eXBlLmNhbGwgPSBkM19zZWxlY3Rpb25Qcm90b3R5cGUuY2FsbDtcbiAgZDNfdHJhbnNpdGlvblByb3RvdHlwZS5lbXB0eSA9IGQzX3NlbGVjdGlvblByb3RvdHlwZS5lbXB0eTtcbiAgZDNfdHJhbnNpdGlvblByb3RvdHlwZS5ub2RlID0gZDNfc2VsZWN0aW9uUHJvdG90eXBlLm5vZGU7XG4gIGQzX3RyYW5zaXRpb25Qcm90b3R5cGUuc2l6ZSA9IGQzX3NlbGVjdGlvblByb3RvdHlwZS5zaXplO1xuICBkMy50cmFuc2l0aW9uID0gZnVuY3Rpb24oc2VsZWN0aW9uLCBuYW1lKSB7XG4gICAgcmV0dXJuIHNlbGVjdGlvbiAmJiBzZWxlY3Rpb24udHJhbnNpdGlvbiA/IGQzX3RyYW5zaXRpb25Jbmhlcml0SWQgPyBzZWxlY3Rpb24udHJhbnNpdGlvbihuYW1lKSA6IHNlbGVjdGlvbiA6IGQzX3NlbGVjdGlvblJvb3QudHJhbnNpdGlvbihzZWxlY3Rpb24pO1xuICB9O1xuICBkMy50cmFuc2l0aW9uLnByb3RvdHlwZSA9IGQzX3RyYW5zaXRpb25Qcm90b3R5cGU7XG4gIGQzX3RyYW5zaXRpb25Qcm90b3R5cGUuc2VsZWN0ID0gZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgICB2YXIgaWQgPSB0aGlzLmlkLCBucyA9IHRoaXMubmFtZXNwYWNlLCBzdWJncm91cHMgPSBbXSwgc3ViZ3JvdXAsIHN1Ym5vZGUsIG5vZGU7XG4gICAgc2VsZWN0b3IgPSBkM19zZWxlY3Rpb25fc2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgIGZvciAodmFyIGogPSAtMSwgbSA9IHRoaXMubGVuZ3RoOyArK2ogPCBtOyApIHtcbiAgICAgIHN1Ymdyb3Vwcy5wdXNoKHN1Ymdyb3VwID0gW10pO1xuICAgICAgZm9yICh2YXIgZ3JvdXAgPSB0aGlzW2pdLCBpID0gLTEsIG4gPSBncm91cC5sZW5ndGg7ICsraSA8IG47ICkge1xuICAgICAgICBpZiAoKG5vZGUgPSBncm91cFtpXSkgJiYgKHN1Ym5vZGUgPSBzZWxlY3Rvci5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGopKSkge1xuICAgICAgICAgIGlmIChcIl9fZGF0YV9fXCIgaW4gbm9kZSkgc3Vibm9kZS5fX2RhdGFfXyA9IG5vZGUuX19kYXRhX187XG4gICAgICAgICAgZDNfdHJhbnNpdGlvbk5vZGUoc3Vibm9kZSwgaSwgbnMsIGlkLCBub2RlW25zXVtpZF0pO1xuICAgICAgICAgIHN1Ymdyb3VwLnB1c2goc3Vibm9kZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3ViZ3JvdXAucHVzaChudWxsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZDNfdHJhbnNpdGlvbihzdWJncm91cHMsIG5zLCBpZCk7XG4gIH07XG4gIGQzX3RyYW5zaXRpb25Qcm90b3R5cGUuc2VsZWN0QWxsID0gZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgICB2YXIgaWQgPSB0aGlzLmlkLCBucyA9IHRoaXMubmFtZXNwYWNlLCBzdWJncm91cHMgPSBbXSwgc3ViZ3JvdXAsIHN1Ym5vZGVzLCBub2RlLCBzdWJub2RlLCB0cmFuc2l0aW9uO1xuICAgIHNlbGVjdG9yID0gZDNfc2VsZWN0aW9uX3NlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICBmb3IgKHZhciBqID0gLTEsIG0gPSB0aGlzLmxlbmd0aDsgKytqIDwgbTsgKSB7XG4gICAgICBmb3IgKHZhciBncm91cCA9IHRoaXNbal0sIGkgPSAtMSwgbiA9IGdyb3VwLmxlbmd0aDsgKytpIDwgbjsgKSB7XG4gICAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgICB0cmFuc2l0aW9uID0gbm9kZVtuc11baWRdO1xuICAgICAgICAgIHN1Ym5vZGVzID0gc2VsZWN0b3IuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBqKTtcbiAgICAgICAgICBzdWJncm91cHMucHVzaChzdWJncm91cCA9IFtdKTtcbiAgICAgICAgICBmb3IgKHZhciBrID0gLTEsIG8gPSBzdWJub2Rlcy5sZW5ndGg7ICsrayA8IG87ICkge1xuICAgICAgICAgICAgaWYgKHN1Ym5vZGUgPSBzdWJub2Rlc1trXSkgZDNfdHJhbnNpdGlvbk5vZGUoc3Vibm9kZSwgaywgbnMsIGlkLCB0cmFuc2l0aW9uKTtcbiAgICAgICAgICAgIHN1Ymdyb3VwLnB1c2goc3Vibm9kZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkM190cmFuc2l0aW9uKHN1Ymdyb3VwcywgbnMsIGlkKTtcbiAgfTtcbiAgZDNfdHJhbnNpdGlvblByb3RvdHlwZS5maWx0ZXIgPSBmdW5jdGlvbihmaWx0ZXIpIHtcbiAgICB2YXIgc3ViZ3JvdXBzID0gW10sIHN1Ymdyb3VwLCBncm91cCwgbm9kZTtcbiAgICBpZiAodHlwZW9mIGZpbHRlciAhPT0gXCJmdW5jdGlvblwiKSBmaWx0ZXIgPSBkM19zZWxlY3Rpb25fZmlsdGVyKGZpbHRlcik7XG4gICAgZm9yICh2YXIgaiA9IDAsIG0gPSB0aGlzLmxlbmd0aDsgaiA8IG07IGorKykge1xuICAgICAgc3ViZ3JvdXBzLnB1c2goc3ViZ3JvdXAgPSBbXSk7XG4gICAgICBmb3IgKHZhciBncm91cCA9IHRoaXNbal0sIGkgPSAwLCBuID0gZ3JvdXAubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgIGlmICgobm9kZSA9IGdyb3VwW2ldKSAmJiBmaWx0ZXIuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBqKSkge1xuICAgICAgICAgIHN1Ymdyb3VwLnB1c2gobm9kZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGQzX3RyYW5zaXRpb24oc3ViZ3JvdXBzLCB0aGlzLm5hbWVzcGFjZSwgdGhpcy5pZCk7XG4gIH07XG4gIGQzX3RyYW5zaXRpb25Qcm90b3R5cGUudHdlZW4gPSBmdW5jdGlvbihuYW1lLCB0d2Vlbikge1xuICAgIHZhciBpZCA9IHRoaXMuaWQsIG5zID0gdGhpcy5uYW1lc3BhY2U7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSByZXR1cm4gdGhpcy5ub2RlKClbbnNdW2lkXS50d2Vlbi5nZXQobmFtZSk7XG4gICAgcmV0dXJuIGQzX3NlbGVjdGlvbl9lYWNoKHRoaXMsIHR3ZWVuID09IG51bGwgPyBmdW5jdGlvbihub2RlKSB7XG4gICAgICBub2RlW25zXVtpZF0udHdlZW4ucmVtb3ZlKG5hbWUpO1xuICAgIH0gOiBmdW5jdGlvbihub2RlKSB7XG4gICAgICBub2RlW25zXVtpZF0udHdlZW4uc2V0KG5hbWUsIHR3ZWVuKTtcbiAgICB9KTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfdHJhbnNpdGlvbl90d2Vlbihncm91cHMsIG5hbWUsIHZhbHVlLCB0d2Vlbikge1xuICAgIHZhciBpZCA9IGdyb3Vwcy5pZCwgbnMgPSBncm91cHMubmFtZXNwYWNlO1xuICAgIHJldHVybiBkM19zZWxlY3Rpb25fZWFjaChncm91cHMsIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gZnVuY3Rpb24obm9kZSwgaSwgaikge1xuICAgICAgbm9kZVtuc11baWRdLnR3ZWVuLnNldChuYW1lLCB0d2Vlbih2YWx1ZS5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGopKSk7XG4gICAgfSA6ICh2YWx1ZSA9IHR3ZWVuKHZhbHVlKSwgZnVuY3Rpb24obm9kZSkge1xuICAgICAgbm9kZVtuc11baWRdLnR3ZWVuLnNldChuYW1lLCB2YWx1ZSk7XG4gICAgfSkpO1xuICB9XG4gIGQzX3RyYW5zaXRpb25Qcm90b3R5cGUuYXR0ciA9IGZ1bmN0aW9uKG5hbWVOUywgdmFsdWUpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgIGZvciAodmFsdWUgaW4gbmFtZU5TKSB0aGlzLmF0dHIodmFsdWUsIG5hbWVOU1t2YWx1ZV0pO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHZhciBpbnRlcnBvbGF0ZSA9IG5hbWVOUyA9PSBcInRyYW5zZm9ybVwiID8gZDNfaW50ZXJwb2xhdGVUcmFuc2Zvcm0gOiBkM19pbnRlcnBvbGF0ZSwgbmFtZSA9IGQzLm5zLnF1YWxpZnkobmFtZU5TKTtcbiAgICBmdW5jdGlvbiBhdHRyTnVsbCgpIHtcbiAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBhdHRyTnVsbE5TKCkge1xuICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGVOUyhuYW1lLnNwYWNlLCBuYW1lLmxvY2FsKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gYXR0clR3ZWVuKGIpIHtcbiAgICAgIHJldHVybiBiID09IG51bGwgPyBhdHRyTnVsbCA6IChiICs9IFwiXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYSA9IHRoaXMuZ2V0QXR0cmlidXRlKG5hbWUpLCBpO1xuICAgICAgICByZXR1cm4gYSAhPT0gYiAmJiAoaSA9IGludGVycG9sYXRlKGEsIGIpLCBmdW5jdGlvbih0KSB7XG4gICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUobmFtZSwgaSh0KSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGF0dHJUd2Vlbk5TKGIpIHtcbiAgICAgIHJldHVybiBiID09IG51bGwgPyBhdHRyTnVsbE5TIDogKGIgKz0gXCJcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhID0gdGhpcy5nZXRBdHRyaWJ1dGVOUyhuYW1lLnNwYWNlLCBuYW1lLmxvY2FsKSwgaTtcbiAgICAgICAgcmV0dXJuIGEgIT09IGIgJiYgKGkgPSBpbnRlcnBvbGF0ZShhLCBiKSwgZnVuY3Rpb24odCkge1xuICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlTlMobmFtZS5zcGFjZSwgbmFtZS5sb2NhbCwgaSh0KSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBkM190cmFuc2l0aW9uX3R3ZWVuKHRoaXMsIFwiYXR0ci5cIiArIG5hbWVOUywgdmFsdWUsIG5hbWUubG9jYWwgPyBhdHRyVHdlZW5OUyA6IGF0dHJUd2Vlbik7XG4gIH07XG4gIGQzX3RyYW5zaXRpb25Qcm90b3R5cGUuYXR0clR3ZWVuID0gZnVuY3Rpb24obmFtZU5TLCB0d2Vlbikge1xuICAgIHZhciBuYW1lID0gZDMubnMucXVhbGlmeShuYW1lTlMpO1xuICAgIGZ1bmN0aW9uIGF0dHJUd2VlbihkLCBpKSB7XG4gICAgICB2YXIgZiA9IHR3ZWVuLmNhbGwodGhpcywgZCwgaSwgdGhpcy5nZXRBdHRyaWJ1dGUobmFtZSkpO1xuICAgICAgcmV0dXJuIGYgJiYgZnVuY3Rpb24odCkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShuYW1lLCBmKHQpKTtcbiAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGF0dHJUd2Vlbk5TKGQsIGkpIHtcbiAgICAgIHZhciBmID0gdHdlZW4uY2FsbCh0aGlzLCBkLCBpLCB0aGlzLmdldEF0dHJpYnV0ZU5TKG5hbWUuc3BhY2UsIG5hbWUubG9jYWwpKTtcbiAgICAgIHJldHVybiBmICYmIGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGVOUyhuYW1lLnNwYWNlLCBuYW1lLmxvY2FsLCBmKHQpKTtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnR3ZWVuKFwiYXR0ci5cIiArIG5hbWVOUywgbmFtZS5sb2NhbCA/IGF0dHJUd2Vlbk5TIDogYXR0clR3ZWVuKTtcbiAgfTtcbiAgZDNfdHJhbnNpdGlvblByb3RvdHlwZS5zdHlsZSA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICAgIHZhciBuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBpZiAobiA8IDMpIHtcbiAgICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICBpZiAobiA8IDIpIHZhbHVlID0gXCJcIjtcbiAgICAgICAgZm9yIChwcmlvcml0eSBpbiBuYW1lKSB0aGlzLnN0eWxlKHByaW9yaXR5LCBuYW1lW3ByaW9yaXR5XSwgdmFsdWUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHByaW9yaXR5ID0gXCJcIjtcbiAgICB9XG4gICAgZnVuY3Rpb24gc3R5bGVOdWxsKCkge1xuICAgICAgdGhpcy5zdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gc3R5bGVTdHJpbmcoYikge1xuICAgICAgcmV0dXJuIGIgPT0gbnVsbCA/IHN0eWxlTnVsbCA6IChiICs9IFwiXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYSA9IGQzX3dpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMsIG51bGwpLmdldFByb3BlcnR5VmFsdWUobmFtZSksIGk7XG4gICAgICAgIHJldHVybiBhICE9PSBiICYmIChpID0gZDNfaW50ZXJwb2xhdGUoYSwgYiksIGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgICB0aGlzLnN0eWxlLnNldFByb3BlcnR5KG5hbWUsIGkodCksIHByaW9yaXR5KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGQzX3RyYW5zaXRpb25fdHdlZW4odGhpcywgXCJzdHlsZS5cIiArIG5hbWUsIHZhbHVlLCBzdHlsZVN0cmluZyk7XG4gIH07XG4gIGQzX3RyYW5zaXRpb25Qcm90b3R5cGUuc3R5bGVUd2VlbiA9IGZ1bmN0aW9uKG5hbWUsIHR3ZWVuLCBwcmlvcml0eSkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMykgcHJpb3JpdHkgPSBcIlwiO1xuICAgIGZ1bmN0aW9uIHN0eWxlVHdlZW4oZCwgaSkge1xuICAgICAgdmFyIGYgPSB0d2Vlbi5jYWxsKHRoaXMsIGQsIGksIGQzX3dpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMsIG51bGwpLmdldFByb3BlcnR5VmFsdWUobmFtZSkpO1xuICAgICAgcmV0dXJuIGYgJiYgZnVuY3Rpb24odCkge1xuICAgICAgICB0aGlzLnN0eWxlLnNldFByb3BlcnR5KG5hbWUsIGYodCksIHByaW9yaXR5KTtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnR3ZWVuKFwic3R5bGUuXCIgKyBuYW1lLCBzdHlsZVR3ZWVuKTtcbiAgfTtcbiAgZDNfdHJhbnNpdGlvblByb3RvdHlwZS50ZXh0ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gZDNfdHJhbnNpdGlvbl90d2Vlbih0aGlzLCBcInRleHRcIiwgdmFsdWUsIGQzX3RyYW5zaXRpb25fdGV4dCk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3RyYW5zaXRpb25fdGV4dChiKSB7XG4gICAgaWYgKGIgPT0gbnVsbCkgYiA9IFwiXCI7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy50ZXh0Q29udGVudCA9IGI7XG4gICAgfTtcbiAgfVxuICBkM190cmFuc2l0aW9uUHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBucyA9IHRoaXMubmFtZXNwYWNlO1xuICAgIHJldHVybiB0aGlzLmVhY2goXCJlbmQudHJhbnNpdGlvblwiLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwO1xuICAgICAgaWYgKHRoaXNbbnNdLmNvdW50IDwgMiAmJiAocCA9IHRoaXMucGFyZW50Tm9kZSkpIHAucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgfSk7XG4gIH07XG4gIGQzX3RyYW5zaXRpb25Qcm90b3R5cGUuZWFzZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgdmFyIGlkID0gdGhpcy5pZCwgbnMgPSB0aGlzLm5hbWVzcGFjZTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDEpIHJldHVybiB0aGlzLm5vZGUoKVtuc11baWRdLmVhc2U7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB2YWx1ZSA9IGQzLmVhc2UuYXBwbHkoZDMsIGFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIGQzX3NlbGVjdGlvbl9lYWNoKHRoaXMsIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIG5vZGVbbnNdW2lkXS5lYXNlID0gdmFsdWU7XG4gICAgfSk7XG4gIH07XG4gIGQzX3RyYW5zaXRpb25Qcm90b3R5cGUuZGVsYXkgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhciBpZCA9IHRoaXMuaWQsIG5zID0gdGhpcy5uYW1lc3BhY2U7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAxKSByZXR1cm4gdGhpcy5ub2RlKClbbnNdW2lkXS5kZWxheTtcbiAgICByZXR1cm4gZDNfc2VsZWN0aW9uX2VhY2godGhpcywgdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIgPyBmdW5jdGlvbihub2RlLCBpLCBqKSB7XG4gICAgICBub2RlW25zXVtpZF0uZGVsYXkgPSArdmFsdWUuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBqKTtcbiAgICB9IDogKHZhbHVlID0gK3ZhbHVlLCBmdW5jdGlvbihub2RlKSB7XG4gICAgICBub2RlW25zXVtpZF0uZGVsYXkgPSB2YWx1ZTtcbiAgICB9KSk7XG4gIH07XG4gIGQzX3RyYW5zaXRpb25Qcm90b3R5cGUuZHVyYXRpb24gPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhciBpZCA9IHRoaXMuaWQsIG5zID0gdGhpcy5uYW1lc3BhY2U7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAxKSByZXR1cm4gdGhpcy5ub2RlKClbbnNdW2lkXS5kdXJhdGlvbjtcbiAgICByZXR1cm4gZDNfc2VsZWN0aW9uX2VhY2godGhpcywgdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIgPyBmdW5jdGlvbihub2RlLCBpLCBqKSB7XG4gICAgICBub2RlW25zXVtpZF0uZHVyYXRpb24gPSBNYXRoLm1heCgxLCB2YWx1ZS5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGopKTtcbiAgICB9IDogKHZhbHVlID0gTWF0aC5tYXgoMSwgdmFsdWUpLCBmdW5jdGlvbihub2RlKSB7XG4gICAgICBub2RlW25zXVtpZF0uZHVyYXRpb24gPSB2YWx1ZTtcbiAgICB9KSk7XG4gIH07XG4gIGQzX3RyYW5zaXRpb25Qcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgdmFyIGlkID0gdGhpcy5pZCwgbnMgPSB0aGlzLm5hbWVzcGFjZTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgIHZhciBpbmhlcml0ID0gZDNfdHJhbnNpdGlvbkluaGVyaXQsIGluaGVyaXRJZCA9IGQzX3RyYW5zaXRpb25Jbmhlcml0SWQ7XG4gICAgICB0cnkge1xuICAgICAgICBkM190cmFuc2l0aW9uSW5oZXJpdElkID0gaWQ7XG4gICAgICAgIGQzX3NlbGVjdGlvbl9lYWNoKHRoaXMsIGZ1bmN0aW9uKG5vZGUsIGksIGopIHtcbiAgICAgICAgICBkM190cmFuc2l0aW9uSW5oZXJpdCA9IG5vZGVbbnNdW2lkXTtcbiAgICAgICAgICB0eXBlLmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgaik7XG4gICAgICAgIH0pO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgZDNfdHJhbnNpdGlvbkluaGVyaXQgPSBpbmhlcml0O1xuICAgICAgICBkM190cmFuc2l0aW9uSW5oZXJpdElkID0gaW5oZXJpdElkO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBkM19zZWxlY3Rpb25fZWFjaCh0aGlzLCBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgIHZhciB0cmFuc2l0aW9uID0gbm9kZVtuc11baWRdO1xuICAgICAgICAodHJhbnNpdGlvbi5ldmVudCB8fCAodHJhbnNpdGlvbi5ldmVudCA9IGQzLmRpc3BhdGNoKFwic3RhcnRcIiwgXCJlbmRcIiwgXCJpbnRlcnJ1cHRcIikpKS5vbih0eXBlLCBsaXN0ZW5lcik7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIGQzX3RyYW5zaXRpb25Qcm90b3R5cGUudHJhbnNpdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpZDAgPSB0aGlzLmlkLCBpZDEgPSArK2QzX3RyYW5zaXRpb25JZCwgbnMgPSB0aGlzLm5hbWVzcGFjZSwgc3ViZ3JvdXBzID0gW10sIHN1Ymdyb3VwLCBncm91cCwgbm9kZSwgdHJhbnNpdGlvbjtcbiAgICBmb3IgKHZhciBqID0gMCwgbSA9IHRoaXMubGVuZ3RoOyBqIDwgbTsgaisrKSB7XG4gICAgICBzdWJncm91cHMucHVzaChzdWJncm91cCA9IFtdKTtcbiAgICAgIGZvciAodmFyIGdyb3VwID0gdGhpc1tqXSwgaSA9IDAsIG4gPSBncm91cC5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgICAgIHRyYW5zaXRpb24gPSBub2RlW25zXVtpZDBdO1xuICAgICAgICAgIGQzX3RyYW5zaXRpb25Ob2RlKG5vZGUsIGksIG5zLCBpZDEsIHtcbiAgICAgICAgICAgIHRpbWU6IHRyYW5zaXRpb24udGltZSxcbiAgICAgICAgICAgIGVhc2U6IHRyYW5zaXRpb24uZWFzZSxcbiAgICAgICAgICAgIGRlbGF5OiB0cmFuc2l0aW9uLmRlbGF5ICsgdHJhbnNpdGlvbi5kdXJhdGlvbixcbiAgICAgICAgICAgIGR1cmF0aW9uOiB0cmFuc2l0aW9uLmR1cmF0aW9uXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgc3ViZ3JvdXAucHVzaChub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGQzX3RyYW5zaXRpb24oc3ViZ3JvdXBzLCBucywgaWQxKTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfdHJhbnNpdGlvbk5hbWVzcGFjZShuYW1lKSB7XG4gICAgcmV0dXJuIG5hbWUgPT0gbnVsbCA/IFwiX190cmFuc2l0aW9uX19cIiA6IFwiX190cmFuc2l0aW9uX1wiICsgbmFtZSArIFwiX19cIjtcbiAgfVxuICBmdW5jdGlvbiBkM190cmFuc2l0aW9uTm9kZShub2RlLCBpLCBucywgaWQsIGluaGVyaXQpIHtcbiAgICB2YXIgbG9jayA9IG5vZGVbbnNdIHx8IChub2RlW25zXSA9IHtcbiAgICAgIGFjdGl2ZTogMCxcbiAgICAgIGNvdW50OiAwXG4gICAgfSksIHRyYW5zaXRpb24gPSBsb2NrW2lkXTtcbiAgICBpZiAoIXRyYW5zaXRpb24pIHtcbiAgICAgIHZhciB0aW1lID0gaW5oZXJpdC50aW1lO1xuICAgICAgdHJhbnNpdGlvbiA9IGxvY2tbaWRdID0ge1xuICAgICAgICB0d2VlbjogbmV3IGQzX01hcCgpLFxuICAgICAgICB0aW1lOiB0aW1lLFxuICAgICAgICBkZWxheTogaW5oZXJpdC5kZWxheSxcbiAgICAgICAgZHVyYXRpb246IGluaGVyaXQuZHVyYXRpb24sXG4gICAgICAgIGVhc2U6IGluaGVyaXQuZWFzZSxcbiAgICAgICAgaW5kZXg6IGlcbiAgICAgIH07XG4gICAgICBpbmhlcml0ID0gbnVsbDtcbiAgICAgICsrbG9jay5jb3VudDtcbiAgICAgIGQzLnRpbWVyKGZ1bmN0aW9uKGVsYXBzZWQpIHtcbiAgICAgICAgdmFyIGRlbGF5ID0gdHJhbnNpdGlvbi5kZWxheSwgZHVyYXRpb24sIGVhc2UsIHRpbWVyID0gZDNfdGltZXJfYWN0aXZlLCB0d2VlbmVkID0gW107XG4gICAgICAgIHRpbWVyLnQgPSBkZWxheSArIHRpbWU7XG4gICAgICAgIGlmIChkZWxheSA8PSBlbGFwc2VkKSByZXR1cm4gc3RhcnQoZWxhcHNlZCAtIGRlbGF5KTtcbiAgICAgICAgdGltZXIuYyA9IHN0YXJ0O1xuICAgICAgICBmdW5jdGlvbiBzdGFydChlbGFwc2VkKSB7XG4gICAgICAgICAgaWYgKGxvY2suYWN0aXZlID4gaWQpIHJldHVybiBzdG9wKCk7XG4gICAgICAgICAgdmFyIGFjdGl2ZSA9IGxvY2tbbG9jay5hY3RpdmVdO1xuICAgICAgICAgIGlmIChhY3RpdmUpIHtcbiAgICAgICAgICAgIC0tbG9jay5jb3VudDtcbiAgICAgICAgICAgIGRlbGV0ZSBsb2NrW2xvY2suYWN0aXZlXTtcbiAgICAgICAgICAgIGFjdGl2ZS5ldmVudCAmJiBhY3RpdmUuZXZlbnQuaW50ZXJydXB0LmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgYWN0aXZlLmluZGV4KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbG9jay5hY3RpdmUgPSBpZDtcbiAgICAgICAgICB0cmFuc2l0aW9uLmV2ZW50ICYmIHRyYW5zaXRpb24uZXZlbnQuc3RhcnQuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpKTtcbiAgICAgICAgICB0cmFuc2l0aW9uLnR3ZWVuLmZvckVhY2goZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlID0gdmFsdWUuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpKSkge1xuICAgICAgICAgICAgICB0d2VlbmVkLnB1c2godmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGVhc2UgPSB0cmFuc2l0aW9uLmVhc2U7XG4gICAgICAgICAgZHVyYXRpb24gPSB0cmFuc2l0aW9uLmR1cmF0aW9uO1xuICAgICAgICAgIGQzLnRpbWVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGltZXIuYyA9IHRpY2soZWxhcHNlZCB8fCAxKSA/IGQzX3RydWUgOiB0aWNrO1xuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgfSwgMCwgdGltZSk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gdGljayhlbGFwc2VkKSB7XG4gICAgICAgICAgaWYgKGxvY2suYWN0aXZlICE9PSBpZCkgcmV0dXJuIDE7XG4gICAgICAgICAgdmFyIHQgPSBlbGFwc2VkIC8gZHVyYXRpb24sIGUgPSBlYXNlKHQpLCBuID0gdHdlZW5lZC5sZW5ndGg7XG4gICAgICAgICAgd2hpbGUgKG4gPiAwKSB7XG4gICAgICAgICAgICB0d2VlbmVkWy0tbl0uY2FsbChub2RlLCBlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHQgPj0gMSkge1xuICAgICAgICAgICAgdHJhbnNpdGlvbi5ldmVudCAmJiB0cmFuc2l0aW9uLmV2ZW50LmVuZC5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGkpO1xuICAgICAgICAgICAgcmV0dXJuIHN0b3AoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gc3RvcCgpIHtcbiAgICAgICAgICBpZiAoLS1sb2NrLmNvdW50KSBkZWxldGUgbG9ja1tpZF07IGVsc2UgZGVsZXRlIG5vZGVbbnNdO1xuICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9XG4gICAgICB9LCAwLCB0aW1lKTtcbiAgICB9XG4gIH1cbiAgZDMuc3ZnLmF4aXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKSwgb3JpZW50ID0gZDNfc3ZnX2F4aXNEZWZhdWx0T3JpZW50LCBpbm5lclRpY2tTaXplID0gNiwgb3V0ZXJUaWNrU2l6ZSA9IDYsIHRpY2tQYWRkaW5nID0gMywgdGlja0FyZ3VtZW50c18gPSBbIDEwIF0sIHRpY2tWYWx1ZXMgPSBudWxsLCB0aWNrRm9ybWF0XztcbiAgICBmdW5jdGlvbiBheGlzKGcpIHtcbiAgICAgIGcuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGcgPSBkMy5zZWxlY3QodGhpcyk7XG4gICAgICAgIHZhciBzY2FsZTAgPSB0aGlzLl9fY2hhcnRfXyB8fCBzY2FsZSwgc2NhbGUxID0gdGhpcy5fX2NoYXJ0X18gPSBzY2FsZS5jb3B5KCk7XG4gICAgICAgIHZhciB0aWNrcyA9IHRpY2tWYWx1ZXMgPT0gbnVsbCA/IHNjYWxlMS50aWNrcyA/IHNjYWxlMS50aWNrcy5hcHBseShzY2FsZTEsIHRpY2tBcmd1bWVudHNfKSA6IHNjYWxlMS5kb21haW4oKSA6IHRpY2tWYWx1ZXMsIHRpY2tGb3JtYXQgPSB0aWNrRm9ybWF0XyA9PSBudWxsID8gc2NhbGUxLnRpY2tGb3JtYXQgPyBzY2FsZTEudGlja0Zvcm1hdC5hcHBseShzY2FsZTEsIHRpY2tBcmd1bWVudHNfKSA6IGQzX2lkZW50aXR5IDogdGlja0Zvcm1hdF8sIHRpY2sgPSBnLnNlbGVjdEFsbChcIi50aWNrXCIpLmRhdGEodGlja3MsIHNjYWxlMSksIHRpY2tFbnRlciA9IHRpY2suZW50ZXIoKS5pbnNlcnQoXCJnXCIsIFwiLmRvbWFpblwiKS5hdHRyKFwiY2xhc3NcIiwgXCJ0aWNrXCIpLnN0eWxlKFwib3BhY2l0eVwiLCDOtSksIHRpY2tFeGl0ID0gZDMudHJhbnNpdGlvbih0aWNrLmV4aXQoKSkuc3R5bGUoXCJvcGFjaXR5XCIsIM61KS5yZW1vdmUoKSwgdGlja1VwZGF0ZSA9IGQzLnRyYW5zaXRpb24odGljay5vcmRlcigpKS5zdHlsZShcIm9wYWNpdHlcIiwgMSksIHRpY2tTcGFjaW5nID0gTWF0aC5tYXgoaW5uZXJUaWNrU2l6ZSwgMCkgKyB0aWNrUGFkZGluZywgdGlja1RyYW5zZm9ybTtcbiAgICAgICAgdmFyIHJhbmdlID0gZDNfc2NhbGVSYW5nZShzY2FsZTEpLCBwYXRoID0gZy5zZWxlY3RBbGwoXCIuZG9tYWluXCIpLmRhdGEoWyAwIF0pLCBwYXRoVXBkYXRlID0gKHBhdGguZW50ZXIoKS5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXCJjbGFzc1wiLCBcImRvbWFpblwiKSwgXG4gICAgICAgIGQzLnRyYW5zaXRpb24ocGF0aCkpO1xuICAgICAgICB0aWNrRW50ZXIuYXBwZW5kKFwibGluZVwiKTtcbiAgICAgICAgdGlja0VudGVyLmFwcGVuZChcInRleHRcIik7XG4gICAgICAgIHZhciBsaW5lRW50ZXIgPSB0aWNrRW50ZXIuc2VsZWN0KFwibGluZVwiKSwgbGluZVVwZGF0ZSA9IHRpY2tVcGRhdGUuc2VsZWN0KFwibGluZVwiKSwgdGV4dCA9IHRpY2suc2VsZWN0KFwidGV4dFwiKS50ZXh0KHRpY2tGb3JtYXQpLCB0ZXh0RW50ZXIgPSB0aWNrRW50ZXIuc2VsZWN0KFwidGV4dFwiKSwgdGV4dFVwZGF0ZSA9IHRpY2tVcGRhdGUuc2VsZWN0KFwidGV4dFwiKSwgc2lnbiA9IG9yaWVudCA9PT0gXCJ0b3BcIiB8fCBvcmllbnQgPT09IFwibGVmdFwiID8gLTEgOiAxLCB4MSwgeDIsIHkxLCB5MjtcbiAgICAgICAgaWYgKG9yaWVudCA9PT0gXCJib3R0b21cIiB8fCBvcmllbnQgPT09IFwidG9wXCIpIHtcbiAgICAgICAgICB0aWNrVHJhbnNmb3JtID0gZDNfc3ZnX2F4aXNYLCB4MSA9IFwieFwiLCB5MSA9IFwieVwiLCB4MiA9IFwieDJcIiwgeTIgPSBcInkyXCI7XG4gICAgICAgICAgdGV4dC5hdHRyKFwiZHlcIiwgc2lnbiA8IDAgPyBcIjBlbVwiIDogXCIuNzFlbVwiKS5zdHlsZShcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpO1xuICAgICAgICAgIHBhdGhVcGRhdGUuYXR0cihcImRcIiwgXCJNXCIgKyByYW5nZVswXSArIFwiLFwiICsgc2lnbiAqIG91dGVyVGlja1NpemUgKyBcIlYwSFwiICsgcmFuZ2VbMV0gKyBcIlZcIiArIHNpZ24gKiBvdXRlclRpY2tTaXplKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aWNrVHJhbnNmb3JtID0gZDNfc3ZnX2F4aXNZLCB4MSA9IFwieVwiLCB5MSA9IFwieFwiLCB4MiA9IFwieTJcIiwgeTIgPSBcIngyXCI7XG4gICAgICAgICAgdGV4dC5hdHRyKFwiZHlcIiwgXCIuMzJlbVwiKS5zdHlsZShcInRleHQtYW5jaG9yXCIsIHNpZ24gPCAwID8gXCJlbmRcIiA6IFwic3RhcnRcIik7XG4gICAgICAgICAgcGF0aFVwZGF0ZS5hdHRyKFwiZFwiLCBcIk1cIiArIHNpZ24gKiBvdXRlclRpY2tTaXplICsgXCIsXCIgKyByYW5nZVswXSArIFwiSDBWXCIgKyByYW5nZVsxXSArIFwiSFwiICsgc2lnbiAqIG91dGVyVGlja1NpemUpO1xuICAgICAgICB9XG4gICAgICAgIGxpbmVFbnRlci5hdHRyKHkyLCBzaWduICogaW5uZXJUaWNrU2l6ZSk7XG4gICAgICAgIHRleHRFbnRlci5hdHRyKHkxLCBzaWduICogdGlja1NwYWNpbmcpO1xuICAgICAgICBsaW5lVXBkYXRlLmF0dHIoeDIsIDApLmF0dHIoeTIsIHNpZ24gKiBpbm5lclRpY2tTaXplKTtcbiAgICAgICAgdGV4dFVwZGF0ZS5hdHRyKHgxLCAwKS5hdHRyKHkxLCBzaWduICogdGlja1NwYWNpbmcpO1xuICAgICAgICBpZiAoc2NhbGUxLnJhbmdlQmFuZCkge1xuICAgICAgICAgIHZhciB4ID0gc2NhbGUxLCBkeCA9IHgucmFuZ2VCYW5kKCkgLyAyO1xuICAgICAgICAgIHNjYWxlMCA9IHNjYWxlMSA9IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICAgIHJldHVybiB4KGQpICsgZHg7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChzY2FsZTAucmFuZ2VCYW5kKSB7XG4gICAgICAgICAgc2NhbGUwID0gc2NhbGUxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRpY2tFeGl0LmNhbGwodGlja1RyYW5zZm9ybSwgc2NhbGUxLCBzY2FsZTApO1xuICAgICAgICB9XG4gICAgICAgIHRpY2tFbnRlci5jYWxsKHRpY2tUcmFuc2Zvcm0sIHNjYWxlMCwgc2NhbGUxKTtcbiAgICAgICAgdGlja1VwZGF0ZS5jYWxsKHRpY2tUcmFuc2Zvcm0sIHNjYWxlMSwgc2NhbGUxKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBheGlzLnNjYWxlID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gc2NhbGU7XG4gICAgICBzY2FsZSA9IHg7XG4gICAgICByZXR1cm4gYXhpcztcbiAgICB9O1xuICAgIGF4aXMub3JpZW50ID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gb3JpZW50O1xuICAgICAgb3JpZW50ID0geCBpbiBkM19zdmdfYXhpc09yaWVudHMgPyB4ICsgXCJcIiA6IGQzX3N2Z19heGlzRGVmYXVsdE9yaWVudDtcbiAgICAgIHJldHVybiBheGlzO1xuICAgIH07XG4gICAgYXhpcy50aWNrcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGlja0FyZ3VtZW50c187XG4gICAgICB0aWNrQXJndW1lbnRzXyA9IGFyZ3VtZW50cztcbiAgICAgIHJldHVybiBheGlzO1xuICAgIH07XG4gICAgYXhpcy50aWNrVmFsdWVzID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGlja1ZhbHVlcztcbiAgICAgIHRpY2tWYWx1ZXMgPSB4O1xuICAgICAgcmV0dXJuIGF4aXM7XG4gICAgfTtcbiAgICBheGlzLnRpY2tGb3JtYXQgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aWNrRm9ybWF0XztcbiAgICAgIHRpY2tGb3JtYXRfID0geDtcbiAgICAgIHJldHVybiBheGlzO1xuICAgIH07XG4gICAgYXhpcy50aWNrU2l6ZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIHZhciBuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgIGlmICghbikgcmV0dXJuIGlubmVyVGlja1NpemU7XG4gICAgICBpbm5lclRpY2tTaXplID0gK3g7XG4gICAgICBvdXRlclRpY2tTaXplID0gK2FyZ3VtZW50c1tuIC0gMV07XG4gICAgICByZXR1cm4gYXhpcztcbiAgICB9O1xuICAgIGF4aXMuaW5uZXJUaWNrU2l6ZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGlubmVyVGlja1NpemU7XG4gICAgICBpbm5lclRpY2tTaXplID0gK3g7XG4gICAgICByZXR1cm4gYXhpcztcbiAgICB9O1xuICAgIGF4aXMub3V0ZXJUaWNrU2l6ZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIG91dGVyVGlja1NpemU7XG4gICAgICBvdXRlclRpY2tTaXplID0gK3g7XG4gICAgICByZXR1cm4gYXhpcztcbiAgICB9O1xuICAgIGF4aXMudGlja1BhZGRpbmcgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aWNrUGFkZGluZztcbiAgICAgIHRpY2tQYWRkaW5nID0gK3g7XG4gICAgICByZXR1cm4gYXhpcztcbiAgICB9O1xuICAgIGF4aXMudGlja1N1YmRpdmlkZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggJiYgYXhpcztcbiAgICB9O1xuICAgIHJldHVybiBheGlzO1xuICB9O1xuICB2YXIgZDNfc3ZnX2F4aXNEZWZhdWx0T3JpZW50ID0gXCJib3R0b21cIiwgZDNfc3ZnX2F4aXNPcmllbnRzID0ge1xuICAgIHRvcDogMSxcbiAgICByaWdodDogMSxcbiAgICBib3R0b206IDEsXG4gICAgbGVmdDogMVxuICB9O1xuICBmdW5jdGlvbiBkM19zdmdfYXhpc1goc2VsZWN0aW9uLCB4MCwgeDEpIHtcbiAgICBzZWxlY3Rpb24uYXR0cihcInRyYW5zZm9ybVwiLCBmdW5jdGlvbihkKSB7XG4gICAgICB2YXIgdjAgPSB4MChkKTtcbiAgICAgIHJldHVybiBcInRyYW5zbGF0ZShcIiArIChpc0Zpbml0ZSh2MCkgPyB2MCA6IHgxKGQpKSArIFwiLDApXCI7XG4gICAgfSk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfc3ZnX2F4aXNZKHNlbGVjdGlvbiwgeTAsIHkxKSB7XG4gICAgc2VsZWN0aW9uLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24oZCkge1xuICAgICAgdmFyIHYwID0geTAoZCk7XG4gICAgICByZXR1cm4gXCJ0cmFuc2xhdGUoMCxcIiArIChpc0Zpbml0ZSh2MCkgPyB2MCA6IHkxKGQpKSArIFwiKVwiO1xuICAgIH0pO1xuICB9XG4gIGQzLnN2Zy5icnVzaCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBldmVudCA9IGQzX2V2ZW50RGlzcGF0Y2goYnJ1c2gsIFwiYnJ1c2hzdGFydFwiLCBcImJydXNoXCIsIFwiYnJ1c2hlbmRcIiksIHggPSBudWxsLCB5ID0gbnVsbCwgeEV4dGVudCA9IFsgMCwgMCBdLCB5RXh0ZW50ID0gWyAwLCAwIF0sIHhFeHRlbnREb21haW4sIHlFeHRlbnREb21haW4sIHhDbGFtcCA9IHRydWUsIHlDbGFtcCA9IHRydWUsIHJlc2l6ZXMgPSBkM19zdmdfYnJ1c2hSZXNpemVzWzBdO1xuICAgIGZ1bmN0aW9uIGJydXNoKGcpIHtcbiAgICAgIGcuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGcgPSBkMy5zZWxlY3QodGhpcykuc3R5bGUoXCJwb2ludGVyLWV2ZW50c1wiLCBcImFsbFwiKS5zdHlsZShcIi13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvclwiLCBcInJnYmEoMCwwLDAsMClcIikub24oXCJtb3VzZWRvd24uYnJ1c2hcIiwgYnJ1c2hzdGFydCkub24oXCJ0b3VjaHN0YXJ0LmJydXNoXCIsIGJydXNoc3RhcnQpO1xuICAgICAgICB2YXIgYmFja2dyb3VuZCA9IGcuc2VsZWN0QWxsKFwiLmJhY2tncm91bmRcIikuZGF0YShbIDAgXSk7XG4gICAgICAgIGJhY2tncm91bmQuZW50ZXIoKS5hcHBlbmQoXCJyZWN0XCIpLmF0dHIoXCJjbGFzc1wiLCBcImJhY2tncm91bmRcIikuc3R5bGUoXCJ2aXNpYmlsaXR5XCIsIFwiaGlkZGVuXCIpLnN0eWxlKFwiY3Vyc29yXCIsIFwiY3Jvc3NoYWlyXCIpO1xuICAgICAgICBnLnNlbGVjdEFsbChcIi5leHRlbnRcIikuZGF0YShbIDAgXSkuZW50ZXIoKS5hcHBlbmQoXCJyZWN0XCIpLmF0dHIoXCJjbGFzc1wiLCBcImV4dGVudFwiKS5zdHlsZShcImN1cnNvclwiLCBcIm1vdmVcIik7XG4gICAgICAgIHZhciByZXNpemUgPSBnLnNlbGVjdEFsbChcIi5yZXNpemVcIikuZGF0YShyZXNpemVzLCBkM19pZGVudGl0eSk7XG4gICAgICAgIHJlc2l6ZS5leGl0KCkucmVtb3ZlKCk7XG4gICAgICAgIHJlc2l6ZS5lbnRlcigpLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICByZXR1cm4gXCJyZXNpemUgXCIgKyBkO1xuICAgICAgICB9KS5zdHlsZShcImN1cnNvclwiLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgcmV0dXJuIGQzX3N2Z19icnVzaEN1cnNvcltkXTtcbiAgICAgICAgfSkuYXBwZW5kKFwicmVjdFwiKS5hdHRyKFwieFwiLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgcmV0dXJuIC9bZXddJC8udGVzdChkKSA/IC0zIDogbnVsbDtcbiAgICAgICAgfSkuYXR0cihcInlcIiwgZnVuY3Rpb24oZCkge1xuICAgICAgICAgIHJldHVybiAvXltuc10vLnRlc3QoZCkgPyAtMyA6IG51bGw7XG4gICAgICAgIH0pLmF0dHIoXCJ3aWR0aFwiLCA2KS5hdHRyKFwiaGVpZ2h0XCIsIDYpLnN0eWxlKFwidmlzaWJpbGl0eVwiLCBcImhpZGRlblwiKTtcbiAgICAgICAgcmVzaXplLnN0eWxlKFwiZGlzcGxheVwiLCBicnVzaC5lbXB0eSgpID8gXCJub25lXCIgOiBudWxsKTtcbiAgICAgICAgdmFyIGdVcGRhdGUgPSBkMy50cmFuc2l0aW9uKGcpLCBiYWNrZ3JvdW5kVXBkYXRlID0gZDMudHJhbnNpdGlvbihiYWNrZ3JvdW5kKSwgcmFuZ2U7XG4gICAgICAgIGlmICh4KSB7XG4gICAgICAgICAgcmFuZ2UgPSBkM19zY2FsZVJhbmdlKHgpO1xuICAgICAgICAgIGJhY2tncm91bmRVcGRhdGUuYXR0cihcInhcIiwgcmFuZ2VbMF0pLmF0dHIoXCJ3aWR0aFwiLCByYW5nZVsxXSAtIHJhbmdlWzBdKTtcbiAgICAgICAgICByZWRyYXdYKGdVcGRhdGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh5KSB7XG4gICAgICAgICAgcmFuZ2UgPSBkM19zY2FsZVJhbmdlKHkpO1xuICAgICAgICAgIGJhY2tncm91bmRVcGRhdGUuYXR0cihcInlcIiwgcmFuZ2VbMF0pLmF0dHIoXCJoZWlnaHRcIiwgcmFuZ2VbMV0gLSByYW5nZVswXSk7XG4gICAgICAgICAgcmVkcmF3WShnVXBkYXRlKTtcbiAgICAgICAgfVxuICAgICAgICByZWRyYXcoZ1VwZGF0ZSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgYnJ1c2guZXZlbnQgPSBmdW5jdGlvbihnKSB7XG4gICAgICBnLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBldmVudF8gPSBldmVudC5vZih0aGlzLCBhcmd1bWVudHMpLCBleHRlbnQxID0ge1xuICAgICAgICAgIHg6IHhFeHRlbnQsXG4gICAgICAgICAgeTogeUV4dGVudCxcbiAgICAgICAgICBpOiB4RXh0ZW50RG9tYWluLFxuICAgICAgICAgIGo6IHlFeHRlbnREb21haW5cbiAgICAgICAgfSwgZXh0ZW50MCA9IHRoaXMuX19jaGFydF9fIHx8IGV4dGVudDE7XG4gICAgICAgIHRoaXMuX19jaGFydF9fID0gZXh0ZW50MTtcbiAgICAgICAgaWYgKGQzX3RyYW5zaXRpb25Jbmhlcml0SWQpIHtcbiAgICAgICAgICBkMy5zZWxlY3QodGhpcykudHJhbnNpdGlvbigpLmVhY2goXCJzdGFydC5icnVzaFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHhFeHRlbnREb21haW4gPSBleHRlbnQwLmk7XG4gICAgICAgICAgICB5RXh0ZW50RG9tYWluID0gZXh0ZW50MC5qO1xuICAgICAgICAgICAgeEV4dGVudCA9IGV4dGVudDAueDtcbiAgICAgICAgICAgIHlFeHRlbnQgPSBleHRlbnQwLnk7XG4gICAgICAgICAgICBldmVudF8oe1xuICAgICAgICAgICAgICB0eXBlOiBcImJydXNoc3RhcnRcIlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSkudHdlZW4oXCJicnVzaDpicnVzaFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB4aSA9IGQzX2ludGVycG9sYXRlQXJyYXkoeEV4dGVudCwgZXh0ZW50MS54KSwgeWkgPSBkM19pbnRlcnBvbGF0ZUFycmF5KHlFeHRlbnQsIGV4dGVudDEueSk7XG4gICAgICAgICAgICB4RXh0ZW50RG9tYWluID0geUV4dGVudERvbWFpbiA9IG51bGw7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgICAgICAgICAgICB4RXh0ZW50ID0gZXh0ZW50MS54ID0geGkodCk7XG4gICAgICAgICAgICAgIHlFeHRlbnQgPSBleHRlbnQxLnkgPSB5aSh0KTtcbiAgICAgICAgICAgICAgZXZlbnRfKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcImJydXNoXCIsXG4gICAgICAgICAgICAgICAgbW9kZTogXCJyZXNpemVcIlxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkuZWFjaChcImVuZC5icnVzaFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHhFeHRlbnREb21haW4gPSBleHRlbnQxLmk7XG4gICAgICAgICAgICB5RXh0ZW50RG9tYWluID0gZXh0ZW50MS5qO1xuICAgICAgICAgICAgZXZlbnRfKHtcbiAgICAgICAgICAgICAgdHlwZTogXCJicnVzaFwiLFxuICAgICAgICAgICAgICBtb2RlOiBcInJlc2l6ZVwiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGV2ZW50Xyh7XG4gICAgICAgICAgICAgIHR5cGU6IFwiYnJ1c2hlbmRcIlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZXZlbnRfKHtcbiAgICAgICAgICAgIHR5cGU6IFwiYnJ1c2hzdGFydFwiXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgZXZlbnRfKHtcbiAgICAgICAgICAgIHR5cGU6IFwiYnJ1c2hcIixcbiAgICAgICAgICAgIG1vZGU6IFwicmVzaXplXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBldmVudF8oe1xuICAgICAgICAgICAgdHlwZTogXCJicnVzaGVuZFwiXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG4gICAgZnVuY3Rpb24gcmVkcmF3KGcpIHtcbiAgICAgIGcuc2VsZWN0QWxsKFwiLnJlc2l6ZVwiKS5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIFwidHJhbnNsYXRlKFwiICsgeEV4dGVudFsrL2UkLy50ZXN0KGQpXSArIFwiLFwiICsgeUV4dGVudFsrL15zLy50ZXN0KGQpXSArIFwiKVwiO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlZHJhd1goZykge1xuICAgICAgZy5zZWxlY3QoXCIuZXh0ZW50XCIpLmF0dHIoXCJ4XCIsIHhFeHRlbnRbMF0pO1xuICAgICAgZy5zZWxlY3RBbGwoXCIuZXh0ZW50LC5uPnJlY3QsLnM+cmVjdFwiKS5hdHRyKFwid2lkdGhcIiwgeEV4dGVudFsxXSAtIHhFeHRlbnRbMF0pO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZWRyYXdZKGcpIHtcbiAgICAgIGcuc2VsZWN0KFwiLmV4dGVudFwiKS5hdHRyKFwieVwiLCB5RXh0ZW50WzBdKTtcbiAgICAgIGcuc2VsZWN0QWxsKFwiLmV4dGVudCwuZT5yZWN0LC53PnJlY3RcIikuYXR0cihcImhlaWdodFwiLCB5RXh0ZW50WzFdIC0geUV4dGVudFswXSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGJydXNoc3RhcnQoKSB7XG4gICAgICB2YXIgdGFyZ2V0ID0gdGhpcywgZXZlbnRUYXJnZXQgPSBkMy5zZWxlY3QoZDMuZXZlbnQudGFyZ2V0KSwgZXZlbnRfID0gZXZlbnQub2YodGFyZ2V0LCBhcmd1bWVudHMpLCBnID0gZDMuc2VsZWN0KHRhcmdldCksIHJlc2l6aW5nID0gZXZlbnRUYXJnZXQuZGF0dW0oKSwgcmVzaXppbmdYID0gIS9eKG58cykkLy50ZXN0KHJlc2l6aW5nKSAmJiB4LCByZXNpemluZ1kgPSAhL14oZXx3KSQvLnRlc3QocmVzaXppbmcpICYmIHksIGRyYWdnaW5nID0gZXZlbnRUYXJnZXQuY2xhc3NlZChcImV4dGVudFwiKSwgZHJhZ1Jlc3RvcmUgPSBkM19ldmVudF9kcmFnU3VwcHJlc3MoKSwgY2VudGVyLCBvcmlnaW4gPSBkMy5tb3VzZSh0YXJnZXQpLCBvZmZzZXQ7XG4gICAgICB2YXIgdyA9IGQzLnNlbGVjdChkM193aW5kb3cpLm9uKFwia2V5ZG93bi5icnVzaFwiLCBrZXlkb3duKS5vbihcImtleXVwLmJydXNoXCIsIGtleXVwKTtcbiAgICAgIGlmIChkMy5ldmVudC5jaGFuZ2VkVG91Y2hlcykge1xuICAgICAgICB3Lm9uKFwidG91Y2htb3ZlLmJydXNoXCIsIGJydXNobW92ZSkub24oXCJ0b3VjaGVuZC5icnVzaFwiLCBicnVzaGVuZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3Lm9uKFwibW91c2Vtb3ZlLmJydXNoXCIsIGJydXNobW92ZSkub24oXCJtb3VzZXVwLmJydXNoXCIsIGJydXNoZW5kKTtcbiAgICAgIH1cbiAgICAgIGcuaW50ZXJydXB0KCkuc2VsZWN0QWxsKFwiKlwiKS5pbnRlcnJ1cHQoKTtcbiAgICAgIGlmIChkcmFnZ2luZykge1xuICAgICAgICBvcmlnaW5bMF0gPSB4RXh0ZW50WzBdIC0gb3JpZ2luWzBdO1xuICAgICAgICBvcmlnaW5bMV0gPSB5RXh0ZW50WzBdIC0gb3JpZ2luWzFdO1xuICAgICAgfSBlbHNlIGlmIChyZXNpemluZykge1xuICAgICAgICB2YXIgZXggPSArL3ckLy50ZXN0KHJlc2l6aW5nKSwgZXkgPSArL15uLy50ZXN0KHJlc2l6aW5nKTtcbiAgICAgICAgb2Zmc2V0ID0gWyB4RXh0ZW50WzEgLSBleF0gLSBvcmlnaW5bMF0sIHlFeHRlbnRbMSAtIGV5XSAtIG9yaWdpblsxXSBdO1xuICAgICAgICBvcmlnaW5bMF0gPSB4RXh0ZW50W2V4XTtcbiAgICAgICAgb3JpZ2luWzFdID0geUV4dGVudFtleV07XG4gICAgICB9IGVsc2UgaWYgKGQzLmV2ZW50LmFsdEtleSkgY2VudGVyID0gb3JpZ2luLnNsaWNlKCk7XG4gICAgICBnLnN0eWxlKFwicG9pbnRlci1ldmVudHNcIiwgXCJub25lXCIpLnNlbGVjdEFsbChcIi5yZXNpemVcIikuc3R5bGUoXCJkaXNwbGF5XCIsIG51bGwpO1xuICAgICAgZDMuc2VsZWN0KFwiYm9keVwiKS5zdHlsZShcImN1cnNvclwiLCBldmVudFRhcmdldC5zdHlsZShcImN1cnNvclwiKSk7XG4gICAgICBldmVudF8oe1xuICAgICAgICB0eXBlOiBcImJydXNoc3RhcnRcIlxuICAgICAgfSk7XG4gICAgICBicnVzaG1vdmUoKTtcbiAgICAgIGZ1bmN0aW9uIGtleWRvd24oKSB7XG4gICAgICAgIGlmIChkMy5ldmVudC5rZXlDb2RlID09IDMyKSB7XG4gICAgICAgICAgaWYgKCFkcmFnZ2luZykge1xuICAgICAgICAgICAgY2VudGVyID0gbnVsbDtcbiAgICAgICAgICAgIG9yaWdpblswXSAtPSB4RXh0ZW50WzFdO1xuICAgICAgICAgICAgb3JpZ2luWzFdIC09IHlFeHRlbnRbMV07XG4gICAgICAgICAgICBkcmFnZ2luZyA9IDI7XG4gICAgICAgICAgfVxuICAgICAgICAgIGQzX2V2ZW50UHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZnVuY3Rpb24ga2V5dXAoKSB7XG4gICAgICAgIGlmIChkMy5ldmVudC5rZXlDb2RlID09IDMyICYmIGRyYWdnaW5nID09IDIpIHtcbiAgICAgICAgICBvcmlnaW5bMF0gKz0geEV4dGVudFsxXTtcbiAgICAgICAgICBvcmlnaW5bMV0gKz0geUV4dGVudFsxXTtcbiAgICAgICAgICBkcmFnZ2luZyA9IDA7XG4gICAgICAgICAgZDNfZXZlbnRQcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBicnVzaG1vdmUoKSB7XG4gICAgICAgIHZhciBwb2ludCA9IGQzLm1vdXNlKHRhcmdldCksIG1vdmVkID0gZmFsc2U7XG4gICAgICAgIGlmIChvZmZzZXQpIHtcbiAgICAgICAgICBwb2ludFswXSArPSBvZmZzZXRbMF07XG4gICAgICAgICAgcG9pbnRbMV0gKz0gb2Zmc2V0WzFdO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZHJhZ2dpbmcpIHtcbiAgICAgICAgICBpZiAoZDMuZXZlbnQuYWx0S2V5KSB7XG4gICAgICAgICAgICBpZiAoIWNlbnRlcikgY2VudGVyID0gWyAoeEV4dGVudFswXSArIHhFeHRlbnRbMV0pIC8gMiwgKHlFeHRlbnRbMF0gKyB5RXh0ZW50WzFdKSAvIDIgXTtcbiAgICAgICAgICAgIG9yaWdpblswXSA9IHhFeHRlbnRbKyhwb2ludFswXSA8IGNlbnRlclswXSldO1xuICAgICAgICAgICAgb3JpZ2luWzFdID0geUV4dGVudFsrKHBvaW50WzFdIDwgY2VudGVyWzFdKV07XG4gICAgICAgICAgfSBlbHNlIGNlbnRlciA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlc2l6aW5nWCAmJiBtb3ZlMShwb2ludCwgeCwgMCkpIHtcbiAgICAgICAgICByZWRyYXdYKGcpO1xuICAgICAgICAgIG1vdmVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVzaXppbmdZICYmIG1vdmUxKHBvaW50LCB5LCAxKSkge1xuICAgICAgICAgIHJlZHJhd1koZyk7XG4gICAgICAgICAgbW92ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtb3ZlZCkge1xuICAgICAgICAgIHJlZHJhdyhnKTtcbiAgICAgICAgICBldmVudF8oe1xuICAgICAgICAgICAgdHlwZTogXCJicnVzaFwiLFxuICAgICAgICAgICAgbW9kZTogZHJhZ2dpbmcgPyBcIm1vdmVcIiA6IFwicmVzaXplXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZnVuY3Rpb24gbW92ZTEocG9pbnQsIHNjYWxlLCBpKSB7XG4gICAgICAgIHZhciByYW5nZSA9IGQzX3NjYWxlUmFuZ2Uoc2NhbGUpLCByMCA9IHJhbmdlWzBdLCByMSA9IHJhbmdlWzFdLCBwb3NpdGlvbiA9IG9yaWdpbltpXSwgZXh0ZW50ID0gaSA/IHlFeHRlbnQgOiB4RXh0ZW50LCBzaXplID0gZXh0ZW50WzFdIC0gZXh0ZW50WzBdLCBtaW4sIG1heDtcbiAgICAgICAgaWYgKGRyYWdnaW5nKSB7XG4gICAgICAgICAgcjAgLT0gcG9zaXRpb247XG4gICAgICAgICAgcjEgLT0gc2l6ZSArIHBvc2l0aW9uO1xuICAgICAgICB9XG4gICAgICAgIG1pbiA9IChpID8geUNsYW1wIDogeENsYW1wKSA/IE1hdGgubWF4KHIwLCBNYXRoLm1pbihyMSwgcG9pbnRbaV0pKSA6IHBvaW50W2ldO1xuICAgICAgICBpZiAoZHJhZ2dpbmcpIHtcbiAgICAgICAgICBtYXggPSAobWluICs9IHBvc2l0aW9uKSArIHNpemU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGNlbnRlcikgcG9zaXRpb24gPSBNYXRoLm1heChyMCwgTWF0aC5taW4ocjEsIDIgKiBjZW50ZXJbaV0gLSBtaW4pKTtcbiAgICAgICAgICBpZiAocG9zaXRpb24gPCBtaW4pIHtcbiAgICAgICAgICAgIG1heCA9IG1pbjtcbiAgICAgICAgICAgIG1pbiA9IHBvc2l0aW9uO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtYXggPSBwb3NpdGlvbjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV4dGVudFswXSAhPSBtaW4gfHwgZXh0ZW50WzFdICE9IG1heCkge1xuICAgICAgICAgIGlmIChpKSB5RXh0ZW50RG9tYWluID0gbnVsbDsgZWxzZSB4RXh0ZW50RG9tYWluID0gbnVsbDtcbiAgICAgICAgICBleHRlbnRbMF0gPSBtaW47XG4gICAgICAgICAgZXh0ZW50WzFdID0gbWF4O1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBicnVzaGVuZCgpIHtcbiAgICAgICAgYnJ1c2htb3ZlKCk7XG4gICAgICAgIGcuc3R5bGUoXCJwb2ludGVyLWV2ZW50c1wiLCBcImFsbFwiKS5zZWxlY3RBbGwoXCIucmVzaXplXCIpLnN0eWxlKFwiZGlzcGxheVwiLCBicnVzaC5lbXB0eSgpID8gXCJub25lXCIgOiBudWxsKTtcbiAgICAgICAgZDMuc2VsZWN0KFwiYm9keVwiKS5zdHlsZShcImN1cnNvclwiLCBudWxsKTtcbiAgICAgICAgdy5vbihcIm1vdXNlbW92ZS5icnVzaFwiLCBudWxsKS5vbihcIm1vdXNldXAuYnJ1c2hcIiwgbnVsbCkub24oXCJ0b3VjaG1vdmUuYnJ1c2hcIiwgbnVsbCkub24oXCJ0b3VjaGVuZC5icnVzaFwiLCBudWxsKS5vbihcImtleWRvd24uYnJ1c2hcIiwgbnVsbCkub24oXCJrZXl1cC5icnVzaFwiLCBudWxsKTtcbiAgICAgICAgZHJhZ1Jlc3RvcmUoKTtcbiAgICAgICAgZXZlbnRfKHtcbiAgICAgICAgICB0eXBlOiBcImJydXNoZW5kXCJcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIGJydXNoLnggPSBmdW5jdGlvbih6KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB4O1xuICAgICAgeCA9IHo7XG4gICAgICByZXNpemVzID0gZDNfc3ZnX2JydXNoUmVzaXplc1sheCA8PCAxIHwgIXldO1xuICAgICAgcmV0dXJuIGJydXNoO1xuICAgIH07XG4gICAgYnJ1c2gueSA9IGZ1bmN0aW9uKHopIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHk7XG4gICAgICB5ID0gejtcbiAgICAgIHJlc2l6ZXMgPSBkM19zdmdfYnJ1c2hSZXNpemVzWyF4IDw8IDEgfCAheV07XG4gICAgICByZXR1cm4gYnJ1c2g7XG4gICAgfTtcbiAgICBicnVzaC5jbGFtcCA9IGZ1bmN0aW9uKHopIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHggJiYgeSA/IFsgeENsYW1wLCB5Q2xhbXAgXSA6IHggPyB4Q2xhbXAgOiB5ID8geUNsYW1wIDogbnVsbDtcbiAgICAgIGlmICh4ICYmIHkpIHhDbGFtcCA9ICEhelswXSwgeUNsYW1wID0gISF6WzFdOyBlbHNlIGlmICh4KSB4Q2xhbXAgPSAhIXo7IGVsc2UgaWYgKHkpIHlDbGFtcCA9ICEhejtcbiAgICAgIHJldHVybiBicnVzaDtcbiAgICB9O1xuICAgIGJydXNoLmV4dGVudCA9IGZ1bmN0aW9uKHopIHtcbiAgICAgIHZhciB4MCwgeDEsIHkwLCB5MSwgdDtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICBpZiAoeCkge1xuICAgICAgICAgIGlmICh4RXh0ZW50RG9tYWluKSB7XG4gICAgICAgICAgICB4MCA9IHhFeHRlbnREb21haW5bMF0sIHgxID0geEV4dGVudERvbWFpblsxXTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgeDAgPSB4RXh0ZW50WzBdLCB4MSA9IHhFeHRlbnRbMV07XG4gICAgICAgICAgICBpZiAoeC5pbnZlcnQpIHgwID0geC5pbnZlcnQoeDApLCB4MSA9IHguaW52ZXJ0KHgxKTtcbiAgICAgICAgICAgIGlmICh4MSA8IHgwKSB0ID0geDAsIHgwID0geDEsIHgxID0gdDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHkpIHtcbiAgICAgICAgICBpZiAoeUV4dGVudERvbWFpbikge1xuICAgICAgICAgICAgeTAgPSB5RXh0ZW50RG9tYWluWzBdLCB5MSA9IHlFeHRlbnREb21haW5bMV07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHkwID0geUV4dGVudFswXSwgeTEgPSB5RXh0ZW50WzFdO1xuICAgICAgICAgICAgaWYgKHkuaW52ZXJ0KSB5MCA9IHkuaW52ZXJ0KHkwKSwgeTEgPSB5LmludmVydCh5MSk7XG4gICAgICAgICAgICBpZiAoeTEgPCB5MCkgdCA9IHkwLCB5MCA9IHkxLCB5MSA9IHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB4ICYmIHkgPyBbIFsgeDAsIHkwIF0sIFsgeDEsIHkxIF0gXSA6IHggPyBbIHgwLCB4MSBdIDogeSAmJiBbIHkwLCB5MSBdO1xuICAgICAgfVxuICAgICAgaWYgKHgpIHtcbiAgICAgICAgeDAgPSB6WzBdLCB4MSA9IHpbMV07XG4gICAgICAgIGlmICh5KSB4MCA9IHgwWzBdLCB4MSA9IHgxWzBdO1xuICAgICAgICB4RXh0ZW50RG9tYWluID0gWyB4MCwgeDEgXTtcbiAgICAgICAgaWYgKHguaW52ZXJ0KSB4MCA9IHgoeDApLCB4MSA9IHgoeDEpO1xuICAgICAgICBpZiAoeDEgPCB4MCkgdCA9IHgwLCB4MCA9IHgxLCB4MSA9IHQ7XG4gICAgICAgIGlmICh4MCAhPSB4RXh0ZW50WzBdIHx8IHgxICE9IHhFeHRlbnRbMV0pIHhFeHRlbnQgPSBbIHgwLCB4MSBdO1xuICAgICAgfVxuICAgICAgaWYgKHkpIHtcbiAgICAgICAgeTAgPSB6WzBdLCB5MSA9IHpbMV07XG4gICAgICAgIGlmICh4KSB5MCA9IHkwWzFdLCB5MSA9IHkxWzFdO1xuICAgICAgICB5RXh0ZW50RG9tYWluID0gWyB5MCwgeTEgXTtcbiAgICAgICAgaWYgKHkuaW52ZXJ0KSB5MCA9IHkoeTApLCB5MSA9IHkoeTEpO1xuICAgICAgICBpZiAoeTEgPCB5MCkgdCA9IHkwLCB5MCA9IHkxLCB5MSA9IHQ7XG4gICAgICAgIGlmICh5MCAhPSB5RXh0ZW50WzBdIHx8IHkxICE9IHlFeHRlbnRbMV0pIHlFeHRlbnQgPSBbIHkwLCB5MSBdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGJydXNoO1xuICAgIH07XG4gICAgYnJ1c2guY2xlYXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghYnJ1c2guZW1wdHkoKSkge1xuICAgICAgICB4RXh0ZW50ID0gWyAwLCAwIF0sIHlFeHRlbnQgPSBbIDAsIDAgXTtcbiAgICAgICAgeEV4dGVudERvbWFpbiA9IHlFeHRlbnREb21haW4gPSBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGJydXNoO1xuICAgIH07XG4gICAgYnJ1c2guZW1wdHkgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAhIXggJiYgeEV4dGVudFswXSA9PSB4RXh0ZW50WzFdIHx8ICEheSAmJiB5RXh0ZW50WzBdID09IHlFeHRlbnRbMV07XG4gICAgfTtcbiAgICByZXR1cm4gZDMucmViaW5kKGJydXNoLCBldmVudCwgXCJvblwiKTtcbiAgfTtcbiAgdmFyIGQzX3N2Z19icnVzaEN1cnNvciA9IHtcbiAgICBuOiBcIm5zLXJlc2l6ZVwiLFxuICAgIGU6IFwiZXctcmVzaXplXCIsXG4gICAgczogXCJucy1yZXNpemVcIixcbiAgICB3OiBcImV3LXJlc2l6ZVwiLFxuICAgIG53OiBcIm53c2UtcmVzaXplXCIsXG4gICAgbmU6IFwibmVzdy1yZXNpemVcIixcbiAgICBzZTogXCJud3NlLXJlc2l6ZVwiLFxuICAgIHN3OiBcIm5lc3ctcmVzaXplXCJcbiAgfTtcbiAgdmFyIGQzX3N2Z19icnVzaFJlc2l6ZXMgPSBbIFsgXCJuXCIsIFwiZVwiLCBcInNcIiwgXCJ3XCIsIFwibndcIiwgXCJuZVwiLCBcInNlXCIsIFwic3dcIiBdLCBbIFwiZVwiLCBcIndcIiBdLCBbIFwiblwiLCBcInNcIiBdLCBbXSBdO1xuICB2YXIgZDNfdGltZV9mb3JtYXQgPSBkM190aW1lLmZvcm1hdCA9IGQzX2xvY2FsZV9lblVTLnRpbWVGb3JtYXQ7XG4gIHZhciBkM190aW1lX2Zvcm1hdFV0YyA9IGQzX3RpbWVfZm9ybWF0LnV0YztcbiAgdmFyIGQzX3RpbWVfZm9ybWF0SXNvID0gZDNfdGltZV9mb3JtYXRVdGMoXCIlWS0lbS0lZFQlSDolTTolUy4lTFpcIik7XG4gIGQzX3RpbWVfZm9ybWF0LmlzbyA9IERhdGUucHJvdG90eXBlLnRvSVNPU3RyaW5nICYmICtuZXcgRGF0ZShcIjIwMDAtMDEtMDFUMDA6MDA6MDAuMDAwWlwiKSA/IGQzX3RpbWVfZm9ybWF0SXNvTmF0aXZlIDogZDNfdGltZV9mb3JtYXRJc287XG4gIGZ1bmN0aW9uIGQzX3RpbWVfZm9ybWF0SXNvTmF0aXZlKGRhdGUpIHtcbiAgICByZXR1cm4gZGF0ZS50b0lTT1N0cmluZygpO1xuICB9XG4gIGQzX3RpbWVfZm9ybWF0SXNvTmF0aXZlLnBhcnNlID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgdmFyIGRhdGUgPSBuZXcgRGF0ZShzdHJpbmcpO1xuICAgIHJldHVybiBpc05hTihkYXRlKSA/IG51bGwgOiBkYXRlO1xuICB9O1xuICBkM190aW1lX2Zvcm1hdElzb05hdGl2ZS50b1N0cmluZyA9IGQzX3RpbWVfZm9ybWF0SXNvLnRvU3RyaW5nO1xuICBkM190aW1lLnNlY29uZCA9IGQzX3RpbWVfaW50ZXJ2YWwoZnVuY3Rpb24oZGF0ZSkge1xuICAgIHJldHVybiBuZXcgZDNfZGF0ZShNYXRoLmZsb29yKGRhdGUgLyAxZTMpICogMWUzKTtcbiAgfSwgZnVuY3Rpb24oZGF0ZSwgb2Zmc2V0KSB7XG4gICAgZGF0ZS5zZXRUaW1lKGRhdGUuZ2V0VGltZSgpICsgTWF0aC5mbG9vcihvZmZzZXQpICogMWUzKTtcbiAgfSwgZnVuY3Rpb24oZGF0ZSkge1xuICAgIHJldHVybiBkYXRlLmdldFNlY29uZHMoKTtcbiAgfSk7XG4gIGQzX3RpbWUuc2Vjb25kcyA9IGQzX3RpbWUuc2Vjb25kLnJhbmdlO1xuICBkM190aW1lLnNlY29uZHMudXRjID0gZDNfdGltZS5zZWNvbmQudXRjLnJhbmdlO1xuICBkM190aW1lLm1pbnV0ZSA9IGQzX3RpbWVfaW50ZXJ2YWwoZnVuY3Rpb24oZGF0ZSkge1xuICAgIHJldHVybiBuZXcgZDNfZGF0ZShNYXRoLmZsb29yKGRhdGUgLyA2ZTQpICogNmU0KTtcbiAgfSwgZnVuY3Rpb24oZGF0ZSwgb2Zmc2V0KSB7XG4gICAgZGF0ZS5zZXRUaW1lKGRhdGUuZ2V0VGltZSgpICsgTWF0aC5mbG9vcihvZmZzZXQpICogNmU0KTtcbiAgfSwgZnVuY3Rpb24oZGF0ZSkge1xuICAgIHJldHVybiBkYXRlLmdldE1pbnV0ZXMoKTtcbiAgfSk7XG4gIGQzX3RpbWUubWludXRlcyA9IGQzX3RpbWUubWludXRlLnJhbmdlO1xuICBkM190aW1lLm1pbnV0ZXMudXRjID0gZDNfdGltZS5taW51dGUudXRjLnJhbmdlO1xuICBkM190aW1lLmhvdXIgPSBkM190aW1lX2ludGVydmFsKGZ1bmN0aW9uKGRhdGUpIHtcbiAgICB2YXIgdGltZXpvbmUgPSBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCkgLyA2MDtcbiAgICByZXR1cm4gbmV3IGQzX2RhdGUoKE1hdGguZmxvb3IoZGF0ZSAvIDM2ZTUgLSB0aW1lem9uZSkgKyB0aW1lem9uZSkgKiAzNmU1KTtcbiAgfSwgZnVuY3Rpb24oZGF0ZSwgb2Zmc2V0KSB7XG4gICAgZGF0ZS5zZXRUaW1lKGRhdGUuZ2V0VGltZSgpICsgTWF0aC5mbG9vcihvZmZzZXQpICogMzZlNSk7XG4gIH0sIGZ1bmN0aW9uKGRhdGUpIHtcbiAgICByZXR1cm4gZGF0ZS5nZXRIb3VycygpO1xuICB9KTtcbiAgZDNfdGltZS5ob3VycyA9IGQzX3RpbWUuaG91ci5yYW5nZTtcbiAgZDNfdGltZS5ob3Vycy51dGMgPSBkM190aW1lLmhvdXIudXRjLnJhbmdlO1xuICBkM190aW1lLm1vbnRoID0gZDNfdGltZV9pbnRlcnZhbChmdW5jdGlvbihkYXRlKSB7XG4gICAgZGF0ZSA9IGQzX3RpbWUuZGF5KGRhdGUpO1xuICAgIGRhdGUuc2V0RGF0ZSgxKTtcbiAgICByZXR1cm4gZGF0ZTtcbiAgfSwgZnVuY3Rpb24oZGF0ZSwgb2Zmc2V0KSB7XG4gICAgZGF0ZS5zZXRNb250aChkYXRlLmdldE1vbnRoKCkgKyBvZmZzZXQpO1xuICB9LCBmdW5jdGlvbihkYXRlKSB7XG4gICAgcmV0dXJuIGRhdGUuZ2V0TW9udGgoKTtcbiAgfSk7XG4gIGQzX3RpbWUubW9udGhzID0gZDNfdGltZS5tb250aC5yYW5nZTtcbiAgZDNfdGltZS5tb250aHMudXRjID0gZDNfdGltZS5tb250aC51dGMucmFuZ2U7XG4gIGZ1bmN0aW9uIGQzX3RpbWVfc2NhbGUobGluZWFyLCBtZXRob2RzLCBmb3JtYXQpIHtcbiAgICBmdW5jdGlvbiBzY2FsZSh4KSB7XG4gICAgICByZXR1cm4gbGluZWFyKHgpO1xuICAgIH1cbiAgICBzY2FsZS5pbnZlcnQgPSBmdW5jdGlvbih4KSB7XG4gICAgICByZXR1cm4gZDNfdGltZV9zY2FsZURhdGUobGluZWFyLmludmVydCh4KSk7XG4gICAgfTtcbiAgICBzY2FsZS5kb21haW4gPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBsaW5lYXIuZG9tYWluKCkubWFwKGQzX3RpbWVfc2NhbGVEYXRlKTtcbiAgICAgIGxpbmVhci5kb21haW4oeCk7XG4gICAgICByZXR1cm4gc2NhbGU7XG4gICAgfTtcbiAgICBmdW5jdGlvbiB0aWNrTWV0aG9kKGV4dGVudCwgY291bnQpIHtcbiAgICAgIHZhciBzcGFuID0gZXh0ZW50WzFdIC0gZXh0ZW50WzBdLCB0YXJnZXQgPSBzcGFuIC8gY291bnQsIGkgPSBkMy5iaXNlY3QoZDNfdGltZV9zY2FsZVN0ZXBzLCB0YXJnZXQpO1xuICAgICAgcmV0dXJuIGkgPT0gZDNfdGltZV9zY2FsZVN0ZXBzLmxlbmd0aCA/IFsgbWV0aG9kcy55ZWFyLCBkM19zY2FsZV9saW5lYXJUaWNrUmFuZ2UoZXh0ZW50Lm1hcChmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkIC8gMzE1MzZlNjtcbiAgICAgIH0pLCBjb3VudClbMl0gXSA6ICFpID8gWyBkM190aW1lX3NjYWxlTWlsbGlzZWNvbmRzLCBkM19zY2FsZV9saW5lYXJUaWNrUmFuZ2UoZXh0ZW50LCBjb3VudClbMl0gXSA6IG1ldGhvZHNbdGFyZ2V0IC8gZDNfdGltZV9zY2FsZVN0ZXBzW2kgLSAxXSA8IGQzX3RpbWVfc2NhbGVTdGVwc1tpXSAvIHRhcmdldCA/IGkgLSAxIDogaV07XG4gICAgfVxuICAgIHNjYWxlLm5pY2UgPSBmdW5jdGlvbihpbnRlcnZhbCwgc2tpcCkge1xuICAgICAgdmFyIGRvbWFpbiA9IHNjYWxlLmRvbWFpbigpLCBleHRlbnQgPSBkM19zY2FsZUV4dGVudChkb21haW4pLCBtZXRob2QgPSBpbnRlcnZhbCA9PSBudWxsID8gdGlja01ldGhvZChleHRlbnQsIDEwKSA6IHR5cGVvZiBpbnRlcnZhbCA9PT0gXCJudW1iZXJcIiAmJiB0aWNrTWV0aG9kKGV4dGVudCwgaW50ZXJ2YWwpO1xuICAgICAgaWYgKG1ldGhvZCkgaW50ZXJ2YWwgPSBtZXRob2RbMF0sIHNraXAgPSBtZXRob2RbMV07XG4gICAgICBmdW5jdGlvbiBza2lwcGVkKGRhdGUpIHtcbiAgICAgICAgcmV0dXJuICFpc05hTihkYXRlKSAmJiAhaW50ZXJ2YWwucmFuZ2UoZGF0ZSwgZDNfdGltZV9zY2FsZURhdGUoK2RhdGUgKyAxKSwgc2tpcCkubGVuZ3RoO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNjYWxlLmRvbWFpbihkM19zY2FsZV9uaWNlKGRvbWFpbiwgc2tpcCA+IDEgPyB7XG4gICAgICAgIGZsb29yOiBmdW5jdGlvbihkYXRlKSB7XG4gICAgICAgICAgd2hpbGUgKHNraXBwZWQoZGF0ZSA9IGludGVydmFsLmZsb29yKGRhdGUpKSkgZGF0ZSA9IGQzX3RpbWVfc2NhbGVEYXRlKGRhdGUgLSAxKTtcbiAgICAgICAgICByZXR1cm4gZGF0ZTtcbiAgICAgICAgfSxcbiAgICAgICAgY2VpbDogZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgICAgIHdoaWxlIChza2lwcGVkKGRhdGUgPSBpbnRlcnZhbC5jZWlsKGRhdGUpKSkgZGF0ZSA9IGQzX3RpbWVfc2NhbGVEYXRlKCtkYXRlICsgMSk7XG4gICAgICAgICAgcmV0dXJuIGRhdGU7XG4gICAgICAgIH1cbiAgICAgIH0gOiBpbnRlcnZhbCkpO1xuICAgIH07XG4gICAgc2NhbGUudGlja3MgPSBmdW5jdGlvbihpbnRlcnZhbCwgc2tpcCkge1xuICAgICAgdmFyIGV4dGVudCA9IGQzX3NjYWxlRXh0ZW50KHNjYWxlLmRvbWFpbigpKSwgbWV0aG9kID0gaW50ZXJ2YWwgPT0gbnVsbCA/IHRpY2tNZXRob2QoZXh0ZW50LCAxMCkgOiB0eXBlb2YgaW50ZXJ2YWwgPT09IFwibnVtYmVyXCIgPyB0aWNrTWV0aG9kKGV4dGVudCwgaW50ZXJ2YWwpIDogIWludGVydmFsLnJhbmdlICYmIFsge1xuICAgICAgICByYW5nZTogaW50ZXJ2YWxcbiAgICAgIH0sIHNraXAgXTtcbiAgICAgIGlmIChtZXRob2QpIGludGVydmFsID0gbWV0aG9kWzBdLCBza2lwID0gbWV0aG9kWzFdO1xuICAgICAgcmV0dXJuIGludGVydmFsLnJhbmdlKGV4dGVudFswXSwgZDNfdGltZV9zY2FsZURhdGUoK2V4dGVudFsxXSArIDEpLCBza2lwIDwgMSA/IDEgOiBza2lwKTtcbiAgICB9O1xuICAgIHNjYWxlLnRpY2tGb3JtYXQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBmb3JtYXQ7XG4gICAgfTtcbiAgICBzY2FsZS5jb3B5ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZDNfdGltZV9zY2FsZShsaW5lYXIuY29weSgpLCBtZXRob2RzLCBmb3JtYXQpO1xuICAgIH07XG4gICAgcmV0dXJuIGQzX3NjYWxlX2xpbmVhclJlYmluZChzY2FsZSwgbGluZWFyKTtcbiAgfVxuICBmdW5jdGlvbiBkM190aW1lX3NjYWxlRGF0ZSh0KSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKHQpO1xuICB9XG4gIHZhciBkM190aW1lX3NjYWxlU3RlcHMgPSBbIDFlMywgNWUzLCAxNWUzLCAzZTQsIDZlNCwgM2U1LCA5ZTUsIDE4ZTUsIDM2ZTUsIDEwOGU1LCAyMTZlNSwgNDMyZTUsIDg2NGU1LCAxNzI4ZTUsIDYwNDhlNSwgMjU5MmU2LCA3Nzc2ZTYsIDMxNTM2ZTYgXTtcbiAgdmFyIGQzX3RpbWVfc2NhbGVMb2NhbE1ldGhvZHMgPSBbIFsgZDNfdGltZS5zZWNvbmQsIDEgXSwgWyBkM190aW1lLnNlY29uZCwgNSBdLCBbIGQzX3RpbWUuc2Vjb25kLCAxNSBdLCBbIGQzX3RpbWUuc2Vjb25kLCAzMCBdLCBbIGQzX3RpbWUubWludXRlLCAxIF0sIFsgZDNfdGltZS5taW51dGUsIDUgXSwgWyBkM190aW1lLm1pbnV0ZSwgMTUgXSwgWyBkM190aW1lLm1pbnV0ZSwgMzAgXSwgWyBkM190aW1lLmhvdXIsIDEgXSwgWyBkM190aW1lLmhvdXIsIDMgXSwgWyBkM190aW1lLmhvdXIsIDYgXSwgWyBkM190aW1lLmhvdXIsIDEyIF0sIFsgZDNfdGltZS5kYXksIDEgXSwgWyBkM190aW1lLmRheSwgMiBdLCBbIGQzX3RpbWUud2VlaywgMSBdLCBbIGQzX3RpbWUubW9udGgsIDEgXSwgWyBkM190aW1lLm1vbnRoLCAzIF0sIFsgZDNfdGltZS55ZWFyLCAxIF0gXTtcbiAgdmFyIGQzX3RpbWVfc2NhbGVMb2NhbEZvcm1hdCA9IGQzX3RpbWVfZm9ybWF0Lm11bHRpKFsgWyBcIi4lTFwiLCBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIGQuZ2V0TWlsbGlzZWNvbmRzKCk7XG4gIH0gXSwgWyBcIjolU1wiLCBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIGQuZ2V0U2Vjb25kcygpO1xuICB9IF0sIFsgXCIlSTolTVwiLCBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIGQuZ2V0TWludXRlcygpO1xuICB9IF0sIFsgXCIlSSAlcFwiLCBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIGQuZ2V0SG91cnMoKTtcbiAgfSBdLCBbIFwiJWEgJWRcIiwgZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiBkLmdldERheSgpICYmIGQuZ2V0RGF0ZSgpICE9IDE7XG4gIH0gXSwgWyBcIiViICVkXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gZC5nZXREYXRlKCkgIT0gMTtcbiAgfSBdLCBbIFwiJUJcIiwgZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiBkLmdldE1vbnRoKCk7XG4gIH0gXSwgWyBcIiVZXCIsIGQzX3RydWUgXSBdKTtcbiAgdmFyIGQzX3RpbWVfc2NhbGVNaWxsaXNlY29uZHMgPSB7XG4gICAgcmFuZ2U6IGZ1bmN0aW9uKHN0YXJ0LCBzdG9wLCBzdGVwKSB7XG4gICAgICByZXR1cm4gZDMucmFuZ2UoTWF0aC5jZWlsKHN0YXJ0IC8gc3RlcCkgKiBzdGVwLCArc3RvcCwgc3RlcCkubWFwKGQzX3RpbWVfc2NhbGVEYXRlKTtcbiAgICB9LFxuICAgIGZsb29yOiBkM19pZGVudGl0eSxcbiAgICBjZWlsOiBkM19pZGVudGl0eVxuICB9O1xuICBkM190aW1lX3NjYWxlTG9jYWxNZXRob2RzLnllYXIgPSBkM190aW1lLnllYXI7XG4gIGQzX3RpbWUuc2NhbGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDNfdGltZV9zY2FsZShkMy5zY2FsZS5saW5lYXIoKSwgZDNfdGltZV9zY2FsZUxvY2FsTWV0aG9kcywgZDNfdGltZV9zY2FsZUxvY2FsRm9ybWF0KTtcbiAgfTtcbiAgdmFyIGQzX3RpbWVfc2NhbGVVdGNNZXRob2RzID0gZDNfdGltZV9zY2FsZUxvY2FsTWV0aG9kcy5tYXAoZnVuY3Rpb24obSkge1xuICAgIHJldHVybiBbIG1bMF0udXRjLCBtWzFdIF07XG4gIH0pO1xuICB2YXIgZDNfdGltZV9zY2FsZVV0Y0Zvcm1hdCA9IGQzX3RpbWVfZm9ybWF0VXRjLm11bHRpKFsgWyBcIi4lTFwiLCBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIGQuZ2V0VVRDTWlsbGlzZWNvbmRzKCk7XG4gIH0gXSwgWyBcIjolU1wiLCBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIGQuZ2V0VVRDU2Vjb25kcygpO1xuICB9IF0sIFsgXCIlSTolTVwiLCBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIGQuZ2V0VVRDTWludXRlcygpO1xuICB9IF0sIFsgXCIlSSAlcFwiLCBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIGQuZ2V0VVRDSG91cnMoKTtcbiAgfSBdLCBbIFwiJWEgJWRcIiwgZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiBkLmdldFVUQ0RheSgpICYmIGQuZ2V0VVRDRGF0ZSgpICE9IDE7XG4gIH0gXSwgWyBcIiViICVkXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gZC5nZXRVVENEYXRlKCkgIT0gMTtcbiAgfSBdLCBbIFwiJUJcIiwgZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiBkLmdldFVUQ01vbnRoKCk7XG4gIH0gXSwgWyBcIiVZXCIsIGQzX3RydWUgXSBdKTtcbiAgZDNfdGltZV9zY2FsZVV0Y01ldGhvZHMueWVhciA9IGQzX3RpbWUueWVhci51dGM7XG4gIGQzX3RpbWUuc2NhbGUudXRjID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzX3RpbWVfc2NhbGUoZDMuc2NhbGUubGluZWFyKCksIGQzX3RpbWVfc2NhbGVVdGNNZXRob2RzLCBkM190aW1lX3NjYWxlVXRjRm9ybWF0KTtcbiAgfTtcbiAgZDMudGV4dCA9IGQzX3hoclR5cGUoZnVuY3Rpb24ocmVxdWVzdCkge1xuICAgIHJldHVybiByZXF1ZXN0LnJlc3BvbnNlVGV4dDtcbiAgfSk7XG4gIGQzLmpzb24gPSBmdW5jdGlvbih1cmwsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIGQzX3hocih1cmwsIFwiYXBwbGljYXRpb24vanNvblwiLCBkM19qc29uLCBjYWxsYmFjayk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX2pzb24ocmVxdWVzdCkge1xuICAgIHJldHVybiBKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0KTtcbiAgfVxuICBkMy5odG1sID0gZnVuY3Rpb24odXJsLCBjYWxsYmFjaykge1xuICAgIHJldHVybiBkM194aHIodXJsLCBcInRleHQvaHRtbFwiLCBkM19odG1sLCBjYWxsYmFjayk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX2h0bWwocmVxdWVzdCkge1xuICAgIHZhciByYW5nZSA9IGQzX2RvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgcmFuZ2Uuc2VsZWN0Tm9kZShkM19kb2N1bWVudC5ib2R5KTtcbiAgICByZXR1cm4gcmFuZ2UuY3JlYXRlQ29udGV4dHVhbEZyYWdtZW50KHJlcXVlc3QucmVzcG9uc2VUZXh0KTtcbiAgfVxuICBkMy54bWwgPSBkM194aHJUeXBlKGZ1bmN0aW9uKHJlcXVlc3QpIHtcbiAgICByZXR1cm4gcmVxdWVzdC5yZXNwb25zZVhNTDtcbiAgfSk7XG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKGQzKTsgZWxzZSBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiAmJiBtb2R1bGUuZXhwb3J0cykgbW9kdWxlLmV4cG9ydHMgPSBkMztcbiAgdGhpcy5kMyA9IGQzO1xufSgpOyJdfQ==
