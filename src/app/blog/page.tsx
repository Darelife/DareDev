import React from "react";
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import BlurText from '../../components/BlurText';

const Blog = () => {
  const blogsFilePath = path.join(process.cwd(), 'public', 'blogs.json');
  const blogsData = JSON.parse(fs.readFileSync(blogsFilePath, 'utf8'));

  const sortedBlogs = blogsData.sort((a: any, b: any) => {
    if (a.date && b.date) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return 0;
  });

  return (
    <div className="bg-black text-white p-4" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      <div className="max-w-4xl mx-auto">
      
      {/* Heading section */}
      <div className="mt-10 p-16 text-center">
        <BlurText
        text="MY BLOG"
        delay={120}
        animateBy="letters"
        direction="top"
        threshold={0.05}
        rootMargin="-30px 0px -30px 0px"
        className="text-5xl md:text-7xl font-bold tracking-tight text-white"
        stepDuration={0.25}
        style={{
          fontFamily: "sans-serif",
          fontWeight: "bold",
          letterSpacing: "-0.02em", 
          filter: "drop-shadow(0 4px 8px rgba(255,0,0,0.3))",
          justifyContent: "center",
          marginBottom: "0.5rem"
        }}
        />
        
        <BlurText
        text="THOUGHTS & TUTORIALS"
        delay={50}
        animateBy="words"
        direction="bottom"
        threshold={0.05}
        rootMargin="-30px 0px -30px 0px"
        className="text-2xl md:text-3xl text-red-400 mb-8"
        stepDuration={0.1}
        style={{
          fontFamily: "sans-serif",
          fontWeight: "600",
          letterSpacing: "0.05em",
          justifyContent: "center",
          opacity: 0.8
        }}
        />
      </div>

      <div className="p-[3rem]"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sortedBlogs.map((blog: any, index: number) => (
        <div 
          key={index} 
          className="relative overflow-hidden group bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg transition-all duration-300"
        >
          <div className="absolute top-0 right-0 bg-red-500/20 text-red-300 text-sm font-mono px-3 py-1 rounded-bl-lg">
          #{index + 1}
          </div>
          
          <div className="p-6">
          {/* Blog Title */}
          <h3 className="text-red-400 text-2xl font-bold mb-3 border-b border-gray-700 pb-3">
            <Link href={`/blog/${blog.slug}`} className="hover:underline">
            {blog.title}
            </Link>
          </h3>
          {/* Blog Description */}
          <div className="text-gray-300 mb-6 leading-relaxed">
            {blog.description}
          </div>
          
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Tags and Metadata */}
            <div className="flex-grow">
            {/* Metadata row */}
            <div className="flex flex-wrap gap-3 mb-3 text-xs text-gray-400">
              {blog.date && (
              <div className="flex items-center gap-1">
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                {new Date(blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
              )}
              <div className="flex items-center gap-1">
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {blog.readTime} min read
              </div>
              <div className="flex items-center gap-1">
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              {blog.author}
              </div>
            </div>
            
            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
              {blog.tags.slice(0, 3).map((tag: string, i: number) => (
                <span key={i} className="bg-gray-800/50 text-gray-300 px-2.5 py-1 text-xs rounded-md border border-gray-700 hover:border-red-500/30 transition-colors">
                #{tag}
                </span>
              ))}
              {blog.tags.length > 3 && (
                <span className="text-gray-400 text-xs px-2.5 py-1">
                +{blog.tags.length - 3} more
                </span>
              )}
              </div>
            )}
            </div>
            
            {/* Read More Link */}
            <div className="flex gap-3 ml-auto">
            <div className="relative group/link z-10">
              <Link 
              href={`/blog/${blog.slug}`}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-800 hover:bg-red-500/30 text-white hover:text-white transition-colors"
              aria-label="Read blog post"
              >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 12h7l-3 3V9l3 3h-7V5l5 5-5 5v-3z"/>
                <path d="M3 5v14h8v-2H5V7h6V5H3z"/>
              </svg>
              </Link>
              {/* Tooltip */}
              <div className="fixed z-50 opacity-0 invisible group-hover/link:opacity-100 group-hover/link:visible transition-all duration-200 -translate-y-full -translate-x-1/2 left-1/2 top-0 pointer-events-none mb-3 transform">
              <div className="bg-black/90 text-white text-xs px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap">
                Read Article
              </div>
              <div className="w-2 h-2 bg-black/90 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
              </div>
            </div>
            </div>
          </div>
          </div>
        </div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default Blog;