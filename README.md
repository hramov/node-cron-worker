# Node Cron Worker Lib 
- Write cron jobs with typescript
- Run jobs in parallel with worker_threads

[Github repository](https://github.com/hramov/node-cron-worker)

Based on [node-cron](https://www.npmjs.com/package/node-cron) scheduler + time parser (classic cron times like 0/5 * * * *) and [worker_threads](https://nodejs.org/api/worker_threads.html).

Try this at your own risk! <code>npm i cron-worker-threads</code>

Examples can be found in <code>./example</code>

Basic usage
<pre><code>const options = {
        timezone: 'Europe/Moscow',
        poolMin: 1,
        poolMax: 5,
    }

    const task = {
        name: 'Job',
        path: join(__dirname, 'jobs', 'job.ts'),
        enabled: true,
        cronTime: '*/2 * * * * *',
        params: {
            foo: 'bar'
        },
        runOnce: false,
    };

    const supervisor = new Supervisor([task], options);
    supervisor.start();</code></pre>

You can also add job to executing after starting the scheduler
<pre><code>...
supervisor.addTask(task) // add one job
supervisor.addTasks([task]) // add multiple jobs
...
</code></pre>

If job property "enabled" is set to "true", it's immediately added to execution.

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