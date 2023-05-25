const path = require('path');
require('ts-node').register();
try {
    require(path.resolve(__dirname, '..', 'handlers', 'cronHandler.ts'));
} catch(err) {
    console.log(err)
}