export const enum TaskMessage {
    Start = 'start',
    Stop = 'stop',
    AddTask = 'addTask',
}

export interface ICronWorkerJob {
    name: string;
    path: string;
    enabled: boolean;
    cronTime: string;
    params: any;
    runOnce: boolean;
}

export interface INodeCronWorkerScheduleOptions extends IScheduleOptions {
    poolMin: number;
    poolMax: number;
}

export interface IScheduleOptions {
    scheduled?: boolean | undefined;
    timezone?: string;
    recoverMissedExecutions?: boolean;
    name?: string;
    runOnInit?: boolean;
}
