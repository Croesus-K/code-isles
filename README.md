# 代码群岛 Code Isles

像素 RPG 风格的学习平台：扮演冒险者，在世界地图上闯关探险，用打游戏的方式学正经知识。首期课程：Python 基础。

## 当前状态

M0~M5 已完成：像素设计系统、存档系统、世界地图与关卡流程、五种题型与经济闭环（星级/连击/提示商店）、Python 基础全课程（5 区域 20 关 135 题）、成就系统（10 枚徽章 + 结算弹窗 + 徽章墙）、零素材 8-bit 音效（Web Audio 合成）、结算/星级/连击/解锁的像素风动画（尊重 prefers-reduced-motion）、打赏入口（游戏内弹窗，支付宝收款码运行时加载）、部署上线（博客 Cloudflare Pages 静态托管）。里程碑规划见 [docs/product-plan.md](docs/product-plan.md)。

## 在线试玩

已部署至作者博客（Cloudflare Pages 静态托管）：<https://croesus-k.top/games/code-isles/>

## 赞助

如果代码群岛帮到了你，欢迎请冒险者喝杯朗姆酒🍹——游戏内「工具箱 → 打赏作者」可扫码打赏（支付宝收款码，金额随意）。

收款码以相对路径运行时加载（不打包进 JS），替换时只需更新发布目录里的 `donate/alipay.png` 并重新部署，无需重新构建。

## 本地开发

```bash
npm install
npm run dev      # 开发服务器
npm test         # 单元测试（Vitest）
npm run build    # 类型检查 + 生产构建
```

## 技术栈

- Vite + React 18 + TypeScript，纯静态网页，无后端
- 状态与存档：Zustand + localStorage（版本化 schema，支持导出/导入 JSON）
- 测试：Vitest
- 托管（规划中）：GitHub Pages / Vercel

## 部署

```bash
npm run build    # 产物在 dist/
```

构建使用相对路径（Vite `base: './'`），`dist/` 可直接放到任意静态站点的任意子路径，包括博客目录（如 `/games/code-isles/`）。建议作为独立页面部署，而非 iframe 嵌入——iframe 里的本地存档可能受浏览器第三方存储策略限制。

## 素材与授权

- 字体：[Fusion Pixel Font](https://github.com/TakWolf/fusion-pixel-font)（SIL OFL 1.1，可商用）
- 像素素材：自制 + CC0（来源清单随素材里程碑补充）
- 代码许可证：待定（当前保留所有权利）
