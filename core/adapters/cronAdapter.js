const path = require('path');
require('ts-node').register();
try {
    require(path.resolve(__dirname, '..', 'cronThread', 'cronHandler.js'));
} catch(err) {
    console.log(err)
}