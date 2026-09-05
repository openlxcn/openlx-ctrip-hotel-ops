# 安装包发布渠道

更新：2026-09-06。运行包版本 v0.1.1。提交、审核与公开回读分别记录。

| 渠道 | 当前状态 | 入口或说明 |
|---|---|---|
| GitHub | 已公开、下载核验通过 | https://github.com/openlxcn/openlx-ctrip-hotel-ops/releases/tag/v0.1.1 |
| 官方网站 | 已公开、下载核验通过 | https://ctrip.openlx.cn/#install |
| 腾讯 SkillHub | 已审核通过，公开回读通过 | https://skillhub.cn/skills/user_ae43c502/openlx-ctrip-hotel-ops |
| 魔搭 | 提交表单就绪，尚未创建 | 分发许可证待确认 |
| ClawHub | v0.1.1 已提交，待公开 | 安全扫描 clean；公开条目与当前版本尚不可读 |
| Cursor | 未提交 | 本产品插件包装与提交条件待完成 |
| Claude | 未提交 | 当前无可用的发布会话 |
| 扣子 | 未提交 | 平台创建条件与额度待处理 |

SkillHub已核实产品名称、优化简介、OpenLX图标与v0.1.1版本。公开下载包为61415字节、23文件，其中原发行22个文件逐字节匹配；平台另外加入元数据，因此ZIP哈希与GitHub原包不同。

- GitHub原发行SHA-256：`78c09206a0bb8bfda991cf95de6b5d51c4add8817a346f2c45272538d173658b`
- SkillHub下载SHA-256：`1121f08bdbaea4e919b6cc3d35c3833850202b47154204f82a11fe24fe399b2b`

公开回执见[evidence/skillhub-public-receipt.json](../evidence/skillhub-public-receipt.json)。平台审核通过不等于真实携程账号的权限、改价、接单、点评或笔记发布已经实测。当前收费仍未开放。

ClawHub 已按用户授权提交运行技能包，采用 MIT-0；官网及支付后台不在该文件范围。23 个提交文件中，原发行 22 个文件全部匹配，新增产品介绍 README。最后回读为 `pending.publication`，公开 `skill` 与 `latestVersion` 为空，因此尚不提供公开安装入口，也无需重复上传。提交与状态分别见 [提交回执](../evidence/clawhub-submission-receipt.json)和[公开状态回读](../evidence/clawhub-publication-readback.json)。
