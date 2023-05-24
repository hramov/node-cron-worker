import {NodeCronWorker} from "../main";
import {Modes} from "../lib/interface";
import {join} from "path";

async function start() {
    const nodeCronWorker = new NodeCronWorker();
    nodeCronWorker.setMode(Modes.SingleJobThread);

    const task = await nodeCronWorker.schedule({
        name: 'Job',
        path: join(__dirname, 'jobs', 'job.ts'),
        enabled: true,
        cronTime: '*/2 * * * * *',
        params: {
            foo: 'bar'
        },
        runOnce: false,
    }, {
        timezone: 'Europe/Moscow',
        name: 'Job',
        scheduled: false,
        runOnInit: false,
        recoverMissedExecutions: false
    });

    if (task instanceof Error) {
        // error handling
        return;
    }

    task.start();

    setTimeout(() => {
        task.stop();
        console.log(task.journal())
    }, 4000);
}

start().catch((err: Error) => console.error(err.message));
