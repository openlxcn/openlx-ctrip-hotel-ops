# 12项优势与实现映射

这是覆盖关系，不是完成率。T编号保留原验收场景；实际状态分维度保存在capability-matrix.json。

|优势|实现能力|代码入口|官网位置|
|---|---|---|---|
|ADV-01 专属Chrome，登录状态持续复用|INSTALL、LOGIN_EBOOKING、LOGIN_CONTENT、SCHEDULER|scripts/automation.mjs、scripts/browser.mjs、scripts/daemon.mjs、scripts/install.mjs、scripts/ops.mjs、scripts/scheduler.mjs|首页12大优势、免费与收费、支持状态|
|ADV-02 全店深度体检，先找真正的问题|PROPERTY_READ、HEALTH_AUDIT|scripts/browser.mjs、scripts/core.mjs|首页12大优势、免费与收费、支持状态|
|ADV-03 完善门店资料，把特色变成卖点|PROPERTY_READ、PROPERTY_WRITE、ACTION_LEDGER|scripts/browser.mjs、scripts/core.mjs|首页12大优势、免费与收费、支持状态|
|ADV-04 房型套餐与活动算账，看清实际到手|ROOM_PRODUCT、PROMOTION_ANALYSIS、PROMOTION_WRITE|scripts/browser.mjs、scripts/core.mjs|首页12大优势、免费与收费、支持状态|
|ADV-05 房态巡检与策略，减少漏卖和超卖风险|INVENTORY_READ、INVENTORY_WRITE、PMS_AUTHORITY、ACTION_LEDGER|scripts/browser.mjs、scripts/core.mjs|首页12大优势、免费与收费、支持状态|
|ADV-06 有依据地调价，不做盲目降价机器人|PMS_AUTHORITY、PRICE_READ、PRICE_CONFIRM、PRICE_STANDARD、REVENUE_SUPREME、ACTION_LEDGER|scripts/automation.mjs、scripts/browser.mjs、scripts/core.mjs、scripts/scheduler.mjs|首页12大优势、免费与收费、支持状态|
|ADV-07 锁定真正同行，持续跟踪可比价格|COMPETITOR、SCHEDULER|scripts/automation.mjs、scripts/browser.mjs、scripts/core.mjs、scripts/daemon.mjs、scripts/scheduler.mjs|首页12大优势、免费与收费、支持状态|
|ADV-08 跟着节日和周边需求提前做准备|DEMAND|scripts/browser.mjs、scripts/core.mjs|首页12大优势、免费与收费、支持状态|
|ADV-09 订单异常提醒，生成今日接待清单|ORDER_READ、ORDER_ACCEPT、ACTION_LEDGER|scripts/browser.mjs、scripts/core.mjs|首页12大优势、免费与收费、支持状态|
|ADV-10 好评自动回，差评先确认|REVIEW_READ、REVIEW_POSITIVE、REVIEW_CONFIRM、REVIEW_INSIGHT、SCHEDULER、ACTION_LEDGER|scripts/automation.mjs、scripts/browser.mjs、scripts/core.mjs、scripts/daemon.mjs、scripts/scheduler.mjs|首页12大优势、免费与收费、支持状态|
|ADV-11 素材放进文件夹，持续产出携程笔记|LOGIN_CONTENT、SCHEDULER、ASSETS、CONTENT_CREATE、CAN_OPEN_EDITOR、CAN_UPLOAD_IMAGE、CAN_SAVE_DRAFT、CAN_SUBMIT、CAN_READBACK、CAN_READ_PUBLIC_STATUS、PERSONA、SERVICE_TICKET、ACTION_LEDGER|scripts/automation.mjs、scripts/browser.mjs、scripts/core.mjs、scripts/daemon.mjs、scripts/model.mjs、scripts/notes.mjs、scripts/ops.mjs、scripts/scheduler.mjs、server:scripts/service-admin.mjs、server:src/store.mjs|首页12大优势、免费与收费、支持状态|
|ADV-12 HTML运营报告，建议落实后继续复盘|REPORT_FREE、REPORT_PAID、ACTION_LEDGER|scripts/browser.mjs、scripts/core.mjs、scripts/ops.mjs|首页12大优势、免费与收费、支持状态|
