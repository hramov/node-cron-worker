import {ICronWorkerJob, INodeCronWorkerScheduleOptions, TaskMessage} from "./interface";
import {Worker} from "worker_threads";
import {join} from "path";

export class Supervisor {
    private readonly scheduler: Worker;

    constructor(private readonly jobs: ICronWorkerJob[], private readonly options: INodeCronWorkerScheduleOptions) {
        this.scheduler = new Worker(join(__dirname, 'adapters', 'cronAdapter.js'), {
            workerData: {
                jobs: this.jobs,
                options: this.options,
            }
        });
        this.scheduler.on('online', () => {
            console.log('Cron scheduler is online');
        })
    }

    public addTask(task: ICronWorkerJob) {
        // TODO implement
    }

    public addTasks(task: ICronWorkerJob[]) {
        // TODO implement
    }

    public start() {
        this.scheduler.postMessage({
            event: TaskMessage.Start,
        })
    }

    public stop() {
        this.scheduler.postMessage({
            event: TaskMessage.Stop,
        })
    }
}