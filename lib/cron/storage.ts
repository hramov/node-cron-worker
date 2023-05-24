const scheduledTasks = new Map();

export default  {
    save: (task: any) => {
        if(!task.options){
            const uuid = require('uuid');
            task.options = {};
            task.options.name = uuid.v4();
        }
        scheduledTasks.set(task.options.name, task);
    },
    getTasks: () => {
        return scheduledTasks;
    }
};