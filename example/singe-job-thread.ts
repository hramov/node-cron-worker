import {NodeCronWorker} from "../main";
import {Modes} from "../lib/interface";

async function start() {
    const nodeCronWorker = new NodeCronWorker();
    nodeCronWorker.setMode(Modes.SingleJobThread);

    const task = await nodeCronWorker.schedule({
        name: 'Job',
        enabled: true,
        cronTime: '*/2 * * * * *',
        params: {},
        runOnce: false,
    }, {
        timezone: 'Europe/Moscow',
        name: 'Job',
        scheduled: true,
        runOnInit: false,
        recoverMissedExecutions: false
    });

    if (task instanceof Error) {
        // error handling
        return;
    }

    task.start();
}

start().catch((err: Error) => console.error(err.message));
