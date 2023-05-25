import { Worker } from 'worker_threads';
import {join} from "path";
import { v4 } from 'uuid';
import {ICronWorkerJob} from "./interface";

export interface PoolOptions {
    min: number;
    max: number;
}

export class Pool {

    private readonly workerPool: Map<string, Worker>;
    private readonly freeWorkers: string[];
    private readonly tasks: Map<string, ICronWorkerJob>;
    private readonly tasksError: Map<string, number>;

    private readonly min: number;
    private readonly max: number;

    constructor(options: PoolOptions) {

        this.min = options.min;
        this.max = options.max;

        this.workerPool = new Map();
        this.freeWorkers = [];
        this.tasks = new Map();
        this.tasksError = new Map();

        for (let i = 0; i < options.min; i++) {
            this.createWorker();
        }

        this.process();
    }

    public setTask(task: ICronWorkerJob) {
        this.tasks.set(v4(), task);
    }

    private createWorker() {
        const workerId = v4();

        const worker = new Worker(join(__dirname, 'adapters', 'poolAdapter.js'), {
            workerData: {
                id: workerId
            },
        });

        worker.on('online', () => {
            console.log(`Worker ${workerId} is online`);
            this.workerPool.set(workerId, worker);
            this.freeWorkers.push(workerId);
        });

        worker.on('exit', () => {
            console.log(`Worker ${workerId} is offline`);
            this.workerPool.delete(workerId);
            const workerIndex = this.freeWorkers.findIndex((id: string) => id === workerId);
            this.freeWorkers.splice(workerIndex, 1);
        });

        return workerId;
    }

    private processWorker(task: ICronWorkerJob, taskId: string) {
        this.tasks.delete(taskId);
        const workerId = this.freeWorkers[0];

        const worker = this.workerPool.get(workerId);
        if (worker) {
            this.freeWorkers.splice(0, 1);

            worker.postMessage({
                event: 'task',
                task: task,
            });

            worker.on('message', (msg: { event: string, error: Error }) => {
                if (msg.event === 'task_complete') {
                    this.freeWorkers.push(workerId);
                } else if (msg.event === 'error') {
                    console.log('Task error ', msg.error.message);
                    const currentErrors = this.tasksError.get(taskId) || 0;

                    if (currentErrors > 2) {
                        console.log(`Delete task ${taskId} for error overflow`)
                        this.tasks.delete(taskId);
                    } else {
                        this.tasksError.set(taskId, currentErrors + 1);
                        this.tasks.set(taskId, task);
                        this.freeWorkers.push(workerId);
                    }
                }
            });
        }
    }

    private processWorkerAndKill(task: ICronWorkerJob, taskId: string, workerId: string) {
        const worker = this.workerPool.get(workerId);
        if (worker) {
            worker.postMessage({
                event: 'task',
                task: task,
            });

            worker.on('message', (msg: { event: string }) => {
                if (msg.event === 'task_complete') {
                    this.tasks.delete(taskId);
                    this.workerPool.delete(workerId);
                    worker.terminate().catch((err: Error) => console.error(err.message));
                }
            })
        }
    }

    private process() {
        setInterval(() => {
            if (this.tasks.size > 0) {
                const taskFromMap = this.tasks.entries().next().value;

                const taskId = taskFromMap[0];
                const task = taskFromMap[1];

                if (this.freeWorkers.length > 0) {
                    this.processWorker(task, taskId);
                } else if (this.freeWorkers.length === 0 && this.workerPool.size < this.max) {
                    const newWorkerId = this.createWorker();
                    this.processWorkerAndKill(task, taskId, newWorkerId);
                } else {
                    console.log('Max worker pool size, waiting...')
                }
            }
        }, 500);
    }

}