import Link from 'next/link';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

const CategoryPage = async ({ params }: CategoryPageProps) => {
  const { category } = await params;
  void category;
  return (
    <div className="bg-black min-h-screen text-white flex items-center justify-center" style={{ fontFamily: "'Ubuntu Mono', monospace" }}>
      <div className="text-center">
        <p className="text-red-500/50 text-xs tracking-widest uppercase mb-4">moved</p>
        <Link href="/resources" className="text-white/40 hover:text-white transition-colors text-sm">
          ← back to resources
        </Link>
      </div>
    </div>
  );
};

export default CategoryPage;
