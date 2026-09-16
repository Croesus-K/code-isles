# 代码群岛 · 知识内容完善 启动提示词

> 把本文整段复制给下一个 AI Agent，即可无障碍接续「完善知识内容 + 正确流畅 + 多设备兼容」任务。
> 打赏入口是另一个独立任务（处于「赞助页即将上线」占位态、`DONATE_URL = ''`），与本文无关——切换时单独开新提示词。

---

## 任务

在 **code-isles（代码群岛）** 这一像素 RPG 风格学习平台上，**完善知识内容**：补足现有「Python 基础」课程中薄弱的环节、修正知识瑕疵、补充代表性题目；**所有新增/修改的知识内容必须在 Python 3 真环境验算后才入库**；并确保答题演示**视觉与交互流程流畅**，且在**桌面 / 平板 / 手机**三类设备上**全部可玩**（不破图、可触屏、不溢出）。

---

## 项目上下文（必读）

- **定位**：纯静态网页（Vite 5 + React 18 + TS + Zustand + localStorage），`base: './'`，已部署到博客 `croesus-k.top/games/code-isles/`（Cloudflare Pages 自动构建 blog 仓库 `main` 分支触发）。
- **代码仓库**：`Croesus-K/code-isles`（源码，main 分支）。博客仓库：`Croesus-K/blog`（在 `.tmp-blog-clone/` 下操作 `source/games/code-isles/` 同步 dist）。
- **里程碑**：M0~M5 已上线（M0 脚手架、M1 地图流程、M2 五种题型闭环、M3 全 20 关 135 题、M4 徽章/音效/动画、M5 部署）。
- **素材**：Fusion Pixel 12px 字体（OFL）、Kenney CC0、零素材 8-bit 音效（Web Audio 合成）、手写 CSS 像素设计系统。
- **不真运行 Python**：v1 判题为答案预置，不接入 Pyodide。新题正确答案必须人工/Python 验算后写入。

## 内容架构（修改前先读）

- 类型定义：`src/content/course.ts`（Question 五种 kind：`choice` / `output` / `fill` / `order` / `bug`；LearnCard；LevelDef；RegionDef；CourseDef）
- 现行课程：`src/content/python-basics/{region1..region5}.ts` + `index.ts`
- 校验测试：`tests/content.test.ts`（覆盖：5 区域齐备、Boss 唯一且末位、id 前缀、题量 4–6（Boss ≥8）、hint/explain 非空、填空含 `___`、排序行唯一、找错行索引）
- 徽章：`src/content/badges.ts`（10 枚，达成条件见 `src/core/badges.ts`，**改关卡 ID / Boss 位置前先看这里**）
- **新增/删除区域或移动 Boss 位置会触发徽章逻辑与关卡 ID 校验，必须同步更新 `tests/content.test.ts` 与 `src/core/badges.ts` 的判定**。

## 当前知识覆盖（已知薄弱环节，仅作参考）

| 区域 | 关卡 | 知识点 |
|---|---|---|
| 1 变量平原 | 1-1 贴标签的宝箱 | 变量命名、大小写、赋值 |
| | 1-2 数字三兄弟 | / // % ** |
| | 1-3 会说话的卷轴 | 字符串、f-string、len |
| | 1-4 Boss | 平原综合 |
| 2 分支森林 | 2-1 真假分叉路 | 布尔值、比较 |
| | 2-2 三岔口 | if/elif/else |
| | 2-3 咒语组合 | and/or/not |
| | 2-4 Boss | 森林综合 |
| 3 循环洞窟 | 3-1 复读机阵 | for |
| | 3-2 无底回廊 | while |
| | 3-3 逃生门 | break/continue |
| | 3-4 Boss | 循环综合 |
| 4 列表湖 | 4-1 宝物船 | 列表定义 |
| | 4-2 船舱管理 | append/remove/in/索引 |
| | 4-3 切片刀 | 切片 |
| | 4-4 Boss | 列表综合 |
| 5 字典城 | 5-1 有名字的宝箱 | 字典定义、访问 |
| | 5-2 城门守卫 | get/in/del |
| | 5-3 咒语工坊 | 函数 def/return |
| | 5-4 Boss | 毕业大测验 |

**已被作者点名或自检发现的可能薄弱**：函数参数/返回值/作用域（5-3 偏浅）、异常 try/except（未覆盖）、input()（未覆盖）、浮点精度坑、字符串方法（split/join/strip）、列表推导式（未覆盖）。**优先补这几块**——补前先和用户确认补在哪一关/要不要新开一关。

---

## 硬约束（违反任一即返工）

### A. 知识正确性（最高优先级）
- **`output` 题**：必须用本地 Python 3 跑一遍代码，把真实输出贴回去作 `answerIndex` 依据；选项里写出最容易混淆的陷阱（如 `'` vs `"`、空格、换行）。
- **`fill` 题**：答案集必须覆盖所有合理等价写法（顺序、空格、首尾空白）；`code` 中 `___` 位置必须真能填入答案跑通。
- **`order` 题**：行集合按正确顺序首尾拼接后必须能作为合法 Python 程序运行；运行结果不要求，但语法必须无错。
- **`bug` 题**：必须真跑一遍确认报错行；选项干扰项放"看起来像但其实正确"的行。
- **`choice` 题**：答案必须是当前代码片段**在 Python 3 下**的真实行为；典型陷阱：作用域、可变默认参数、浮点、字符串不可变、列表引用。

### B. 演示流畅性
- 学习卡正文 ≤ 3 段、单段 ≤ 80 中文字符；代码示例 ≤ 8 行；超过用第二段 `code` 字段或精简。
- 每题 `explain` ≤ 120 字，讲清"为什么对"和"其他选项错在哪"；`hint` ≤ 40 字，给方向不给答案。
- 节奏：4~6 题 / 普通关，8~10 题 / Boss，避免一关全 choice 让玩家疲倦——混合五种 kind。

### C. 多设备兼容（必须逐项手测）
- **桌面 ≥ 1024px**：原版布局，世界地图 / 区域地图 / 关卡页全功能。
- **平板 768~1023px（横竖）**：世界地图关卡节点不应重叠；关卡页学习卡 + 代码块单列；Order 题触屏拖拽仍可用。
- **手机 ≤ 767px**：单列；学习卡 + 题面 + 选项不溢出屏幕；代码块允许横向滚动（不强制换行）；键盘弹起时弹窗不被遮挡。
- **触屏**：Order 题拖拽、Choice 点击热区 ≥ 44px；Fill 题系统键盘触发。
- **键盘**：Tab 顺序合理、Esc 关闭弹窗、Enter 提交（fill / choice）。
- **a11y**：弹窗 `role="dialog" aria-modal aria-label`；占位卡有 `aria-label`；尊重 `prefers-reduced-motion`。
- **设备验收**：用 Chrome DevTools 切到 iPhone SE / iPad / 1440px 三档，关卡页完整跑完 5 关不破图。

---

## 方法论（按顺序执行）

1. **列改动清单**：每次会话先列"这次新增 / 修改了哪些关 / 题"，写入 TODO，跑完后回头核对。
2. **验算**：每条 `output` / `fill` / `order` / `bug` 题，在本地 Python 3 实跑一次，把命令和输出贴到 commit message 或 PR 描述里。
3. **先测试后改代码**：改 region 文件后跑 `npx tsc --noEmit` 和 `npx vitest run`，全过才继续。
4. **小步增量**：每新增 1~2 关跑一次 `npm run build`，避免最后一次性构建暴雷。
5. **设备三档截图**：每次合并改动前，DevTools 切三档尺寸，对关卡页 + 弹窗截图存档（不必提交，但要肉眼复核）。
6. **里程碑收尾**：照 `product-plan.md` §七的固定流程——变更清单 → grep 扫描本地路径/邮箱 → commit + push。

---

## 沙箱 / 部署备忘

- **沙箱权限边界**（DeepSeek Harness Windows 沙箱）：
  - `npm run build` / `npx vitest run` 会触发 esbuild spawn，需 `sandbox_permissions: danger-full-access`。
  - `git push`（SSH）会触发 named pipe 创建，需 `danger-full-access`。
  - `tsc --noEmit`、纯文件读写、PowerShell 内置命令可在只读沙箱运行。
- **部署链**：
  1. `npm run build` → 2. `Copy-Item .\code-isles\dist\* .\.tmp-blog-clone\source\games\code-isles\ -Recurse -Force` → 3. 提交 blog → 4. `git push origin main`（blog）→ 5. CF Pages 自动构建，验证 `assets/index-*.js` 在线可访问。
- **不要做的事**：不要启动 `hexo deploy`（已禁用，会 force-push）；不要修改 `source/_headers`（CSP 宽松，hash 变更无影响）；不要把 `.tmp-blog-clone` 之外的路径推到 blog 仓库。

---

## 验收清单（移交前必过）

- [ ] `npx tsc --noEmit` 无错
- [ ] `npx vitest run` 全过（新增题后数量自然增加）
- [ ] `npm run build` 成功；产物哈希与上次 diff 在 commit message 列出
- [ ] DevTools 三档（iPhone SE / iPad / 1440px）关卡页全程跑通，截图归档
- [ ] 所有 `output` 题在 Python 3 实跑过，输出贴回 answer
- [ ] 至少一处薄弱知识点被补强（如异常处理 / 函数作用域 / 列表推导式之一），与用户确认补在哪
- [ ] 不动引擎逻辑（除非为了接入新关卡）
- [ ] 推送两仓库（code-isles + blog），CF Pages 自动部署，线上 `croesus-k.top/games/code-isles/` 验证可访问

---

## 接续入口（给下一个 Agent）

接到本提示后，先：

1. `git -C .\code-isles log --oneline -5`、`git -C .\.tmp-blog-clone log --oneline -5` 确认当前分支状态。
2. 跑一遍 `npx tsc --noEmit` + `npx vitest run`，确认基线干净。
3. **第一句话先回复"已接续，启动知识内容完善任务"**，然后列出你打算补哪几个薄弱环节、放在哪一关、是否需要新开关——**先和用户对清单再动手**，不要先斩后奏。