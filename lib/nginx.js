/**
 * * Created by lee on 2018/6/3
 */
const NginxConfFile = require('nginx-conf').NginxConfFile;
const { exec } = require('child_process');
const { check } = require('./utils');
const { isAbsolute } = require('path');
const { existsSync } = require('fs');
const { backup, recover } = require('./backup');

function getCertPath (domain, certPath) {
    let parts = domain.split('.');
    if(parts.length > 2) {
        parts = parts.slice(1);
    }
    let certName = parts.join('.');
    let crt = `${certPath}/${certName}.crt`;
    let key = `${certPath}/${certName}.key`;
    check(crt, existsSync, `${crt} is required in https`);
    check(key, existsSync, `${key} is required in https`);

    return {
        crt: `${certPath}/${certName}.crt`,
        key: `${certPath}/${certName}.key`
    };
}

function _add (conf, rule, count, port) {
    let { source, sourcePort, target, targetPort } = rule;
    sourcePort = port || sourcePort;
    conf.nginx.http._add('server');

    let server;
    if(count === 0){
        server = conf.nginx.http.server;
    }else{
        server = conf.nginx.http.server[count];
    }

    server._add('listen', sourcePort);
    server._add('server_name', source);
    server._add('location', '/');
    // server.location._add('sub_filter', `</head> '</head><script language="javascript">alert('1')</script>'`);
    // server.location._add('sub_filter_once', 'off');
    // server.location._add('sub_filter_types', 'text/html');
    server.location._add('proxy_pass', `http://${target}:${targetPort}`);
}

function _addHttps (conf, rule, count, certPath) {
    let { source, sourcePort, target, targetPort } = rule;

    // 80
    _add(conf, rule, count, 80);

    // redirect
    conf.nginx.http._add('server');
    conf.nginx.http.server[count + 1]._add('listen', 80);
    conf.nginx.http.server[count + 1]._add('server_name', source);
    conf.nginx.http.server[count + 1]._add('rewrite', '/(.*)$ https://$host:443/$1 redirect');

    // 443
    let parts = getCertPath(source, certPath);
    conf.nginx.http._add('server');
    conf.nginx.http.server[count + 2]._add('listen', `${sourcePort} ssl`);
    conf.nginx.http.server[count + 2]._add('server_name', source);
    conf.nginx.http.server[count + 2]._add('ssl_certificate', parts.crt);
    conf.nginx.http.server[count + 2]._add('ssl_certificate_key', parts.key);
    conf.nginx.http.server[count + 2]._add('location', '/');
    conf.nginx.http.server[count + 2].location._add('proxy_pass', `http://${target}:${targetPort}`);
}

function add (conf, rules, certPath) {
    for(let i = 0, len = rules.length; i < len; i++) {
        if(rules[i].sourcePort === '443'){
            _addHttps(conf, rules[i], count(conf.nginx.http.server), certPath);
        }else{
            _add(conf, rules[i], count(conf.nginx.http.server));
        }
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
        // 备份文件
        backup(this.path);
        NginxConfFile.create(this.path, (err, conf) => {
            if(err) {
                console.log(err);
                return;
            }
            if(!conf.nginx.http){
                conf.nginx._add('http');
            }
            add(conf, this.rules, this.certPath);
            this.nginx = conf;
            resolve(conf);

            this.refresh();
        });
    });
};

Nginx.prototype.clear = function() {
    // 清空设置
    recover(this.path);
    // remove(this.nginx, this.rules);
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