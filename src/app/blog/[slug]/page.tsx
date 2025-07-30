import fs from 'fs';
import path from 'path';
import Link from 'next/link';

const BlogPost = async ({ params }: { params: { slug: string } }) => {
  const { slug } = params;
  
  // Read blogs from JSON file
  const blogsFilePath = path.join(process.cwd(), 'public', 'blogs.json');
  const blogsData = JSON.parse(fs.readFileSync(blogsFilePath, 'utf8'));
  
  // Find the specific blog post
  const blog = blogsData.find((b: any) => b.slug === slug);
  
  if (!blog) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-400 mb-4">Blog Not Found</h1>
          <Link href="/blog" className="text-red-400 hover:underline">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  // Read HTML content from file if contentFile is present
  let blogContent = '';
  if (blog.contentFile) {
    const contentPath = path.join(process.cwd(), 'public', 'blogs', blog.contentFile);
    blogContent = fs.readFileSync(contentPath, 'utf8');
  } else {
    blogContent = blog.content || '';
  }

  // Format date if available
  const formattedDate = blog.date ? new Date(blog.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : null;

  return (
    <div className="bg-black text-white" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      {/* Header Section */}
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 px-6 sm:px-12 lg:px-24 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link 
            href="/blog" 
            className="inline-flex items-center text-red-400 hover:text-red-300 transition-colors mb-8 group"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Blog
          </Link>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white drop-shadow-[0_0_20px_rgba(255,0,0,0.8)] mb-6 leading-tight">
            {blog.title}
          </h1>

          {/* Description */}
          {blog.description && (
            <p className="text-xl text-gray-300 mb-6 leading-relaxed">
              {blog.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-6">
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
                  className="px-3 py-1 text-sm bg-red-900/30 border border-red-500/30 rounded-full text-red-300"
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
          <article 
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: blogContent }}
          />
        </div>
      </div>
    </div>
  );
};

export const generateStaticParams = async () => {
  const blogsFilePath = path.join(process.cwd(), 'public', 'blogs.json');
  const blogsData = JSON.parse(fs.readFileSync(blogsFilePath, 'utf8'));

  return blogsData.map((blog: any) => ({
    slug: blog.slug,
  }));
};

export default BlogPost;
