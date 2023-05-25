# Node Cron Worker Lib 
- Write cron jobs with typescript
- Run jobs in parallel with worker_threads

Based on node-cron scheduler and worker_threads

## Advantages
 - [X] Cron scheduler starts in separate thread and thus doesn't affect main thread and doesn't depend on its event loop  
 - [X] Every cron job implements as a separate TypeScript file that allows you to use all power of typing
 - [X] Every cron job starts in its own thread that allows you to perform complex calculations and CPU intensive tasks with no effect on your server performance

## Disadvantages
- [X] Still in alpha
- [X] No tests
- [X] Not all bugs are found