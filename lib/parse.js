/**
 * * Created by lee on 2018/6/3
 */
const { readFileSync } = require('fs');
const { isAbsolute } = require('path');
const { check } = require('./utils');

function parse ({ path }) {
    check(path, isAbsolute, 'absolute path is required');

    let res = [];
    let str = readFileSync(path, { encoding: 'utf8' });
    let conf = str.split('\n');
    conf = conf.filter((line) => {
        if(line === '') {
            return false;
        }
        if(line.startsWith('#')) {
            return false;
        }
        return true;
    });
    conf.forEach((line) => {
        let rule = parseLine(line);
        if(rule.source) {
            res.push(rule);
        }
    });
    return res;
}

function parseLine (str) {
    str = str.trim().replace(/\s+/g, ' ');
    let hosts = str.split(' ');
    let source = hosts[1];
    let target = hosts[0];

    target = target.split(':');
    source = source.split(':');

    return {
        source: source[0],
        sourcePort: source[1] || 80,
        target: target[0],
        targetPort: target[1] || 80
    }
}

module.exports = parse;