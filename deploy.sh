#!/bin/bash
# 部署脚本

echo "🚀 开始部署小红书文案生成器..."

# 检查是否有 GitHub Token
if [ -z "$GITHUB_TOKEN" ]; then
    echo "⚠️  请先设置 GITHUB_TOKEN 环境变量"
    echo "获取方式：GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)"
    echo "需要权限：repo"
    exit 1
fi

# 配置 Git
git config user.email "ericlau0305hk@gmail.com"
git config user.name "Eric"

# 创建 GitHub 仓库
echo "📦 创建 GitHub 仓库..."
curl -H "Authorization: token $GITHUB_TOKEN" \
     -H "Accept: application/vnd.github.v3+json" \
     https://api.github.com/user/repos \
     -d '{"name":"xhs-generator","description":"小红书文案生成器 - AI帮你写爆款","private":false}'

# 推送代码
echo "📤 推送代码到 GitHub..."
git remote add origin https://ericlau0305:$GITHUB_TOKEN@github.com/ericlau0305/xhs-generator.git 2>/dev/null || true
git branch -M main
git push -u origin main --force

echo "✅ 代码已推送到 GitHub!"
echo ""
echo "下一步：在 Vercel 部署"
echo "1. 打开 https://vercel.com/new"
echo "2. 导入 ericlau0305/xhs-generator"
echo "3. 添加环境变量："
echo "   MINIMAX_API_KEY=sk-cp-lXdopiWb4S3Lq1z4VZjobg6kByLu8CqUAzief_icuxmy3Q8vMNs3DMHzUMexsxO-V10v633qy5AVgui5wmmQrVgk2c311x_LalyNIwWcANyMExEWgx4WVn0"
echo "   KIMI_API_KEY=sk-BQFE69zfzVva6to7mcsq8TOyjzgIYQVCIGpBt5HCFQviUGO3"
echo "4. 点击 Deploy"
