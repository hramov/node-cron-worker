import { Worker } from "worker_threads";

import {ICronWorkerJob, INodeCronWorkerScheduleOptions, INodeCronWorkerTask} from "../interface";
import {NodeCronWorkerTask} from "./task";
import {join} from "path";
import {NEW_TASK_EVENT} from "../constants";

export class NodeCronWorkerRunner {
    public async schedule(params: ICronWorkerJob, options: INodeCronWorkerScheduleOptions): Promise<INodeCronWorkerTask> {
        return new NodeCronWorkerTask({} as Worker);
    }

    public async scheduleJob(params: ICronWorkerJob, options: INodeCronWorkerScheduleOptions): Promise<INodeCronWorkerTask> {
        const cronDataString = JSON.stringify({params, options });

        return new Promise((resolve, reject) => {
            const worker = new Worker(join(__dirname, '..', 'adapters', 'cron-adapter.js'), {
                workerData: cronDataString,
            });

            worker.on('online', () => {
                console.log(options.name + ' is online');
            });

            worker.on('message', (data: any) => {
                if (data.event === NEW_TASK_EVENT) {
                    resolve(new NodeCronWorkerTask(worker));
                } else {
                    reject(new Error('Wrong start event'));
                }
            });

            worker.on('error', (err: Error) => {
                reject(err);
            });

            worker.on('exit', (code: number) => {
                code === 0 ? console.log(options.name + " is offline") : reject(new Error(`${options.name} exited with code ${code}`));
            });

        });
    }
}