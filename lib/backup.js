/**
 * * Created by lee on 2018/6/4
 */
const { check } = require('./utils');
const { isAbsolute } = require('path');
const { readFileSync, writeFileSync } = require('fs');

let _files = {};

function backup (path) {
    check(path, isAbsolute, 'absolute path is required');
    _files[path] = readFileSync(path);
}

function recover (path) {
    writeFileSync(path, _files[path]);
    delete _files[path];
}

module.exports = {
    backup,
    recover
};

