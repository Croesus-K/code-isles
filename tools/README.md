# tools：仓主本地工具

## mint-key.mjs — 秘境岛发卡脚本

打赏玩家凭专属密钥解锁隐藏岛屿（Python `6·秘境岛` / JS `j5·秘境岛`）。
**校验是在册制**：密钥必须先写入 D1（`secret_keys` 表，只存 SHA-256 哈希），
客户端把输入的密钥 POST 给 Worker（`/api/secret/unlock`）联网验证后才解锁。
题目内容也只由 Worker 下发——客户端 bundle 里没有秘境岛题目。

### 发卡 + 入库（一条龙）

```bash
# 1. 铸 5 枚，追加记录到本地 minted-keys.txt，并打印入库 SQL
node tools/mint-key.mjs 5 --append --sql

# 2. 把打印出来的 SQL 执行入库（在 blog 仓库 counter-worker 目录下也行）
npx wrangler d1 execute blog-counter --remote --command "<上一步的 SQL>"
```

### 工作流

1. 玩家打赏（打赏弹窗 / 爱发电等渠道）。
2. 跑发卡脚本 + 入库 SQL（两步缺一不可——不入库的密钥服务端不认）。
3. 把密钥私发给玩家。玩家在「打赏弹窗 → 已有专属密钥」输入即解锁。
4. 解锁状态存进玩家存档（跨设备随存档迁移，服务端会重新校验）。

### 注意

- `tools/minted-keys.txt` 已 gitignore，含密钥明文，只留在本地。
- 旧版的 `tools/.secret` 盐机制已废弃（2026-09-18 起改为在册制），无需保留。
- 改算法要同步三处：`tools/mint-key.mjs`、`code-isles/src/core/secret-key.ts`、
  `counter-worker/src/index.js`（normalizeSecretKey）。
- Worker 侧改动需要 `npx wrangler deploy`（在 blog 仓库 counter-worker 目录）。
