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
                alt={`${getArticleTitle(article)} - cover image`}
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
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl">
            <div className="prose prose-xl prose-invert max-w-none">
              {(() => {
                const raw = getArticleContent(article);
                let withLinks = raw
                  .replace(/https?:\/\/[^\s]+/g, (url) => {
                    const isContact = url.startsWith('https://climate-seal.com/?utm_source=website&utm_medium=article&utm_campaign=basic');
                    const text = isContact ? 'Contact Us' : url;
                    return `<a href=\"${url}\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-[#9ef894] underline hover:text-[#7dd87d] transition-colors\">${text}</a>`;
                  }) 
                  .replace(/^CTA:?\s*/im, '')
                  .replace(/Ready to simplify[^\n]*\n?/i, '');

                // Simple heading styling without borders
                const headings = [
                  'What is changing',
                  'Why it matters (for sustainability and business teams)',
                  'What to do this quarter',
                  'How Climate Seal helps (right now)',
                  '到底在改变什么',
                  '为什么重要（给业务与可持续团队的直白版）',
                  '本季度建议行动',
                  'Climate Seal 能帮你什么（现在就能做的）'
                ];
                const escapeReg = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                headings.forEach((h) => {
                  const re = new RegExp(`(^|\\n)${escapeReg(h)}`, 'g');
                  withLinks = withLinks.replace(re, (_m, p1) => `${p1}<h2 class="text-2xl md:text-3xl font-bold text-white mb-6 mt-12 first:mt-0">${h}</h2>`);
                });

                // Simple paragraph styling - only wrap non-heading content
                withLinks = withLinks.replace(/\n\n/g, '</p><p class="text-white/90 text-lg leading-relaxed mb-6">');
                // Only wrap in paragraph if it doesn't start with a heading
                if (!withLinks.startsWith('<h2')) {
                  withLinks = `<p class="text-white/90 text-lg leading-relaxed mb-6">${withLinks}</p>`;
                }

                if (language !== 'zh') {
                  const contactUrl = 'https://climate-seal.com/?utm_source=website&utm_medium=article&utm_campaign=basic';
                  const contactAnchor = `<a href=\"${contactUrl}\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-[#9ef894] underline hover:text-[#7dd87d] transition-colors\">Contact Us</a>`;
                  const escapedAnchor = contactAnchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                  const prompt = 'Ready to simplify your PCFs process? Book a 30-min readiness demo: ';
                  withLinks = withLinks.replace(new RegExp(escapedAnchor), `<p class="text-white/90 text-lg leading-relaxed mb-6"><strong>${prompt}${contactAnchor}</strong></p>`);
                }

                return (
                  <div
                    className="text-white/90 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: withLinks }}
                  />
                );
              })()}
            </div>
          </div>

          {/* Enhanced Share Actions */}
          {article && (
            <div className="mt-12 pt-8 border-t border-white/20">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {language === 'zh' ? '分享这篇文章' : 'Share this article'}
                  </h3>
                  <p className="text-white/70 text-sm">
                    {language === 'zh' ? '帮助更多人了解碳核算的最新发展' : 'Help others stay informed about carbon accounting developments'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {/* LinkedIn */}
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full bg-[#0077B5] hover:bg-[#005885] text-white font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0H5C2.239 0 0 2.239 0 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5V5c0-2.761-2.238-5-5-5Zm-9.5 18H6V9h3.5v9ZM7.75 7.75A1.75 1.75 0 1 1 7.751 4.25 1.75 1.75 0 0 1 7.75 7.75ZM20 18h-3.5v-4.75c0-1.131-.919-2.05-2.05-2.05s-2.05.919-2.05 2.05V18H8.85V9H12v1.053c.664-.81 1.803-1.353 2.95-1.353 2.214 0 4.05 1.836 4.05 4.05V18Z"/>
                    </svg>
                    LinkedIn
                  </a>
                  {/* X/Twitter */}
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(getArticleTitle(article))}`}
                    target="_blank" rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full bg-black hover:bg-gray-800 text-white font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    X
                  </a>
                  {/* WhatsApp */}
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(getArticleTitle(article) + ' ' + shareUrl)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full bg-[#25D366] hover:bg-[#1DA851] text-white font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    WhatsApp
                  </a>
                  {/* Copy Link */}
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(shareUrl);
                        alert(language === 'zh' ? '链接已复制' : 'Link copied');
                      }
                    }}
                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {language === 'zh' ? '复制链接' : 'Copy Link'}
                  </button>
                  {/* Web Share */}
                  {canWebShare && (
                    <button
                      type="button"
                      onClick={() => (navigator as any).share({ title: getArticleTitle(article), url: shareUrl })}
                      className="px-4 py-2 rounded-full bg-[#9ef894] hover:bg-[#7dd87d] text-black font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      {language === 'zh' ? '系统分享' : 'Share'}
                    </button>
                  )}
                </div>
              </div>
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
                        alt={`${getArticleTitle(relatedArticle)} - cover image`}
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