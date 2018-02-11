(function (exports) {
'use strict';

/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
	var arguments$1 = arguments;

	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments$1[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

//Supposedly faster for v8 than just Object.create(null)
function Raw(){}
Raw.prototype = (function (){
    //Maybe some old browser has risen from it's grave
    if(typeof Object.create !== 'function'){
        var temp = new Object();
        temp.__proto__ = null;
        return temp;
    }

    return Object.create(null);
})();

function rawObject(){
    var arguments$1 = arguments;

    var objects = [], len = arguments.length;
    while ( len-- ) { objects[ len ] = arguments$1[ len ]; }

    var raw = new Raw();
    objectAssign.apply(void 0, [ raw ].concat( objects ));
    return raw;
}

function clock(interval, ref){
    if ( ref === void 0 ) ref = {};
    var tick = ref.tick; if ( tick === void 0 ) tick = null;
    var sync = ref.sync; if ( sync === void 0 ) sync = 1000;
    var stop = ref.stop; if ( stop === void 0 ) stop = function (){};
    var pause = ref.pause; if ( pause === void 0 ) pause = function (){};
    var showDiff = ref.showDiff; if ( showDiff === void 0 ) showDiff = false;


    var running = false,
        paused = false,
        timeoutID = null,
        pausePassed = false,
        stopOn = null,
        startTime,
        count = 0,
        base = null;

    if(typeof tick !== 'function'){
        throw new Error((tick + " is not a function"));
    }

    var timer = rawObject({
        stop: function stop$1(){
            running = false;
            if(timeoutID !== null){
                clearTimeout(timeoutID);
                stop.call(this, base);
            }
            return this;
        },
        pause: function pause$1(){
            paused = true;
            pause.call(this, base);
            return this;
        },
        start: function start(times){
            stopOn = isNaN(times) ? stopOn : times;
            count = 0;

            if(running) { return; }
            if(paused){
                paused = false; return;
            }

            paused = false;
            running = true;
            base = startTime = Date.now();

            if(sync){
                //Synchronize start interval
                //to rounded interval
                base = startTime = startTime - (startTime % sync) + sync;

                timeoutID = setTimeout(next, startTime - Date.now());
                return this;
            }

            next();
            return this;
        }
    });

    function next(){
        if(!running) { return; }

        //Stabilize the timer interval
        base += interval;
        var time = Date.now();
        var diff = time - base;
        var frame = interval - diff;

        timeoutID = setTimeout(
            next, frame < 0 ? 0 : frame);

        if(paused) { return; }

        ++count;

        if(stopOn && count >= stopOn){
            return timer.stop();
        }

        tick.call(timer, base, time);

    }

    return timer;
}

exports.clock = clock;

}((this.horologian = this.horologian || {})));
//# sourceMappingURL=horologian.js.map
