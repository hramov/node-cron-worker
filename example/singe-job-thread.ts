import {NodeCronWorker} from "../main";
import {Modes} from "../lib/interface";

async function start() {
    const nodeCronWorker = new NodeCronWorker();
    nodeCronWorker.setMode(Modes.SingleJobThread);

    const task = await nodeCronWorker.schedule('* * * * * *', (params: any) => {
        console.log(params.foo)
    }, { foo: 'bar'}, {
        timezone: 'Europe/Moscow',
        name: 'TestJob',
        scheduled: true,
        runOnInit: false,
        recoverMissedExecutions: false
    });

    task.start();
}

start().catch((err: Error) => console.error(err.message));
