const requestFrame = typeof window !== 'undefined'
? window.requestAnimationFrame
? window.requestAnimationFrame
: window.setImmediate
? window.setImmediate
: (cb)=>setTimeout(cb, 0)
: setImmediate
? setImmediate
: (cb)=>setTimeout(cb, 0);

const cancelFrame = typeof window !== 'undefined'
? window.cancelAnimationFrame
? window.cancelAnimationFrame
: window.clearImmediate
? window.clearImmediate
: clearTimeout
: clearImmediate
? clearImmediate
: clearTimeout;

export { requestFrame, cancelFrame }
