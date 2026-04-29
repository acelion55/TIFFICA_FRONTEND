'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Calendar, User, Share2, Tag } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Blog {
  title: string;
  content: string;
  image: string;
  author: string;
  category: string;
  publishedAt: string;
  slug: string;
}

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/blogs/${slug}`)
      .then(res => res.json())
      .then(data => {
        setBlog(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching blog details:', err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white pt-20">
        <div className="w-16 h-16 border-[6px] border-primary border-t-secondary rounded-pill animate-spin" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white pt-20 px-4">
        <h1 className="text-4xl font-black mb-4 uppercase">Blog Not Found</h1>
        <p className="text-muted mb-8 italic">The story you are looking for has already been eaten.</p>
        <Link href="/blog" className="bg-primary text-white px-8 py-3 rounded-pill font-bold shadow-xl shadow-primary/20">
          RETURN TO BLOGS
        </Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted hover:text-primary mb-12 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Library
        </Link>

        {/* Category & Meta */}
        <div className="flex items-center gap-4 mb-8">
          <span className="bg-gray-100 px-4 py-1.5 rounded-pill text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <Tag size={12} /> {blog.category}
          </span>
          <span className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-2">
            <Calendar size={12} /> {new Date(blog.publishedAt).toLocaleDateString()}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-[0.9] mb-12 uppercase text-foreground">
          {blog.title}
        </h1>

        {/* Author & Share */}
        <div className="flex justify-between items-center py-8 border-y border-gray-100 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-pill flex items-center justify-center text-white font-black">
              {blog.author[0]}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">WRITTEN BY</p>
              <p className="text-sm font-bold text-muted">{blog.author}</p>
            </div>
          </div>
          <button className="w-12 h-12 rounded-pill border border-gray-100 flex items-center justify-center text-muted hover:bg-primary hover:text-white hover:border-primary transition-all">
            <Share2 size={18} />
          </button>
        </div>

        {/* Featured Image */}
        <div className="rounded-[64px] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] mb-20 aspect-video">
          <img 
            src={blog.image} 
            alt={blog.title} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div 
          className="prose prose-2xl prose-gray max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-headings:uppercase prose-p:font-medium prose-p:leading-loose prose-a:text-primary prose-strong:font-black"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* CTA */}
        <div className="mt-32 p-12 bg-orange-50 rounded-[48px] text-center border-2 border-primary/10">
          <h3 className="text-3xl font-black tracking-tight mb-4 uppercase italic italic">Loved this story?</h3>
          <p className="text-muted font-medium mb-8">Wait till you taste our food. Experience the best tiffin service in Jaipur.</p>
          <Link href="/signup" className="bg-primary text-white px-10 py-4 rounded-pill font-black text-xl shadow-2xl shadow-primary/30 hover:scale-105 transition-transform inline-flex items-center gap-3 uppercase">
            Order Your Tiffin <ArrowRight />
          </Link>
        </div>
      </div>
    </article>
  );
}
