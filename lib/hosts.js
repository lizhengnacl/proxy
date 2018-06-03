/**
 * * Created by lee on 2018/6/3
 */

const hostile = require('hostile');

let _hosts = {};

function clear(){
    Object.keys(_hosts).forEach((domain) => {
        hostile.remove(_hosts[domain], domain)
    });
    _hosts = {};
}

function set(ip, domain){
    _hosts[domain] = ip;
}

function effect(){
    Object.keys(_hosts).forEach((domain) => {
        hostile.set(_hosts[domain], domain)
    });
}

module.exports = {
    clear,
    set,
    effect
};