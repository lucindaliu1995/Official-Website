# Climate Seal Website (Next.js)

基于 Next.js App Router 的官网项目，支持多语言、文章资源中心、FAQ、RSS、站点地图与结构化数据。

## 本地开发

```bash
npm install
npm run dev
# http://localhost:3000
```

## 环境变量（示例见 `env.example`）

- `NEXT_PUBLIC_APP_URL`：站点基础 URL（用于 sitemap、OG、RSS 绝对地址）
- `NEXT_PUBLIC_INDEXABLE`：是否允许被搜索引擎索引（生产 true；开发/预发建议 false）
- `NEXT_PUBLIC_GSC_VERIFICATION` / `NEXT_PUBLIC_BING_VERIFICATION`：可选，搜索引擎验证

## 部署与 SEO 自检

1) 生产环境设置：
- `NEXT_PUBLIC_APP_URL=https://climate-seal.com`
- `NEXT_PUBLIC_INDEXABLE=true`

2) 部署后检查：
- 打开 `/robots.txt` 应为 Allow: /
- 查看源码 meta robots 不应包含 `noindex, nofollow`
- `/sitemap.xml`、`/rss.xml` 返回 200
- 文章详情页含正确的 `og:image` 绝对地址

3) 结构化数据
- 站点包含 Organization、ItemList、FAQ、Article 的 JSON-LD

## 目录
- `src/app`：页面与路由（含 `resources`、`faq`、`rss`、`sitemap`、`robots`）
- `src/components`：组件（Navbar、Footer、FAQ 等）
- `src/data/articles.json`：文章数据源
- `src/lib/i18n.ts`：多语言配置

## 常见问题
- 本地开发默认 `noindex`（防止测试内容被抓取）；生产需设置 `NEXT_PUBLIC_INDEXABLE=true` 开启收录。
