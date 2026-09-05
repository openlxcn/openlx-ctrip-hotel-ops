# 官网部署与验证

官网为https://ctrip.openlx.cn，使用独立Node.js进程和SQLite业务账本。服务器目录为`/www/wwwroot/openlx-ctrip-hotel-ops`，服务名`openlx-ctrip-hotel-ops.service`，仅监听`127.0.0.1:1986`。Nginx代理至该服务，证书由现有ACME账户管理和续期。

`deploy/`提供实际使用的服务和站点配置。部署包排除`.env.production`、数据、私钥和依赖缓存；服务器执行`npm ci --omit=dev`后启动。生产环境加载既有wx-api支付配置，身份请求通过同机`127.0.0.1:1978`进入共享服务。未修改原wx业务进程或数据库。

`SALES_ENABLED=false`是当前收款状态。支付适配读取到原微信支付和支付宝配置不等于完成真实交易；必须用实际商户回执、支付通知和同订单权益记录单独验收后再开放。没有模拟支付接口、试用套餐、优惠券或兑换码路由。

上线检查分别包含服务active、回环health、HTTPS公开health、主页及会员中心、资源与下载校验。注册/登录代码复用已存在的共享身份路由；SMTP已验证连接和认证，未向用户发验证邮件，真实注册与邮件送达保持NOT_RUN。

部署更新前备份独立目录的配置与数据；需要回退时恢复上一版应用，保留数据及签名密钥，重启本站服务。不能用重新生成密钥作为故障修复，否则已签发许可证无法校验。只恢复本站Nginx配置，不替换其他域名配置。

对外状态是分项记录，见客户端`references/capability-matrix.json`、`references/acceptance-T01-T46.csv`以及官网`/status.json`。任何测试夹具中的LIVE字段都只用于模拟断言，不构成真实酒店账户证据。
