'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, User, Tag, Sparkles, Mail, Send } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  author: string;
  category: string;
  image: string;
}

export default function BlogListing() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/blogs`)
      .then(res => res.json())
      .then(data => {
        setBlogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching blogs:', err);
        setLoading(false);
      });
  }, []);

  const featuredBlog = blogs[0];
  const regularBlogs = blogs.slice(1);

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-pill mb-6">
            <Sparkles size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Our Library of Flavors</span>
          </div>
          <h1 className="text-mega uppercase tracking-tighter mb-6">
            The <span className="text-primary italic">Food</span> Blog
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto font-medium leading-relaxed">
            Discover the secrets of healthy eating, Jaipur's deep food history, and how Tiffica is revolutionizing the way students and professionals eat every day.
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-100 aspect-video rounded-[32px] mb-6" />
                <div className="h-4 bg-gray-100 w-1/4 rounded-pill mb-4" />
                <div className="h-8 bg-gray-100 w-3/4 rounded-pill mb-4" />
                <div className="h-4 bg-gray-100 w-full rounded-pill mb-2" />
                <div className="h-4 bg-gray-100 w-1/2 rounded-pill" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredBlog && (
              <div className="mb-32">
                <Link href={`/blog/${featuredBlog.slug}`} className="group relative block aspect-[21/9] rounded-[64px] overflow-hidden shadow-2xl">
                   <img 
                    src={featuredBlog.image} 
                    alt={featuredBlog.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                   <div className="absolute bottom-12 left-12 right-12">
                      <div className="flex items-center gap-4 mb-6">
                        <span className="bg-primary text-white px-4 py-1.5 rounded-pill text-[10px] font-black uppercase tracking-widest">Featured Story</span>
                        <span className="text-white/60 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                           <Calendar size={12} /> {new Date(featuredBlog.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase mb-6 max-w-4xl leading-none">
                        {featuredBlog.title}
                      </h2>
                      <div className="flex items-center gap-3 text-white/80 font-black text-xs uppercase tracking-widest group-hover:gap-6 transition-all">
                        Dive Into the story <ArrowRight size={20} className="text-primary" />
                      </div>
                   </div>
                </Link>
              </div>
            )}

            {blogs.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-[40px]">
                <h2 className="text-2xl font-black mb-4">No Blogs Found</h2>
                <p className="text-muted mb-8">We are still cooking some great stories for you!</p>
                <Link href="/" className="bg-primary text-white px-8 py-3 rounded-pill font-bold">
                  BACK TO HOME
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 mb-32">
                {regularBlogs.map((blog) => (
                  <Link 
                    key={blog._id} 
                    href={`/blog/${blog.slug}`}
                    className="group flex flex-col"
                  >
                    <div className="relative aspect-[4/3] rounded-[48px] overflow-hidden mb-8 shadow-2xl group-hover:-translate-y-2 transition-all duration-500">
                      <img 
                        src={blog.image} 
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute top-6 left-6">
                        <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-pill text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                           <Tag size={12} className="text-primary" /> {blog.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-[10px] font-black text-muted uppercase tracking-widest mb-4 px-2">
                      <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(blog.publishedAt).toLocaleDateString()}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full" />
                      <span className="flex items-center gap-1.5"><User size={12} /> {blog.author}</span>
                    </div>

                    <h2 className="text-2xl font-black mb-4 tracking-tight group-hover:text-primary transition-colors line-clamp-2 uppercase px-2">
                      {blog.title}
                    </h2>
                    
                    <p className="text-muted font-medium line-clamp-3 mb-6 leading-relaxed px-2">
                      {blog.excerpt}
                    </p>

                    <div className="mt-auto flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] group-hover:gap-4 transition-all px-2">
                      Read Full Story <ArrowRight size={16} className="text-primary" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* Newsletter Section */}
        <div className="bg-black rounded-[64px] p-20 text-center relative overflow-hidden">
           <div className="relative z-10 max-w-2xl mx-auto">
              <div className="mb-8 flex justify-center">
                <div className="w-20 h-20 bg-primary/20 rounded-pill flex items-center justify-center text-primary">
                  <Mail size={40} />
                </div>
              </div>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-6">Stay Hungry for Knowledge.</h2>
              <p className="text-white/60 font-medium mb-10 text-lg">Join 5000+ Jaipur foodies. Get weekly nutrition tips, chef secrets, and exclusive subscription offers delivered to your inbox.</p>
              
              <form className="relative group" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="w-full bg-white/5 border-2 border-white/10 rounded-pill px-10 py-6 text-white font-bold focus:outline-none focus:border-primary transition-all pr-40"
                />
                <button className="absolute right-2 top-2 bottom-2 bg-primary text-white px-8 rounded-pill font-black flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
                  JOIN <Send size={16} />
                </button>
              </form>
           </div>
           
           {/* Abstract shapes */}
           <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
           <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />
        </div>
      </div>
    </div>
  );
}
