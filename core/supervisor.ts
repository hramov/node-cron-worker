import {ICronWorkerJob, INodeCronWorkerScheduleOptions, LogLevels, LogMessage, TaskMessage} from "./interface";
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

        this.logCollector({
            level: LogLevels.Info,
            message: `Start cron thread`
        });

        this.scheduler.on('online', () => {
            this.logCollector({
                level: LogLevels.Info,
                message: `Cron scheduler is online`
            });
        });

        this.scheduler.on('message', (msg: any) => {
            this.schedulerEventListener(msg);
        })
    }

    public addTask(task: ICronWorkerJob) {
        this.scheduler.postMessage({
            event: TaskMessage.AddTask,
            data: task,
        });
        this.logCollector({
            level: LogLevels.Info,
            message: `Add task ${task.name} to execution`
        });
    }

    public addTasks(tasks: ICronWorkerJob[]) {
        for (const task of tasks) {
            this.addTask(task)
        }
    }

    public start() {
        this.scheduler.postMessage({
            event: TaskMessage.Start,
        });
        this.logCollector({
            level: LogLevels.Info,
            message: `Send command to start jobs`
        });
    }

    public stop() {
        this.scheduler.postMessage({
            event: TaskMessage.Stop,
        });
        this.logCollector({
            level: LogLevels.Info,
            message: `Send command to stop jobs`
        });
    }

    private schedulerEventListener(message: { event: string, data: any}) {
        if (message.event === 'Task scheduled') {
            this.logCollector({
                level: LogLevels.Info,
                message: `Task ${message.data} scheduled`
            });
        } else if (message.event === 'Task moved to execution queue') {
            this.logCollector({
                level: LogLevels.Info,
                message: `Task ${message.data} moved to execution queue`
            });
        } else if (message.event === 'Task started') {
            this.logCollector({
                level: LogLevels.Warning,
                message: `Task ${message.data} started`
            });
        } else if (message.event === 'Task stopped') {
            this.logCollector({
                level: LogLevels.Warning,
                message: `Task ${message.data} stopped`
            });
        } else if (message.event === 'Worker online') {
            this.logCollector({
                level: LogLevels.Info,
                message: `Worker ${message.data} online`
            });
        } else if (message.event === 'Worker offline') {
            this.logCollector({
                level: LogLevels.Warning,
                message: `Worker ${message.data} offline`
            });
        } else if (message.event === 'Task completed') {
            this.logCollector({
                level: LogLevels.Info,
                message: `Task ${message.data.task} completed with result: ${message.data.result}`
            });
        } else if (message.event === 'Task error') {
            this.logCollector({
                level: LogLevels.Error,
                message: `Task ${message.data.task} finished with error: ${message.data.error}`
            });
        } else if (message.event === 'Task error overflow') {
            this.logCollector({
                level: LogLevels.Warning,
                message: `Task ${message.data} removed from task queue - error overflow`
            });
        } else if (message.event === 'Max pool size exceeded') {
            this.logCollector({
                level: LogLevels.Warning,
                message: `Max pool size exceeded, waiting for available workers`
            });
        }
    }

    private logCollector(message: LogMessage) {
        console.log(JSON.stringify({
            ts: new Date().toLocaleString(),
            level: message.level,
            message: message.message,
        }));
    }
}