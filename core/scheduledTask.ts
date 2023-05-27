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
    private readonly name: string;

    constructor(job: ICronWorkerJob, options: INodeCronWorkerScheduleOptions, workerPool: Pool) {
        super();

        this.workerPool = workerPool;

        if (!job.runOnce) {
            job.runOnce = false;
        }

        if (!job.params) {
            job.params = {};
        }

        this.name = job.name;
      
        this.options = options;
        this.options.name = this.options.name || v4();

        this.scheduler = new Scheduler(job.cronTime, options.timezone || '', options.recoverMissedExecutions || false);

        const task = new WorkerTask(job, this.workerPool);
        if (job.runOnce) {
            this.scheduler.once('scheduled-time-matched', (now: any) => {
                task.execute();
                this.scheduler.stop();
            });
        } else {
            this.scheduler.on('scheduled-time-matched', (now: any) => {
                task.execute();
            });
        }

    }

    getId() {
        return this.options.name;
    }

    getName() {
        return this.name;
    }
    
    start() {
        this.scheduler.start();
    }
    
    stop() {
        this.scheduler.stop();
    }
}
