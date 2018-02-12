const start = typeof performance !== 'undefined' && performance.now
? performance.timing.navigationStart
: null;

const now = typeof performance !== 'undefined' && performance.now
? ()=>start + performance.now()
: Date.now
? Date.now
: ()=>new Date().getTime();

export default now;
