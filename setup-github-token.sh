#!/bin/bash
# GitHub Token 配置脚本

echo "🔐 配置 GitHub Token 认证"
echo ""
echo "步骤："
echo "1. 打开 https://github.com/settings/tokens/new"
echo "2. 勾选 'repo' 权限"
echo "3. 生成 Token（只显示一次，请复制）"
echo "4. 在下面粘贴 Token："
echo ""
read -s -p "GitHub Token: " TOKEN
echo ""

if [ -z "$TOKEN" ]; then
    echo "❌ Token 不能为空"
    exit 1
fi

# 配置 Git 使用 Token
cd ~/.openclaw/workspace/projects/my-app
git remote set-url origin https://ericlau0305hk:$TOKEN@github.com/ericlau0305hk/xhs-generator.git

# 测试推送
echo ""
echo "🚀 测试推送..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ 推送成功！GitHub Token 已配置"
    # 保存 token 到文件（仅当前用户可读）
    echo "$TOKEN" > ~/.github_token
    chmod 600 ~/.github_token
else
    echo "❌ 推送失败，请检查 Token 是否正确"
fi
