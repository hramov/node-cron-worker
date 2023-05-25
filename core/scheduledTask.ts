import EventEmitter from "events";
import { v4 } from 'uuid'

import {WorkerTask} from "./workerTask";
import {Scheduler} from "./scheduler";
import {ICronWorkerJob, INodeCronWorkerScheduleOptions} from "./interface";
import {Pool} from "./pool";

export class ScheduledTask extends EventEmitter {
    private options: INodeCronWorkerScheduleOptions;
    private readonly workerPool: Pool;
    private scheduler: Scheduler;

    constructor(job: ICronWorkerJob, options: INodeCronWorkerScheduleOptions, workerPool: Pool) {
        super();

        this.workerPool = workerPool;

        if(!options) {
            options = {
                scheduled: true,
                recoverMissedExecutions: false,
                poolMin: 1,
                poolMax: 1,
            }
        }
      
        this.options = options;
        this.options.name = this.options.name || v4();

        const task = new WorkerTask(job, this.workerPool);

        this.scheduler = new Scheduler(job.cronTime, options.timezone || '', options.recoverMissedExecutions || false);

        this.scheduler.on('scheduled-time-matched', (now: any) => {
            task.execute();
        });
    }

    getName() {
        return this.options.name;
    }
    
    start() {
        this.scheduler.start();
    }
    
    stop() {
        this.scheduler.stop();
    }
}
