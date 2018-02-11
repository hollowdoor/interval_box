interval-box
===

Install
---

`npm install interval-box`

Usage
---

The `tick()` value is the only required "option". All other options are optional.

In the next example all options except for `tick()` are set to the default.

```javascript
import { clock } from 'interval-box';
//Start a timer with 1 second intervals
const timer = clock(1000, {
    //Runs tick() every interval
    tick(time){

    },
    //Synchronize the interval to a
    //real time rounded number
    sync: 1000,
    //Use requestAnimationFrame, or setImmediate
    //instead of setTimeout
    //For better timing set precise to true
    precise: false,
    //This function gets called when
    //the timer.stop() method is called.
    stop(time){

    },
    //This function gets called when
    //the timer.pause() method is called.
    pause(time){

    }
});
```

Methods
----

### timer.start(times)

Start the timer with `timer.start()`

Start the timer with a limit of intervals with `timer.start(times)`. The `times` parameter should be an integer.

### timer.stop()

Stop the timer with `timer.stop()`.

### timer.pause()

Pause the timer with `timer.pause()`. The intervals will continue to build up, but the `tick()` options function will not be called.

### timer.sync(syncTo, foward = 1)

You can synchronize the timer to a definite time frame. Setting `timer.sync(1000)` would make the timer synchronized to real seconds on the clock.

The `forward` argument multiplies the value you pass to `syncTo`. So `timer.sync(1000, 3)` synchronize the timer to 1 second, and wait 3 seconds to start the intervals.

About
---

A precision timer with a very simple implementation.
