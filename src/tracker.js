import rawObject from 'raw-object';

export default function tracker(){

    return rawObject({
        timeoutId: null,
        running: false,
        paused: false,
        pausePassed: false,
        stopOn: null,
        count: 0,
        startTime: Date.now(),
        sync
    });
}
