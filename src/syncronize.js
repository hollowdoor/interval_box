export default function syncronize({
    startTime = Date.now(),
    sync = 1000
} = {}){
    startTime = startTime - (startTime % sync) + sync;

    return {
        startTime,
        startInterval: startTime - Date.now()
    };
}
