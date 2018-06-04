# 说明

## 安装
```
git clone https://github.com/lizhengnacl/proxy.git

cd proxy && npm i
```

## 使用
依赖nginx，主要是方便调试HTTPS，请先安装nginx

修改main.js中的配置项

```
const config = {
    nginxConf: {
        path: resolve(__dirname, './nginx.conf'), // 绝对路径，本地nginx配置文件路径
        certPath: '/usr/local/nginx/HTTPS', // 绝对路径，指向证书的路径，如果不需要调试HTTPS，可忽略
        forceReload: false // 强制更新，断网重连，默认关闭
    },
    hostConfig: {
        path: resolve(__dirname, './hosts.md') // 绝对路径，指向hosts配置文件
    }
};
```

hosts配置文件
80端口可省略；https使用443端口

```
# comments

127.0.0.1:8081   a.test.com
127.0.0.1:8082   b.test.com
# 127.0.0.1:9002   oa.neixin.cn:443
```

启动

```
sudo node main.js
```

## TODO
1. HTTPS 支持，证书路径 `done`
2. 恢复nginx config `done`
3. 依赖检测，nginx