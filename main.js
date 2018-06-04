/**
 * * Created by lee on 2018/6/3
 */

const parse = require('./lib/parse');
const hosts = require('./lib/hosts');
const Nginx = require('./lib/nginx');
const welcom = require('./lib/welcom');
const { resolve } = require('path');

const config = {
    nginxConf: {
        path: resolve(__dirname, './nginx.conf'),
        certPath: '/usr/local/nginx/HTTPS',
        forceReload: false
    },
    hostConfig: {
        path: resolve(__dirname, './hosts.md')
    }
};

let nginx = new Nginx(config.nginxConf);

let conf = parse(config.hostConfig);

conf.forEach((rule) => {
    hosts.set(rule.target, rule.source);
    nginx.set(rule);
});

hosts.effect().then((lines) => {
    // hosts.clear();
});

nginx.effect().then((conf) => {
    // nginx.clear();
});

welcom();

process.stdin.resume();

process.on('SIGINT', function () {
    console.log('Got SIGINT.  Press Control-D to exit.');
});

process.on('exit', async () => {
    // 这里必须是一个同步操作
    hosts.clear();
    nginx.clear();
});