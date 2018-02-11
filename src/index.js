import rawObject from 'raw-object';
import { requestFrame, cancelFrame } from './frames.js';
import now from './now.js';
const max = Math.max;

export function clock(interval, {
    tick = null,
    sync = 1000,
    precise = false,
    stop = ()=>{},
    pause = ()=>{}
} = {}){

    let running = false,
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
        throw new Error(`${tick} is not a function`);
    }

    const timer = rawObject({
        stop(){
            //Full stop
            if(timeoutID !== null){
                running = false;
                cancel(timeoutID);
                timeoutID = null;
                stop.call(this, base);
            }
            return this;
        },
        pause(){
            //A pause is just a boolean
            //that stops tick() calls
            paused = true;
            pause.call(this, base);
            return this;
        },
        start(times){
            stopOn = isNaN(times)
            ? stopOn : max(times, 1);
            count = 0;

            if(paused){
                //The timer is already running
                paused = false;
                return this;
            }

            base = startTime = now();
            if(sync) this.sync(sync);
            paused = false;
            running = true;

            next();
            return this;
        },
        sync(syncTo, forward = 1){
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
        if(!running) return;
        timeoutID = request(next, 0);
        let time = now();
        //Compensate for drifting,
        //and processing time
        if(time - base < -1) return;
        //Stabilize the timer interval
        base += interval;
        //While paused the interval still
        //progresses without calling tick()
        if(paused) return;

        ++count;

        if(stopOn && count >= stopOn){
            return timer.stop();
        }

        tick.call(timer, base, time);
    }

    return timer;
}
