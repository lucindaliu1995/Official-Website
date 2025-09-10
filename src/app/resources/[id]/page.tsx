"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Script from 'next/script';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import articlesData from '@/data/articles.json';

type Article = {
  id: string;
  title: string;
  titleZh: string;
  coverImage: string;
  excerpt: string;
  excerptZh: string;
  content: string;
  contentZh: string;
  publishDate: string;
  category: string;
  categoryZh: string;
  featured: boolean;
};

export default function ArticleDetail() {
  const { language } = useLanguage();
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [canWebShare, setCanWebShare] = useState<boolean>(false);

  const articles: Article[] = articlesData.articles;

  useEffect(() => {
    const foundArticle = articles.find(a => a.id === params.id);
    setArticle(foundArticle || null);

    if (foundArticle) {
      // Get related articles from the same category
      const related = articles
        .filter(a => a.id !== foundArticle.id && a.category === foundArticle.category)
        .slice(0, 3);
      setRelatedArticles(related);
    }
  }, [params.id, articles]);

  // Build share URL with UTM once article is known (client-side)
  useEffect(() => {
    if (!article) return;
    const origin = typeof window !== 'undefined' 
      ? window.location.origin 
      : (process.env.NEXT_PUBLIC_APP_URL || 'https://climate-seal.com');
    const url = new URL(`/resources/${article.id}`, origin);
    url.searchParams.set('utm_source', 'share');
    url.searchParams.set('utm_medium', 'article');
    url.searchParams.set('utm_campaign', 'referral');
    setShareUrl(url.toString());
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      setCanWebShare(true);
    }
  }, [article]);

  if (!article) {
    return (
      <div className="min-h-screen bg-[rgb(0,52,50)] flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">
            {language === 'zh' ? '文章未找到' : 'Article Not Found'}
          </h1>
          <Link href="/solution-resources" className="text-[#9ef894] hover:underline">
            {language === 'zh' ? '← 返回资源中心' : '← Back to Resources'}
          </Link>
        </div>
      </div>
    );
  }

  const getArticleTitle = (article: Article) => {
    return language === 'zh' ? article.titleZh : article.title;
  };

  const getArticleContent = (article: Article) => {
    return language === 'zh' ? article.contentZh : article.content;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return language === 'zh' 
      ? date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[rgb(0,52,50)]">
      {/* JSON-LD: Breadcrumb（仅元信息，不渲染 UI）*/}
      <Script id="jsonld-breadcrumb-article" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: language === 'zh' ? '首页' : 'Home', item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://climate-seal.com'}/` },
            { "@type": "ListItem", position: 2, name: language === 'zh' ? '解决方案资源中心' : 'Solution Resources', item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://climate-seal.com'}/resources` },
            { "@type": "ListItem", position: 3, name: getArticleTitle(article), item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://climate-seal.com'}/resources/${article.id}` }
          ]
        })}
      </Script>
      {/* Article Header */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <Link 
              href="/resources" 
              className="text-[#9ef894] hover:underline text-sm"
            >
              {language === 'zh' ? '← 返回资源中心' : '← Back to Resources'}
            </Link>
          </nav>

          {/* Article Meta */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-4 items-center mb-4">
              <span className="bg-[#9ef894] text-black px-3 py-1 rounded-full text-sm font-medium">
                {language === 'zh' ? article.categoryZh : article.category}
              </span>
              <span className="text-white/60 text-sm">
                {formatDate(article.publishDate)}
              </span>
              {article.featured && (
                <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-medium">
                  {language === 'zh' ? '推荐' : 'Featured'}
                </span>
              )}
            </div>
          </div>

          {/* Article Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {getArticleTitle(article)}
          </h1>

          {/* Article Cover */}
          <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8">
            {article.coverImage ? (
              <Image
                src={article.coverImage}
                alt={getArticleTitle(article)}
                fill
                className="object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                <span className="text-white/60">
                  {language === 'zh' ? '封面图片' : 'Cover Image'}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <div className="prose prose-lg prose-invert max-w-none">
              {(() => {
                const raw = getArticleContent(article);
                let withLinks = raw
                  .replace(/https?:\/\/[^\s]+/g, (url) => {
                    const isContact = url.startsWith('https://climate-seal.com/?utm_source=website&utm_medium=article&utm_campaign=basic');
                    const text = isContact ? 'Contact Us' : url;
                    return `<a href=\"${url}\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-[#9ef894] underline\">${text}</a>`;
                  }) 
                  .replace(/^CTA:?\s*/im, '')
                  .replace(/Ready to simplify[^\n]*\n?/i, '');

                const headings = [
                  'What is changing',
                  'Why it matters (for sustainability and business teams)',
                  'What to do this quarter',
                  'How Climate Seal helps (right now)',
                  'Sources',
                  '到底在改变什么',
                  '为什么重要（给业务与可持续团队的直白版）',
                  '本季度建议行动',
                  'Climate Seal 能帮你什么（现在就能做的）',
                  '参考资料'
                ];
                const escapeReg = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                headings.forEach((h) => {
                  const re = new RegExp(`(^|\\n)${escapeReg(h)}`, 'g');
                  withLinks = withLinks.replace(re, (_m, p1) => `${p1}<strong>${h}</strong>`);
                });

                // Bold key terms (EN & ZH)
                const keyTerms = [
                  'ISO', 'GHG Protocol', 'ISO 1406x', 'Corporate/Scope 2/Scope 3', 'Product Carbon Footprint (PCF)', 'ISSB', 'B7', 'COP30',
                  'strategic partnership', 'dual-logo portfolio', 'joint PCF standard', 'integrated technical process',
                  'reduce duplication', 'fewer re-baselines', 'clearer audit trails', 'supplier data comparability', 'assurance',
                  '产品碳足迹', '联合的产品碳足迹标准', '战略合作', '双标识', '一体化技术流程', '审计', '可比性'
                ];
                keyTerms.forEach((term) => {
                  const re = new RegExp(`(?!<strong>)${escapeReg(term)}`, 'gi');
                  withLinks = withLinks.replace(re, (match) => `<strong>${match}</strong>`);
                });

                // Bold action phrases at line starts (bullet or numbered) up to colon
                withLinks = withLinks
                  .replace(/(^|\n)-\s*([^:\n：]+)(:|：)/g, (_m, p1, p2, p3) => `${p1}- <strong>${p2}</strong>${p3}`)
                  .replace(/(^|\n)\d+\)\s*([^:\n：]+)(:|：)/g, (_m, p1, p2, p3) => `${p1}<strong>${p2}</strong>${p3}`);

                if (language !== 'zh') {
                  const contactUrl = 'https://climate-seal.com/?utm_source=website&utm_medium=article&utm_campaign=basic';
                  const contactAnchor = `<a href=\"${contactUrl}\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-[#9ef894] underline\">Contact Us</a>`;
                  const escapedAnchor = contactAnchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                  const prompt = 'Ready to simplify your PCFs process? Book a 30-min readiness demo: ';
                  // 将“Contact Us”前缀文案与链接整体加粗
                  withLinks = withLinks.replace(new RegExp(escapedAnchor), `<strong>${prompt}${contactAnchor}</strong>`);
                  // 将首段（至首个空行）整体加粗
                  withLinks = withLinks.replace(/^[\s\S]*?(?=\n\n)/, (m) => `<strong>${m}</strong>`);
                }

                return (
                  <div
                    className="text-white/90 leading-relaxed whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: withLinks }}
                  />
                );
              })()}
            </div>
          </div>

          {/* Share Actions */}
          {article && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-white/70 text-sm">{language === 'zh' ? '分享至：' : 'Share:'}</span>
              {/* LinkedIn */}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank" rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-sm text-white transition"
              >LinkedIn</a>
              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank" rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-sm text-white transition"
              >Facebook</a>
              {/* X/Twitter */}
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(getArticleTitle(article))}`}
                target="_blank" rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-sm text-white transition"
              >X</a>
              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(getArticleTitle(article) + ' ' + shareUrl)}`}
                target="_blank" rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-sm text-white transition"
              >WhatsApp</a>
              {/* Copy Link */}
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(shareUrl);
                    alert(language === 'zh' ? '链接已复制' : 'Link copied');
                  }
                }}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-sm text-white transition"
              >{language === 'zh' ? '复制链接' : 'Copy Link'}</button>
              {/* Web Share */}
              {canWebShare && (
                <button
                  type="button"
                  onClick={() => (navigator as any).share({ title: getArticleTitle(article), url: shareUrl })}
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-sm text-white transition"
                >{language === 'zh' ? '系统分享' : 'Share'}</button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              {language === 'zh' ? '相关文章' : 'Related Articles'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedArticles.map((relatedArticle) => (
                <Link
                  key={relatedArticle.id}
                  href={`/resources/${relatedArticle.id}`}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 group"
                >
                  <div className="relative h-48 bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                    {relatedArticle.coverImage && (
                      <Image
                        src={relatedArticle.coverImage}
                        alt={getArticleTitle(relatedArticle)}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-white text-lg font-semibold mb-2 line-clamp-2 group-hover:text-[#9ef894] transition-colors">
                      {getArticleTitle(relatedArticle)}
                    </h3>
                    <p className="text-white/60 text-sm">
                      {formatDate(relatedArticle.publishDate)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}