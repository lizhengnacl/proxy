/**
 * * Created by lee on 2018/6/3
 */

const parse = require('./lib/parse');
const hosts = require('./lib/hosts');
const Nginx = require('./lib/nginx');
const { resolve } = require('path');

const config = {
    nginxConf: {
        path: resolve(__dirname, './test/nginx.conf'),
        // certPath: '',
        // forceReload: false // 断网重连，保证DNS立即清除
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

process.stdin.resume();

process.on('SIGINT', function () {
    console.log('Got SIGINT.  Press Control-D to exit.');
});

process.on('exit', async () => {
    // 这里必须是一个同步操作
    hosts.clear();
    // TODO 刚开始备份一个nginx配置文件，exit时，直接用备份的文件替换掉当前的
    // 副作用：nginx内存中的内容没有被清除，如果reload conf操作是异步的话
    nginx.clear();
});