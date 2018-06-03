/**
 * * Created by lee on 2018/6/3
 */

const parse = require('./lib/parse');
const hosts = require('./lib/hosts');
const Nginx = require('./lib/nginx');

let nginx = new Nginx({
    path: '/Users/lizhengnacl/liz/learn/js_/nginx/nginx.conf'
});


let conf = parse('../hosts.md');

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
