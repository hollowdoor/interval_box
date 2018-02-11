import { clock } from '../';
let queue = [];
export default function timer(n, s, d = 4){

    queue.push(()=>{
        console.log();
        return clock(n, {
            precise: true,
            tick(time){
                console.log(s, new Date(time).toTimeString());
                console.log('time ',time)
            },
            stop(time){
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
