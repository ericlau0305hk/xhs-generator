# 小红书文案生成器

输入主题，AI生成3种风格的小红书文案，附带标签和配图建议。

## 功能特点

- 📝 输入主题，生成3个不同版本文案
- 🎨 3种风格可选：干货型、情感型、争议型
- 🏷️ 自动生成推荐标签
- 🖼️ 提供配图建议
- 📋 一键复制小红书格式

## 技术栈

- Next.js 14 + React 18 + TypeScript
- Tailwind CSS
- Minimax/Kimi AI API（自动fallback）

## 本地开发

```bash
npm install
npm run dev
```

## 部署到 Vercel

1. 在 Vercel 导入项目
2. 配置环境变量：
   - `MINIMAX_API_KEY`: Minimax API Key
   - `KIMI_API_KEY`: Kimi API Key (fallback)
3. 部署

## 环境变量

```
MINIMAX_API_KEY=your_minimax_key
KIMI_API_KEY=your_kimi_key
```
