import {validation} from "../validation/patternValidation";
import {ICronWorkerJob, INodeCronWorkerScheduleOptions, TaskMessage} from "../interface";
import {ScheduledTask} from "./scheduledTask";
import {Pool} from "./pool";
import {parentPort} from "worker_threads";

export class Cron {
    private readonly scheduledTasks = new Map<string, { enabled: boolean, task: ScheduledTask}>();
    private readonly workerPool: Pool;

    constructor(private readonly options: INodeCronWorkerScheduleOptions) {
        this.workerPool = new Pool({
            min: this.options.poolMin,
            max: this.options.poolMax,
        });
    }

    public start() {
        for (let i = 0; i < this.scheduledTasks.size; i++) {
            const { enabled, task } = this.scheduledTasks.values().next().value;
            if (enabled) {
                task.start();
                parentPort!.postMessage({
                    event: `Task moved to execution queue`,
                    data: task.name,
                });
            }
        }
    }

    public stop() {
        for (let i = 0; i < this.scheduledTasks.size; i++) {
            const { enabled, task } = this.scheduledTasks.values().next().value;
            if (enabled) {
                task.stop();
                parentPort!.postMessage({
                    event: `Task stopped`,
                    data: task.name,
                });
            }
        }
    }

    public schedule(job: ICronWorkerJob) {
        const task = this.createTask(job);
        this.scheduledTasks.set(task.getId()!, {
            enabled: job.enabled,
            task: task,
        });
        parentPort!.postMessage({
            event: `Task scheduled`,
            data: job.name,
        });
        return task;
    }

    public validate(expression: string) {
        try {
            validation(expression);
            return true;
        } catch (_) {
            return false;
        }
    }

    public getTasks() {
        return this.scheduledTasks;
    }

    public getWorkerStat() {
        parentPort?.postMessage({
        event: TaskMessage.GetStat,
        data: {
            poolSize: this.workerPool.getCurrentWorkerPoolSize(),
            taskPoolSize: this.workerPool.getCurrentTaskPoolSize(),
            taskProcessing: this.workerPool.getCurrentProcessingTaskPoolSize(),
        }
    });
    }

    private createTask(job: ICronWorkerJob) {
        return new ScheduledTask(job, this.options, this.workerPool);
    }
}