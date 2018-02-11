(function () {
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

var requestFrame = typeof window !== 'undefined'
? window.requestAnimationFrame
? window.requestAnimationFrame
: window.requestAnimationFrame
? window.requestAnimationFrame
: function (cb){ return setTimeout(cb, 0); }
: setImmediate
? setImmediate
: function (cb){ return setTimeout(cb, 0); };

var cancelFrame = typeof window !== 'undefined'
? window.cancelAnimationFrame
? window.cancelAnimationFrame
: window.clearImmediate
? window.clearImmediate
: clearTimeout
: clearImmediate
? clearImmediate
: clearTimeout;

var start = typeof performance !== 'undefined' && performance.now
? performance.timing.navigationStart
: null;

var now = typeof performance !== 'undefined' && performance.now
? function (){ return start + performance.now(); }
: Date.now;

var max = Math.max;

function clock(interval, ref){
    if ( ref === void 0 ) { ref = {}; }
    var tick = ref.tick; if ( tick === void 0 ) { tick = null; }
    var sync = ref.sync; if ( sync === void 0 ) { sync = 1000; }
    var precise = ref.precise; if ( precise === void 0 ) { precise = false; }
    var stop = ref.stop; if ( stop === void 0 ) { stop = function (){}; }
    var pause = ref.pause; if ( pause === void 0 ) { pause = function (){}; }


    var running = false,
        paused = false,
        timeoutID = null,
        //Allow setting amount of ticks
        stopOn = null,
        startTime,
        count = 0,
        //The precise-ish time
        base = null,
        request = precise
        ? requestFrame : setTimeout,
        cancel = precise
        ? cancelFrame : clearTimeout;

    if(typeof tick !== 'function'){
        throw new Error((tick + " is not a function"));
    }

    var timer = rawObject({
        stop: function stop$1(){
            //Full stop
            if(timeoutID !== null){
                running = false;
                cancel(timeoutID);
                timeoutID = null;
                stop.call(this, base);
            }
            return this;
        },
        pause: function pause$1(){
            //A pause is just a boolean
            //that stops tick() calls
            paused = true;
            pause.call(this, base);
            return this;
        },
        start: function start(times){
            stopOn = isNaN(times)
            ? stopOn : max(times, 1);
            count = 0;

            if(paused){
                //The timer is already running
                paused = false;
                return this;
            }

            base = startTime = now();
            if(sync) { this.sync(sync); }
            paused = false;
            running = true;

            next();
            return this;
        },
        sync: function sync$1(syncTo, forward){
            if ( forward === void 0 ) { forward = 1; }

            sync = syncTo;
            forward = sync * max(forward, 1);
            //Synchronize interval
            //to rounded interval
            if(!base){
                base = startTime = startTime - (startTime % sync) + forward;
            }else{
                startTime = startTime - (startTime % sync) + forward;
                base = base - (base % sync) + forward;
            }
        }
    });

    function next(){
        if(!running) { return; }
        timeoutID = request(next, 0);
        var time = now();
        //Compensate for drifting,
        //and processing time
        if(time - base < -1) { return; }
        //Stabilize the timer interval
        base += interval;
        //While paused the interval still
        //progresses without calling tick()
        if(paused) { return; }

        ++count;

        if(stopOn && count >= stopOn){
            return timer.stop();
        }

        tick.call(timer, base, time);
    }

    return timer;
}

var queue = [];
function timer(n, s, d){
    if ( d === void 0 ) d = 4;


    queue.push(function (){
        console.log();
        return clock(n, {
            precise: true,
            tick: function tick(time){
                console.log(s, new Date(time).toTimeString());
                console.log('time ',time);
            },
            stop: function stop(time){
                console.log(s, new Date(time).toTimeString());
                console.log('time ',time);
                if(queue.length){
                    queue.shift()();
                }
            }
        }).start(d);
    });

    return queue;

}

timer(1000, 'timer 1').shift()();
timer(1000, 'timer 2');
timer(100, 'timer 3', 7);

}());
//# sourceMappingURL=code.js.map
