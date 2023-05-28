import { parentPort } from 'worker_threads';
import {ICronWorkerJob} from "../interface";

async function idle() {
    if (parentPort) {
        parentPort.on('message', async (msg: { event: 'task', task: ICronWorkerJob }) => {
            await run(msg.task);
        });
    }
}

async function run(task: ICronWorkerJob) {
    if (parentPort) {
        const job = require(task.path);
        if (job && job.run && typeof job.run === 'function') {
            try {
                const result = await job.run(task.params);
                parentPort.postMessage({
                    event: 'task_complete',
                    data: result,
                });
            } catch (_err: unknown) {
                const err = _err as Error;
                parentPort.postMessage({
                    event: 'error',
                    error: err.message,
                });
            }
        }
    }
}

idle().catch((err: Error) => console.log(err.message));