import { parentPort } from 'worker_threads';

export function run(params: any) {
    console.log(params)
    if (parentPort) {
        parentPort.postMessage({
            event: 'message',
            data: '123',
        });
    }
}