import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { getBlogPost } from '../../../lib/api-client';

const BlogPost = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const blog = await getBlogPost(slug);

  if (!blog) {
    return (
      <div className="blog-article bg-[var(--appearance-canvas,#000)] min-h-screen text-[color:var(--appearance-ink,#fff)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[color:var(--appearance-accent,oklch(70.4%_0.191_22.216))] mb-4">Blog Not Found</h1>
          <Link href="/blog" className="text-[color:var(--appearance-accent,oklch(70.4%_0.191_22.216))] hover:underline">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = blog.date ? new Date(blog.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : null;

  return (
    <div className="blog-article bg-[var(--appearance-canvas,#000)] text-[color:var(--appearance-ink,#fff)]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      {/* Header Section */}
      <div className="relative bg-gradient-to-br from-[var(--appearance-highlight,oklch(21%_0.034_264.665))] to-[var(--appearance-highlight,oklch(27.8%_0.033_256.848))] px-6 sm:px-12 lg:px-24 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            href="/blog"
            className="inline-flex items-center text-[color:var(--appearance-accent,oklch(70.4%_0.191_22.216))] hover:text-[color:var(--appearance-accent,oklch(80.8%_0.114_19.571))] transition-colors mb-8 group"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Blog
          </Link>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[color:var(--appearance-ink,#fff)] drop-shadow-[0_0_20px_rgba(255,0,0,0.8)] mb-6 leading-tight">
            {blog.title}
          </h1>

          {/* Description */}
          {blog.description && (
            <p className="text-xl text-[color:var(--appearance-muted,oklch(87.2%_0.01_258.338))] mb-6 leading-relaxed">
              {blog.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-6 text-[color:var(--appearance-muted,oklch(70.7%_0.022_261.325))] mb-6">
            {formattedDate && (
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                {formattedDate}
              </div>
            )}
            {blog.author && (
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                {blog.author}
              </div>
            )}
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {blog.readTime} min read
            </div>
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm bg-[var(--appearance-wash,color-mix(in_oklab,oklch(39.6%_0.141_25.723)_30%,transparent))] border border-[var(--appearance-rule,color-mix(in_oklab,oklch(63.7%_0.237_25.331)_30%,transparent))] rounded-full text-[color:var(--appearance-accent,oklch(80.8%_0.114_19.571))]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 sm:px-12 lg:px-24 py-16">
        <div className="max-w-4xl mx-auto">
          <article className="blog-content prose prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {blog.body}
            </ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
