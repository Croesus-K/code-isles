# tools：仓主本地工具

## mint-key.mjs — 隐藏岛屿发卡脚本

打赏玩家凭专属密钥解锁隐藏岛屿（Python `6·秘境岛` / JS `j5·秘境岛`）。
密钥在本地离线生成，算法与 `src/core/secret-key.ts` 严格一致。

### 首次配置

发卡盐的明文放在 `tools/.secret`（已 gitignore，绝不入库）：

```
<盐的明文，一行纯文本>
```

### 发卡

```bash
node tools/mint-key.mjs          # 发 1 枚，打印到终端
node tools/mint-key.mjs 5        # 发 5 枚
node tools/mint-key.mjs 5 --append   # 发 5 枚并追加记录到 tools/minted-keys.txt
```

### 工作流

1. 玩家打赏（打赏弹窗 / 爱发电等渠道）。
2. 跑发卡脚本，把密钥私发给玩家（爱发电留言 / 邮件）。
3. 玩家在游戏「打赏弹窗 → 已有专属密钥」输入即解锁，解锁状态存进存档。

### 注意

- `tools/.secret` 与 `tools/minted-keys.txt` 已 gitignore；换机器记得手动带过去。
- 换盐 = 密钥全部失效：改 `.secret` 后必须重新构建部署（盐以混淆形式内嵌进
  `src/core/secret-key.ts` 的 `SECRET_OBFUSCATED`），并重新发卡。
- 改动算法任何一边都要同步另一边。
