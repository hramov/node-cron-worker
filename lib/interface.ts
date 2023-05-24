export interface INodeCronWorker {
    setMode(mode: Modes): void
}

export const enum Modes {
    CronThread,
    SingleJobThread
}