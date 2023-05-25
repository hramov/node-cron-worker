import { parentPort } from 'worker_threads';

export function run(params: any) {
    console.log(params)
    throw new Error('123')
}