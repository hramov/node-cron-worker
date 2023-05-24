import EventEmitter from "events";
import {Task} from "./task";
import {Scheduler} from "./scheduler";
import { v4 } from 'uuid'
import {IScheduleOptions} from "../interface";

export class ScheduledTask extends EventEmitter {
    private options: IScheduleOptions;
    private _task: Task;
    private _scheduler: Scheduler;

    constructor(cronExpression: string, func: Function, options: IScheduleOptions) {
        super();
        if(!options) {
            options = {
                scheduled: true,
                recoverMissedExecutions: false
            }
        }
      
        this.options = options;
        this.options.name = this.options.name || v4();

        this._task = new Task(func);
        this._scheduler = new Scheduler(cronExpression, options.timezone || '', options.recoverMissedExecutions || false);

        this._scheduler.on('scheduled-time-matched', (now: any) => {
            this.now(now);
        });

        if(options.scheduled) {
            this._scheduler.start();
        }
        
        if(options.runOnInit === true){
            this.now('init');
        }
    }

    getName() {
        return this.options.name;
    }
    
    now(now = 'manual') {
        let result = this._task.execute(now);
        this.emit('task-done', result);
    }
    
    start() {
        this._scheduler.start();  
    }
    
    stop() {
        this._scheduler.stop();
    }
}
