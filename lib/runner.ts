import { ScheduledTask } from "node-cron";
import { Worker } from "worker_threads";

import {ICronWorkerJob, INodeCronWorkerScheduleOptions, INodeCronWorkerTask} from "./interface";
import {NodeCronWorkerTask} from "./task";
import {join} from "path";
import {NEW_TASK_EVENT} from "./constants";

export class NodeCronWorkerRunner {
    public async schedule(params: ICronWorkerJob, options: INodeCronWorkerScheduleOptions): Promise<INodeCronWorkerTask> {
        return new NodeCronWorkerTask({} as ScheduledTask, {} as Worker);
    }

    public async scheduleJob(params: ICronWorkerJob, options: INodeCronWorkerScheduleOptions): Promise<INodeCronWorkerTask> {
        const cronDataString = JSON.stringify({params, options });

        return new Promise((resolve, reject) => {
            const worker = new Worker(join(__dirname, 'adapters', 'adapter.js'), {
                workerData: cronDataString,
            });

            let task: ScheduledTask;

            worker.on('online', () => {
                console.log('Worker is online');
            });

            worker.on('message', (data: any) => {
                const dataObject = JSON.parse(data.data);
                if (data.event === NEW_TASK_EVENT) {
                    task = dataObject;
                }
                resolve(new NodeCronWorkerTask(task, worker));
            });

            worker.on('error', (err: Error) => {
                reject(err);
            });

            worker.on('exit', (code: number) => {
                code === 0 ? resolve(new NodeCronWorkerTask(task, worker)): reject(new Error(`Worker exited with code ${code}`));
            });
        });
    }
}