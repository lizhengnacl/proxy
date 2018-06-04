/**
 * * Created by lee on 2018/6/3
 */
const NginxConfFile = require('nginx-conf').NginxConfFile;
const { exec } = require('child_process');
const { check } = require('./utils');
const { isAbsolute } = require('path');

function _add (conf, rule, count) {
    let { source, sourcePort, target, targetPort } = rule;

    conf.nginx.http._add('server');
    conf.nginx.http.server[count]._add('listen', sourcePort);
    conf.nginx.http.server[count]._add('server_name', source);
    conf.nginx.http.server[count]._add('location', '/');
    conf.nginx.http.server[count].location._add('proxy_pass', `http://${target}:${targetPort}`);
}

function add (conf, rules) {
    for(let i = 0, len = rules.length; i < len; i++) {
        // http
        _add(conf, rules[i], count(conf.nginx.http.server));
        // TODO https
    }
}

function remove (conf, rules) {
    for(let i = 0, len = rules.length; i < len; i++) {
        // http
        conf.nginx.http._remove('server', count(conf.nginx.http.server) - 1);
        // TODO https
    }
}

function count (server) {
    let toStr = Object.prototype.toString;
    switch(toStr.call(server)) {
        case '[object Undefined]':
            return 0;
        case '[object Object]':
            return 1;
        case '[object Array]':
            return server.length;
    }
}

function Nginx (ops = {}) {
    check(ops.path, isAbsolute, 'absolute path is required');

    this.path = ops.path;
    this.certPath = ops.certPath;
    this.forceReload = ops.forceReload || false;
    this.rules = [];
}

Nginx.prototype.set = function(rule) {
    this.rules.push(rule);
};

Nginx.prototype.effect = function() {
    return new Promise((resolve) => {
        NginxConfFile.create(this.path, (err, conf) => {
            if(err) {
                console.log(err);
                return;
            }
            add(conf, this.rules);
            this.nginx = conf;
            resolve(conf);

            this.refresh();
        });
    });
};

Nginx.prototype.clear = function() {
    // 清空设置
    remove(this.nginx, this.rules);
    this.rules = [];

    this.refresh();
};

Nginx.prototype.refresh = function() {
    // TODO 这里假设nginx已经打开
    exec(`sudo nginx -c ${this.path} -s reload`);

    if(this.forceReload) {
        // 断网重连
        exec('sudo ifconfig en0 down && sudo ifconfig en0 up');
    }
};

module.exports = Nginx;