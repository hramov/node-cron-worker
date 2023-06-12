const path = require('path');
require('ts-node').register();
try {
    require(path.resolve(__dirname, '..', 'taskThread', 'workerHandler.js'));
} catch(err) {
    console.log(err)
}