import timer from './timer.js';

timer(1000, 'timer 1').shift()();
timer(1000, 'timer 2');
timer(100, 'timer 3', 7);
