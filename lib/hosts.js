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
    return new Promise((resolve) => {
        Object.keys(_hosts).forEach((domain) => {
            hostile.set(_hosts[domain], domain)
        });

        hostile.get(false, function(err, lines){
            resolve(lines);
        })
    });
}

module.exports = {
    clear,
    set,
    effect
};