import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { blogPosts } from "../../constants/blogPosts";
import React from "react";

interface BlogListProps {
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

export default function BlogList({
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
}: BlogListProps) {
  return (
    <div className="min-h-screen bg-[#F7F7FB] text-slate-900">
      <SEO 
        title="DMflow Blog – Instagram Growth & Automation Tips"
        description="The DMflow blog is your destination for Instagram automation tips, growth strategies, and feature updates. Learn how to automate your Instagram business."
        canonical="https://dmflow.site/blog"
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
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-extrabold font-display mb-6">DMflow Blog</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Master Instagram automation with our latest guides and updates.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article key={post.slug} className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 flex flex-col">
                <div className="aspect-video bg-slate-200">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-xs font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                    <time className="text-xs text-slate-400 font-bold">{post.date}</time>
                  </div>
                  <h2 className="text-2xl font-bold mb-4 line-clamp-2">{post.title}</h2>
                  <p className="text-slate-500 mb-8 line-clamp-3">
                    {post.description}
                  </p>
                  <button 
                    onClick={() => onNavigate(`/blog/${post.slug}`)}
                    className="mt-auto text-brand-primary font-bold hover:underline inline-flex items-center gap-2"
                  >
                    Read Guide →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
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
