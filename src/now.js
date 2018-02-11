const start = typeof performance !== 'undefined' && performance.now
? performance.timing.navigationStart
: null;

const now = typeof performance !== 'undefined' && performance.now
? ()=>start + performance.now()
: Date.now;

export default now;
