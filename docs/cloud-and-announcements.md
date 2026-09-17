# 云端存档 & 公告栏 运维手册

## 一、公告栏（右侧）

### 数据流

```
内置兜底列表 src/content/announcements.ts   ←─ 随版本发布，离线可用
        ↓ 合并（id 去重，远端优先，按日期倒序）
运行时抓取 public/announcements.json        ←─ 可选 remoteUrl 指向公开 Gist
        ↓
右侧公告栏（未读高亮 + 计数，已读记录在 localStorage）
```

### 发公告的两种方式

**方式 A（随版本发布）**：编辑 `public/announcements.json`，追加一条：

```json
{ "id": "r20-xxx", "date": "2026-09-20", "tag": "feature", "title": "标题", "body": "正文" }
```

`tag` 取值：`feature`（绿）/ `fix`（红）/ `notice`（金）。重新部署后生效。

**方式 B（免部署，推荐）**：

1. 建一个 **公开** Gist，内容为一个 JSON 数组（同上结构）
2. 拿到 raw 地址（形如 `https://gist.githubusercontent.com/<你>/<id>/raw/announcements.json`）
3. 把地址填进 `public/announcements.json`：`{ "remoteUrl": "https://...", "announcements": [] }`
4. 以后发公告 = 改 Gist，页面刷新即生效（请求带 `?t=时间戳` 防缓存）

远端抓取失败时自动回退本地 json / 内置列表，页面不会挂。

### 防缓存说明

json 请求带 `cache: 'no-store'` + `?t=` 时间戳双保险；Cloudflare 对非 HTML 的 4h 缓存也拦不住时间戳。

## 二、GitHub 云端存档（左菜单）

### 用户使用流程

1. 打开 https://github.com/settings/tokens/new?scopes=gist&description=code-isles （已按 gist 权限预填）
2. 生成 Token，复制粘贴进左菜单「云端存档 · GitHub」输入框 → 连接
3. 应用自动在你的账号下找一个描述为 `code-isles-cloud-save` 的**私有 Gist**（没有则创建）
4. 之后手动「↑ 上传到云端 / ↓ 从云端恢复」即可跨设备迁移

### 安全边界

| 项 | 说明 |
|---|---|
| Token 权限 | 只需 `gist` scope，做不了仓库 / 代码操作 |
| Token 存哪 | 浏览器 localStorage，**不上传**给任何服务 |
| Token 发到哪 | 只发 `https://api.github.com`（CSP connect-src 白名单已放行该域） |
| 云端内容 | 私有 Gist，只有你的 Token 能读写 |

### 为什么是手动两键而不是自动同步

自动双向同步要做冲突解决（两台设备都改过听谁的）。手动模型下用户自己选择覆盖方向：
上传 = 本地盖云端，下载 = 云端盖本地（有 confirm 确认），永远不会静默丢进度。

### 为什么本地存档用 localStorage 而不是 cookie

- localStorage 5MB+ 且不随请求发送；cookie 只有 4KB 且每个 HTTP 请求都背着走
- 两者 XSS 暴露面相同，cookie 并不更安全（HttpOnly 反而让 JS 无法读写，不适用本场景）
- 本应用的持久化（存档 / Token / 公告已读 / 课程选择）全部走 localStorage，另有文件导出 + 云端 Gist 双备份兜底
