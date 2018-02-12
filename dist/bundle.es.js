import rawObject from 'raw-object';

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
: Date.now
? Date.now
: function (){ return new Date().getTime(); };

var max = Math.max;

function clock(interval, ref){
    if ( ref === void 0 ) ref = {};
    var tick = ref.tick; if ( tick === void 0 ) tick = null;
    var sync = ref.sync; if ( sync === void 0 ) sync = 1000;
    var precise = ref.precise; if ( precise === void 0 ) precise = false;
    var stop = ref.stop; if ( stop === void 0 ) stop = function (){};
    var pause = ref.pause; if ( pause === void 0 ) pause = function (){};


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
            if ( forward === void 0 ) forward = 1;

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

export { clock };
//# sourceMappingURL=bundle.es.js.map
