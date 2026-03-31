# 部署说明

## 本地代码已提交

代码已在本地提交，需要你手动推送：

```bash
cd /path/to/water-report-analysis
git push origin main
```

## 测试访问

### 1. 个人中心
访问：https://water-report-analysis.xjypro.com/dashboard

### 2. 测试流程

**游客测试：**
- 访问首页，不登录
- 上传报告，查看只有 1 个建议

**免费用户测试：**
- 点击 Google 登录
- 上传报告，查看有 2 个建议
- 点击头像进入个人中心

**个人中心：**
- 查看账户状态
- 查看三个付费选项

## 环境变量

确保 Cloudflare 部署时设置了：
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `AUTH_SECRET`
- `NEXT_PUBLIC_BASE_URL`

## 下一步开发

1. 集成 Stripe 支付
2. 连接真实数据库
3. 实现报告历史
