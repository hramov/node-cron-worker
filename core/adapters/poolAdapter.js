const path = require('path');
require('ts-node').register();
try {
    require(path.resolve(__dirname, '..', 'taskThread', 'workerHandler.ts'));
} catch(err) {
    console.log(err)
}