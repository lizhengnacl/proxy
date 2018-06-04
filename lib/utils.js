/**
 * * Created by lee on 2018/5/26
 */


function check(value, predicate, error) {
    if(!predicate(value)) {
        log('error', 'uncaught at check, ', error);
        throw new Error(error)
    }
}

function toStr(data){
    return Object.prototype.toString.call(data);
}

const is = {
    undef     : v => v === null || v === undefined,
    notUndef  : v => v !== null && v !== undefined,
    string    : f => typeof f === 'string',
    func      : f => typeof f === 'function',
    number    : n => typeof n === 'number',
    array    : arr => toStr(arr) === '[object Array]',
    object    : obj => toStr(obj) === '[object Object]'
};

function log(level, message, error) {
    /*eslint-disable no-console*/
    console[level].call(console, message, error)
}

module.exports = {
    check,
    is,
    log
};