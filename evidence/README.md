# 0.1.0证据索引

| ID | 范围 | 证据 |
|---|---|---|
| CODE_0_1_0 | 本仓库代码与独立安装包 | Git提交、Release及构建摘要 |
| LOCAL_TESTS_25 | 25项本地回归及模拟场景 | local-tests.txt；不是T01—T46全量通过 |
| INSTALL_MAC_LINUX | 实际依赖安装、doctor、示例导入及HTML报告 | macos-install-run.json、linux-install-run.json；经营输入MOCK |
| SITE_DEPLOY | 网站部署、HTTPS与公开页面 | production-verification.json；不是酒店操作 |
| SMTP_VERIFY | 同一SMTP连接与认证 | smtp-verify.txt；邮件发送0封 |
| FORWARD_CHECK | 独立复查失败隔离与文案 | forward-check.json |
| RELEASE_DOWNLOAD | GitHub与官网实际发布文件 | release-verification.json |

真实携程读取、改价、接单、点评发布、笔记提交及公开回读均未执行。人工服务未实际交付，支付交易0笔，注册送达尚未验证。公开服务的读取结果仅适用于本站，不跨记为平台业务通过。
