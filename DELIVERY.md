# OpenLX 携程酒店运营助手交付记录

交付版本0.1.1，日期2026-09-06（Asia/Shanghai）。**首版技能、官网和GitHub发行已交付；完整产品验收仍为PARTIAL。**

- 官网：https://ctrip.openlx.cn
- GitHub：https://github.com/openlxcn/openlx-ctrip-hotel-ops
- Release：https://github.com/openlxcn/openlx-ctrip-hotel-ops/releases/tag/v0.1.1
- 当前状态：https://ctrip.openlx.cn/status.json
- 本机安装目录：`/Users/quan/.codex/skills/openlx-ctrip-hotel-ops`

官网保留12项优势和全部固定价格，按免费与收费说明，收费含标准/至尊。没有试用、优惠券或兑换券。采用与wx.openlx.cn相近的页面结构、蓝黄旅行视觉、自有OpenLX主视觉和流程图。

注册、邮箱验证及SMTP复用原OpenLX服务；支付复用原微信与支付宝配置。两张联系二维码与wx原文件的SHA-256一致。携程套餐、酒店、设备、签名许可和人工工单独立记账。

## 分项证据

| 项目 | 状态 | 证据与范围 |
|---|---|---|
| 本地业务代码 | 已实现，部分能力仍需完善 | 42项能力矩阵逐项标识；保留全部12优势及原46项验收 |
| macOS安装与运行 | PASS | 实际依赖安装、doctor、示例导入、报告、点评提案 |
| Linux运行 | PASS | 实际依赖安装及演示报告；修订版28项检查通过 |
| 自动化回归 | MOCK_PASS：28/28 | 不是T01—T46全部通过，不是酒店真实操作 |
| 设备租约独立复查 | MOCK_PASS | 错误令牌/身份拒绝、续租串行、失效时上传0次 |
| 官网部署 | PASS | 独立服务、HTTPS及公开页面回读；wx服务保持正常 |
| GitHub与官网下载 | PASS | 本地、GitHub与官网安装包三方哈希一致 |
| SMTP | 连接认证PASS；送达NOT_RUN | 未发送验证邮件 |
| 注册/登录 | 已接同一身份服务；实际账号NOT_RUN | 页面与代理已部署，不以表单存在代替登录成功 |
| 支付 | 配置及模拟账本通过；真实交易NOT_RUN | 收费尚未开放 |
| 携程真实读写与笔记发布 | NOT_RUN | 未登录实际门店或内容账号，未改价、接单、回复点评或提交笔记 |
| 人工服务、人设年度交付 | NOT_RUN | 已有模块和工单，未以代码代替真人履约 |
| Windows | NOT_RUN | 提供安装器分支，尚无真实系统验证 |

安装包60206字节，SHA-256：

```text
78c09206a0bb8bfda991cf95de6b5d51c4add8817a346f2c45272538d173658b
```

安装包内状态是构建时快照；发布后的记录独立保存于官网status.json和仓库evidence/release-verification.json，避免用构建成功提前宣称公开发布成功。

继续保留的工作包括真实账户字段与权限适配、PMS对接、库存/订单自动策略、深入经营分析、模型服务实连、长期运行及真实笔记提交/公开回读、支付和注册送达实测。未完成部分没有从商业目标删除，收费继续关闭。

详细证据位于evidence目录；原要求逐项映射位于技能references/capability-matrix.json及acceptance-T01-T46.csv。
