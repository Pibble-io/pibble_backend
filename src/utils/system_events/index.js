var EventEmitter = require('events').EventEmitter;
export const SystemEventEmitter = new EventEmitter();

require('./feeds');
require('./firebase');
