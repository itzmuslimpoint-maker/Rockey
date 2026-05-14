import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { blogPosts, BlogPost as BlogPostType } from "../../constants/blogPosts";
import React from "react";

interface BlogPostProps {
  slug: string;
  onStart: () => void;
  onAffiliate: () => void;
  onHelp: () => void;
  onHome: () => void;
  onPricing: () => void;
  onFeatures: () => void;
  onPrivacy: () => void;
  onTerms: () => void;
  onDataDeletion: () => void;
  onNavigate: (path: string) => void;
}

export default function BlogPost({
  slug,
  onStart,
  onAffiliate,
  onHelp,
  onHome,
  onPricing,
  onFeatures,
  onPrivacy,
  onTerms,
  onDataDeletion,
  onNavigate
}: BlogPostProps) {
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#F7F7FB] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Post not found</h1>
        <button onClick={() => onNavigate('/blog')} className="text-brand-primary font-bold">Back to Blog</button>
      </div>
    );
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.description,
    "author": { "@type": "Organization", "name": "DMflow" },
    "publisher": {
      "@type": "Organization",
      "name": "DMflow",
      "url": "https://dmflow.site"
    },
    "datePublished": post.date,
    "dateModified": post.date,
    "mainEntityOfPage": `https://dmflow.site/blog/${post.slug}`,
    "image": post.image
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SEO 
        title={`${post.title} – DMflow Blog`}
        description={post.description}
        canonical={`https://dmflow.site/blog/${post.slug}`}
        ogType="article"
        ogImage={post.image}
        schema={articleSchema}
      />
      <Navbar 
        onStart={onStart}
        onAffiliate={onAffiliate}
        onHelp={onHelp}
        onHome={onHome}
        onPricing={onPricing}
        onFeatures={onFeatures}
      />

      <main className="pt-32 pb-24">
        <article className="max-w-3xl mx-auto px-6">
          <header className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-xs font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-3 py-1 rounded-full">
                {post.category}
              </span>
              <time className="text-xs text-slate-400 font-bold">{post.date}</time>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold font-display leading-tight mb-8">
              {post.title}
            </h1>
            <div className="aspect-video bg-slate-100 rounded-[2rem] overflow-hidden mb-12 shadow-2xl">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
            </div>
          </header>

          <div 
            className="prose prose-lg prose-slate max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-brand-primary prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <section className="mt-24 pt-12 border-t border-slate-100">
            <div className="bg-[#F7F7FB] p-10 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-4">Want to try DMflow?</h2>
                <p className="text-slate-500 mb-0">Automate your Instagram interactions instantly. Start free today.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                <button onClick={() => onNavigate('/pricing')} className="px-8 py-3 bg-white text-slate-900 border border-slate-200 rounded-full font-bold hover:bg-slate-50 transition-all">
                  Pricing
                </button>
                <button onClick={onStart} className="px-8 py-3 brand-gradient text-white rounded-full font-bold shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all">
                  Get Started Free
                </button>
              </div>
            </div>
          </section>
        </article>
      </main>

      <Footer 
        onPrivacy={onPrivacy}
        onTerms={onTerms}
        onAffiliate={onAffiliate}
        onHelp={onHelp}
        onDataDeletion={onDataDeletion}
      />
    </div>
  );
}
