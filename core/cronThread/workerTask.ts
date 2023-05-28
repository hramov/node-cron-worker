import EventEmitter from 'events';
import {Pool} from "./pool";
import {ICronWorkerJob} from "../interface";

export class WorkerTask extends EventEmitter {
    constructor(private readonly job: ICronWorkerJob, private readonly workerPool: Pool) {
        super();
    }

    execute() {
        this.workerPool.setTask(this.job);
    }
}

