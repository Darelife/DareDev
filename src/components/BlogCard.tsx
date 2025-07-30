import Link from 'next/link';

const BlogCard: React.FC<{ slug: string }> = ({ slug }) => {
  return (
    <div className="bg-gray-900/50 border border-red-500/20 p-6 rounded-lg shadow-lg shadow-red-500/10 hover:bg-gray-800/50 transition-colors">
      <Link href={`/blog/${slug}`} legacyBehavior>
        <a className="block">
          <h2 className="text-2xl font-semibold text-red-400 hover:underline mb-2">
            {(slug ?? '').replace(/-/g, ' ')}
          </h2>
          <p className="text-gray-300 text-sm">
            Click to read more about this blog.
          </p>
        </a>
      </Link>
    </div>
  );
};

export default BlogCard;
