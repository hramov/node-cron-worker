const path = require('path');
require('ts-node').register();
try {
    require(path.resolve(__dirname, 'worker-pool-adapter.ts'));
} catch(err) {
    console.log(err)
}