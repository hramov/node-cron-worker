# Node Cron Worker Lib 
- Write cron jobs with typescript
- Run jobs in parallel with worker_threads

[Github repository](https://github.com/hramov/node-cron-worker)

Based on [node-cron](https://www.npmjs.com/package/node-cron) scheduler + time parser (classic cron times like 0/5 * * * *) and [worker_threads](https://nodejs.org/api/worker_threads.html).

Try this at your own risk! <code>npm i cron-worker-threads</code>

Examples can be found in <code>./example</code>

### Basic usage
<pre><code>const options = {
        timezone: 'Europe/Moscow',
        poolMin: 1,
        poolMax: 5,
        logs: true, // show logs in console or not
    }

    const task = {
        name: 'Job',
        path: join(__dirname, 'jobs', 'job.ts'),
        enabled: true,
        cronTime: '*/2 * * * * *',
        params: {
            foo: 'bar'
        },
        runOnce: false, // if true stops job after first execution
    };

    const supervisor = new Supervisor([task], options);
    supervisor.start();</code></pre>

You can also add job to executing after starting the scheduler
<pre><code>...
supervisor.addTask(task) // add one job
supervisor.addTasks([task]) // add multiple jobs
...
</code></pre>

If job property <code>enabled</code> is set to <code>true</code>, it's immediately added to execution.

If you want to use your custom logger, just pass it to Supervisor constructor after options
<pre><code>...
const supervisor = new Supervisor([task], options, logger);
supervisor.start();
...</code></pre>

Logger should implement <code>ILogger</code> interface
<pre><code>export interface ILogger {
    debug(message: string, context?: string): void;
    info(message: string, context?: string): void;
    warning(message: string, context?: string): void;
    error(message: string, stack?: string, context?: string): void;
}</code></pre>

Default logger output
<pre><code>{"ts":"28.05.2023, 12:43:58","level":"info","message":"Start cron thread"}
{"ts":"28.05.2023, 12:43:58","level":"info","message":"Send command to start jobs"}
{"ts":"28.05.2023, 12:43:58","level":"info","message":"Cron scheduler is online"}
{"ts":"28.05.2023, 12:44:00","level":"info","message":"Task Job scheduled"}
{"ts":"28.05.2023, 12:44:00","level":"info","message":"Task Job moved to execution queue"}
{"ts":"28.05.2023, 12:44:00","level":"info","message":"Worker d19af155-04ac-479b-a1cf-69204f6c5f25 online"}
{"ts":"28.05.2023, 12:44:00","level":"info","message":"Worker 6fab4a75-cf71-45fe-b22c-eacf37c7f395 online"}
</code></pre>

### Job communication with parent thread
1) To indicate that job is finished successfully, just return something you want to see in logs that describes job's finish
2) To indicate an error, throw an exception inside <code>run</code> function with error description

<pre><code>export async function run(params: any) {
    const result = //... your code
    if (error) {
        throw new Error(error);
    }
    return result;
}</code></pre>

### Worker status
You can easily get worker status by invoking supervisor method <code>getStat()</code>
<pre><code>...
supervisor.start();
setInterval(async () => {
    const stat = await supervisor.getStat();
    console.table(stat)
}, 1000);
...
</code></pre>

It returns object with following fields:
1) poolSize - count of active/waiting worker threads
2) taskPoolSize - count of tasks in processing queue
3) taskProcessing - count of tasks currently processing by workers

## Should you use it?
### Advantages
 - [X] Cron scheduler starts in separate thread and thus doesn't affect main thread and doesn't depend on its event loop  
 - [X] Every cron job implements as a separate TypeScript file that allows you to use all power of typing
 - [X] Every cron job starts in its own thread that allows you to perform complex calculations and CPU intensive tasks with no effect on your server performance
 - [X] Get worker status at every moment of execution

### Disadvantages
- [X] Still in alpha
- [X] No tests
- [X] Not all bugs are found