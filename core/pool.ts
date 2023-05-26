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
    private readonly processedTasks: Map<string, boolean>;
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
        this.processedTasks = new Map();

        for (let i = 0; i < this.min; i++) {
            this.createWorker();
        }

        this.process();
    }

    public setTask(task: ICronWorkerJob) {
        if (!this.processedTasks.has(task.name)) {
            this.tasks.set(task.name, task);
        }
        return task.name;
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

    private createOnetimeWorker() {
        const workerId = v4();

        const worker = new Worker(join(__dirname, 'adapters', 'poolAdapter.js'), {
            workerData: {
                id: workerId
            },
        });

        worker.on('online', () => {
            console.log(`Worker ${workerId} is online`);
            this.workerPool.set(workerId, worker);
        });

        worker.on('exit', () => {
            console.log(`Worker ${workerId} is offline`);
            this.workerPool.delete(workerId);
        });
        return worker;
    }

    private processWorker(task: ICronWorkerJob, taskId: string) {
        this.processedTasks.set(taskId, true);
        const workerId = this.freeWorkers[0];

        const worker = this.workerPool.get(workerId);
        if (worker) {
            this.freeWorkers.splice(0, 1);

            worker.postMessage({
                event: 'task',
                task: task,
            });

            const listener = (msg: { event: string, error: Error }) => {
                if (msg.event === 'task_complete') {
                    console.log(`Worker ${workerId} completed task ${taskId}`);
                    this.processedTasks.delete(taskId);
                    this.tasks.delete(taskId);
                    this.freeWorkers.push(workerId);
                    worker.removeListener('message', listener);
                } else if (msg.event === 'error') {
                    console.log('Task error ', msg.error.message);
                    const currentErrors = this.tasksError.get(taskId) || 0;
                    if (currentErrors > 2) {
                        console.log(`Delete task ${taskId} for error overflow`);
                        this.processedTasks.delete(taskId);
                        this.tasks.delete(taskId);
                    } else {
                        this.tasksError.set(taskId, currentErrors + 1);
                        this.processedTasks.delete(taskId);
                        this.tasks.set(taskId, task);
                    }
                    this.freeWorkers.push(workerId);
                    worker.removeListener('message', listener);
                }
            };
            worker.on('message', listener);
        }
    }

    private processWorkerAndKill(task: ICronWorkerJob, taskId: string, worker: Worker) {
        this.processedTasks.set(taskId, true);
        if (worker) {
            worker.postMessage({
                event: 'task',
                task: task,
            });

            worker.on('message', (msg: { event: string }) => {
                if (msg.event === 'task_complete') {
                    this.processedTasks.delete(taskId);
                    this.tasks.delete(taskId);
                }
                worker.terminate().catch((err: Error) => console.error(err.message));
            })
        }
    }

    private process() {
        setInterval(() => {
            if (this.tasks.size > 0) {
                const taskFromMap = this.tasks.entries().next().value;

                const taskId = taskFromMap[0];

                if (this.processedTasks.has(taskId)) {
                    return;
                }

                const task = taskFromMap[1];

                if (this.freeWorkers.length > 0) {
                    this.processWorker(task, taskId);
                } else if (this.freeWorkers.length === 0 && this.workerPool.size < this.max) {
                    const newWorker = this.createOnetimeWorker();
                    this.processWorkerAndKill(task, taskId, newWorker);
                } else {
                    console.log('Max worker pool size, waiting...')
                }
            }
        }, 1000);
    }

}