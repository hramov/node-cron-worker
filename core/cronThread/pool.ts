import {parentPort, Worker} from 'worker_threads';
import {join} from "path";
import { v4 } from 'uuid';
import {ICronWorkerJob} from "../interface";

export interface PoolOptions {
    min: number;
    max: number;
}

export class Pool {

    private readonly workerPool: Map<string, Worker>;
    private readonly freeWorkers: string[];
    private readonly tasks: Map<string, ICronWorkerJob>;
    private readonly processingTasks: Map<string, boolean>;

    private readonly min: number;
    private readonly max: number;

    constructor(options: PoolOptions) {

        this.min = options.min;
        this.max = options.max;

        this.workerPool = new Map();
        this.freeWorkers = [];
        this.tasks = new Map();
        this.processingTasks = new Map();

        for (let i = 0; i < this.min; i++) {
            this.createWorker();
        }

        this.process();
    }

    public setTask(task: ICronWorkerJob) {
        if (!this.processingTasks.has(task.name)) {
            this.tasks.set(task.name, task);
        }
        return task.name;
    }

    public getCurrentWorkerPoolSize() {
        return this.workerPool.size;
    }

    public getCurrentTaskPoolSize() {
        return this.tasks.size;
    }

    public getCurrentProcessingTaskPoolSize() {
        return this.processingTasks.size;
    }

    private createWorker() {
        const workerId = v4();
        const worker = new Worker(join(__dirname, '..', 'adapters', 'poolAdapter.js'), {
            workerData: {
                id: workerId
            },
        });
        worker.on('online', () => {
            parentPort?.postMessage({
                event: 'Worker online',
                data: workerId,
            });
            this.workerPool.set(workerId, worker);
            this.freeWorkers.push(workerId);
        });
        worker.on('exit', () => {
            parentPort?.postMessage({
                event: 'Worker offline',
                data: workerId,
            });
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
            parentPort?.postMessage({
                event: 'Worker online',
                data: workerId,
            });
            this.workerPool.set(workerId, worker);
        });

        worker.on('exit', () => {
            parentPort?.postMessage({
                event: 'Worker offline',
                data: workerId,
            });
            this.workerPool.delete(workerId);
        });
        return worker;
    }

    private processWorker(task: ICronWorkerJob, taskId: string) {
        this.processingTasks.set(taskId, true);

        const workerId = this.freeWorkers[0];
        const worker = this.workerPool.get(workerId);
        if (worker) {
            this.freeWorkers.splice(0, 1);
            worker.postMessage({
                event: 'task',
                task: task,
            });
            parentPort?.postMessage({
                event: 'Task started',
                data: taskId,
            });
            const listener = (msg: { event: string, error: Error, data: any }) => {
                if (msg.event === 'task_complete') {
                    parentPort?.postMessage({
                        event: 'Task completed',
                        data: {
                            worker: workerId,
                            task: taskId,
                            result: JSON.stringify(msg.data),
                        }
                    });
                } else if (msg.event === 'error') {
                    parentPort?.postMessage({
                        event: 'Task error',
                        data: {
                            worker: workerId,
                            task: taskId,
                            error: msg.error,
                        }
                    });
                }
                this.processingTasks.delete(taskId);
                this.tasks.delete(taskId);
                this.freeWorkers.push(workerId);
                worker.removeListener('message', listener);
            };
            worker.on('message', listener);
        }
    }

    private processWorkerAndKill(task: ICronWorkerJob, taskId: string, worker: Worker) {
        this.processingTasks.set(taskId, true);
        if (worker) {
            worker.postMessage({
                event: 'task',
                task: task,
            });
            parentPort?.postMessage({
                event: 'Task started',
                data: taskId,
            });
            const listener = (msg: { event: string, error: Error, data: any }) => {
                if (msg.event === 'task_complete') {
                    parentPort?.postMessage({
                        event: 'Task completed',
                        data: {
                            task: taskId,
                            result: JSON.stringify(msg.data),
                        }
                    });
                } else if (msg.event === 'error') {
                    parentPort?.postMessage({
                        event: 'Task error',
                        data: {
                            task: taskId,
                            error: msg.error,
                        }
                    });
                }
                this.processingTasks.delete(taskId);
                this.tasks.delete(taskId);
                worker.removeListener('message', listener);
                worker.terminate().catch((err: Error) => console.error(err.message));
            }
            worker.on('message', listener);
        }
    }

    private process() {
        setInterval(() => {
            if (this.tasks.size > 0) {
                const taskFromMap = this.tasks.entries().next().value;
                const taskId = taskFromMap[0];

                if (this.processingTasks.has(taskId)) {
                    return;
                }

                const task = taskFromMap[1];
                if (this.freeWorkers.length > 0) {
                    this.processWorker(task, taskId);
                } else if (this.freeWorkers.length === 0 && this.workerPool.size < this.max) {
                    const newWorker = this.createOnetimeWorker();
                    this.processWorkerAndKill(task, taskId, newWorker);
                } else {
                    parentPort?.postMessage({
                        event: 'Max pool size exceeded',
                    });
                }
            }
        }, 1000);
    }

}