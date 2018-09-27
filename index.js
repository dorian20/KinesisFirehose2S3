/**
 * Author: @nadir93
 * Date 2018.7.18
 */
const proc = require('./lib/proc');
const log = require('./lib/log');

let callback = null;

function success(data) {
  callback(null, data);
}

function fail(e) {
  callback(e);
}

const execute = async (event, context, cb) => {

  callback = cb;
  log.debug('received event:', JSON.stringify(event, null, 2));

  try {
    const result = await proc(event);
    log.debug('result:', JSON.stringify(result, null, 2));
    success(result);
  } catch (e) {
    fail(e);
  };
}

process.on('unhandledRejection', (reason, p) => {
  log.debug('reason: ', reason);
  log.debug('p: ', p);
  throw reason;
});

process.on('uncaughtException', (e) => {
  log.debug('uncaughtException: ', e);
  log.error(e);
});

exports.handler = execute;